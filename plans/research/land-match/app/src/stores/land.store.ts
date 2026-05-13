import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface LandListing {
  id: string
  name: string
  location: string
  areaSqm: number
  price: number
  zoning: string
  description: string
  documents: string[]
  verified: boolean
  lat: number
  lng: number
  createdAt: string
}

const STORAGE_KEY = 'land_match_state'

const defaultListings: LandListing[] = [
  { id: '1', name: 'Batangas Agricultural Lot', location: 'Batangas, Philippines', areaSqm: 12000, price: 1800000, zoning: 'Agricultural', description: 'Fertile agricultural land with coconut trees. Road frontage. Title clean. Near highway.', documents: ['Title Deed', 'Tax Declaration', 'Survey Plan'], verified: true, lat: 13.76, lng: 121.05, createdAt: '2026-01-15' },
  { id: '2', name: 'Cebu Residential Lot', location: 'Cebu City, Philippines', areaSqm: 300, price: 4500000, zoning: 'Residential', description: 'Prime residential lot in subdivided area. All utilities available. Gated community.', documents: ['Title Deed', 'Tax Declaration'], verified: true, lat: 10.32, lng: 123.90, createdAt: '2026-02-10' },
  { id: '3', name: 'Davao Commercial Parcel', location: 'Davao City, Philippines', areaSqm: 800, price: 12000000, zoning: 'Commercial', description: 'Corner lot along main road. High foot traffic area. Suitable for retail or mixed-use building.', documents: ['Title Deed'], verified: false, lat: 7.07, lng: 125.61, createdAt: '2026-03-01' },
  { id: '4', name: 'Tagaytay Vacation Lot', location: 'Tagaytay, Philippines', areaSqm: 500, price: 7500000, zoning: 'Residential', description: 'Cool climate highland lot with Taal Lake view. Perfect for vacation house or airbnb.', documents: ['Title Deed', 'Survey Plan', 'Tax Declaration', 'Environmental Clearance'], verified: true, lat: 14.10, lng: 120.96, createdAt: '2026-03-20' },
  { id: '5', name: 'Bukidnon Farmland', location: 'Bukidnon, Philippines', areaSqm: 50000, price: 3500000, zoning: 'Agricultural', description: 'Large agricultural parcel suitable for pineapple, corn, or vegetable farming. Irrigation nearby.', documents: ['Tax Declaration'], verified: false, lat: 8.05, lng: 124.62, createdAt: '2026-04-01' },
  { id: '6', name: 'Iloilo Industrial Zone', location: 'Iloilo City, Philippines', areaSqm: 5000, price: 22000000, zoning: 'Industrial', description: 'Near SEZ. Ideal for manufacturing, warehouse, or logistics hub. Power and water ready.', documents: ['Title Deed', 'Tax Declaration', 'Survey Plan', 'Environmental Compliance'], verified: true, lat: 10.70, lng: 122.56, createdAt: '2026-04-15' },
]

export const useLandStore = defineStore('land', () => {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  const listings = ref<LandListing[]>(saved.listings || defaultListings)
  const savedListings = ref<string[]>(saved.savedListings || [])

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ listings: listings.value, savedListings: savedListings.value }))
  }

  function addListing(l: Omit<LandListing, 'id' | 'verified' | 'createdAt'>) {
    const newL: LandListing = {
      id: Date.now().toString(),
      verified: false,
      createdAt: new Date().toISOString().split('T')[0],
      ...l
    }
    listings.value.unshift(newL)
    save()
    return newL
  }

  function toggleSave(id: string) {
    const idx = savedListings.value.indexOf(id)
    if (idx >= 0) savedListings.value.splice(idx, 1)
    else savedListings.value.push(id)
    save()
  }

  function isSaved(id: string) {
    return savedListings.value.includes(id)
  }

  return { listings, savedListings, addListing, toggleSave, isSaved }
})
