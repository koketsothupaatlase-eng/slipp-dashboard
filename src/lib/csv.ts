import type { Receipt, ReceiptItem } from '@/types/database'

export function generateReportCsv(receipts: Receipt[]): string {
  const headers = [
    'receipt_date', 'time', 'merchant', 'category',
    'items_count', 'items_detail', 'vat', 'total',
  ]

  const rows = receipts.map((r) => {
    const dt = new Date(r.receipt_date)
    const items = r.items as ReceiptItem[]
    const itemsDetail = items
      .map((i) => `${i.name} x${i.quantity} @R${i.price.toFixed(2)}`)
      .join(' | ')
    return [
      dt.toLocaleDateString('en-ZA'),
      dt.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' }),
      `"${r.merchant.replace(/"/g, '""')}"`,
      r.category ?? '',
      items.length,
      `"${itemsDetail.replace(/"/g, '""')}"`,
      Number(r.vat ?? 0).toFixed(2),
      r.total.toFixed(2),
    ]
  })

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
}
