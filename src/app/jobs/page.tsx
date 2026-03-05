import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { JobsFilter } from '@/components/jobs-filter'
import { JobCard } from '@/components/job-card'
import { Card, CardContent } from '@/components/ui/card'
import { Briefcase } from 'lucide-react'

interface SearchParams {
  category?: string
  region?: string
  search?: string
}

async function JobsList({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient()

  let query = supabase
    .from('jobs')
    .select(`*, profiles!jobs_client_id_fkey(id, full_name, avatar_url)`)
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  if (searchParams.category && searchParams.category !== 'all') {
    query = query.eq('category', searchParams.category)
  }

  if (searchParams.search) {
    query = query.or(`title.ilike.%${searchParams.search}%,description.ilike.%${searchParams.search}%`)
  }

  const { data: jobs, error } = await query

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500">Failed to load jobs. Please try again.</p>
      </div>
    )
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-20">
        <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No jobs found</h3>
        <p className="text-gray-500">
          {searchParams.search || searchParams.category !== 'all'
            ? 'Try adjusting your filters to see more results.'
            : 'Check back soon for new drone service opportunities.'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {jobs.map((job) => (
        <Link key={job.id} href={`/jobs/${job.id}`}>
          <JobCard job={job as any} />
        </Link>
      ))}
    </div>
  )
}

function JobsListSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
          <div className="aspect-[16/9] bg-gray-100" />
          <div className="p-4 space-y-3">
            <div className="h-5 w-3/4 bg-gray-100 rounded" />
            <div className="h-4 w-full bg-gray-100 rounded" />
            <div className="h-4 w-1/2 bg-gray-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function JobsPage(props: { searchParams: Promise<SearchParams> }) {
  const searchParams = await props.searchParams
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

  const { count } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'open')

  return (
    <div className="min-h-screen bg-white">
      <Header user={profile} />

      {/* Page hero */}
      <div className="relative h-48 sm:h-56 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=1920&q=80&auto=format"
          alt="Aerial drone view"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Browse Jobs</h1>
            <p className="mt-2 text-white/80">
              {count} open {count === 1 ? 'opportunity' : 'opportunities'} across Australia
            </p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="hidden lg:block">
            <JobsFilter
              currentCategory={searchParams.category || 'all'}
              currentRegion={searchParams.region || 'all'}
              currentSearch={searchParams.search || ''}
            />
          </aside>

          <div>
            <Suspense fallback={<JobsListSkeleton />}>
              <JobsList searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  )
}
