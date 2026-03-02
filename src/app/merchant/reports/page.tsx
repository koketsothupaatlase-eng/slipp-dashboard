'use client'
import { useState, useEffect } from 'react'
import { Spinner } from '@/components/ui/Spinner'

const MONTHS = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

interface Report {
  id:           string
  merchant_id:  string
  year:         number
  month:        number
  pdf_url:      string | null
  csv_url:      string | null
  generated_at: string
}

export default function ReportsPage() {
  const now      = new Date()
  const [year,   setYear]   = useState(now.getFullYear())
  const [month,  setMonth]  = useState(now.getMonth() + 1)
  const [report, setReport] = useState<Report | null>(null)
  const [checking, setChecking]   = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error,  setError]  = useState<string | null>(null)

  // Fetch cached report whenever year/month changes
  useEffect(() => {
    setReport(null)
    setError(null)
    setChecking(true)
    fetch(`/api/merchant/reports?year=${year}&month=${month}`)
      .then((r) => r.json())
      .then((data) => setReport(data))
      .catch(() => setError('Failed to check for existing report'))
      .finally(() => setChecking(false))
  }, [year, month])

  async function generate() {
    setGenerating(true)
    setError(null)
    const res = await fetch('/api/merchant/reports', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ year, month }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Generation failed')
    } else {
      setReport(data)
    }
    setGenerating(false)
  }

  const years = Array.from({ length: 3 }, (_, i) => now.getFullYear() - i)

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Monthly Reports</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Download PDF and CSV reports for any month
        </p>
      </div>

      {/* Month / Year picker */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Select Period</h2>
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/40"
            >
              {MONTHS.slice(1).map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/40"
            >
              {years.map((y) => <option key={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Report status + actions */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">
          {MONTHS[month]} {year} Report
        </h2>

        {checking && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Spinner size="sm" /> Checking for existing report…
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
            {error}
          </p>
        )}

        {!checking && report && (
          <div className="space-y-4">
            <p className="text-xs text-gray-400">
              Generated: {new Date(report.generated_at).toLocaleString('en-ZA')}
            </p>
            <div className="flex flex-wrap gap-3">
              {report.pdf_url && (
                <a
                  href={report.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-brand-green text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-800 transition-colors"
                >
                  📄 Download PDF
                </a>
              )}
              {report.csv_url && (
                <a
                  href={report.csv_url}
                  download
                  className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:border-brand-green hover:text-brand-green transition-colors"
                >
                  📊 Download CSV
                </a>
              )}
              <button
                onClick={() => window.open(report.pdf_url ?? '', '_blank')}
                className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:border-brand-green hover:text-brand-green transition-colors"
              >
                🖨 Print
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              To regenerate with updated data, click the button below.
            </p>
            <button
              onClick={generate}
              disabled={generating}
              className="text-xs text-gray-500 hover:text-brand-green underline"
            >
              {generating ? 'Regenerating…' : 'Regenerate report'}
            </button>
          </div>
        )}

        {!checking && !report && !error && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              No report has been generated for {MONTHS[month]} {year} yet.
            </p>
            <button
              onClick={generate}
              disabled={generating}
              className="inline-flex items-center gap-2 bg-brand-green text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-800 transition-colors disabled:opacity-60"
            >
              {generating
                ? <><Spinner size="sm" /> Generating…</>
                : '⚙ Generate Report'}
            </button>
          </div>
        )}
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">About Reports</h3>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Reports include all transactions for the selected month</li>
          <li>PDF is formatted for printing — use your browser's print dialog</li>
          <li>CSV can be opened in Excel, Google Sheets, or any spreadsheet app</li>
          <li>Generated reports are cached; click "Regenerate" to refresh with new data</li>
        </ul>
      </div>
    </div>
  )
}
