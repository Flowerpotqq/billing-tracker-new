<template>
  <div class="app-shell">
    <!-- Ambient orbs -->
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>

    <!-- Top bar -->
    <Topbar />

    <div class="app-body">
      <!-- Sidebar -->
      <Sidebar />

      <!-- Main content
           v-show (NOT v-if): all tab components stay mounted at all times.
           Switching tabs only toggles display:none — zero mount/unmount,
           zero Vue lifecycle races, impossible to get stuck. -->
      <main ref="mainAreaRef" class="main-area">
        <div class="content-wrap">
          <Overview    v-show="store.activeTab === 'overview'" />
          <Analytics   v-show="store.activeTab === 'analytics'" />
          <CallLog     v-show="store.activeTab === 'calllog'" />
          <Transcripts v-show="store.activeTab === 'transcripts'" />
          <MakeCall    v-show="store.activeTab === 'makecall'" />
          <Invoices    v-show="store.activeTab === 'invoices'" />
          <Overage     v-show="store.activeTab === 'overage'" />
          <Plan        v-show="store.activeTab === 'plan'" />
          <Contact     v-show="store.activeTab === 'contact'" />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import Topbar      from '@/components/Topbar.vue'
import Sidebar     from '@/components/Sidebar.vue'
import Overview    from '@/views/Overview.vue'
import Analytics   from '@/views/Analytics.vue'
import CallLog     from '@/views/CallLog.vue'
import Transcripts from '@/views/Transcripts.vue'
import MakeCall    from '@/views/MakeCall.vue'
import Invoices    from '@/views/Invoices.vue'
import Overage     from '@/views/Overage.vue'
import Plan        from '@/views/Plan.vue'
import Contact     from '@/views/Contact.vue'

const store       = useDashboardStore()
const mainAreaRef = ref(null)

// Scroll back to top every time the active tab changes
watch(() => store.activeTab, () => {
  if (mainAreaRef.value) mainAreaRef.value.scrollTop = 0
})

onMounted(() => store.init())
</script>

<style scoped>
.app-shell {
  width: 100vw; height: 100vh;
  display: flex; flex-direction: column;
  background: var(--bg-page);
  overflow: hidden; position: relative;
}
.orb {
  position: fixed; border-radius: 50%; pointer-events: none;
  filter: blur(80px); z-index: 0;
}
.orb-1 {
  width: 520px; height: 520px; top: -160px; right: -120px;
  background: radial-gradient(circle, rgba(91,63,143,0.12) 0%, transparent 70%);
  animation: orb1 18s ease-in-out infinite;
}
.orb-2 {
  width: 420px; height: 420px; bottom: -120px; left: 5%;
  background: radial-gradient(circle, rgba(0,168,138,0.08) 0%, transparent 70%);
  animation: orb2 22s ease-in-out infinite;
}
.app-body {
  flex: 1; display: flex; overflow: hidden; position: relative; z-index: 1;
}
.main-area {
  flex: 1; overflow-y: auto; overflow-x: hidden;
  scroll-behavior: smooth;
}
.content-wrap {
  max-width: 1200px; margin: 0 auto;
  padding: 28px 28px;
  position: relative;
}
</style>
