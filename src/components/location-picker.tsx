'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import { MapPin } from 'lucide-react'

interface LocationPickerProps {
  onLocationSelect: (location: { name: string; coordinates: [number, number] }) => void
  initialLocation?: { name: string; coordinates: [number, number] }
}

export function LocationPicker({ onLocationSelect, initialLocation }: LocationPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const marker = useRef<mapboxgl.Marker | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string>(initialLocation?.name || '')
  const [mapError, setMapError] = useState<string | null>(null)

  useEffect(() => {
    if (!mapContainer.current) return

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''
    if (!token || token === 'pk.YOUR_MAPBOX_TOKEN_HERE') {
      setMapError('Add a valid Mapbox token to enable the map.')
      return
    }

    mapboxgl.accessToken = token
    const initialCoords = initialLocation?.coordinates || [133.7751, -25.2744]

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: initialCoords,
        zoom: initialLocation ? 12 : 4,
      })
    } catch {
      setMapError('Map failed to load. Check your Mapbox token.')
      return
    }

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl as any,
      marker: false,
      placeholder: 'Search for a location in Australia...',
      countries: 'au',
      proximity: { longitude: 133.7751, latitude: -25.2744 },
    })

    map.current.addControl(geocoder, 'top-left')

    marker.current = new mapboxgl.Marker({ color: '#111827', draggable: true })

    if (initialLocation) {
      marker.current.setLngLat(initialLocation.coordinates).addTo(map.current)
    }

    geocoder.on('result', (e) => {
      const { center, place_name } = e.result
      if (marker.current && map.current) marker.current.setLngLat(center).addTo(map.current)
      setSelectedLocation(place_name)
      onLocationSelect({ name: place_name, coordinates: center as [number, number] })
    })

    const reverseGeocode = (lng: number, lat: number) => {
      fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&country=au`)
        .then(res => res.json())
        .then(data => {
          if (data.features?.length > 0) {
            const placeName = data.features[0].place_name
            setSelectedLocation(placeName)
            onLocationSelect({ name: placeName, coordinates: [lng, lat] })
          }
        })
    }

    marker.current.on('dragend', () => {
      if (marker.current) {
        const { lng, lat } = marker.current.getLngLat()
        reverseGeocode(lng, lat)
      }
    })

    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat
      if (marker.current && map.current) marker.current.setLngLat([lng, lat]).addTo(map.current)
      reverseGeocode(lng, lat)
    })

    return () => { map.current?.remove() }
  }, [])

  if (mapError) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
        <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">{mapError}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div ref={mapContainer} className="h-[320px] w-full rounded-xl overflow-hidden border border-gray-200" />
      {selectedLocation && (
        <div className="flex items-start gap-2 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2.5 text-sm">
          <MapPin className="h-4 w-4 text-gray-900 flex-shrink-0 mt-0.5" />
          <span className="text-gray-700">{selectedLocation}</span>
        </div>
      )}
      <p className="text-xs text-gray-400">
        Search, click, or drag the marker to set the job location.
      </p>
    </div>
  )
}
