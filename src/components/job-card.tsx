'use client'

import Image from 'next/image'
import { Building2, Home, Wheat, MapPin, Calendar, DollarSign } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/avatar'
import { formatCurrency, formatRelativeTime, formatDate } from '@/lib/utils'
import type { JobWithClient, JobCategory } from '@/types/database'

interface JobCardProps {
  job: JobWithClient
}

const CATEGORY_CONFIG: Record<JobCategory, { icon: typeof Building2; image: string }> = {
  'Real Estate': {
    icon: Building2,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80&auto=format',
  },
  'Roof Check': {
    icon: Home,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80&auto=format',
  },
  'Agriculture': {
    icon: Wheat,
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80&auto=format',
  },
}

export function JobCard({ job }: JobCardProps) {
  const config = CATEGORY_CONFIG[job.category]
  const Icon = config.icon

  return (
    <div className="group card-lift rounded-2xl overflow-hidden border border-gray-200 bg-white cursor-pointer">
      <div className="aspect-[16/9] relative overflow-hidden bg-gray-100">
        <Image
          src={config.image}
          alt={job.title}
          fill
          className="object-cover img-zoom"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-gray-700 shadow-sm">
            <Icon className="h-3 w-3 mr-1" />
            {job.category}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <span className="text-xs font-medium text-white bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1">
            {formatRelativeTime(job.created_at)}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-gray-600 transition-colors">
          {job.title}
        </h3>

        {job.description && (
          <p className="mt-1.5 text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {job.description}
          </p>
        )}

        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{job.location_name}</span>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-base font-bold text-gray-900">
              {formatCurrency(job.budget_min)} – {formatCurrency(job.budget_max)}
            </p>
          </div>

          {job.deadline && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Calendar className="h-3 w-3" />
              {formatDate(job.deadline)}
            </div>
          )}
        </div>

        {job.profiles && (
        <div className="mt-3 flex items-center gap-2">
            <Avatar id={job.profiles.id} name={job.profiles.full_name} avatarUrl={job.profiles.avatar_url} size="xs" />
            <span className="text-xs text-gray-500">{job.profiles.full_name || 'Client'}</span>
          </div>
        )}
      </div>
    </div>
  )
}
