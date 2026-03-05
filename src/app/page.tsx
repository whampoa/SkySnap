import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { ArrowRight, Shield, MapPin, Zap } from 'lucide-react'

const SERVICE_CARDS = [
  {
    title: 'Real Estate',
    description: 'Stunning aerial photography that elevates your property listings above the competition.',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80&auto=format',
    href: '/jobs?category=Real+Estate',
  },
  {
    title: 'Roof Inspections',
    description: 'Safe, detailed assessments without ladders. Identify damage fast with high-resolution imagery.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80&auto=format',
    href: '/jobs?category=Roof+Check',
  },
  {
    title: 'Agriculture',
    description: 'Crop health monitoring, irrigation planning, and paddock surveys at scale.',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80&auto=format',
    href: '/jobs?category=Agriculture',
  },
]

const SHOWCASE_IMAGES = [
  {
    src: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80&auto=format',
    alt: 'Aerial view of farmland',
    label: 'Agriculture',
  },
  {
    src: 'https://images.unsplash.com/photo-1629807473015-41699c4471b5?w=600&q=80&auto=format',
    alt: 'Mining equipment on red dirt in the Australian outback',
    label: 'Mining & Resources',
  },
  {
    src: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80&auto=format',
    alt: 'Luxury home aerial view',
    label: 'Real Estate',
  },
  {
    src: 'https://images.unsplash.com/photo-1508444845599-5c89863b1c44?w=1920&q=80&auto=format',
    alt: 'Australian coastline from drone',
    label: 'Coastal',
  },
]

const STATS = [
  { value: '500+', label: 'Jobs Completed' },
  { value: '120+', label: 'Licensed Pilots' },
  { value: 'National', label: 'Coverage' },
  { value: '4.9★', label: 'Average Rating' },
]

export default async function HomePage() {
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

  return (
    <div className="min-h-screen bg-white">
      <Header user={profile} variant="transparent" />

      {/* ========== HERO ========== */}
      <section className="relative h-[92vh] min-h-[600px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=1920&q=80&auto=format"
          alt="Drone flying over Australian landscape"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className="text-xs font-medium text-white">🇦🇺 Australia&apos;s Drone Services Marketplace</span>
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] max-w-4xl">
            Professional aerial
            <br />
            services, on demand
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-2xl">
            Connect with CASA-licensed drone pilots for photography, inspections, and surveys across Australia.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href="/jobs"
              className="px-8 py-3.5 bg-white text-gray-900 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              Browse Services
            </Link>
            <Link
              href="/auth/signup"
              className="px-8 py-3.5 bg-white/15 backdrop-blur-sm text-white rounded-full text-sm font-semibold border border-white/25 hover:bg-white/25 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 section-fade" />
      </section>

      {/* ========== STATS BAR ========== */}
      <section className="py-12 border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== SERVICES GRID ========== */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">Services</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">
              Every perspective covered
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              From property marketing to precision agriculture, find the right pilot for every job.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {SERVICE_CARDS.map((card) => (
              <Link key={card.title} href={card.href} className="group">
                <div className="card-lift rounded-2xl overflow-hidden border border-gray-200 bg-white">
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      className="object-cover img-zoom"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-600 transition-colors">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                      {card.description}
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-sm font-medium text-gray-900">
                      View jobs
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FULL-WIDTH DRONE IMAGE SECTION ========== */}
      <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1508444845599-5c89863b1c44?w=1920&q=80&auto=format"
          alt="Aerial view of Australian coastline"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <h2 className="text-3xl sm:text-5xl font-bold text-white max-w-3xl">
              See the bigger picture
            </h2>
            <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">
              Our pilots capture perspectives that transform how you work, sell, and manage — from coast to outback.
            </p>
          </div>
        </div>
      </section>

      {/* ========== SHOWCASE GALLERY ========== */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">Portfolio</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">
              Captured across Australia
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SHOWCASE_IMAGES.map((img) => (
              <div key={img.label} className="group relative aspect-square rounded-2xl overflow-hidden">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover img-zoom"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <p className="absolute bottom-4 left-4 text-sm font-medium text-white">{img.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">How It Works</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">
              Three steps to lift off
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Post your job', desc: 'Describe what you need, pin the location on the map, and set your budget range.' },
              { step: '02', title: 'Receive proposals', desc: 'Licensed pilots review your brief and reach out with tailored quotes and timelines.' },
              { step: '03', title: 'Get it done', desc: 'Choose your pilot, coordinate the shoot, and receive professional deliverables.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-900 text-white text-sm font-bold mb-6">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-3 text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== WHY SKYSNAP ========== */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">Why SkySnap</p>
              <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">
                Built for the Australian drone industry
              </h2>
              <div className="mt-8 space-y-6">
                {[
                  { icon: Shield, title: 'CASA Compliant', desc: 'Every pilot on our platform holds a valid Remote Pilot Licence. We verify credentials so you don\'t have to.' },
                  { icon: MapPin, title: 'Australia-Wide Coverage', desc: 'From Sydney to Perth, Cairns to Hobart. Local pilots who know the terrain in every state and territory.' },
                  { icon: Zap, title: 'Fast Turnaround', desc: 'Post a job and start receiving proposals within hours, not days.' },
                ].map((feature) => (
                  <div key={feature.title} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                      <feature.icon className="h-5 w-5 text-gray-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                      <p className="mt-1 text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&q=80&auto=format"
                alt="Drone pilot operating equipment in a field"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========== TRUSTED BY / AUS CONTEXT BAR ========== */}
      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-400 uppercase tracking-wider mb-6">Trusted across every state and territory</p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm font-medium text-gray-500">
            <span>Sydney</span>
            <span className="text-gray-300">|</span>
            <span>Melbourne</span>
            <span className="text-gray-300">|</span>
            <span>Brisbane</span>
            <span className="text-gray-300">|</span>
            <span>Perth</span>
            <span className="text-gray-300">|</span>
            <span>Adelaide</span>
            <span className="text-gray-300">|</span>
            <span>Gold Coast</span>
            <span className="text-gray-300">|</span>
            <span>Newcastle</span>
            <span className="text-gray-300">|</span>
            <span>Canberra</span>
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="relative py-32 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80&auto=format"
          alt="Aerial view of Australian landscape at golden hour"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold text-white">
            Ready to take flight?
          </h2>
          <p className="mt-6 text-lg text-white/80">
            Join hundreds of clients and pilots already using SkySnap to get aerial work done across Australia.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-3.5 bg-white text-gray-900 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              Create free account
            </Link>
            <Link
              href="/jobs"
              className="px-8 py-3.5 text-white rounded-full text-sm font-semibold border border-white/30 hover:bg-white/10 transition-colors"
            >
              Browse jobs
            </Link>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <svg width="24" height="24" viewBox="0 0 32 32" fill="none" className="text-gray-900">
                  <path d="M16 2L2 9l14 7 14-7-14-7z" fill="currentColor" opacity="0.9"/>
                  <path d="M2 23l14 7 14-7" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4"/>
                  <path d="M2 16l14 7 14-7" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.65"/>
                </svg>
                <span className="font-semibold text-gray-900">SkySnap</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Professional drone services marketplace for Australia. CASA-compliant pilots, coast to coast.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Platform</h4>
              <div className="space-y-2.5">
                <Link href="/jobs" className="block text-sm text-gray-500 hover:text-gray-900">Browse Jobs</Link>
                <Link href="/jobs/new" className="block text-sm text-gray-500 hover:text-gray-900">Post a Job</Link>
                <Link href="/auth/signup" className="block text-sm text-gray-500 hover:text-gray-900">Sign Up</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Resources</h4>
              <div className="space-y-2.5">
                <a href="https://www.casa.gov.au/drones" target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-500 hover:text-gray-900">CASA Drone Rules</a>
                <Link href="#" className="block text-sm text-gray-500 hover:text-gray-900">Safety Guidelines</Link>
                <Link href="#" className="block text-sm text-gray-500 hover:text-gray-900">Help Centre</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Legal</h4>
              <div className="space-y-2.5">
                <Link href="#" className="block text-sm text-gray-500 hover:text-gray-900">Terms of Service</Link>
                <Link href="#" className="block text-sm text-gray-500 hover:text-gray-900">Privacy Policy</Link>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              © 2026 SkySnap Pty Ltd. All rights reserved.
            </p>
            <p className="text-sm text-gray-400">
              Made with 🇦🇺 in Australia
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
