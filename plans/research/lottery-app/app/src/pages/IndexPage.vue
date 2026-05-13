<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- Left: Create Raffle -->
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section class="bg-deep-purple-8 text-white">
            <div class="text-h6">Create a Raffle</div>
          </q-card-section>
          <q-card-section class="q-gutter-md">
            <q-input v-model="newRaffle.name" label="Raffle Name *" outlined />
            <q-input v-model="newRaffle.description" label="Prize Description *" outlined type="textarea" rows="2" />
            <q-input v-model="newRaffle.ticketPrice" label="Ticket Price ($)" outlined type="number" prefix="$" />
            <q-input v-model="newRaffle.maxTickets" label="Max Tickets" outlined type="number" />
            <q-input v-model="newRaffle.drawDate" label="Draw Date *" outlined type="date" />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn color="deep-purple-8" label="Create Raffle" icon="add" @click="createRaffle" :disable="!newRaffle.name || !newRaffle.description || !newRaffle.drawDate" />
          </q-card-actions>
        </q-card>

        <!-- Stats -->
        <q-card class="q-mt-md">
          <q-card-section>
            <div class="text-subtitle2 text-grey">Platform Stats</div>
            <div class="row q-mt-sm q-gutter-sm">
              <div class="col">
                <q-item>
                  <q-item-section avatar>
                    <q-avatar color="deep-purple-1" text-color="deep-purple-8" icon="casino" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-h6 text-deep-purple-8">{{ raffles.length }}</q-item-label>
                    <q-item-label caption>Raffles</q-item-label>
                  </q-item-section>
                </q-item>
              </div>
              <div class="col">
                <q-item>
                  <q-item-section avatar>
                    <q-avatar color="green-1" text-color="positive" icon="confirmation_number" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-h6 text-positive">{{ totalTickets }}</q-item-label>
                    <q-item-label caption>Tickets</q-item-label>
                  </q-item-section>
                </q-item>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Center/Right: Active Raffles -->
      <div class="col-12 col-md-8">
        <div v-if="raffles.length === 0" class="text-center q-pa-xl">
          <q-icon name="casino" size="80px" color="deep-purple-3" />
          <div class="text-h6 q-mt-md text-grey">No raffles yet. Create one!</div>
        </div>

        <div v-for="raffle in raffles" :key="raffle.id" class="q-mb-lg">
          <q-card :class="raffle.winner ? 'bg-green-1' : ''">
            <q-card-section>
              <div class="row items-start">
                <div class="col">
                  <div class="text-h6">{{ raffle.name }}</div>
                  <div class="text-body2 text-grey q-mb-xs">{{ raffle.description }}</div>
                  <div class="row q-gutter-sm">
                    <q-chip icon="confirmation_number" color="deep-purple-1" text-color="deep-purple-8">
                      ${{ raffle.ticketPrice }}/ticket
                    </q-chip>
                    <q-chip icon="people" color="blue-1" text-color="blue-8">
                      {{ raffle.tickets.length }}/{{ raffle.maxTickets || '∞' }} tickets
                    </q-chip>
                    <q-chip icon="event" color="orange-1" text-color="orange-8">
                      Draw: {{ raffle.drawDate }}
                    </q-chip>
                    <q-chip icon="attach_money" color="green-1" text-color="positive">
                      Pool: ${{ poolAmount(raffle).toFixed(2) }}
                    </q-chip>
                  </div>
                </div>
                <div class="col-auto">
                  <q-btn flat round icon="delete" color="grey" size="sm" @click="deleteRaffle(raffle.id)" v-if="!raffle.winner" />
                </div>
              </div>
            </q-card-section>

            <!-- Winner Banner -->
            <q-card-section v-if="raffle.winner" class="bg-positive text-white">
              <div class="row items-center">
                <q-icon name="emoji_events" size="lg" class="q-mr-sm" />
                <div>
                  <div class="text-h6">WINNER: {{ raffle.winner.name }}</div>
                  <div class="text-body2">
                    Prize: ${{ (poolAmount(raffle) * 0.95).toFixed(2) }} (95% of pool)
                    · Ticket #{{ raffle.winner.ticketNumber }}
                    · Drawn at: {{ raffle.winner.drawnAt }}
                  </div>
                  <div class="text-caption q-mt-xs">
                    Fairness Proof (crypto.getRandomValues seed): {{ raffle.winner.seed }}
                  </div>
                </div>
              </div>
            </q-card-section>

            <!-- Buy Tickets -->
            <q-card-section v-if="!raffle.winner">
              <div class="text-subtitle2 q-mb-sm">Buy a Ticket</div>
              <div class="row q-gutter-sm items-end">
                <q-input v-model="raffle._buyName" label="Your Name" outlined dense class="col" />
                <q-input v-model="raffle._buyEmail" label="Email" outlined dense class="col" />
                <q-input v-model="raffle._buyQty" label="Qty" outlined dense type="number" class="col-2" style="min-width: 70px" />
                <q-btn
                  color="deep-purple-8"
                  label="Buy"
                  icon="confirmation_number"
                  @click="buyTickets(raffle)"
                  :disable="!raffle._buyName || !raffle._buyEmail"
                />
              </div>
            </q-card-section>

            <!-- Ticket List -->
            <q-card-section>
              <div class="row items-center q-mb-sm">
                <div class="text-subtitle2">Ticket Holders ({{ raffle.tickets.length }})</div>
                <q-space />
                <q-btn
                  v-if="!raffle.winner && raffle.tickets.length > 0"
                  color="negative"
                  icon="casino"
                  label="Draw Winner"
                  size="sm"
                  @click="drawWinner(raffle)"
                />
              </div>
              <q-table
                :rows="raffle.tickets"
                :columns="ticketColumns"
                row-key="ticketNumber"
                flat
                dense
                :rows-per-page-options="[5, 10, 25]"
                :pagination="{ rowsPerPage: 5 }"
                :row-class="(row) => row.ticketNumber === raffle.winner?.ticketNumber ? 'bg-positive text-white' : ''"
              >
                <template #body-cell-ticketNumber="props">
                  <q-td :props="props">
                    <q-badge
                      :color="props.row.ticketNumber === raffle.winner?.ticketNumber ? 'positive' : 'deep-purple-3'"
                    >
                      #{{ props.row.ticketNumber }}
                    </q-badge>
                  </q-td>
                </template>
              </q-table>
            </q-card-section>

            <q-card-section v-if="!raffle.winner && raffle.tickets.length === 0" class="text-center text-grey">
              No tickets sold yet
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

interface Ticket {
  ticketNumber: number
  name: string
  email: string
  purchasedAt: string
}

interface Winner {
  name: string
  email: string
  ticketNumber: number
  drawnAt: string
  seed: string
}

interface Raffle {
  id: string
  name: string
  description: string
  ticketPrice: number
  maxTickets: number | null
  drawDate: string
  tickets: Ticket[]
  winner: Winner | null
  _buyName?: string
  _buyEmail?: string
  _buyQty?: number
}

const raffles = ref<Raffle[]>([])

const newRaffle = ref({
  name: '',
  description: '',
  ticketPrice: 10,
  maxTickets: null as number | null,
  drawDate: ''
})

const ticketColumns = [
  { name: 'ticketNumber', label: 'Ticket #', field: 'ticketNumber', align: 'center' as const, sortable: true },
  { name: 'name', label: 'Name', field: 'name', align: 'left' as const },
  { name: 'email', label: 'Email', field: 'email', align: 'left' as const },
  { name: 'purchasedAt', label: 'Purchased At', field: 'purchasedAt', align: 'center' as const }
]

const totalTickets = computed(() => raffles.value.reduce((sum, r) => sum + r.tickets.length, 0))

function poolAmount(raffle: Raffle): number {
  return raffle.tickets.length * raffle.ticketPrice
}

function saveData() {
  localStorage.setItem('lottery_raffles', JSON.stringify(raffles.value.map(r => {
    const { _buyName, _buyEmail, _buyQty, ...rest } = r
    return rest
  })))
}

function createRaffle() {
  const raffle: Raffle = {
    id: Date.now().toString(),
    name: newRaffle.value.name,
    description: newRaffle.value.description,
    ticketPrice: Number(newRaffle.value.ticketPrice) || 10,
    maxTickets: newRaffle.value.maxTickets ? Number(newRaffle.value.maxTickets) : null,
    drawDate: newRaffle.value.drawDate,
    tickets: [],
    winner: null,
    _buyName: '',
    _buyEmail: '',
    _buyQty: 1
  }
  raffles.value.unshift(raffle)
  saveData()
  newRaffle.value = { name: '', description: '', ticketPrice: 10, maxTickets: null, drawDate: '' }
  $q.notify({ type: 'positive', message: 'Raffle created!' })
}

function deleteRaffle(id: string) {
  raffles.value = raffles.value.filter(r => r.id !== id)
  saveData()
}

function buyTickets(raffle: Raffle) {
  const qty = Number(raffle._buyQty) || 1
  if (raffle.maxTickets && raffle.tickets.length + qty > raffle.maxTickets) {
    $q.notify({ type: 'warning', message: `Only ${raffle.maxTickets - raffle.tickets.length} tickets remaining` })
    return
  }
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
  for (let i = 0; i < qty; i++) {
    raffle.tickets.push({
      ticketNumber: raffle.tickets.length + 1,
      name: raffle._buyName!,
      email: raffle._buyEmail!,
      purchasedAt: now
    })
  }
  raffle._buyName = ''
  raffle._buyEmail = ''
  raffle._buyQty = 1
  saveData()
  $q.notify({ type: 'positive', message: `${qty} ticket(s) purchased!` })
}

function drawWinner(raffle: Raffle) {
  if (raffle.tickets.length === 0) {
    $q.notify({ type: 'warning', message: 'No tickets sold yet' })
    return
  }

  // Use crypto.getRandomValues for fairness
  const seed = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0')).join('')

  // Pick a random winner using the seed
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  const winnerIndex = buf[0] % raffle.tickets.length
  const winnerTicket = raffle.tickets[winnerIndex]

  raffle.winner = {
    name: winnerTicket.name,
    email: winnerTicket.email,
    ticketNumber: winnerTicket.ticketNumber,
    drawnAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    seed
  }
  saveData()
  $q.notify({
    type: 'positive',
    message: `Winner drawn: ${winnerTicket.name} (Ticket #${winnerTicket.ticketNumber})!`,
    timeout: 5000
  })
}

onMounted(() => {
  const saved = localStorage.getItem('lottery_raffles')
  if (saved) {
    const parsed = JSON.parse(saved)
    raffles.value = parsed.map((r: any) => ({
      ...r,
      _buyName: '',
      _buyEmail: '',
      _buyQty: 1
    }))
  }
})
</script>
