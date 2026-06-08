/**
 * Frontend webhook/API configuration
 *
 * Supported modes:
 * 1) API gateway mode (recommended):
 *    VITE_API_BASE_URL=https://api.yourdomain.com
 *    VITE_CLIENT_ID=client-id
 *    VITE_CLINIC_ID=clinic-id
 *    -> /api/{client}/{clinic}/{endpoint}
 *
 * 2) Direct n8n webhook mode:
 *    VITE_N8N_WEBHOOK_BASE_URL=https://n8n.getnapsolutions.com/webhook
 *    -> /nap/{endpoint}
 *
 * Set VITE_ENABLE_WEBHOOKS=false for a clean slate (no live webhook data).
 */
const ENABLE_WEBHOOKS = String(import.meta.env.VITE_ENABLE_WEBHOOKS ?? 'true').toLowerCase() !== 'false'
const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
const CLIENT_ID = String(import.meta.env.VITE_CLIENT_ID ?? 'client-id').trim()
const CLINIC_ID = String(import.meta.env.VITE_CLINIC_ID ?? 'clinic-id').trim()

const DEFAULT_WEBHOOK_BASE = 'https://n8n.getnapsolutions.com/webhook'
const WEBHOOK_BASE = String(import.meta.env.VITE_N8N_WEBHOOK_BASE_URL ?? DEFAULT_WEBHOOK_BASE).replace(/\/$/, '')

function endpoint(path) {
  if (!ENABLE_WEBHOOKS) return ''

  const cleanedPath = String(path).replace(/^\/+/, '')

  if (API_BASE_URL) {
    return `${API_BASE_URL}/api/${CLIENT_ID}/${CLINIC_ID}/${cleanedPath}`
  }

  return `${WEBHOOK_BASE}/nap/${cleanedPath}`
}

export const WEBHOOKS = {
  overview: endpoint('overview'),
  analytics: endpoint('analytics'),
  calls: endpoint('calls'),
  transcripts: endpoint('transcripts'),
  invoices: endpoint('invoices'),
  outboundCalls: endpoint('outbound/retell-batch-v2'),
  callAnalyzed: ENABLE_WEBHOOKS ? `${WEBHOOK_BASE}/nap-call-analyzed` : '',
}

export const RANGE_LABELS = ['Hourly', 'Daily', 'Weekly', '2 Mo', '3 Mo', '6 Mo', 'Yearly', 'All Time']
