'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Truck, Shield, RotateCcw, HeartHandshake,
  ArrowRight, Gift, Percent, Sparkles,
} from 'lucide-react'
import { useStore } from '@/lib/store'

export function HeroSection() {
  const { setView } = useStore()
  
  return (
    <section className="relative bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-72 h-72 bg-rose-200 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-fuchsia-200 rounded-full blur-3xl" />
      </div>
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 relative">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <Badge className="bg-gradient-to-r from-rose-100 to-fuchsia-100 text-rose-700 border-rose-200 text-sm px-3 py-1">
              <Sparkles className="w-3 h-3 mr-1" />New Collection 2025
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Discover Your <span className="bg-gradient-to-r from-rose-500 to-fuchsia-600 bg-clip-text text-transparent">Perfect</span> Style
            </h2>
            <p className="text-lg text-gray-600 max-w-md">Explore our curated collection of women&apos;s fashion. From elegant dresses to trendy activewear, find everything you love.</p>
            <div className="flex gap-3">
              <Button size="lg" onClick={() => setView('home')} className="bg-gradient-to-r from-rose-500 to-fuchsia-600 hover:from-rose-600 hover:to-fuchsia-700 text-white px-8 shadow-lg shadow-rose-200">
                Shop Now <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-50">
                <Gift className="w-4 h-4 mr-2" /> Special Offers
              </Button>
            </div>
            <div className="flex gap-8 pt-4">
              <div><p className="text-2xl font-bold text-gray-900">2K+</p><p className="text-sm text-gray-500">Products</p></div>
              <div><p className="text-2xl font-bold text-gray-900">15K+</p><p className="text-sm text-gray-500">Happy Customers</p></div>
              <div><p className="text-2xl font-bold text-gray-900">4.9</p><p className="text-sm text-gray-500">Rating</p></div>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-rose-200 to-fuchsia-300 flex items-center justify-center overflow-hidden shadow-2xl">
              <div className="text-center p-8">
                <div className="text-8xl mb-4">👗</div>
                <h3 className="text-2xl font-bold text-rose-900">Spring Collection</h3>
                <p className="text-rose-700">Up to 40% Off</p>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"><Truck className="w-5 h-5 text-green-600" /></div>
              <div><p className="font-semibold text-sm">Free Shipping</p><p className="text-xs text-gray-500">On orders $100+</p></div>
            </div>
            <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center"><Percent className="w-5 h-5 text-amber-600" /></div>
              <div><p className="font-semibold text-sm">REHAB20</p><p className="text-xs text-gray-500">20% Off Code</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function FeaturesBar() {
  const features = [
    { icon: Truck, label: 'Free Shipping', desc: 'Orders $100+' },
    { icon: Shield, label: 'Secure Payment', desc: '100% Protected' },
    { icon: RotateCcw, label: 'Easy Returns', desc: '30-Day Policy' },
    { icon: HeartHandshake, label: '24/7 Support', desc: 'Always Here' },
  ]
  return (
    <div className="bg-white border-b"><div className="max-w-7xl mx-auto px-4 py-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {features.map((f) => (
          <div key={f.label} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-50 to-fuchsia-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <f.icon className="w-5 h-5 text-rose-600" />
            </div>
            <div><p className="font-semibold text-sm text-gray-900">{f.label}</p><p className="text-xs text-gray-500">{f.desc}</p></div>
          </div>
        ))}
      </div>
    </div></div>
  )
}
