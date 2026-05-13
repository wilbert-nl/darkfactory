import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Listing {
  id: string
  title: string
  description: string
  category: string
  pricePerDay: number
  deposit: number
  availableFrom: string
  availableTo: string
  owner: string
  available: boolean
}

export interface Booking {
  id: string
  listingId: string
  listingTitle: string
  owner: string
  fromDate: string
  toDate: string
  totalDays: number
  totalCost: number
  status: 'pending' | 'confirmed' | 'returned'
  createdAt: string
}

const STORAGE_KEY = 'rentals_state'

const defaultListings: Listing[] = [
  { id: '1', title: 'DeWalt Power Drill Set', description: 'Professional 20V cordless drill kit with 2 batteries, charger, and bit set. Perfect for home projects.', category: 'Power Tools', pricePerDay: 25, deposit: 100, availableFrom: '2026-01-01', availableTo: '2026-12-31', owner: 'John M.', available: true },
  { id: '2', title: 'DJI Drone Mavic Mini 3', description: 'Compact folding drone with 4K camera. Great for aerial photography. Includes extra batteries.', category: 'Electronics', pricePerDay: 60, deposit: 300, availableFrom: '2026-04-01', availableTo: '2026-09-30', owner: 'Sarah K.', available: true },
  { id: '3', title: '6-Person Camping Tent', description: 'Waterproof 4-season tent, easy setup, fits 6 adults. Includes rain fly and stakes.', category: 'Outdoor', pricePerDay: 35, deposit: 150, availableFrom: '2026-03-01', availableTo: '2026-10-31', owner: 'Mike T.', available: true },
  { id: '4', title: 'Party Sound System', description: 'JBL PRX815 powered speakers, mixer, mic stand. Handles up to 200 people.', category: 'Event', pricePerDay: 120, deposit: 400, availableFrom: '2026-01-01', availableTo: '2026-12-31', owner: 'Events Co.', available: true },
  { id: '5', title: 'GoPro Hero 12 + Accessories', description: 'Latest GoPro with waterproof case, chest harness, head mount, extra batteries and 128GB card.', category: 'Electronics', pricePerDay: 30, deposit: 150, availableFrom: '2026-01-01', availableTo: '2026-12-31', owner: 'Alex P.', available: false },
  { id: '6', title: 'Pressure Washer', description: '3200 PSI gas pressure washer. Perfect for driveways, decks, and vehicles.', category: 'Power Tools', pricePerDay: 55, deposit: 200, availableFrom: '2026-04-01', availableTo: '2026-11-30', owner: 'Dave R.', available: true },
]

export const useRentalsStore = defineStore('rentals', () => {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  const listings = ref<Listing[]>(saved.listings || defaultListings)
  const bookings = ref<Booking[]>(saved.bookings || [])
  const myListings = ref<Listing[]>(saved.myListings || [])

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ listings: listings.value, bookings: bookings.value, myListings: myListings.value }))
  }

  function addListing(l: Omit<Listing, 'id' | 'available'>) {
    const newL: Listing = { id: Date.now().toString(), available: true, ...l }
    listings.value.unshift(newL)
    myListings.value.push(newL)
    save()
    return newL
  }

  function book(listingId: string, fromDate: string, toDate: string) {
    const listing = listings.value.find(l => l.id === listingId)
    if (!listing) return
    const days = Math.max(1, Math.ceil((new Date(toDate).getTime() - new Date(fromDate).getTime()) / 86400000))
    const booking: Booking = {
      id: Date.now().toString(),
      listingId,
      listingTitle: listing.title,
      owner: listing.owner,
      fromDate,
      toDate,
      totalDays: days,
      totalCost: days * listing.pricePerDay,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    bookings.value.push(booking)
    save()
    return booking
  }

  return { listings, bookings, myListings, addListing, book }
})
