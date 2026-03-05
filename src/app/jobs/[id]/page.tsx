import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Badge } from '@/components/ui/badge'
import { TrustBadge } from '@/components/trust-badge'
import { ContactPoster } from '@/components/contact-poster'
import { BidsList } from '@/components/bids-list'
import { JobMap } from '@/components/job-map'
import { Avatar } from '@/components/avatar'
import {
  ArrowLeft,
  Building2,
  Home,
  Wheat,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  User,
  Share2,
  Flag,
} from 'lucide-react'
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils'
import type { JobCategory } from '@/types/database'

const CATEGORY_CONFIG: Record<JobCategory, { icon: typeof Building2; image: string }> = {
  'Real Estate': {
    icon: Building2,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80&auto=format',
  },
  'Roof Check': {
    icon: Home,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80&auto=format',
  },
  'Agriculture': {
    icon: Wheat,
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80&auto=format',
  },
}

const STATUS_VARIANTS = {
  open: 'success',
  assigned: 'warning',
  completed: 'secondary',
} as const

export default async function JobDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  const { data: job, error } = await supabase
    .from('jobs')
    .select(`*, profiles!jobs_client_id_fkey(id, full_name, avatar_url)`)
    .eq('id', params.id)
    .single()

  if (error || !job) notFound()

  const isOwner = user?.id === job.client_id
  const isPilot = profile?.role === 'pilot'
  const config = CATEGORY_CONFIG[job.category as JobCategory]
  const Icon = config.icon

  let bids: any[] = []
  let userBid = null

  if (isOwner) {
    const { data } = await supabase
      .from('bids')
      .select(`*, profiles!bids_pilot_id_fkey(id, full_name, avatar_url, is_repl_verified, arn_number, bio)`)
      .eq('job_id', job.id)
      .order('created_at', { ascending: false })
    bids = data || []
  } else if (user) {
    const { data } = await supabase
      .from('bids')
      .select('*')
      .eq('job_id', job.id)
      .eq('pilot_id', user.id)
      .single()
    userBid = data
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={profile} />

      {/* Hero image */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <Image
          src={config.image}
          alt={job.title}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-6 left-0 right-0">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Link
              href={isOwner ? '/dashboard' : '/jobs'}
              className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white mb-3 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {isOwner ? 'Dashboard' : 'All Jobs'}
            </Link>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-gray-700">
                <Icon className="h-3 w-3 mr-1" />
                {job.category}
              </Badge>
              <Badge variant={STATUS_VARIANTS[job.status as keyof typeof STATUS_VARIANTS] as any}>
                {job.status === 'open' ? 'Open' : job.status === 'assigned' ? 'In Progress' : 'Completed'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left column — details */}
          <div className="space-y-6">
            {/* Title + meta */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{job.title}</h1>
                  <p className="text-sm text-gray-500 mt-1.5">
                    Posted {formatRelativeTime(job.created_at)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(job.budget_min)} – {formatCurrency(job.budget_max)}
                  </p>
                  <p className="text-sm text-gray-500">Budget</p>
                </div>
              </div>

              {job.description && (
                <div className="mb-6">
                  <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Description</h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{job.description}</p>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                  <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Location</p>
                    <p className="text-sm text-gray-500">{job.location_name}</p>
                  </div>
                </div>
                {job.deadline && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                    <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Deadline</p>
                      <p className="text-sm text-gray-500">{formatDate(job.deadline)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Map */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Location</h2>
              <JobMap coordinates={job.coordinates} locationName={job.location_name} />
            </div>

            {/* Proposals (for job owner) */}
            {isOwner && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Proposals ({bids.length})</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Review proposals from drone pilots</p>
                  </div>
                </div>
                <BidsList bids={bids} jobId={job.id} jobStatus={job.status} />
              </div>
            )}
          </div>

          {/* Right column — sidebar */}
          <div className="space-y-6">
            {/* Posted by card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Posted by</h3>
              <div className="flex items-center gap-3">
                <Avatar id={job.profiles?.id} name={job.profiles?.full_name} avatarUrl={job.profiles?.avatar_url} size="lg" />
                <div>
                  <p className="font-medium text-gray-900">{job.profiles?.full_name || 'Client'}</p>
                  <p className="text-sm text-gray-500">Client</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                  <Share2 className="h-3.5 w-3.5" />
                  Share
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                  <Flag className="h-3.5 w-3.5" />
                  Report
                </button>
              </div>
            </div>

            {/* Contact form for pilots */}
            {isPilot && job.status === 'open' && (
              <ContactPoster
                jobId={job.id}
                budgetMin={job.budget_min}
                budgetMax={job.budget_max}
                existingBid={userBid}
              />
            )}

            {/* Prompt to sign in for non-authenticated */}
            {!user && job.status === 'open' && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
                <User className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 mb-1">Want to work on this?</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Sign in as a pilot to send the client a proposal.
                </p>
                <div className="space-y-2">
                  <Link
                    href="/auth/signup"
                    className="block w-full px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 text-center transition-colors"
                  >
                    Sign up free
                  </Link>
                  <Link
                    href="/auth/login"
                    className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 text-center transition-colors"
                  >
                    Log in
                  </Link>
                </div>
              </div>
            )}

            {/* Client who's signed in but isn't the owner */}
            {user && !isPilot && !isOwner && job.status === 'open' && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
                <p className="text-sm text-gray-500">
                  Only pilot accounts can send proposals. Switch to a pilot account to contact this client.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
