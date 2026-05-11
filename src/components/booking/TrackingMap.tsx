'use client'
import { useEffect, useRef } from 'react'
import type { Map, Marker } from 'leaflet'

export interface Position {
  lat: number
  lng: number
  speed?: number
  timestamp?: string
}

interface Props {
  position: Position | null
  message?: string
}

// Must be imported via next/dynamic with ssr:false
export default function TrackingMap({ position, message }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<Map | null>(null)
  const markerRef = useRef<Marker | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    let mounted = true

    async function init() {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css' as never)

      if (!mounted || !containerRef.current || mapRef.current) return

      ;(L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl = undefined
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const defaultCenter: [number, number] = [23.97, 121.6]
      const center: [number, number] = position ? [position.lat, position.lng] : defaultCenter
      const map = L.map(containerRef.current).setView(center, 14)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map)
      mapRef.current = map

      if (position) {
        markerRef.current = L.marker(center).addTo(map)
      }
    }

    init()
    return () => {
      mounted = false
      mapRef.current?.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mapRef.current || !position) return
    const latlng: [number, number] = [position.lat, position.lng]

    if (markerRef.current) {
      markerRef.current.setLatLng(latlng)
    } else {
      import('leaflet').then(({ default: L }) => {
        if (!mapRef.current) return
        markerRef.current = L.marker(latlng).addTo(mapRef.current)
      })
    }
    mapRef.current.setView(latlng)
  }, [position])

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={containerRef}
        style={{ height: 420, width: '100%' }}
        role="img"
        aria-label="車輛即時位置地圖"
        className="overflow-hidden rounded-2xl border border-border shadow-card"
      />
      {!position && message && (
        <p role="status" aria-live="polite" className="rounded-md border border-dashed border-border bg-brand-50 px-4 py-3 text-center text-sm text-ink-soft">
          {message}
        </p>
      )}
    </div>
  )
}
