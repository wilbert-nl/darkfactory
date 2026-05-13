import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Itinerary {
  id: string
  destination: string
  startDate: string
  endDate: string
  groupSize: number
  budget: string
  preferences: string[]
  status: 'open' | 'accepted' | 'closed'
  acceptedBidId: string | null
  createdAt: string
}

export interface Bid {
  id: string
  itineraryId: string
  agency: string
  price: string
  duration: string
  description: string
  rating: number
  includes: string[]
}

const STORAGE_KEY = 'travel_connect_state'

const mockBids: Bid[] = [
  { id: 'b1', itineraryId: 'demo', agency: 'Wanderlust Tours', price: '$2,400/person', duration: '10 days', description: 'Luxury guided experience with hand-picked hotels, private transfers, and exclusive local guides.', rating: 4.9, includes: ['Hotel', 'Breakfast', 'Tours', 'Transfers'] },
  { id: 'b2', itineraryId: 'demo', agency: 'Budget Horizons', price: '$1,200/person', duration: '10 days', description: 'Best value package with comfortable 3-star hotels, shared tours, and flexible schedule.', rating: 4.3, includes: ['Hotel', 'Breakfast', 'Group Tours'] },
  { id: 'b3', itineraryId: 'demo', agency: 'Elite Escapes', price: '$3,800/person', duration: '12 days', description: 'Ultra-premium 5-star experience with yacht excursion, Michelin dining, and personal concierge.', rating: 5.0, includes: ['5-Star Hotel', 'All Meals', 'Private Tours', 'Yacht', 'Concierge'] },
]

export const useTravelStore = defineStore('travel', () => {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  const itineraries = ref<Itinerary[]>(saved.itineraries || [])
  const bids = ref<Bid[]>(saved.bids || mockBids)

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ itineraries: itineraries.value, bids: bids.value }))
  }

  function addItinerary(it: Omit<Itinerary, 'id' | 'status' | 'acceptedBidId' | 'createdAt'>) {
    const newIt: Itinerary = {
      id: Date.now().toString(),
      status: 'open',
      acceptedBidId: null,
      createdAt: new Date().toISOString(),
      ...it
    }
    itineraries.value.unshift(newIt)
    // Add mock bids for the new itinerary
    const newBids = mockBids.map(b => ({ ...b, id: b.id + '-' + newIt.id, itineraryId: newIt.id }))
    bids.value.push(...newBids)
    save()
    return newIt
  }

  function acceptBid(itineraryId: string, bidId: string) {
    const it = itineraries.value.find(i => i.id === itineraryId)
    if (it) { it.acceptedBidId = bidId; it.status = 'accepted'; save() }
  }

  function getBidsForItinerary(itineraryId: string) {
    return bids.value.filter(b => b.itineraryId === itineraryId || b.itineraryId === 'demo')
  }

  return { itineraries, bids, addItinerary, acceptBid, getBidsForItinerary }
})
