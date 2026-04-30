import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useApi } from '@/composables/useApi'

export const useDashboardStore = defineStore('dashboard', () => {
  const api = useApi()

  const activeTab = ref('overview')
  const sidebarOpen = ref(true)

  // Per-tab loading flags
  const loading = ref({
    overview: false,
    calls: false,
    transcripts: false,
    invoices: false,
  })

  const timeRange = ref(1)
  const chartData = ref([])
  const chartLoading = ref(false)

  const overview = ref(null)
  const calls = ref([])
  const transcripts = ref([])
  const invoices = ref([])

  // Avoid refetching on tab revisit
  const loaded = ref({
    overview: false,
    calls: false,
    transcripts: false,
    invoices: false,
  })

  // Mutex-style guards per dataset
  const fetching = {
    overview: false,
    calls: false,
    transcripts: false,
    invoices: false,
  }

  const search = ref('')
  const filter = ref('all')

  const expandedCallId = ref(null)
  const expandedTranscriptId = ref(null)

  function resetViewState() {
    search.value = ''
    filter.value = 'all'
    expandedCallId.value = null
    expandedTranscriptId.value = null
  }

  async function fetchOverview() {
    if (loaded.value.overview || fetching.overview) return
    fetching.overview = true
    loading.value.overview = true

    try {
      overview.value = await api.fetchOverview()
      loaded.value.overview = true
      console.log('[NAP][STORE] Overview loaded')
    } catch (error) {
      if (!api.isCancelledError(error)) {
        console.error('[NAP][STORE] Overview fetch error:', error)
      }
    } finally {
      loading.value.overview = false
      fetching.overview = false
    }
  }

  async function fetchCalls() {
    if (loaded.value.calls || fetching.calls) return
    fetching.calls = true
    loading.value.calls = true

    try {
      const response = await api.fetchCalls()
      calls.value = response.calls
      loaded.value.calls = true
      console.log('[NAP][STORE] Calls loaded:', response.calls.length)
    } catch (error) {
      if (!api.isCancelledError(error)) {
        console.error('[NAP][STORE] Calls fetch error:', error)
      }
    } finally {
      loading.value.calls = false
      fetching.calls = false
    }
  }

  async function fetchTranscripts() {
    if (loaded.value.transcripts || fetching.transcripts) return
    fetching.transcripts = true
    loading.value.transcripts = true

    try {
      const response = await api.fetchTranscripts()
      transcripts.value = response.transcripts
      loaded.value.transcripts = true
      console.log('[NAP][STORE] Transcripts loaded:', response.transcripts.length)
    } catch (error) {
      if (!api.isCancelledError(error)) {
        console.error('[NAP][STORE] Transcripts fetch error:', error)
      }
    } finally {
      loading.value.transcripts = false
      fetching.transcripts = false
    }
  }

  async function fetchInvoices() {
    if (loaded.value.invoices || fetching.invoices) return
    fetching.invoices = true
    loading.value.invoices = true

    try {
      invoices.value = await api.fetchInvoices()
      loaded.value.invoices = true
      console.log('[NAP][STORE] Invoices loaded:', invoices.value.length)
    } catch (error) {
      if (!api.isCancelledError(error)) {
        console.error('[NAP][STORE] Invoices fetch error:', error)
      }
    } finally {
      loading.value.invoices = false
      fetching.invoices = false
    }
  }

  async function _fetchForTab(tab) {
    switch (tab) {
      case 'overview':
        await fetchOverview()
        break
      case 'calllog':
        await fetchCalls()
        break
      case 'transcripts':
        await fetchTranscripts()
        break
      case 'invoices':
        await fetchInvoices()
        break
      case 'overage':
      case 'analytics':
      case 'plan':
      case 'contact':
        break
      default:
        console.warn('[NAP][STORE] Unknown tab requested:', tab)
    }
  }

  function loadTab(tab) {
    const previous = activeTab.value
    if (previous !== tab) {
      console.log(`[NAP][TAB] ${previous} -> ${tab}`)
    } else {
      console.log(`[NAP][TAB] Re-opened ${tab}`)
    }

    // Cancel stale inflight requests from prior tab actions.
    api.cancelAllRequests()
    Object.keys(fetching).forEach((key) => { fetching[key] = false })

    activeTab.value = tab
    resetViewState()

    _fetchForTab(tab).catch((error) => {
      if (!api.isCancelledError(error)) {
        console.error('[NAP][STORE] Tab fetch error:', error)
      }
    })
  }

  async function loadChartData(rangeIndex) {
    chartLoading.value = true
    timeRange.value = rangeIndex

    try {
      chartData.value = await api.fetchAnalytics(rangeIndex)
      console.log('[NAP][STORE] Analytics loaded:', chartData.value.length, 'points')
    } catch (error) {
      if (!api.isCancelledError(error)) {
        console.error('[NAP][STORE] Analytics fetch error:', error)
      }
    } finally {
      chartLoading.value = false
    }
  }

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function toggleCall(id) {
    expandedCallId.value = expandedCallId.value === id ? null : id
  }

  function toggleTranscript(id) {
    expandedTranscriptId.value = expandedTranscriptId.value === id ? null : id
  }

  function init() {
    loadTab('overview')
    loadChartData(1).catch((error) => console.error('[NAP][STORE] Init analytics error:', error))
  }

  return {
    activeTab,
    sidebarOpen,
    loading,
    timeRange,
    chartData,
    chartLoading,
    overview,
    calls,
    transcripts,
    invoices,
    search,
    filter,
    expandedCallId,
    expandedTranscriptId,
    loadTab,
    loadChartData,
    toggleSidebar,
    toggleCall,
    toggleTranscript,
    init,
  }
})
