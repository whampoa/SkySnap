'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Building2, Home, Wheat, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn, JOB_CATEGORIES, REGIONS } from '@/lib/utils'
import { useState, useCallback } from 'react'

interface JobsFilterProps {
  currentCategory: string
  currentRegion: string
  currentSearch: string
}

const CATEGORY_ICONS = {
  'Real Estate': Building2,
  'Roof Check': Home,
  'Agriculture': Wheat,
}

export function JobsFilter({ currentCategory, currentRegion, currentSearch }: JobsFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(currentSearch)

  const updateFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/jobs?${params.toString()}`)
  }, [router, searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilter('search', search)
  }

  const clearFilters = () => {
    setSearch('')
    router.push('/jobs')
  }

  const hasActiveFilters = currentCategory !== 'all' || currentRegion !== 'all' || currentSearch

  return (
    <div className="sticky top-24 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900"
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>
      </form>

      <div className="space-y-2">
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Category</h4>
        <div className="space-y-0.5">
          <button
            onClick={() => updateFilter('category', 'all')}
            className={cn(
              'w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors text-left',
              currentCategory === 'all'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            All Categories
          </button>
          {JOB_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.value as keyof typeof CATEGORY_ICONS]
            return (
              <button
                key={cat.value}
                onClick={() => updateFilter('category', cat.value)}
                className={cn(
                  'w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors text-left',
                  currentCategory === cat.value
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <Icon className="h-4 w-4" />
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Region</h4>
        <div className="space-y-0.5">
          <button
            onClick={() => updateFilter('region', 'all')}
            className={cn(
              'w-full text-left rounded-lg px-3 py-2 text-sm transition-colors',
              currentRegion === 'all'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            All Australia
          </button>
          {REGIONS.map((region) => (
            <button
              key={region.value}
              onClick={() => updateFilter('region', region.value)}
              className={cn(
                'w-full text-left rounded-lg px-3 py-2 text-sm transition-colors',
                currentRegion === region.value
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              {region.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
