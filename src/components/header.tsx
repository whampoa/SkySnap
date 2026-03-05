'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, LogOut, Plus, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/avatar'
import type { Profile } from '@/types/database'

interface HeaderProps {
  user: Profile | null
  variant?: 'solid' | 'transparent'
}

export function Header({ user, variant = 'solid' }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const isTransparent = variant === 'transparent'

  return (
    <header className={cn(
      'sticky top-0 z-50 w-full transition-all',
      isTransparent
        ? 'bg-white/80 backdrop-blur-xl border-b border-gray-100'
        : 'bg-white border-b border-gray-200'
    )}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 h-16 sm:px-6 lg:px-8">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2.5 group">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" className="text-gray-900">
              <path d="M16 2L2 9l14 7 14-7-14-7z" fill="currentColor" opacity="0.9"/>
              <path d="M2 23l14 7 14-7" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4"/>
              <path d="M2 16l14 7 14-7" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.65"/>
            </svg>
            <span className="text-lg font-semibold tracking-tight text-gray-900">SkySnap</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/jobs"
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === '/jobs'
                  ? 'text-gray-900 bg-gray-100'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              Browse Jobs
            </Link>
            {user?.role === 'client' && (
              <Link
                href="/jobs/new"
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === '/jobs/new'
                    ? 'text-gray-900 bg-gray-100'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                <Plus className="h-4 w-4" />
                Post a Job
              </Link>
            )}
            {user && (
              <Link
                href="/dashboard"
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === '/dashboard'
                    ? 'text-gray-900 bg-gray-100'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="hidden md:flex items-center">
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Avatar id={user.id} name={user.full_name} avatarUrl={user.avatar_url} size="sm" />
                  <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                    {user.full_name?.split(' ')[0] || 'Account'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-lg z-20 py-1">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setProfileOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Sign up
              </Link>
            </div>
          )}

          <button
            type="button"
            className="md:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-4 space-y-1">
          <Link
            href="/jobs"
            className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            onClick={() => setMobileMenuOpen(false)}
          >
            Browse Jobs
          </Link>
          {user?.role === 'client' && (
            <Link
              href="/jobs/new"
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Post a Job
            </Link>
          )}
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <div className="border-t border-gray-100 pt-2 mt-2">
                <div className="flex items-center gap-3 px-3 py-2">
                  <Avatar id={user.id} name={user.full_name} avatarUrl={user.avatar_url} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => { handleSignOut(); setMobileMenuOpen(false) }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <div className="border-t border-gray-100 pt-3 mt-2 space-y-2">
              <Link
                href="/auth/login"
                className="block w-full text-center px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                href="/auth/signup"
                className="block w-full text-center px-4 py-2.5 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
