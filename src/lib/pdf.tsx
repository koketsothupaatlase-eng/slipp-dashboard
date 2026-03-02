import React from 'react'
import {
  Document, Page, Text, View, StyleSheet, renderToBuffer,
} from '@react-pdf/renderer'
import type { Receipt, ReceiptItem } from '@/types/database'

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const styles = StyleSheet.create({
  page:    { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: '#111' },
  header:  { marginBottom: 24 },
  title:   { fontSize: 22, fontWeight: 'bold', color: '#3D7A3D', marginBottom: 4 },
  subtitle:{ fontSize: 11, color: '#666' },
  section: { marginTop: 20 },
  kpiRow:  { flexDirection: 'row', gap: 12, marginTop: 8 },
  kpiBox: {
    flex: 1, backgroundColor: '#f3f4f6', borderRadius: 6,
    padding: 10, alignItems: 'center',
  },
  kpiNum:  { fontSize: 16, fontWeight: 'bold', color: '#3D7A3D' },
  kpiLbl:  { fontSize: 8, color: '#888', marginTop: 2 },
  tableHeader: {
    flexDirection: 'row', backgroundColor: '#3D7A3D',
    color: '#fff', padding: '5 8', borderRadius: '4 4 0 0',
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row', padding: '5 8',
    borderBottomWidth: 1, borderColor: '#e5e7eb',
  },
  tableRowAlt: { backgroundColor: '#f9fafb' },
  col1: { flex: 2 },
  col2: { flex: 1 },
  col3: { flex: 2 },
  col4: { flex: 1, textAlign: 'right' },
  col5: { flex: 1, textAlign: 'right' },
  footer: {
    position: 'absolute', bottom: 30, left: 40, right: 40,
    flexDirection: 'row', justifyContent: 'space-between',
    fontSize: 8, color: '#999',
  },
})

interface ReportProps {
  receipts:     Receipt[]
  year:         number
  month:        number
  merchantName: string
}

function MonthlyReportDocument({ receipts, year, month, merchantName }: ReportProps) {
  const total           = receipts.reduce((s, r) => s + Number(r.total), 0)
  const totalTax        = receipts.reduce((s, r) => s + Number(r.vat ?? 0), 0)
  const uniqueCustomers = new Set(receipts.map((r) => r.user_id)).size
  const avgTxn          = receipts.length ? total / receipts.length : 0

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Monthly Report</Text>
          <Text style={styles.subtitle}>
            {merchantName}  ·  {MONTH_NAMES[month]} {year}
          </Text>
          <Text style={[styles.subtitle, { marginTop: 2 }]}>
            Generated: {new Date().toLocaleDateString('en-ZA')}
          </Text>
        </View>

        {/* KPI summary */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiNum}>{receipts.length}</Text>
            <Text style={styles.kpiLbl}>Transactions</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiNum}>R {total.toFixed(2)}</Text>
            <Text style={styles.kpiLbl}>Total Revenue</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiNum}>R {avgTxn.toFixed(2)}</Text>
            <Text style={styles.kpiLbl}>Avg Transaction</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiNum}>{uniqueCustomers}</Text>
            <Text style={styles.kpiLbl}>Unique Customers</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiNum}>R {totalTax.toFixed(2)}</Text>
            <Text style={styles.kpiLbl}>Total VAT</Text>
          </View>
        </View>

        {/* Transaction table */}
        <View style={styles.section}>
          <Text style={{ fontWeight: 'bold', marginBottom: 6 }}>Transaction Detail</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Date &amp; Time</Text>
            <Text style={styles.col2}>Category</Text>
            <Text style={styles.col3}>Items</Text>
            <Text style={styles.col4}>VAT (R)</Text>
            <Text style={styles.col5}>Total (R)</Text>
          </View>
          {receipts.map((r, i) => {
            const dt    = new Date(r.receipt_date)
            const items = r.items as ReceiptItem[]
            const label = items.length > 2
              ? `${items[0].name}, ${items[1].name} +${items.length - 2} more`
              : items.map((it) => it.name).join(', ')
            return (
              <View
                key={r.id}
                style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
              >
                <Text style={styles.col1}>
                  {dt.toLocaleDateString('en-ZA')} {dt.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Text style={styles.col2}>{r.category ?? '—'}</Text>
                <Text style={styles.col3}>{label || '—'}</Text>
                <Text style={styles.col4}>{Number(r.vat ?? 0).toFixed(2)}</Text>
                <Text style={styles.col5}>{Number(r.total).toFixed(2)}</Text>
              </View>
            )
          })}
          {/* Totals row */}
          <View style={[styles.tableRow, { backgroundColor: '#ecfdf5', fontWeight: 'bold' }]}>
            <Text style={styles.col1}>TOTAL</Text>
            <Text style={styles.col2}></Text>
            <Text style={styles.col3}></Text>
            <Text style={styles.col4}>{totalTax.toFixed(2)}</Text>
            <Text style={styles.col5}>{total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Slipp — {merchantName}</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}

export async function generateReportPdf(props: ReportProps): Promise<Buffer> {
  return renderToBuffer(<MonthlyReportDocument {...props} />) as Promise<Buffer>
}
