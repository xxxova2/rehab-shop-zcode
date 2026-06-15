'use client'

import { Separator } from '@/components/ui/separator'
import { Store, Phone, MessageCircle, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4"><div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-fuchsia-600 rounded-lg flex items-center justify-center"><Store className="w-4 h-4 text-white" /></div><span className="font-bold text-white">Rehab Shop</span></div>
            <p className="text-sm text-gray-400">Your destination for the latest women&apos;s fashion. Quality clothing, great prices, fast delivery.</p>
          </div>
          <div><h4 className="font-semibold text-white mb-3">Shop</h4><ul className="space-y-2 text-sm"><li>Dresses</li><li>Tops</li><li>Bottoms</li><li>Activewear</li></ul></div>
          <div><h4 className="font-semibold text-white mb-3">Support</h4><ul className="space-y-2 text-sm"><li>Contact Us</li><li>Shipping Info</li><li>Returns</li><li>FAQ</li></ul></div>
          <div><h4 className="font-semibold text-white mb-3">Contact</h4><ul className="space-y-2 text-sm"><li className="flex items-center gap-2"><Phone className="w-3 h-3" /> +1 (555) 123-4567</li><li className="flex items-center gap-2"><MessageCircle className="w-3 h-3" /> WhatsApp</li><li className="flex items-center gap-2"><MapPin className="w-3 h-3" /> New York, NY</li></ul></div>
        </div>
        <Separator className="my-6 bg-gray-700" />
        <p className="text-center text-sm text-gray-500">&copy; 2025 Rehab Shop. All rights reserved.</p>
      </div>
    </footer>
  )
}
