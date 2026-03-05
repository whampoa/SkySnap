import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'SkySnap — Drone Services Marketplace | Australia',
  description: 'Connect with CASA-licensed drone pilots for aerial photography, inspections, and agricultural surveys across Australia.',
  keywords: ['drone', 'aerial photography', 'Australia', 'CASA', 'pilot', 'marketplace'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v3.8.0/mapbox-gl.css"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-white text-gray-900 font-sans">
        {children}
      </body>
    </html>
  )
}
