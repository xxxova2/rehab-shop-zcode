'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { t } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  ShoppingCart, Search, Heart, Star, Minus, Plus, Trash2,
  Package, ChevronLeft, Store, Menu, X,
  Truck, Shield, RotateCcw, CreditCard, Phone, MapPin,
  User, LogIn, UserPlus, Settings, LayoutDashboard,
  Image as ImageIcon, Tag, Eye, Edit, Trash, PlusCircle,
  Download, MessageCircle, CheckCircle, Clock, AlertCircle,
  ArrowRight, ShoppingBag, Gift, Percent, HeartHandshake,
  Globe, Moon, Sun, Filter, ChevronDown, ExternalLink,
  Sparkles, TrendingUp, DollarSign, BarChart3
} from 'lucide-react'

export function Header() {
  const { cart, setView, currentView, isLoggedIn, userName, userRole, logout, locale, setLocale, darkMode, toggleDarkMode } = useStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const navItems = [
    { view: 'home' as const, label: t(locale, 'shop'), icon: ShoppingBag },
    { view: 'wishlist' as const, label: t(locale, 'wishlist'), icon: Heart },
    { view: 'orders' as const, label: t(locale, 'orders'), icon: Package },
    ...(userRole === 'admin' ? [{ view: 'admin' as const, label: 'Admin', icon: Shield }] : []),
  ]

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 text-white text-xs py-1.5 text-center font-medium">
        Free Shipping on Orders Over $100 | Use Code: <span className="font-bold">REHAB20</span> for 20% Off
      </div>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => setView('home')} className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-fuchsia-600 rounded-lg flex items-center justify-center shadow-md">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-rose-600 to-fuchsia-600 bg-clip-text text-transparent leading-none">Rehab Shop</h1>
              <p className="text-[10px] text-gray-400 leading-none">Women&apos;s Fashion Store</p>
            </div>
          </button>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Button key={item.view} variant={currentView === item.view ? 'default' : 'ghost'} size="sm"
                onClick={() => setView(item.view)}
                className={currentView === item.view ? 'bg-gradient-to-r from-rose-500 to-fuchsia-600 hover:from-rose-600 hover:to-fuchsia-700 text-white shadow-sm' : ''}>
                <item.icon className="w-4 h-4 mr-1.5" />{item.label}
              </Button>
            ))}
          </nav>
          <div className="flex items-center gap-1.5">
            <TooltipProvider>
              <Tooltip><TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={toggleDarkMode} className="h-8 w-8 p-0">
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
              </TooltipTrigger><TooltipContent>Toggle Theme</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')} className="h-8 w-8 p-0">
                  <Globe className="w-4 h-4" />
                </Button>
              </TooltipTrigger><TooltipContent>{locale === 'en' ? 'العربية' : 'English'}</TooltipContent></Tooltip>
            </TooltipProvider>
            <Button variant="outline" size="sm" onClick={() => setView('cart')} className="relative">
              <ShoppingCart className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">{t(locale, 'cart')}</span>
              {cartCount > 0 && <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white text-[10px] h-5 w-5 flex items-center justify-center p-0">{cartCount}</Badge>}
            </Button>
            {isLoggedIn ? (
              <button
                onClick={() => setView(userRole === 'admin' ? 'admin' : 'home')}
                className="hidden sm:flex items-center gap-2 text-sm hover:opacity-80 transition"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-rose-100 to-fuchsia-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-rose-600" />
                </div>
                <span className="font-medium text-gray-700 max-w-[80px] truncate">{userName}</span>
                {userRole === 'admin' && <Badge className="bg-rose-100 text-rose-700 text-[9px]">Admin</Badge>}
              </button>
            ) : (
              <Button variant="default" size="sm" className="bg-gradient-to-r from-rose-500 to-fuchsia-600 hover:from-rose-600 hover:to-fuchsia-700 text-white" onClick={() => setView('checkout')}>
                <LogIn className="w-4 h-4 mr-1" /><span className="hidden sm:inline">{t(locale, 'signIn')}</span>
              </Button>
            )}
            <Button variant="ghost" size="sm" className="md:hidden h-8 w-8 p-0" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-3 space-y-1">
            {navItems.map((item) => (
              <Button key={item.view} variant="ghost" className="w-full justify-start" onClick={() => { setView(item.view); setMobileMenuOpen(false) }}>
                <item.icon className="w-4 h-4 mr-2" />{item.label}
              </Button>
            ))}
            {isLoggedIn && <Button variant="ghost" className="w-full justify-start text-red-500" onClick={() => { logout(); setMobileMenuOpen(false) }}><LogIn className="w-4 h-4 mr-2" />Sign Out</Button>}
          </div>
        )}
      </div>
    </header>
  )
}
