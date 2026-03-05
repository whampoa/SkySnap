'use client'

import { Shield, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrustBadgeProps {
  isVerified: boolean
  arnNumber?: string | null
  size?: 'sm' | 'md' | 'lg'
  showArn?: boolean
}

export function TrustBadge({ isVerified, arnNumber, size = 'md', showArn = false }: TrustBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  if (!isVerified) {
    return (
      <div className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-gray-100 text-gray-500',
        sizeClasses[size]
      )}>
        <Shield className={iconSizes[size]} />
        <span>Unverified</span>
      </div>
    )
  }

  return (
    <div className={cn(
      'inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200',
      sizeClasses[size]
    )}>
      <CheckCircle2 className={cn(iconSizes[size], 'text-emerald-500')} />
      <span className="font-semibold">RePL Verified</span>
      {showArn && arnNumber && (
        <span className="text-emerald-600/60 ml-1">ARN: {arnNumber}</span>
      )}
    </div>
  )
}
