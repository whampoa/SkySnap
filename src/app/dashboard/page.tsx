import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Badge } from '@/components/ui/badge'
import { TrustBadge } from '@/components/trust-badge'
import { Avatar } from '@/components/avatar'
import {
  Plus,
  Search,
  Briefcase,
  Clock,
  CheckCircle2,
  DollarSign,
  MapPin,
  ArrowRight,
} from 'lucide-react'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/auth/signup')

  const isClient = profile.role === 'client'

  let jobs: any[] = []
  let bids: any[] = []
  let stats = { open: 0, assigned: 0, completed: 0, totalSpent: 0 }

  if (isClient) {
    const { data } = await supabase
      .from('jobs')
      .select(`*, bids(count)`)
      .eq('client_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
    jobs = data || []

    const allJobs = await supabase.from('jobs').select('status').eq('client_id', user.id)
    if (allJobs.data) {
      stats.open = allJobs.data.filter(j => j.status === 'open').length
      stats.assigned = allJobs.data.filter(j => j.status === 'assigned').length
      stats.completed = allJobs.data.filter(j => j.status === 'completed').length
    }
  } else {
    const { data } = await supabase
      .from('bids')
      .select(`*, jobs(*)`)
      .eq('pilot_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
    bids = data || []

    const allBids = await supabase.from('bids').select('status, amount').eq('pilot_id', user.id)
    if (allBids.data) {
      stats.open = allBids.data.filter(b => b.status === 'pending').length
      stats.assigned = allBids.data.filter(b => b.status === 'accepted').length
      stats.totalSpent = allBids.data.filter(b => b.status === 'accepted').reduce((acc, b) => acc + b.amount, 0)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={profile} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {profile.full_name?.split(' ')[0] || 'there'}
            </h1>
            <p className="text-gray-500 mt-0.5">
              {isClient ? 'Manage your jobs and review proposals' : 'Find jobs and track your proposals'}
            </p>
          </div>
          <Link
            href={isClient ? '/jobs/new' : '/jobs'}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            {isClient ? (
              <><Plus className="h-4 w-4" /> Post a Job</>
            ) : (
              <><Search className="h-4 w-4" /> Browse Jobs</>
            )}
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: isClient ? 'Open Jobs' : 'Pending', value: stats.open, icon: Briefcase, color: 'bg-blue-50 text-blue-600' },
            { label: isClient ? 'In Progress' : 'Active', value: stats.assigned, icon: Clock, color: 'bg-amber-50 text-amber-600' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
            { label: isClient ? 'Total Spent' : 'Total Earned', value: formatCurrency(stats.totalSpent), icon: DollarSign, color: 'bg-purple-50 text-purple-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {isClient ? 'Your Jobs' : 'Your Proposals'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {isClient ? 'Recent job postings' : 'Track your sent proposals'}
                  </p>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {isClient ? (
                  jobs.length > 0 ? (
                    jobs.map((job) => (
                      <Link
                        key={job.id}
                        href={`/jobs/${job.id}`}
                        className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900 truncate">{job.title}</h3>
                            <Badge variant={
                              job.status === 'open' ? 'success' :
                              job.status === 'assigned' ? 'warning' : 'secondary'
                            }>
                              {job.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {job.location_name}
                            </span>
                            <span>{formatCurrency(job.budget_min)} – {formatCurrency(job.budget_max)}</span>
                            <span>{job.bids?.[0]?.count || 0} proposals</span>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-gray-500 flex-shrink-0 ml-4" />
                      </Link>
                    ))
                  ) : (
                    <div className="p-12 text-center">
                      <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 mb-4">You haven't posted any jobs yet</p>
                      <Link href="/jobs/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
                        <Plus className="h-4 w-4" /> Post Your First Job
                      </Link>
                    </div>
                  )
                ) : (
                  bids.length > 0 ? (
                    bids.map((bid) => (
                      <Link
                        key={bid.id}
                        href={`/jobs/${bid.job_id}`}
                        className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900 truncate">{bid.jobs?.title}</h3>
                            <Badge variant={
                              bid.status === 'pending' ? 'secondary' :
                              bid.status === 'accepted' ? 'success' : 'destructive'
                            }>
                              {bid.status === 'pending' ? 'Awaiting' : bid.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span>Quote: {formatCurrency(bid.amount)}</span>
                            <span>{bid.delivery_days} days delivery</span>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-gray-500 flex-shrink-0 ml-4" />
                      </Link>
                    ))
                  ) : (
                    <div className="p-12 text-center">
                      <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 mb-4">You haven't sent any proposals yet</p>
                      <Link href="/jobs" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
                        <Search className="h-4 w-4" /> Browse Jobs
                      </Link>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Sidebar — profile card */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Your Profile</h3>
              <div className="flex items-center gap-3 mb-4">
              <Avatar id={profile.id} name={profile.full_name} avatarUrl={profile.avatar_url} size="lg" />
                <div>
                  <p className="font-medium text-gray-900">{profile.full_name}</p>
                  <p className="text-sm text-gray-500 capitalize">{profile.role}</p>
                </div>
              </div>

              {!isClient && (
                <div className="mb-4">
                  <TrustBadge isVerified={profile.is_repl_verified} arnNumber={profile.arn_number} showArn />
                </div>
              )}

              {profile.bio && (
                <p className="text-sm text-gray-500 mb-4">{profile.bio}</p>
              )}

              {profile.location && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <MapPin className="h-4 w-4" />
                  {profile.location}
                </div>
              )}

              <Link
                href="#"
                className="block w-full text-center px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
