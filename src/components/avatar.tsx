'use client'

import { cn } from '@/lib/utils'

const AVATAR_COLORS = [
  'bg-rose-500',
  'bg-pink-500',
  'bg-fuchsia-500',
  'bg-purple-500',
  'bg-violet-500',
  'bg-indigo-500',
  'bg-blue-500',
  'bg-sky-500',
  'bg-cyan-500',
  'bg-teal-500',
  'bg-emerald-500',
  'bg-green-500',
  'bg-lime-600',
  'bg-amber-500',
  'bg-orange-500',
  'bg-red-500',
]

function hashName(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return parts[0][0]?.toUpperCase() || '?'
}

interface AvatarProps {
  id?: string | null
  name: string | null | undefined
  avatarUrl?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-xl',
}

export function Avatar({ id, name, avatarUrl, size = 'md', className }: AvatarProps) {
  const initials = getInitials(name)
  const seed = (id || name || 'default').toString()
  const colorIndex = hashName(seed) % AVATAR_COLORS.length
  const bgColor = AVATAR_COLORS[colorIndex]

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name || 'User'}
        className={cn('rounded-full object-cover', sizeClasses[size], className)}
      />
    )
  }

  return (
    <div className={cn(
      'rounded-full flex items-center justify-center font-semibold text-white select-none',
      sizeClasses[size],
      bgColor,
      className,
    )}>
      {initials}
    </div>
  )
}
