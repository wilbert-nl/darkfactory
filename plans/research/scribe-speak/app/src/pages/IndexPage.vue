<template>
  <q-page class="q-pa-md">
    <div class="row q-gutter-md">
      <!-- Left: Record Panel -->
      <div class="col-12 col-md-5">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Record Audio</div>

            <!-- Format selector -->
            <q-select
              v-model="selectedFormat"
              :options="formats"
              label="Document Format"
              class="q-mb-md"
              dense
            />

            <!-- Record button -->
            <div class="flex flex-center q-mb-md">
              <q-btn
                round
                :color="isRecording ? 'negative' : 'primary'"
                :icon="isRecording ? 'stop' : 'mic'"
                size="xl"
                @click="toggleRecord"
              />
            </div>
            <div class="text-center text-caption text-grey q-mb-md">
              {{ isRecording ? `Recording... ${recordTime}s` : 'Click to record' }}
            </div>

            <!-- Mock transcript area -->
            <div v-if="transcript">
              <div class="text-subtitle2 q-mb-xs">Raw Transcript:</div>
              <q-input
                v-model="transcript"
                type="textarea"
                rows="6"
                outlined
                dense
                class="q-mb-md"
              />
              <q-btn
                color="secondary"
                icon="auto_awesome"
                label="Apply Formatting"
                @click="applyFormat"
                :loading="formatting"
                class="full-width"
              />
            </div>
          </q-card-section>
        </q-card>

        <!-- Saved Documents -->
        <q-card class="q-mt-md">
          <q-card-section>
            <div class="text-subtitle1 q-mb-sm">Saved Documents ({{ savedDocs.length }})</div>
            <div v-if="!savedDocs.length" class="text-grey text-caption">No documents yet</div>
            <q-list bordered separator>
              <q-item v-for="doc in savedDocs" :key="doc.id" clickable @click="loadDoc(doc)">
                <q-item-section avatar>
                  <q-icon name="description" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ doc.format }}</q-item-label>
                  <q-item-label caption>{{ new Date(doc.createdAt).toLocaleString() }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn flat round icon="delete" size="sm" color="negative" @click.stop="deleteDoc(doc.id)" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Right: Formatted Document -->
      <div class="col-12 col-md-6">
        <q-card v-if="formattedDocument" style="min-height: 400px">
          <q-card-section>
            <div class="row items-center q-mb-sm">
              <div class="text-h6 col">{{ selectedFormat }} Document</div>
              <q-btn flat icon="content_copy" label="Copy" @click="copyDoc" dense />
              <q-btn flat icon="save" label="Save" @click="saveDoc" dense class="q-ml-sm" />
              <q-btn flat icon="download" label="Export" @click="exportDoc" dense class="q-ml-sm" />
            </div>
            <q-separator class="q-mb-md" />
            <pre class="doc-content q-pa-md bg-grey-1 rounded-borders" style="white-space: pre-wrap; font-family: 'Georgia', serif; line-height: 1.6;">{{ formattedDocument }}</pre>
          </q-card-section>
        </q-card>
        <div v-else class="flex flex-center" style="height: 400px">
          <div class="text-center text-grey">
            <q-icon name="article" size="4em" />
            <div class="text-h6 q-mt-sm">No document yet</div>
            <div>Record audio and apply formatting to generate a document</div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const formats = ['Medical Note (SOAP)', 'Legal Brief', 'Interview Transcript', 'General Document']
const selectedFormat = ref('Medical Note (SOAP)')
const isRecording = ref(false)
const recordTime = ref(0)
const transcript = ref('')
const formattedDocument = ref('')
const formatting = ref(false)
let recordInterval: ReturnType<typeof setInterval> | null = null

interface SavedDoc {
  id: string
  format: string
  content: string
  createdAt: number
}

const savedDocs = ref<SavedDoc[]>(JSON.parse(localStorage.getItem('scribespeak-docs') || '[]'))

const mockTranscripts = [
  "Patient presents today with complaints of chest pain that started three days ago. The pain is described as sharp, 7 out of 10 in severity, radiating to the left arm. Patient also reports shortness of breath upon exertion. No fever or chills. Past medical history includes hypertension and type 2 diabetes. Currently on metformin 500 milligrams twice daily and lisinopril 10 milligrams once daily. Vital signs are stable. Examination reveals clear lung fields bilaterally. Heart sounds are regular.",
  "This brief is submitted in the matter of Smith versus Jones. The plaintiff alleges breach of contract arising from the defendant's failure to deliver goods as specified under the purchase agreement dated January 15th 2024. The defendant contends that force majeure provisions apply due to supply chain disruptions. The relevant statutes include Section 2-615 of the Uniform Commercial Code which addresses excuse by failure of presupposed conditions.",
  "Interviewer asks about the candidate's experience with distributed systems. Candidate responds that they have five years of experience working with microservices architecture, specifically Apache Kafka for event streaming and PostgreSQL for persistence. They mention leading a team of four engineers on a real-time data pipeline project that processed two million events per day. When asked about challenges, candidate discusses dealing with eventual consistency and implementing idempotent consumers."
]

function toggleRecord() {
  if (isRecording.value) {
    // Stop recording
    isRecording.value = false
    if (recordInterval) clearInterval(recordInterval)
    // Show mock transcript
    const idx = Math.floor(Math.random() * mockTranscripts.length)
    transcript.value = mockTranscripts[idx]
    $q.notify({ color: 'positive', message: 'Recording complete! Review and format your transcript.', icon: 'mic' })
  } else {
    // Start recording
    isRecording.value = true
    recordTime.value = 0
    transcript.value = ''
    formattedDocument.value = ''
    recordInterval = setInterval(() => { recordTime.value++ }, 1000)
    // Auto-stop after 4 seconds for demo
    setTimeout(() => {
      if (isRecording.value) toggleRecord()
    }, 4000)
  }
}

function applyFormat() {
  if (!transcript.value) return
  formatting.value = true
  setTimeout(() => {
    const raw = transcript.value
    if (selectedFormat.value === 'Medical Note (SOAP)') {
      formattedDocument.value = `SOAP NOTE
Date: ${new Date().toLocaleDateString()}
Provider: Dr. [Provider Name]
Patient: [Patient Name]

SUBJECTIVE:
${raw.split('.').slice(0, 2).join('.')}.

OBJECTIVE:
Vital signs stable. Examination findings as documented.
${raw.split('.').slice(-2).join('.')}.

ASSESSMENT:
Presenting symptoms consistent with cardiovascular evaluation required.
Differential diagnosis includes musculoskeletal pain, angina pectoris.

PLAN:
1. Order ECG and cardiac enzymes
2. Refer to cardiology for stress test evaluation
3. Continue current medications
4. Follow up in 2 weeks or sooner if symptoms worsen
5. Patient educated on warning signs requiring immediate ER visit`
    } else if (selectedFormat.value === 'Legal Brief') {
      formattedDocument.value = `LEGAL BRIEF
                    IN THE MATTER OF: [Case Name]
                    Docket No.: [Number]
                    Date: ${new Date().toLocaleDateString()}

I. INTRODUCTION
${raw.split('.').slice(0, 1).join('.')}.

II. STATEMENT OF FACTS
${raw.split('.').slice(1, 3).join('.')}.

III. LEGAL ARGUMENT
A. Applicable Law
The relevant statutory framework governs this matter as set forth below.

B. Analysis
${raw.split('.').slice(-2).join('.')}.

IV. CONCLUSION
For the foregoing reasons, the moving party respectfully requests relief as described above.

                    Respectfully submitted,
                    [Attorney Name]
                    [Bar Number]`
    } else if (selectedFormat.value === 'Interview Transcript') {
      const sentences = raw.split('.')
      formattedDocument.value = `INTERVIEW TRANSCRIPT
Date: ${new Date().toLocaleDateString()}
Participants: Interviewer [I], Candidate [C]

[BEGIN TRANSCRIPT]

I: Let's begin. Can you tell me about your background?

C: ${sentences.slice(0, 2).join('.')}.

I: That's impressive. What challenges have you encountered?

C: ${sentences.slice(2, 4).join('.')}.

I: And how did you resolve those challenges?

C: ${sentences.slice(-2).join('.')}.

[END TRANSCRIPT]

Duration: ~${Math.floor(Math.random() * 20 + 10)} minutes
Notes: [Interviewer notes here]`
    } else {
      formattedDocument.value = `DOCUMENT
Date: ${new Date().toLocaleDateString()}
Format: General

SUMMARY:
${raw.substring(0, 200)}...

FULL CONTENT:
${raw}

---
Generated by ScribeSpeak`
    }
    formatting.value = false
  }, 1500)
}

function copyDoc() {
  if (!formattedDocument.value) return
  navigator.clipboard.writeText(formattedDocument.value)
  $q.notify({ color: 'positive', message: 'Copied to clipboard!', icon: 'content_copy' })
}

function saveDoc() {
  if (!formattedDocument.value) return
  const doc: SavedDoc = { id: crypto.randomUUID(), format: selectedFormat.value, content: formattedDocument.value, createdAt: Date.now() }
  savedDocs.value.unshift(doc)
  localStorage.setItem('scribespeak-docs', JSON.stringify(savedDocs.value))
  $q.notify({ color: 'positive', message: 'Document saved!', icon: 'save' })
}

function exportDoc() {
  if (!formattedDocument.value) return
  const blob = new Blob([formattedDocument.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${selectedFormat.value.replace(/\s+/g, '-')}-${Date.now()}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

function loadDoc(doc: SavedDoc) {
  formattedDocument.value = doc.content
  selectedFormat.value = doc.format
}

function deleteDoc(id: string) {
  savedDocs.value = savedDocs.value.filter(d => d.id !== id)
  localStorage.setItem('scribespeak-docs', JSON.stringify(savedDocs.value))
}
</script>

<style scoped>
.doc-content {
  font-size: 14px;
}
</style>
