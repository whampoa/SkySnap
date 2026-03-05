'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Home,
  Wheat,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SafetyDisclosure } from '@/components/safety-disclosure'
import { LocationPicker } from '@/components/location-picker'
import { cn, JOB_CATEGORIES } from '@/lib/utils'
import type { JobCategory } from '@/types/database'

type Step = 1 | 2 | 3 | 4

const CATEGORY_ICONS = {
  'Real Estate': Building2,
  'Roof Check': Home,
  'Agriculture': Wheat,
}

const CATEGORY_DESCRIPTIONS = {
  'Real Estate': 'Aerial photography for property listings',
  'Roof Check': 'Roof inspections and damage assessment',
  'Agriculture': 'Crop monitoring and agricultural surveys',
}

export default function NewJobPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<Step>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [category, setCategory] = useState<JobCategory | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState<{ name: string; coordinates: [number, number] } | null>(null)
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [deadline, setDeadline] = useState('')

  const canProceed = () => {
    switch (step) {
      case 1: return category !== null
      case 2: return title.trim() !== '' && description.trim() !== ''
      case 3: return location !== null
      case 4: return budgetMin !== '' && budgetMax !== '' && parseInt(budgetMax) >= parseInt(budgetMin)
      default: return false
    }
  }

  const handleSubmit = async () => {
    if (!category || !location) return
    setIsLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: insertError } = await supabase
        .from('jobs')
        .insert({
          client_id: user.id,
          title,
          description,
          category,
          location_name: location.name,
          coordinates: `POINT(${location.coordinates[0]} ${location.coordinates[1]})`,
          budget_min: parseInt(budgetMin),
          budget_max: parseInt(budgetMax),
          deadline: deadline || null,
        })
        .select()
        .single()

      if (insertError) throw insertError
      router.push(`/jobs/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job')
    } finally {
      setIsLoading(false)
    }
  }

  const steps = [
    { number: 1, title: 'Category' },
    { number: 2, title: 'Details' },
    { number: 3, title: 'Location' },
    { number: 4, title: 'Budget' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <span className="text-sm text-gray-500">Step {step} of 4</span>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Post a new job</h1>
          <p className="text-gray-500 mt-1">Find the perfect drone pilot for your project.</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {steps.map((s, i) => (
              <div key={s.number} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                    step >= s.number ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'
                  )}>
                    {step > s.number ? <CheckCircle2 className="h-4 w-4" /> : s.number}
                  </div>
                  <span className={cn(
                    'text-sm hidden sm:block',
                    step >= s.number ? 'text-gray-900 font-medium' : 'text-gray-400'
                  )}>
                    {s.title}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={cn('h-0.5 w-8 sm:w-16 mx-2 sm:mx-4 rounded-full', step > s.number ? 'bg-gray-900' : 'bg-gray-200')} />
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 mb-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">What type of service do you need?</h2>
                <p className="text-sm text-gray-500 mt-1">Select the category that best fits your project.</p>
              </div>
              <div className="grid gap-3">
                {JOB_CATEGORIES.map((cat) => {
                  const Icon = CATEGORY_ICONS[cat.value as keyof typeof CATEGORY_ICONS]
                  return (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(cat.value as JobCategory)}
                      className={cn(
                        'flex items-center gap-4 rounded-xl border p-4 text-left transition-all',
                        category === cat.value
                          ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      )}
                    >
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', category === cat.value ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600')}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{cat.label}</h3>
                        <p className="text-sm text-gray-500">{CATEGORY_DESCRIPTIONS[cat.value as keyof typeof CATEGORY_DESCRIPTIONS]}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Project details</h2>
                <p className="text-sm text-gray-500 mt-1">Help pilots understand what you need.</p>
              </div>
              <Input label="Job title" placeholder="e.g., Aerial photos for 3-bedroom house listing" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Textarea label="Description" placeholder="Describe what you need, including specific shots, angles, or requirements..." value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[150px]" />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Job location</h2>
                <p className="text-sm text-gray-500 mt-1">Set the location for the drone operation.</p>
              </div>
              <LocationPicker onLocationSelect={setLocation} initialLocation={location || undefined} />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Budget and timeline</h2>
                <p className="text-sm text-gray-500 mt-1">Pilots will send proposals within your range.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Minimum budget (AUD)" type="number" placeholder="150" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} min={0} />
                <Input label="Maximum budget (AUD)" type="number" placeholder="500" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} min={0} />
              </div>
              <Input label="Deadline (optional)" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} min={new Date().toISOString().split('T')[0]} />
              <SafetyDisclosure />
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep((step - 1) as Step)}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          ) : <div />}

          {step < 4 ? (
            <Button onClick={() => setStep((step + 1) as Step)} disabled={!canProceed()}>
              Continue <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!canProceed() || isLoading} isLoading={isLoading}>
              Post Job
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}
