import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { generateReportPdf } from '@/lib/pdf'
import { generateReportCsv } from '@/lib/csv'

async function getMerchantId(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase
    .from('merchant_users')
    .select('merchant_id')
    .eq('user_id', userId)
    .single()
  return data?.merchant_id ?? null
}

// GET /api/merchant/reports?year=2025&month=3
// Returns the cached report record (or null if not yet generated).
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const year  = parseInt(searchParams.get('year')  ?? '')
  const month = parseInt(searchParams.get('month') ?? '')

  if (!year || !month) {
    return NextResponse.json({ error: 'year and month are required' }, { status: 400 })
  }

  const merchantId = await getMerchantId(supabase, user.id)
  if (!merchantId) return NextResponse.json({ error: 'No merchant linked' }, { status: 403 })

  const { data } = await supabase
    .from('monthly_reports')
    .select('*')
    .eq('merchant_id', merchantId)
    .eq('year', year)
    .eq('month', month)
    .maybeSingle()

  return NextResponse.json(data ?? null)
}

// POST /api/merchant/reports  { year, month }
// Generates PDF + CSV, uploads to Supabase Storage, caches in monthly_reports.
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { year, month } = await req.json() as { year: number; month: number }
  if (!year || !month) {
    return NextResponse.json({ error: 'year and month are required' }, { status: 400 })
  }

  const merchantId = await getMerchantId(supabase, user.id)
  if (!merchantId) return NextResponse.json({ error: 'No merchant linked' }, { status: 403 })

  // Get merchant name for the PDF header
  const { data: merchant } = await supabase
    .from('merchants')
    .select('name')
    .eq('id', merchantId)
    .single()

  // Fetch all receipts for this merchant in the given month
  const startDate = `${year}-${String(month).padStart(2, '0')}-01T00:00:00Z`
  const endDate   = new Date(year, month, 1).toISOString() // first day of next month

  const { data: receipts, error: receiptError } = await supabase
    .from('receipts')
    .select('*')
    .eq('merchant_id', merchantId)
    .gte('receipt_date', startDate)
    .lt('receipt_date', endDate)
    .order('receipt_date')

  if (receiptError) {
    return NextResponse.json({ error: receiptError.message }, { status: 500 })
  }

  if (!receipts?.length) {
    return NextResponse.json({ error: 'No transactions found for this period' }, { status: 404 })
  }

  // Generate PDF and CSV
  const [pdfBuffer, csvString] = await Promise.all([
    generateReportPdf({ receipts, year, month, merchantName: merchant?.name ?? 'Merchant' }),
    Promise.resolve(generateReportCsv(receipts)),
  ])

  const admin   = createServiceRoleClient()
  const pdfPath = `reports/${merchantId}/${year}-${String(month).padStart(2, '0')}.pdf`
  const csvPath = `reports/${merchantId}/${year}-${String(month).padStart(2, '0')}.csv`

  // Upload both files to Supabase Storage
  const [pdfUpload, csvUpload] = await Promise.all([
    admin.storage.from('merchant-reports').upload(pdfPath, pdfBuffer, {
      contentType: 'application/pdf', upsert: true,
    }),
    admin.storage.from('merchant-reports').upload(csvPath, Buffer.from(csvString, 'utf-8'), {
      contentType: 'text/csv; charset=utf-8', upsert: true,
    }),
  ])

  if (pdfUpload.error || csvUpload.error) {
    return NextResponse.json(
      { error: pdfUpload.error?.message ?? csvUpload.error?.message },
      { status: 500 }
    )
  }

  const pdfUrl = admin.storage.from('merchant-reports').getPublicUrl(pdfPath).data.publicUrl
  const csvUrl = admin.storage.from('merchant-reports').getPublicUrl(csvPath).data.publicUrl

  // Upsert cache record
  const { data: report, error: cacheError } = await admin
    .from('monthly_reports')
    .upsert(
      { merchant_id: merchantId, year, month, pdf_url: pdfUrl, csv_url: csvUrl,
        generated_at: new Date().toISOString() },
      { onConflict: 'merchant_id,year,month' }
    )
    .select()
    .single()

  if (cacheError) {
    return NextResponse.json({ error: cacheError.message }, { status: 500 })
  }

  return NextResponse.json(report, { status: 201 })
}
