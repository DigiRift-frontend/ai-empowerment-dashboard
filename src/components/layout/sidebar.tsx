'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { useCustomer } from '@/hooks/use-customers'
import {
  LayoutDashboard,
  Cpu,
  Map,
  GraduationCap,
  Users,
  Settings,
  HelpCircle,
  Phone,
  Mail,
  Copy,
  Check,
  Calendar,
  Coins,
  LogOut,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Punkteübersicht', href: '/budget', icon: Coins },
  { name: 'Roadmap', href: '/roadmap', icon: Map },
  { name: 'Module', href: '/modules', icon: Cpu },
  { name: 'Schulungen', href: '/schulungen', icon: GraduationCap },
  { name: 'Team', href: '/team', icon: Users },
]

const secondaryNavigation = [
  { name: 'Einstellungen', href: '/settings', icon: Settings },
  { name: 'Hilfe', href: '/help', icon: HelpCircle },
]

export function Sidebar() {
  const pathname = usePathname()
  const { customerId, logout } = useAuth()
  const { customer, isLoading } = useCustomer(customerId || '')
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)

  const advisor = customer?.advisor
  const customerCode = customer?.customerCode || ''

  const handleCopyCode = () => {
    navigator.clipboard.writeText(customerCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(advisor.email)
    setCopiedEmail(true)
    setTimeout(() => setCopiedEmail(false), 2000)
  }

  return (
    <div className="flex h-screen w-64 flex-col border-r border-gray-200 bg-gray-50">
      {/* Logo */}
      <Link href="/" className="flex h-16 items-center justify-center bg-white border-b border-gray-200 px-4 hover:bg-gray-50 transition-colors">
        <div className="relative h-12 w-32">
          <Image
            src="/blue_cropped.png"
            alt="digirift Logo"
            fill
            className="object-contain"
          />
        </div>
      </Link>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors mb-1',
                isActive
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 shrink-0',
                  isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Advisor Card */}
      <div className="px-3 pb-3">
        <div className="rounded-2xl bg-white shadow-lg border border-gray-200 overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-3">
            <p className="text-xs font-medium text-primary-100">Ihr Ansprechpartner</p>
          </div>

          {advisor ? (
            <>
              {/* Advisor Info */}
              <div className="px-4 pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-14 w-14 overflow-hidden rounded-full ring-4 ring-gray-100">
                    <Image
                      src={advisor.avatarUrl || '/Profilbild_min.png'}
                      alt={advisor.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{advisor.name}</p>
                    <p className="text-xs text-gray-500">{advisor.role}</p>
                  </div>
                </div>
              </div>

              {/* Contact Options */}
              <div className="px-4 pb-3 space-y-1">
                <a
                  href={`tel:${advisor.phone}`}
                  className="flex items-center gap-2.5 py-1.5 text-sm hover:text-primary-600 transition-colors"
                >
                  <Phone className="h-4 w-4 text-primary-600" />
                  <span className="text-gray-700">{advisor.phone}</span>
                </a>
                <div className="flex items-center gap-1.5">
                  <a
                    href={`mailto:${advisor.email}`}
                    className="flex items-center gap-2.5 py-1.5 text-sm hover:text-primary-600 transition-colors"
                  >
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{advisor.email}</span>
                  </a>
                  <button
                    onClick={handleCopyEmail}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="E-Mail kopieren"
                  >
                    {copiedEmail ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Schedule Button */}
              <div className="px-4 pb-4">
                <Link
                  href={advisor.calendlyUrl || '#'}
                  target={advisor.calendlyUrl ? '_blank' : undefined}
                  className="flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors w-full"
                >
                  <Calendar className="h-4 w-4" />
                  Termin vereinbaren
                </Link>
              </div>
            </>
          ) : (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">
              {isLoading ? 'Laden...' : 'Kein Ansprechpartner zugewiesen'}
            </div>
          )}

          {/* Customer PIN */}
          {customerCode && (
            <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Telefon-PIN</p>
                  <p className="font-mono text-xl font-bold tracking-[0.2em] text-gray-900">
                    {customerCode}
                  </p>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="rounded-lg bg-white p-2 text-gray-400 border border-gray-200 hover:text-gray-600 hover:border-gray-300 transition-colors"
                  title="PIN kopieren"
                >
                  {copiedCode ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                Bei jedem Anruf angeben
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Secondary Navigation - Below Card */}
      <div className="px-3 pb-3 space-y-2">
        <div className="flex gap-2">
          {secondaryNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-gray-500 hover:bg-white hover:text-gray-700 hover:shadow-sm'
                )}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.name}
              </Link>
            )
          })}
        </div>
        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Abmelden
        </button>
      </div>
    </div>
  )
}
