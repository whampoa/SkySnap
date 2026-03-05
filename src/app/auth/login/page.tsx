'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) throw authError
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — image panel */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=1200&q=80&auto=format"
          alt="Drone over agricultural field"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-12 left-12 right-12">
          <Link href="/" className="flex items-center gap-2.5 mb-6">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L2 9l14 7 14-7-14-7z" fill="white" opacity="0.9"/>
              <path d="M2 23l14 7 14-7" stroke="white" strokeWidth="2" fill="none" opacity="0.4"/>
              <path d="M2 16l14 7 14-7" stroke="white" strokeWidth="2" fill="none" opacity="0.65"/>
            </svg>
            <span className="text-lg font-semibold text-white">SkySnap</span>
          </Link>
          <h2 className="text-3xl font-bold text-white leading-tight">
            Welcome back
          </h2>
          <p className="mt-3 text-white/70">
            Pick up where you left off — manage your jobs, review proposals, or find your next gig.
          </p>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex flex-col">
        <div className="lg:hidden p-4">
          <Link href="/" className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" className="text-gray-900">
              <path d="M16 2L2 9l14 7 14-7-14-7z" fill="currentColor" opacity="0.9"/>
              <path d="M2 23l14 7 14-7" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4"/>
              <path d="M2 16l14 7 14-7" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.65"/>
            </svg>
            <span className="font-semibold text-gray-900">SkySnap</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-8">
          <div className="w-full max-w-md space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Log in to SkySnap</h1>
              <p className="text-gray-500 mt-1">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />

              <div>
                <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <div className="mt-1.5 text-right">
                  <Link href="#" className="text-sm text-gray-500 hover:text-gray-900">Forgot password?</Link>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                Log in
              </Button>
            </form>

            <p className="text-center text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="font-medium text-gray-900 hover:underline">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
