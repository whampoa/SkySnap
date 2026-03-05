'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { MapPin } from 'lucide-react'

interface JobMapProps {
  coordinates: unknown
  locationName: string
}

function parseCoordinates(coords: unknown): [number, number] | null {
  if (!coords) return null

  // WKT string: "POINT(lng lat)"
  if (typeof coords === 'string') {
    const match = coords.match(/POINT\(([^ ]+) ([^)]+)\)/)
    if (match) return [parseFloat(match[1]), parseFloat(match[2])]
  }

  if (typeof coords === 'object' && coords !== null) {
    const c = coords as any

    // GeoJSON: { type: "Point", coordinates: [lng, lat] }
    if (c.type === 'Point' && Array.isArray(c.coordinates)) {
      return [c.coordinates[0], c.coordinates[1]]
    }

    // PostGIS geography object returned via Supabase
    if (Array.isArray(c.coordinates)) {
      return [c.coordinates[0], c.coordinates[1]]
    }

    // Plain {lng, lat} or {longitude, latitude}
    if (typeof c.lng === 'number' && typeof c.lat === 'number') {
      return [c.lng, c.lat]
    }
    if (typeof c.longitude === 'number' && typeof c.latitude === 'number') {
      return [c.longitude, c.latitude]
    }
  }

  return null
}

export function JobMap({ coordinates, locationName }: JobMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapError, setMapError] = useState(false)

  useEffect(() => {
    if (!mapContainer.current) return

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''
    if (!token || token.startsWith('pk.YOUR')) {
      setMapError(true)
      return
    }

    mapboxgl.accessToken = token

    const coords = parseCoordinates(coordinates)
    if (!coords) {
      setMapError(true)
      return
    }

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: coords,
        zoom: 13,
      })

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

      new mapboxgl.Marker({ color: '#111827' })
        .setLngLat(coords)
        .addTo(map.current)
    } catch {
      setMapError(true)
    }

    return () => { map.current?.remove() }
  }, [coordinates, locationName])

  if (mapError) {
    return (
      <div className="h-[200px] rounded-xl bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">{locationName}</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={mapContainer}
      className="h-[240px] w-full rounded-xl overflow-hidden border border-gray-200"
    />
  )
}
