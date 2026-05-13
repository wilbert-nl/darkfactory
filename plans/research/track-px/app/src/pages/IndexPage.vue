<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- Left: Patient List -->
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section class="q-pa-sm bg-teal-1">
            <div class="text-subtitle1 text-weight-bold text-teal-9 q-mb-sm">
              <q-icon name="people" class="q-mr-xs" /> Patients
              <q-badge color="teal" :label="patients.length" class="q-ml-sm" />
            </div>
            <div class="row q-gutter-xs">
              <q-input
                v-model="patientSearch"
                outlined dense
                placeholder="Search patients..."
                class="col"
                bg-color="white"
                clearable
              >
                <template #prepend><q-icon name="search" size="18px" /></template>
              </q-input>
              <q-btn color="teal" round flat icon="person_add" @click="showAddPatient = true">
                <q-tooltip>Add Patient</q-tooltip>
              </q-btn>
            </div>
          </q-card-section>
          <q-list separator style="max-height: calc(100vh - 200px); overflow-y: auto;">
            <q-item
              v-for="p in filteredPatients"
              :key="p.id"
              clickable v-ripple
              :active="selectedPatientId === p.id"
              active-class="bg-teal-1"
              @click="selectPatient(p.id)"
            >
              <q-item-section avatar>
                <q-avatar :color="p.sex === 'Male' ? 'blue-4' : 'pink-4'" text-color="white" size="36px">
                  {{ p.name[0] }}
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ p.name }}</q-item-label>
                <q-item-label caption>
                  {{ p.sex }} · {{ age(p.dob) }} yrs
                  <span v-if="lastVisit(p.id)" class="text-grey"> · Last: {{ lastVisit(p.id) }}</span>
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge v-if="p.bloodType" color="red-4" :label="p.bloodType" />
              </q-item-section>
            </q-item>
            <q-item v-if="filteredPatients.length === 0">
              <q-item-section class="text-center text-grey q-py-md">No patients found</q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <!-- Right: Patient Detail or Empty State -->
      <div class="col-12 col-md-8">
        <div v-if="selectedPatient">
          <q-card class="q-mb-md">
            <q-card-section class="bg-teal-8 text-white q-pa-sm">
              <div class="row items-center">
                <q-avatar :color="selectedPatient.sex === 'Male' ? 'blue-6' : 'pink-6'" text-color="white" size="48px" class="q-mr-md">
                  {{ selectedPatient.name[0] }}
                </q-avatar>
                <div class="col">
                  <div class="text-h6">{{ selectedPatient.name }}</div>
                  <div class="text-caption">
                    {{ selectedPatient.sex }} · DOB: {{ selectedPatient.dob }} ({{ age(selectedPatient.dob) }} yrs) ·
                    <q-badge color="red-4" :label="selectedPatient.bloodType || 'Unknown'" />
                  </div>
                </div>
                <div>
                  <q-btn flat round icon="download" @click="exportPatient">
                    <q-tooltip>Export JSON</q-tooltip>
                  </q-btn>
                  <q-btn flat round icon="print" @click="printSummary">
                    <q-tooltip>Print Summary</q-tooltip>
                  </q-btn>
                  <q-btn flat round icon="delete" color="red-3" @click="deletePatient(selectedPatient.id)">
                    <q-tooltip>Delete Patient</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </q-card-section>

            <q-tabs v-model="patientTab" class="text-teal" align="left" dense>
              <q-tab name="profile" icon="person" label="Profile" />
              <q-tab name="consultations" icon="medical_services" label="Consultations" />
            </q-tabs>
            <q-separator />

            <q-tab-panels v-model="patientTab" animated>
              <!-- Profile Tab -->
              <q-tab-panel name="profile">
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-sm-6">
                    <q-input v-model="selectedPatient.name" outlined dense label="Full Name" @update:model-value="savePatients" />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input v-model="selectedPatient.dob" outlined dense label="Date of Birth" type="date" @update:model-value="savePatients" />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-select v-model="selectedPatient.sex" :options="['Male','Female','Other']" outlined dense label="Sex" @update:model-value="savePatients" />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-select v-model="selectedPatient.bloodType" :options="['A+','A-','B+','B-','AB+','AB-','O+','O-']" outlined dense label="Blood Type" clearable @update:model-value="savePatients" />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input v-model="selectedPatient.contact" outlined dense label="Contact Number" @update:model-value="savePatients" />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input v-model="selectedPatient.email" outlined dense label="Email" @update:model-value="savePatients" />
                  </div>
                  <div class="col-12">
                    <q-input
                      v-model="selectedPatient.allergies"
                      outlined dense
                      label="Allergies (comma separated)"
                      placeholder="e.g. Penicillin, Aspirin"
                      @update:model-value="savePatients"
                    />
                  </div>
                  <div class="col-12">
                    <q-input
                      v-model="selectedPatient.notes"
                      outlined dense
                      type="textarea" rows="3"
                      label="Medical History / Notes"
                      @update:model-value="savePatients"
                    />
                  </div>
                </div>
              </q-tab-panel>

              <!-- Consultations Tab -->
              <q-tab-panel name="consultations">
                <div class="row items-center q-mb-md">
                  <div class="text-subtitle1 text-weight-bold">Consultation Log</div>
                  <q-space />
                  <q-btn color="teal" icon="add" label="New Consultation" @click="addConsultation" />
                </div>

                <div v-for="(consult, ci) in patientConsultations" :key="consult.id" class="q-mb-md">
                  <q-expansion-item
                    :label="consult.date + ' — ' + (consult.chiefComplaint || 'No complaint recorded')"
                    :caption="'Dr. ' + (consult.doctor || 'Unknown')"
                    icon="medical_services"
                    header-class="bg-teal-1"
                    default-opened
                  >
                    <q-card flat bordered>
                      <q-card-section>
                        <div class="row q-col-gutter-sm">
                          <div class="col-12 col-sm-6">
                            <q-input v-model="consult.date" outlined dense label="Date" type="date" @update:model-value="saveConsultations" />
                          </div>
                          <div class="col-12 col-sm-6">
                            <q-input v-model="consult.chiefComplaint" outlined dense label="Chief Complaint" @update:model-value="saveConsultations" />
                          </div>
                          <!-- Vitals -->
                          <div class="col-12">
                            <div class="text-caption text-weight-bold text-teal q-mb-xs">VITALS</div>
                          </div>
                          <div class="col-6 col-sm-3">
                            <q-input v-model="consult.bp" outlined dense label="BP (mmHg)" placeholder="120/80" @update:model-value="saveConsultations" />
                          </div>
                          <div class="col-6 col-sm-3">
                            <q-input v-model="consult.temp" outlined dense label="Temp (°C)" placeholder="36.5" @update:model-value="saveConsultations" />
                          </div>
                          <div class="col-6 col-sm-3">
                            <q-input v-model="consult.weight" outlined dense label="Weight (kg)" @update:model-value="saveConsultations" />
                          </div>
                          <div class="col-6 col-sm-3">
                            <q-input v-model="consult.hr" outlined dense label="Heart Rate" @update:model-value="saveConsultations" />
                          </div>
                          <!-- Assessment -->
                          <div class="col-12">
                            <q-input v-model="consult.assessment" outlined dense type="textarea" rows="2" label="Assessment / Diagnosis" @update:model-value="saveConsultations" />
                          </div>
                          <!-- Prescription -->
                          <div class="col-12">
                            <q-input v-model="consult.prescription" outlined dense type="textarea" rows="2" label="Prescription / Treatment Plan" @update:model-value="saveConsultations" />
                          </div>
                          <div class="col-12">
                            <q-input v-model="consult.doctor" outlined dense label="Attending Physician" @update:model-value="saveConsultations" />
                          </div>
                        </div>
                        <div class="row justify-end q-mt-sm">
                          <q-btn flat color="negative" icon="delete" size="sm" label="Delete Consultation" @click="deleteConsultation(consult.id)" />
                        </div>
                      </q-card-section>
                    </q-card>
                  </q-expansion-item>
                </div>

                <div v-if="patientConsultations.length === 0" class="text-center q-pa-xl text-grey">
                  <q-icon name="medical_services" size="48px" color="grey-3" />
                  <div>No consultations yet. Click "New Consultation" to add one.</div>
                </div>
              </q-tab-panel>
            </q-tab-panels>
          </q-card>
        </div>

        <!-- Empty state -->
        <div v-else class="text-center q-mt-xl">
          <q-icon name="local_hospital" size="80px" color="teal-2" />
          <div class="text-h6 text-grey-6 q-mt-md">Select a patient or add a new one</div>
          <div class="text-caption text-grey-5 q-mt-sm">All data stored locally — works offline</div>
          <q-btn color="teal" icon="person_add" label="Add First Patient" class="q-mt-md" @click="showAddPatient = true" />
        </div>
      </div>
    </div>

    <!-- Add Patient Dialog -->
    <q-dialog v-model="showAddPatient">
      <q-card style="min-width: 400px;">
        <q-card-section class="bg-teal-8 text-white">
          <div class="text-h6"><q-icon name="person_add" class="q-mr-sm" />New Patient</div>
        </q-card-section>
        <q-card-section>
          <div class="row q-col-gutter-sm">
            <div class="col-12">
              <q-input v-model="newPatient.name" outlined dense label="Full Name *" />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="newPatient.dob" outlined dense label="Date of Birth *" type="date" />
            </div>
            <div class="col-12 col-sm-6">
              <q-select v-model="newPatient.sex" :options="['Male','Female','Other']" outlined dense label="Sex *" />
            </div>
            <div class="col-12 col-sm-6">
              <q-select v-model="newPatient.bloodType" :options="['A+','A-','B+','B-','AB+','AB-','O+','O-']" outlined dense label="Blood Type" clearable />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="newPatient.contact" outlined dense label="Contact Number" />
            </div>
            <div class="col-12">
              <q-input v-model="newPatient.allergies" outlined dense label="Known Allergies" />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="teal" label="Add Patient" icon="check" @click="createPatient" :disabled="!newPatient.name || !newPatient.dob" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Print Dialog -->
    <q-dialog v-model="showPrint" maximized>
      <q-card>
        <q-card-section class="row items-center bg-teal-8 text-white">
          <div class="text-h6">Consultation Summary</div>
          <q-space />
          <q-btn flat icon="print" label="Print" @click="window.print()" />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>
        <q-card-section class="q-pa-lg print-area">
          <div v-if="selectedPatient">
            <div class="text-h5 q-mb-sm">{{ selectedPatient.name }}</div>
            <div class="text-body1 q-mb-md">
              {{ selectedPatient.sex }} · DOB: {{ selectedPatient.dob }} · Blood Type: {{ selectedPatient.bloodType || 'N/A' }}
            </div>
            <div v-if="selectedPatient.allergies" class="q-mb-md">
              <strong>Allergies:</strong> {{ selectedPatient.allergies }}
            </div>
            <q-separator class="q-mb-md" />
            <div v-for="c in patientConsultations" :key="c.id" class="q-mb-md">
              <div class="text-subtitle1 text-weight-bold">{{ c.date }} — {{ c.chiefComplaint }}</div>
              <div><strong>BP:</strong> {{ c.bp || 'N/A' }} | <strong>Temp:</strong> {{ c.temp || 'N/A' }}°C | <strong>Weight:</strong> {{ c.weight || 'N/A' }} kg</div>
              <div><strong>Assessment:</strong> {{ c.assessment || 'N/A' }}</div>
              <div><strong>Prescription:</strong> {{ c.prescription || 'N/A' }}</div>
              <div><strong>Physician:</strong> Dr. {{ c.doctor || 'N/A' }}</div>
              <q-separator class="q-mt-sm" />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

interface Patient {
  id: string; name: string; dob: string; sex: string; bloodType: string;
  contact: string; email: string; allergies: string; notes: string;
}

interface Consultation {
  id: string; patientId: string; date: string; chiefComplaint: string;
  bp: string; temp: string; weight: string; hr: string;
  assessment: string; prescription: string; doctor: string;
}

const patients = ref<Patient[]>([])
const consultations = ref<Consultation[]>([])
const patientSearch = ref('')
const selectedPatientId = ref<string | null>(null)
const patientTab = ref('profile')
const showAddPatient = ref(false)
const showPrint = ref(false)

const newPatient = ref<Partial<Patient>>({ name: '', dob: '', sex: 'Male', bloodType: '', contact: '', allergies: '' })

const selectedPatient = computed(() => patients.value.find(p => p.id === selectedPatientId.value) || null)

const filteredPatients = computed(() =>
  patients.value.filter(p => p.name.toLowerCase().includes(patientSearch.value.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))
)

const patientConsultations = computed(() =>
  consultations.value.filter(c => c.patientId === selectedPatientId.value)
    .sort((a, b) => b.date.localeCompare(a.date))
)

function age(dob: string) {
  if (!dob) return '?'
  const d = new Date(dob)
  const today = new Date()
  let a = today.getFullYear() - d.getFullYear()
  if (today.getMonth() < d.getMonth() || (today.getMonth() === d.getMonth() && today.getDate() < d.getDate())) a--
  return a
}

function lastVisit(patientId: string) {
  const visits = consultations.value.filter(c => c.patientId === patientId)
  if (!visits.length) return null
  return visits.sort((a, b) => b.date.localeCompare(a.date))[0].date
}

function loadData() {
  const raw = localStorage.getItem('trackpx_patients')
  if (raw) patients.value = JSON.parse(raw)
  const craw = localStorage.getItem('trackpx_consultations')
  if (craw) consultations.value = JSON.parse(craw)
}

function savePatients() { localStorage.setItem('trackpx_patients', JSON.stringify(patients.value)) }
function saveConsultations() { localStorage.setItem('trackpx_consultations', JSON.stringify(consultations.value)) }

function selectPatient(id: string) {
  selectedPatientId.value = id
  patientTab.value = 'profile'
}

function createPatient() {
  const p: Patient = {
    id: crypto.randomUUID(),
    name: newPatient.value.name || '',
    dob: newPatient.value.dob || '',
    sex: newPatient.value.sex || 'Male',
    bloodType: newPatient.value.bloodType || '',
    contact: newPatient.value.contact || '',
    email: '',
    allergies: newPatient.value.allergies || '',
    notes: ''
  }
  patients.value.push(p)
  savePatients()
  showAddPatient.value = false
  newPatient.value = { name: '', dob: '', sex: 'Male', bloodType: '', contact: '', allergies: '' }
  selectPatient(p.id)
  $q.notify({ type: 'positive', message: 'Patient added successfully' })
}

function deletePatient(id: string) {
  $q.dialog({ title: 'Delete Patient', message: 'Are you sure? This will remove all their records.', cancel: true }).onOk(() => {
    patients.value = patients.value.filter(p => p.id !== id)
    consultations.value = consultations.value.filter(c => c.patientId !== id)
    savePatients(); saveConsultations()
    selectedPatientId.value = null
    $q.notify({ type: 'positive', message: 'Patient deleted' })
  })
}

function addConsultation() {
  if (!selectedPatientId.value) return
  const c: Consultation = {
    id: crypto.randomUUID(),
    patientId: selectedPatientId.value,
    date: new Date().toISOString().split('T')[0],
    chiefComplaint: '', bp: '', temp: '', weight: '', hr: '',
    assessment: '', prescription: '', doctor: ''
  }
  consultations.value.unshift(c)
  saveConsultations()
  patientTab.value = 'consultations'
}

function deleteConsultation(id: string) {
  consultations.value = consultations.value.filter(c => c.id !== id)
  saveConsultations()
  $q.notify({ type: 'positive', message: 'Consultation deleted', timeout: 1000 })
}

function exportPatient() {
  if (!selectedPatient.value) return
  const data = {
    patient: selectedPatient.value,
    consultations: patientConsultations.value,
    exportedAt: new Date().toISOString()
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = selectedPatient.value.name.replace(/ /g, '_') + '_record.json'
  a.click()
  $q.notify({ type: 'positive', message: 'Patient record exported as JSON' })
}

function printSummary() { showPrint.value = true }

function seedDemoData() {
  if (patients.value.length > 0) return
  const demoPatients: Patient[] = [
    { id: crypto.randomUUID(), name: 'Maria Santos', dob: '1985-03-15', sex: 'Female', bloodType: 'O+', contact: '+63 912 345 6789', email: '', allergies: 'Penicillin', notes: 'Hypertensive, on maintenance meds' },
    { id: crypto.randomUUID(), name: 'Juan Dela Cruz', dob: '1972-07-22', sex: 'Male', bloodType: 'A+', contact: '+63 917 654 3210', email: '', allergies: '', notes: 'Diabetic, Type 2' },
    { id: crypto.randomUUID(), name: 'Ana Reyes', dob: '1995-11-08', sex: 'Female', bloodType: 'B+', contact: '+63 998 765 4321', email: '', allergies: 'Aspirin', notes: '' },
  ]
  patients.value = demoPatients
  savePatients()

  const demoConsults: Consultation[] = [
    {
      id: crypto.randomUUID(), patientId: demoPatients[0].id,
      date: '2026-04-20', chiefComplaint: 'Headache and dizziness',
      bp: '150/95', temp: '36.8', weight: '65', hr: '88',
      assessment: 'Hypertensive urgency — BP elevated', prescription: 'Amlodipine 5mg OD, rest, low-sodium diet', doctor: 'Cruz'
    },
    {
      id: crypto.randomUUID(), patientId: demoPatients[1].id,
      date: '2026-04-25', chiefComplaint: 'Follow-up for diabetes management',
      bp: '128/82', temp: '36.5', weight: '82', hr: '76',
      assessment: 'Blood sugar controlled, HbA1c 7.2%', prescription: 'Metformin 500mg BID, continue current regimen', doctor: 'Santos'
    }
  ]
  consultations.value = demoConsults
  saveConsultations()
}

const window = globalThis

onMounted(() => {
  loadData()
  seedDemoData()
})
</script>
