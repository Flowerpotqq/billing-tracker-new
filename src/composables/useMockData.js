/**
 * Zero-state fallback — returned when webhook URLs are not reachable.
 * Replace webhook URLs in src/config/webhooks.js to populate with live data.
 */
export function generateOverview() {
  return {
    minutesUsed:     0,
    minutesIncluded: 2000,
    totalCalls:      0,
    overageUSD:      0,
    avgCallMin:      0,
    callsToday:      0,
    completedToday:  0,
    missedToday:     0,
    billingPeriod:   '—',
    billingPct:      0,
  }
}

export function generateCalls()       { return [] }
export function generateTranscripts() { return [] }
export function generateInvoices()    { return [] }
export function generateChartData()   { return [] }
