'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Clock, MessageSquare, Inbox } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrustBadge } from '@/components/trust-badge'
import { Avatar } from '@/components/avatar'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import type { BidWithPilot } from '@/types/database'

interface BidsListProps {
  bids: BidWithPilot[]
  jobId: string
  jobStatus: string
}

export function BidsList({ bids, jobId, jobStatus }: BidsListProps) {
  const router = useRouter()
  const supabase = createClient()
  const [acceptingId, setAcceptingId] = useState<string | null>(null)

  const handleAcceptBid = async (bidId: string) => {
    setAcceptingId(bidId)
    try {
      const { error } = await supabase.rpc('accept_bid', { bid_id: bidId })
      if (error) throw error
      router.refresh()
    } catch (err) {
      console.error('Error accepting bid:', err)
      alert('Failed to accept proposal. Please try again.')
    } finally {
      setAcceptingId(null)
    }
  }

  if (bids.length === 0) {
    return (
      <div className="text-center py-12">
        <Inbox className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No proposals yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Pilots will send proposals once they see your job listing.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bids.map((bid) => (
        <div
          key={bid.id}
          className={`rounded-xl border p-5 transition-colors ${
            bid.status === 'accepted'
              ? 'border-emerald-200 bg-emerald-50'
              : bid.status === 'rejected'
              ? 'border-gray-200 bg-gray-50 opacity-60'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Avatar id={bid.profiles?.id} name={bid.profiles?.full_name} avatarUrl={bid.profiles?.avatar_url} size="md" />
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-medium text-gray-900">
                    {bid.profiles?.full_name || 'Pilot'}
                  </span>
                  <TrustBadge isVerified={bid.profiles?.is_repl_verified || false} size="sm" />
                </div>
                {bid.profiles?.arn_number && (
                  <p className="text-xs text-gray-400">ARN: {bid.profiles.arn_number}</p>
                )}
              </div>
            </div>

            <div className="text-right">
              <p className="text-xl font-bold text-gray-900">{formatCurrency(bid.amount)}</p>
              {bid.status !== 'pending' && (
                <Badge variant={bid.status === 'accepted' ? 'success' : 'destructive'}>
                  {bid.status}
                </Badge>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {bid.delivery_days} day{bid.delivery_days !== 1 ? 's' : ''} delivery
            </span>
            <span className="text-gray-300">|</span>
            <span>{formatRelativeTime(bid.created_at)}</span>
          </div>

          {bid.message && (
            <div className="mt-3 rounded-lg bg-gray-50 p-3">
              <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600 leading-relaxed">{bid.message}</p>
              </div>
            </div>
          )}

          {jobStatus === 'open' && bid.status === 'pending' && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Button
                onClick={() => handleAcceptBid(bid.id)}
                isLoading={acceptingId === bid.id}
                disabled={acceptingId !== null}
                className="w-full"
              >
                <Check className="h-4 w-4 mr-2" />
                Accept Proposal
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
