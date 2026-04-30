/**
 * useApi:
 * - fetches n8n webhook endpoints
 * - normalizes payloads to stable frontend shapes
 * - cancels stale requests during tab switches
 * - falls back to mock data on timeout/network errors
 */
import { WEBHOOKS } from '@/config/webhooks'
import {
  generateOverview,
  generateCalls,
  generateTranscripts,
  generateInvoices,
  generateChartData,
} from './useMockData'

const FETCH_TIMEOUT_MS = 10_000
const inflight = new Map()

class CancelledRequestError extends Error {
  constructor(requestKey) {
    super(`[NAP][API] Request cancelled: ${requestKey}`)
    this.name = 'CancelledRequestError'
  }
}

function toArray(value) {
  return Array.isArray(value) ? value : []
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function toBool(value) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const lower = value.toLowerCase()
    return lower === 'true' || lower === '1' || lower === 'yes'
  }
  return Boolean(value)
}

function parseTranscriptLines(rawTranscript) {
  if (Array.isArray(rawTranscript)) {
    return rawTranscript
      .map((line) => ({
        speaker: line?.speaker || 'System',
        text: String(line?.text || '').trim(),
      }))
      .filter((line) => line.text.length > 0)
  }

  if (typeof rawTranscript !== 'string') return []

  return rawTranscript
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      if (/^Agent:/i.test(line) || /^AI:/i.test(line)) {
        return { speaker: 'AI', text: line.replace(/^Agent:/i, '').replace(/^AI:/i, '').trim() }
      }
      if (/^User:/i.test(line) || /^Caller:/i.test(line)) {
        return { speaker: 'Caller', text: line.replace(/^User:/i, '').replace(/^Caller:/i, '').trim() }
      }
      return { speaker: 'System', text: line }
    })
}

function normalizeOverviewPayload(payload) {
  return payload && typeof payload === 'object' && !Array.isArray(payload)
    ? payload
    : generateOverview()
}

function normalizeCallsPayload(payload) {
  const list = toArray(payload?.calls ?? payload)

  const calls = list.map((row, index) => {
    const id = row?.id ?? row?.call_id ?? `call-${index + 1}`
    const from = row?.from ?? row?.from_number ?? row?.caller ?? row?.callerName ?? 'Unknown'
    const date = row?.date ?? row?.call_date ?? row?.call_timestamp ?? ''
    const durationMin = toNumber(row?.duration_min ?? row?.call_duration_min ?? row?.duration)
    const status = row?.status ?? row?.call_status ?? 'ended'
    const hasTranscript = toBool(row?.hasTranscript ?? row?.has_transcript)
    const hasRecording = toBool(row?.hasRecording ?? row?.has_recording)

    return {
      id,
      date,
      from,
      duration_min: durationMin,
      status,
      hasTranscript,
      hasRecording,
      sentiment: row?.sentiment ?? '',
      // Compatibility fields used by existing UI filters/details
      callerName: row?.callerName ?? row?.caller ?? from,
      call_id: row?.call_id ?? id,
      call_date: row?.call_date ?? date,
      call_timestamp: row?.call_timestamp ?? date,
      call_summary: row?.call_summary ?? row?.summary ?? '',
      disconnect_reason: row?.disconnect_reason ?? row?.disconnectReason ?? '',
      has_transcript: hasTranscript,
      has_recording: hasRecording,
      from_number: row?.from_number ?? from,
    }
  })

  return { calls }
}

function normalizeTranscriptsPayload(payload) {
  const list = toArray(payload?.transcripts ?? payload)

  const transcripts = list.map((row, index) => {
    const callId = row?.call_id ?? row?.id ?? `transcript-${index + 1}`
    const transcriptLines = parseTranscriptLines(row?.transcript)
    const recordingUrl = row?.recording_url ?? row?.recordingUrl ?? ''
    const durationMin = toNumber(row?.duration_min ?? row?.call_duration_min ?? row?.duration)
    const callerName = row?.callerName ?? row?.caller ?? row?.from ?? row?.from_number ?? `Call ${callId}`

    return {
      call_id: callId,
      transcript: transcriptLines,
      recording_url: recordingUrl,
      // Compatibility fields used by existing UI
      id: row?.id ?? callId,
      date: row?.date ?? row?.call_date ?? row?.call_timestamp ?? '',
      callerName,
      duration_min: durationMin,
      status: row?.status ?? row?.call_status ?? 'completed',
      summary: row?.summary ?? row?.call_summary ?? '',
      sentiment: row?.sentiment ?? 'Unknown',
      word_count: toNumber(
        row?.word_count ?? row?.words,
        transcriptLines
          .map((line) => line.text)
          .join(' ')
          .split(/\s+/)
          .filter(Boolean).length,
      ),
      call_summary: row?.call_summary ?? row?.summary ?? '',
      call_date: row?.call_date ?? row?.date ?? '',
      call_duration_min: durationMin,
    }
  })

  return { transcripts }
}

function normalizeInvoicesPayload(payload) {
  return toArray(payload?.invoices ?? payload)
}

function normalizeAnalyticsPayload(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.analytics)) return payload.analytics
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

function cancelRequest(requestKey) {
  const existing = inflight.get(requestKey)
  if (!existing) return
  existing.abort()
  inflight.delete(requestKey)
  console.log(`[NAP][API] Cancelled in-flight request: ${requestKey}`)
}

function cancelAllRequests() {
  Array.from(inflight.keys()).forEach(cancelRequest)
}

async function safeFetch(requestKey, url, fallback) {
  if (!url) {
    console.warn(`[NAP][API] Missing webhook URL for ${requestKey}. Using fallback.`)
    return fallback()
  }

  // If the same endpoint is requested again quickly, cancel the older one.
  cancelRequest(requestKey)

  const controller = new AbortController()
  inflight.set(requestKey, controller)

  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, FETCH_TIMEOUT_MS)

  console.log(`[NAP][API] Request -> ${requestKey}: ${url}`)

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const payload = await response.json()
    console.log(`[NAP][API] Response <- ${requestKey}:`, payload)
    return payload
  } catch (error) {
    if (error?.name === 'AbortError' && !timedOut) {
      throw new CancelledRequestError(requestKey)
    }

    const reason = timedOut ? `timeout (${FETCH_TIMEOUT_MS}ms)` : (error?.message || 'Unknown error')
    console.error(`[NAP][API] Error ${requestKey}:`, reason)
    const fallbackPayload = fallback()
    console.warn(`[NAP][API] Using fallback for ${requestKey}:`, fallbackPayload)
    return fallbackPayload
  } finally {
    clearTimeout(timer)
    if (inflight.get(requestKey) === controller) {
      inflight.delete(requestKey)
    }
  }
}

export const useApi = () => ({
  cancelAllRequests,
  isCancelledError: (error) => error?.name === 'CancelledRequestError',

  fetchOverview: async () => {
    const payload = await safeFetch('overview', WEBHOOKS.overview, generateOverview)
    return normalizeOverviewPayload(payload)
  },

  fetchCalls: async () => {
    const payload = await safeFetch('calls', WEBHOOKS.calls, () => ({ calls: generateCalls() }))
    return normalizeCallsPayload(payload)
  },

  fetchTranscripts: async () => {
    const payload = await safeFetch('transcripts', WEBHOOKS.transcripts, () => ({ transcripts: generateTranscripts() }))
    return normalizeTranscriptsPayload(payload)
  },

  fetchInvoices: async () => {
    const payload = await safeFetch('invoices', WEBHOOKS.invoices, generateInvoices)
    return normalizeInvoicesPayload(payload)
  },

  fetchAnalytics: async (rangeIndex) => {
    const url = WEBHOOKS.analytics
      ? `${WEBHOOKS.analytics}?range=${rangeIndex}`
      : ''

    const payload = await safeFetch('analytics', url, () => generateChartData(rangeIndex))
    return normalizeAnalyticsPayload(payload)
  },
})
