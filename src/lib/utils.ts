import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const then = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return formatDate(date)
}

export const REGIONS = [
  { value: 'sydney', label: 'Sydney', coords: [151.2093, -33.8688] },
  { value: 'melbourne', label: 'Melbourne', coords: [144.9631, -37.8136] },
  { value: 'brisbane', label: 'Brisbane', coords: [153.0251, -27.4698] },
  { value: 'perth', label: 'Perth', coords: [115.8605, -31.9505] },
  { value: 'adelaide', label: 'Adelaide', coords: [138.6007, -34.9285] },
  { value: 'newcastle', label: 'Newcastle', coords: [151.7789, -32.9283] },
  { value: 'gold-coast', label: 'Gold Coast', coords: [153.4000, -28.0167] },
] as const

export const JOB_CATEGORIES = [
  { value: 'Real Estate', label: 'Real Estate', icon: 'Building2' },
  { value: 'Roof Check', label: 'Roof Inspection', icon: 'Home' },
  { value: 'Agriculture', label: 'Agriculture', icon: 'Wheat' },
] as const
