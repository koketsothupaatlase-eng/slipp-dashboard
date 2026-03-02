'use client'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="text-sm border border-gray-200 text-gray-600 hover:border-brand-green hover:text-brand-green px-4 py-2 rounded-lg transition-colors"
    >
      Print
    </button>
  )
}
