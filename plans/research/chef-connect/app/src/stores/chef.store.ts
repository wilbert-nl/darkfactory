import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Chef {
  id: string
  name: string
  cuisine: string
  bio: string
  price: number
  rating: number
  verified: boolean
  avatar: string
}

export interface Order {
  id: string
  chefId: string
  chefName: string
  meal: string
  qty: number
  address: string
  total: number
  status: 'pending' | 'confirmed' | 'delivered'
  createdAt: string
}

const STORAGE_KEY_CHEFS = 'chef_connect_chefs'
const STORAGE_KEY_ORDERS = 'chef_connect_orders'

const defaultChefs: Chef[] = [
  { id: '1', name: 'Maria Santos', cuisine: 'Filipino', bio: 'Authentic Filipino home cooking with love. Specialty: Kare-Kare and Lechon', price: 18, rating: 4.8, verified: true, avatar: 'MS' },
  { id: '2', name: 'Amara Diallo', cuisine: 'West African', bio: 'Jollof rice expert and Egusi soup specialist from Lagos with 10+ years experience', price: 22, rating: 4.9, verified: true, avatar: 'AD' },
  { id: '3', name: 'Priya Nair', cuisine: 'South Indian', bio: 'Kerala-style biryanis and authentic dosas, coconut-based curries', price: 16, rating: 4.7, verified: false, avatar: 'PN' },
  { id: '4', name: 'Chen Wei', cuisine: 'Sichuan Chinese', bio: 'Fiery Sichuan cuisine, hand-pulled noodles, mapo tofu', price: 20, rating: 4.6, verified: true, avatar: 'CW' },
]

export const useChefStore = defineStore('chef', () => {
  const chefs = ref<Chef[]>(JSON.parse(localStorage.getItem(STORAGE_KEY_CHEFS) || 'null') || defaultChefs)
  const orders = ref<Order[]>(JSON.parse(localStorage.getItem(STORAGE_KEY_ORDERS) || '[]'))

  function saveChefs() {
    localStorage.setItem(STORAGE_KEY_CHEFS, JSON.stringify(chefs.value))
  }

  function saveOrders() {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders.value))
  }

  function addChef(chef: Omit<Chef, 'id' | 'rating' | 'verified' | 'avatar'>) {
    const initials = chef.name.split(' ').map(n => n[0]).join('').toUpperCase()
    const newChef: Chef = {
      id: Date.now().toString(),
      rating: 4.5,
      verified: false,
      avatar: initials.slice(0, 2),
      ...chef
    }
    chefs.value.push(newChef)
    saveChefs()
    return newChef
  }

  function addOrder(order: Omit<Order, 'id' | 'status' | 'createdAt'>) {
    const newOrder: Order = {
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...order
    }
    orders.value.push(newOrder)
    saveOrders()
    return newOrder
  }

  return { chefs, orders, addChef, addOrder }
})
