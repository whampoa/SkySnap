'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { User, Plane, ArrowRight, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { UserRole } from '@/types/database'

type Step = 'role' | 'details'

export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<Step>('role')
  const [role, setRole] = useState<UserRole | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [arnNumber, setArnNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole)
    setStep('details')
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!role) return
    setIsLoading(true)
    setError(null)

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role, full_name: fullName } },
      })
      if (authError) throw authError

      if (authData.user) {
        const avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(authData.user.id)}`

        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            role,
            full_name: fullName,
            arn_number: role === 'pilot' ? arnNumber : null,
            avatar_url: avatarUrl,
          })
        if (profileError) throw profileError
        router.push('/dashboard')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — image panel */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=1200&q=80&auto=format"
          alt="Drone flying over landscape"
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
            Join Australia&apos;s leading drone services marketplace
          </h2>
          <p className="mt-3 text-white/70">
            Whether you need aerial work done or you&apos;re a pilot looking for jobs — we&apos;ve got you covered.
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
          <div className="w-full max-w-md">
            {step === 'role' ? (
              <div className="space-y-8">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
                  <p className="text-gray-500 mt-1">How will you be using SkySnap?</p>
                </div>

                <div className="grid gap-4">
                  <button
                    onClick={() => handleRoleSelect('client')}
                    className="group relative rounded-xl border border-gray-200 bg-white p-5 text-left transition-all hover:border-gray-900 hover:shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-0.5">I need drone services</h3>
                        <p className="text-sm text-gray-500">
                          Post jobs and receive proposals from licensed pilots.
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-gray-900 transition-colors mt-1" />
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSelect('pilot')}
                    className="group relative rounded-xl border border-gray-200 bg-white p-5 text-left transition-all hover:border-gray-900 hover:shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <Plane className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-0.5">I'm a drone pilot</h3>
                        <p className="text-sm text-gray-500">
                          Browse jobs and send proposals to grow your business.
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-gray-900 transition-colors mt-1" />
                    </div>
                  </button>
                </div>

                <p className="text-center text-sm text-gray-500">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="font-medium text-gray-900 hover:underline">Log in</Link>
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                <div>
                  <button
                    onClick={() => setStep('role')}
                    className="text-sm text-gray-500 hover:text-gray-900 mb-3 inline-block"
                  >
                    ← Back
                  </button>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {role === 'client' ? 'Create client account' : 'Create pilot account'}
                  </h1>
                  <p className="text-gray-500 mt-1">
                    {role === 'client' ? 'Start posting drone service jobs' : 'Join our network of professional pilots'}
                  </p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                  {error && (
                    <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <Input label="Full name" placeholder="John Smith" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                  <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  <Input label="Password" type="password" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />

                  {role === 'pilot' && (
                    <div>
                      <Input label="CASA ARN (Aviation Reference Number)" placeholder="e.g., 123456" value={arnNumber} onChange={(e) => setArnNumber(e.target.value)} />
                      <p className="text-xs text-gray-400 mt-1.5">Optional — you can add this later in your profile settings.</p>
                    </div>
                  )}

                  <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                    Create account
                  </Button>

                  <p className="text-center text-xs text-gray-400">
                    By signing up, you agree to our{' '}
                    <Link href="#" className="underline hover:text-gray-600">Terms</Link> and{' '}
                    <Link href="#" className="underline hover:text-gray-600">Privacy Policy</Link>.
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
