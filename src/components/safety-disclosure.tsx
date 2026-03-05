'use client'

import { AlertTriangle, ExternalLink, Plane, Users, Ruler } from 'lucide-react'

export function SafetyDisclosure() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-amber-600" />
        <h3 className="font-semibold text-gray-900">CASA Safety Requirements</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        All drone operations in Australia must comply with Civil Aviation Safety Authority (CASA) regulations.
      </p>

      <div className="grid gap-3">
        {[
          { icon: Ruler, title: '400ft (120m) Maximum Height', desc: 'Drones must not fly higher than 120 metres above ground level.' },
          { icon: Users, title: '30m from People', desc: 'Keep at least 30 metres away from other people not involved in the operation.' },
          { icon: Plane, title: '5.5km from Airports', desc: 'Do not fly within 5.5km of a controlled aerodrome without approval.' },
        ].map((rule) => (
          <div key={rule.title} className="flex items-start gap-3 text-sm">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <rule.icon className="h-4 w-4 text-amber-700" />
            </div>
            <div>
              <span className="font-medium text-gray-900">{rule.title}</span>
              <p className="text-gray-500">{rule.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-amber-200">
        <a
          href="https://www.casa.gov.au/drones"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-800"
        >
          Learn more about CASA drone rules
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  )
}
