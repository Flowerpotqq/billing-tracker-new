<template>
  <div>
    <div class="mb-6">
      <h2 class="text-[24px] font-black tracking-tight mb-1">
        <span class="text-grad-accent">Make a Call</span>
      </h2>
      <p class="text-sm text-nap-text-2">Upload outbound contacts for review before Retell AI calling is connected</p>
    </div>

    <div class="grid grid-cols-3 gap-4 mb-5">
      <div class="glass-card p-5 animate-tab-enter">
        <div class="label-sm">Contacts Ready</div>
        <div class="text-[28px] font-black text-grad-accent">{{ validContacts.length }}</div>
        <div class="text-[11px] text-nap-text-2 mt-1">Valid rows from CSV</div>
      </div>
      <div class="glass-card p-5 animate-tab-enter" style="animation-delay:40ms">
        <div class="label-sm">Rows With Issues</div>
        <div class="text-[28px] font-black text-grad-warn">{{ rowErrors.length }}</div>
        <div class="text-[11px] text-nap-text-2 mt-1">Need cleanup before submission</div>
      </div>
      <div class="glass-card p-5 animate-tab-enter" style="animation-delay:80ms">
        <div class="label-sm">Retell Status</div>
        <div class="text-[22px] font-black text-grad-primary mt-1">Not Connected</div>
        <div class="pending-chip mt-2.5">Preview only</div>
      </div>
    </div>

    <div class="grid grid-cols-[minmax(280px,0.9fr)_minmax(420px,1.4fr)] gap-5">
      <div class="glass-card p-6 animate-tab-enter">
        <div class="label-sm mb-4">CSV Upload</div>

        <label
          :class="['upload-zone', { 'is-dragging': isDragging }]"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
        >
          <input
            ref="fileInputRef"
            type="file"
            accept=".csv,text/csv"
            class="hidden"
            @change="handleFileSelect"
          />
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <span class="upload-title">Drop CSV here or browse</span>
          <span class="upload-copy">Required headers: phone number, first name, last name</span>
        </label>

        <div v-if="fileName" class="file-row mt-4">
          <div class="min-w-0">
            <div class="text-[12px] font-bold text-nap-text truncate">{{ fileName }}</div>
            <div class="text-[10.5px] text-nap-text-3">{{ totalRows }} parsed rows</div>
          </div>
          <button class="clear-file-btn" @click="clearFile">Clear</button>
        </div>

        <div class="mt-5">
          <div class="label-sm mb-3">Validation</div>
          <div v-if="messages.length === 0" class="empty-state">
            Upload a CSV to validate contacts.
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="message in messages"
              :key="message.text"
              :class="['message-row', message.type]"
            >
              {{ message.text }}
            </div>
          </div>
        </div>

        <button class="submit-btn mt-5" disabled>
          Submit to Retell AI later
        </button>
      </div>

      <div class="glass-card overflow-hidden animate-tab-enter" style="animation-delay:70ms">
        <div class="table-header">
          <div>
            <div class="label-sm">Contact Preview</div>
            <div class="text-[11px] text-nap-text-2 mt-1">Valid contacts from the uploaded CSV</div>
          </div>
          <span class="preview-count">{{ validContacts.length }} contacts</span>
        </div>

        <table class="nap-table w-full">
          <thead>
            <tr>
              <th>Phone Number</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Source Row</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="contact in previewContacts" :key="contact.rowNumber">
              <td class="font-mono text-[12px] text-nap-text">{{ contact.phoneNumber }}</td>
              <td class="font-semibold text-nap-text">{{ contact.firstName || '-' }}</td>
              <td class="font-semibold text-nap-text">{{ contact.lastName || '-' }}</td>
              <td class="text-nap-text-2 text-[12px]">Row {{ contact.rowNumber }}</td>
            </tr>
            <tr v-if="previewContacts.length === 0">
              <td colspan="4" class="text-center py-10 text-nap-text-3 text-sm">
                No valid contacts to preview yet.
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="validContacts.length > previewContacts.length" class="preview-footer">
          Showing first {{ PREVIEW_LIMIT }} contacts. {{ validContacts.length - PREVIEW_LIMIT }} more are ready.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const REQUIRED_COLUMNS = {
  phoneNumber: ['phone number', 'phone', 'phone_number', 'phonenumber', 'number'],
  firstName: ['first name', 'firstname', 'first_name', 'first'],
  lastName: ['last name', 'lastname', 'last_name', 'last'],
}
const PREVIEW_LIMIT = 25

const fileInputRef = ref(null)
const fileName = ref('')
const totalRows = ref(0)
const contacts = ref([])
const rowErrors = ref([])
const fileErrors = ref([])
const isDragging = ref(false)

const validContacts = computed(() => contacts.value.filter((contact) => contact.isValid))
const previewContacts = computed(() => validContacts.value.slice(0, PREVIEW_LIMIT))
const messages = computed(() => {
  const list = fileErrors.value.map((text) => ({ type: 'error', text }))

  if (fileName.value && fileErrors.value.length === 0) {
    list.push({ type: 'success', text: `${validContacts.value.length} contacts are ready to preview.` })
  }

  rowErrors.value.slice(0, 5).forEach((error) => {
    list.push({ type: 'warning', text: `Row ${error.rowNumber}: ${error.message}` })
  })

  if (rowErrors.value.length > 5) {
    list.push({ type: 'warning', text: `${rowErrors.value.length - 5} additional rows have validation issues.` })
  }

  return list
})

function normalizeHeader(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, ' ')
    .replace(/_/g, ' ')
}

function splitCsvLine(line) {
  const values = []
  let current = ''
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    const next = line[index + 1]

    if (char === '"' && inQuotes && next === '"') {
      current += '"'
      index += 1
    } else if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  values.push(current.trim())
  return values
}

function parseCsv(text) {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)

  if (lines.length === 0) {
    throw new Error('CSV file is empty.')
  }

  const headers = splitCsvLine(lines[0]).map(normalizeHeader)
  const columnIndexes = {}
  const missingHeaders = []

  Object.entries(REQUIRED_COLUMNS).forEach(([field, aliases]) => {
    const normalizedAliases = aliases.map(normalizeHeader)
    const index = headers.findIndex((header) => normalizedAliases.includes(header))

    if (index === -1) {
      missingHeaders.push(aliases[0])
    } else {
      columnIndexes[field] = index
    }
  })

  if (missingHeaders.length > 0) {
    throw new Error(`Missing required headers: ${missingHeaders.join(', ')}.`)
  }

  const parsedContacts = []
  const parsedErrors = []

  lines.slice(1).forEach((line, index) => {
    const rowNumber = index + 2
    const values = splitCsvLine(line)
    const phoneNumber = values[columnIndexes.phoneNumber]?.trim() || ''
    const firstName = values[columnIndexes.firstName]?.trim() || ''
    const lastName = values[columnIndexes.lastName]?.trim() || ''
    const hasAnyContactData = Boolean(phoneNumber || firstName || lastName)

    if (!hasAnyContactData) {
      parsedErrors.push({ rowNumber, message: 'No contact data found.' })
      return
    }

    const isValid = Boolean(phoneNumber)

    if (!isValid) {
      parsedErrors.push({ rowNumber, message: 'Phone number is required.' })
    }

    parsedContacts.push({
      rowNumber,
      phoneNumber,
      firstName,
      lastName,
      isValid,
    })
  })

  if (parsedContacts.length === 0) {
    throw new Error('CSV does not contain any contact rows.')
  }

  return {
    rows: lines.length - 1,
    contacts: parsedContacts,
    errors: parsedErrors,
  }
}

function clearFile() {
  fileName.value = ''
  totalRows.value = 0
  contacts.value = []
  rowErrors.value = []
  fileErrors.value = []

  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

function readFile(file) {
  clearFile()
  fileName.value = file.name

  if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
    fileErrors.value = ['Please upload a CSV file.']
    return
  }

  const reader = new FileReader()

  reader.onload = () => {
    try {
      const result = parseCsv(String(reader.result || ''))
      totalRows.value = result.rows
      contacts.value = result.contacts
      rowErrors.value = result.errors
    } catch (error) {
      fileErrors.value = [error.message || 'Unable to parse CSV file.']
    }
  }

  reader.onerror = () => {
    fileErrors.value = ['Unable to read CSV file.']
  }

  reader.readAsText(file)
}

function handleFileSelect(event) {
  const file = event.target.files?.[0]
  if (file) readFile(file)
}

function handleDrop(event) {
  isDragging.value = false
  const file = event.dataTransfer.files?.[0]
  if (file) readFile(file)
}
</script>

<style scoped>
.label-sm {
  font-size: 9.5px; font-weight: 800; letter-spacing: 1.8px;
  color: #8e82a0; text-transform: uppercase;
}
.upload-zone {
  min-height: 190px; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 10px; padding: 24px; border-radius: 14px; border: 1.5px dashed rgba(91,63,143,0.28);
  background: rgba(255,255,255,0.56); color: #5b3f8f; cursor: pointer; text-align: center;
  transition: border-color .16s, background .16s, transform .16s;
}
.upload-zone:hover, .upload-zone.is-dragging {
  border-color: var(--c-teal); background: rgba(0,168,138,0.06); transform: translateY(-1px);
}
.upload-title { font-size: 14px; font-weight: 800; color: var(--c-text); }
.upload-copy { max-width: 260px; font-size: 11.5px; color: #8e82a0; line-height: 1.5; }
.file-row {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 11px 12px; border-radius: 10px; border: 1px solid var(--border-color);
  background: rgba(255,255,255,0.72);
}
.clear-file-btn {
  padding: 6px 10px; border-radius: 8px; border: 1px solid rgba(224,92,92,0.3);
  background: rgba(224,92,92,0.06); color: #e05c5c; font-size: 11px; font-weight: 800; cursor: pointer;
}
.empty-state {
  padding: 12px; border-radius: 10px; background: rgba(91,63,143,0.05);
  color: #8e82a0; font-size: 12px; font-weight: 600;
}
.message-row {
  padding: 9px 11px; border-radius: 9px; font-size: 12px; font-weight: 700; border: 1px solid transparent;
}
.message-row.success { background: var(--ok-light); border-color: var(--ok-border); color: var(--c-teal); }
.message-row.warning { background: var(--warn-light); border-color: var(--warn-border); color: #c27800; }
.message-row.error { background: var(--danger-light); border-color: var(--danger-border); color: #e03050; }
.pending-chip {
  display: inline-flex; align-items: center; padding: 5px 10px; border-radius: 8px;
  background: var(--warn-light); border: 1px solid var(--warn-border);
  font-size: 11px; color: #c27800; font-weight: 800;
}
.submit-btn {
  width: 100%; padding: 10px 14px; border-radius: 10px; border: none;
  background: rgba(91,63,143,0.12); color: #8e82a0; font-size: 12px; font-weight: 800;
  cursor: not-allowed;
}
.table-header {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 18px 18px 14px; border-bottom: 1px solid var(--border-color);
}
.preview-count {
  flex-shrink: 0; padding: 4px 9px; border-radius: 8px;
  background: var(--ok-light); border: 1px solid var(--ok-border);
  color: var(--c-teal); font-size: 11px; font-weight: 800;
}
.preview-footer {
  padding: 12px 16px; border-top: 1px solid var(--border-color);
  color: #8e82a0; font-size: 12px; font-weight: 600; text-align: center;
}
</style>
