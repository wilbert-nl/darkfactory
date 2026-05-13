import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Job {
  id: string
  filename: string
  style: string
  status: 'queued' | 'processing' | 'done' | 'failed'
  progress: number
  createdAt: number
  resultThumb?: string
}

export const useJobStore = defineStore('jobs', () => {
  const jobs = ref<Job[]>(JSON.parse(localStorage.getItem('aw-jobs') || '[]'))

  function save() {
    localStorage.setItem('aw-jobs', JSON.stringify(jobs.value))
  }

  function addJob(filename: string, style: string): Job {
    const job: Job = {
      id: crypto.randomUUID(),
      filename,
      style,
      status: 'queued',
      progress: 0,
      createdAt: Date.now()
    }
    jobs.value.unshift(job)
    save()
    return job
  }

  function simulateProcessing(jobId: string) {
    const job = jobs.value.find(j => j.id === jobId)
    if (!job) return
    job.status = 'processing'
    save()
    const interval = setInterval(() => {
      const j = jobs.value.find(j => j.id === jobId)
      if (!j) { clearInterval(interval); return }
      j.progress = Math.min(j.progress + Math.random() * 15, 100)
      if (j.progress >= 100) {
        j.progress = 100
        j.status = 'done'
        j.resultThumb = `https://picsum.photos/seed/${jobId}/400/300`
        clearInterval(interval)
      }
      save()
    }, 800)
  }

  return { jobs, addJob, simulateProcessing }
})
