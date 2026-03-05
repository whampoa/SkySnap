'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency } from '@/lib/utils'

interface BidFormProps {
  jobId: string
  budgetMin: number
  budgetMax: number
  existingBid?: {
    id: string
    amount: number
    message: string | null
    delivery_days: number
  } | null
}

export function BidForm({ jobId, budgetMin, budgetMax, existingBid }: BidFormProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [amount, setAmount] = useState(existingBid?.amount?.toString() || '')
  const [deliveryDays, setDeliveryDays] = useState(existingBid?.delivery_days?.toString() || '')
  const [message, setMessage] = useState(existingBid?.message || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const bidAmount = parseInt(amount)
      const days = parseInt(deliveryDays)

      if (bidAmount < budgetMin || bidAmount > budgetMax) {
        throw new Error(`Bid must be between ${formatCurrency(budgetMin)} and ${formatCurrency(budgetMax)}`)
      }

      if (existingBid) {
        const { error: updateError } = await supabase
          .from('bids')
          .update({
            amount: bidAmount,
            delivery_days: days,
            message: message || null,
          })
          .eq('id', existingBid.id)

        if (updateError) throw updateError
      } else {
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
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit bid')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {existingBid ? 'Update Your Bid' : 'Place a Bid'}
        </CardTitle>
        <CardDescription>
          Budget range: {formatCurrency(budgetMin)} - {formatCurrency(budgetMax)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <Input
            label="Your Bid (AUD)"
            type="number"
            placeholder={`${budgetMin} - ${budgetMax}`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={budgetMin}
            max={budgetMax}
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
            label="Message to Client (Optional)"
            placeholder="Introduce yourself and explain why you're the right pilot for this job..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[80px]"
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            <Send className="h-4 w-4 mr-2" />
            {existingBid ? 'Update Bid' : 'Submit Bid'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
