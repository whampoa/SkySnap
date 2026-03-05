'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, AlertCircle, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency } from '@/lib/utils'

interface ContactPosterProps {
  jobId: string
  budgetMin: number
  budgetMax: number
  existingBid?: {
    id: string
    amount: number
    message: string | null
    delivery_days: number
    status: string
  } | null
}

export function ContactPoster({ jobId, budgetMin, budgetMax, existingBid }: ContactPosterProps) {
  const router = useRouter()
  const supabase = createClient()

  const [amount, setAmount] = useState(existingBid?.amount?.toString() || '')
  const [deliveryDays, setDeliveryDays] = useState(existingBid?.delivery_days?.toString() || '')
  const [message, setMessage] = useState(existingBid?.message || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (existingBid) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          <h3 className="font-semibold text-gray-900">Proposal sent</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Your quote</span>
            <span className="font-medium text-gray-900">{formatCurrency(existingBid.amount)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Delivery</span>
            <span className="text-gray-900">{existingBid.delivery_days} days</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500">Status</span>
            <span className={`font-medium ${
              existingBid.status === 'accepted' ? 'text-emerald-600' :
              existingBid.status === 'rejected' ? 'text-red-600' : 'text-amber-600'
            }`}>
              {existingBid.status === 'pending' ? 'Awaiting response' : existingBid.status}
            </span>
          </div>
        </div>
        {existingBid.message && (
          <div className="mt-4 p-3 rounded-lg bg-gray-50 text-sm text-gray-600">
            {existingBid.message}
          </div>
        )}
      </div>
    )
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
        <h3 className="font-semibold text-gray-900 mb-1">Proposal sent!</h3>
        <p className="text-sm text-gray-600">The client will review your proposal and get back to you.</p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Please sign in to send a proposal')

      const bidAmount = parseInt(amount)
      const days = parseInt(deliveryDays)

      if (isNaN(bidAmount) || bidAmount <= 0) {
        throw new Error('Please enter a valid quote amount')
      }

      const { error: insertError } = await supabase
        .from('bids')
        .insert({
          job_id: jobId,
          pilot_id: user.id,
          amount: bidAmount,
          delivery_days: days,
          message: message || null,
        })

      if (insertError) throw insertError

      setSuccess(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send proposal')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <h3 className="font-semibold text-gray-900 mb-1">Contact this client</h3>
      <p className="text-sm text-gray-500 mb-5">
        Send a proposal with your quote and availability.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <Input
          label="Your Quote (AUD)"
          type="number"
          placeholder={`${budgetMin} – ${budgetMax}`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min={1}
          required
        />

        <Input
          label="Delivery Time (Days)"
          type="number"
          placeholder="e.g., 3"
          value={deliveryDays}
          onChange={(e) => setDeliveryDays(e.target.value)}
          min={1}
          required
        />

        <Textarea
          label="Message"
          placeholder="Introduce yourself, your experience, equipment, and why you're a great fit for this job..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[100px]"
          required
        />

        <Button type="submit" className="w-full" isLoading={isLoading}>
          <Send className="h-4 w-4 mr-2" />
          Send Proposal
        </Button>

        <p className="text-xs text-gray-400 text-center">
          Budget range: {formatCurrency(budgetMin)} – {formatCurrency(budgetMax)}
        </p>
      </form>
    </div>
  )
}
