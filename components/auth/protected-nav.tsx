'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { SearchDialog } from '@/components/search/search-dialog'

interface ProtectedNavProps {
  member: {
    id: string
    name: string
    role: 'MEMBER' | 'ADMIN'
  }
}

export function ProtectedNav({ member }: ProtectedNavProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  async function handleLogout() {
    try {
      setIsLoggingOut(true)
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      setIsLoggingOut(false)
    }
  }

  const navLinks = [
    { href: '/home', label: 'Home' },
    { href: '/chat', label: 'Chat' },
    { href: '/board', label: 'Board' },
    { href: '/todos', label: 'Todos' },
    { href: '/files', label: 'Files' },
    { href: '/calendar', label: 'Calendar' },
    { href: '/settings', label: 'Settings' },
    ...(member.role === 'ADMIN' ? [{ href: '/admin', label: 'Admin' }] : []),
  ]

  return (
    <nav className="bg-card/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50 shadow-lg shadow-primary/5">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center space-x-8">
            <Link
              href="/home"
              className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hover:from-primary/80 hover:to-accent/80 transition-all"
            >
              Family App
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-foreground/80 hover:text-primary hover:bg-gradient-to-br hover:from-primary/10 hover:to-accent/10 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop User Info & Logout */}
          <div className="hidden md:flex items-center space-x-4">
            <SearchDialog />
            <NotificationBell userId={member.id} />
            <span className="text-sm text-foreground/80 flex items-center gap-2">
              {member.name}
              {member.role === 'ADMIN' && (
                <span className="text-xs bg-gradient-to-r from-primary/20 to-accent/20 text-primary px-3 py-1 rounded-full font-medium border border-primary/20">
                  Admin
                </span>
              )}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-border/50 mt-2 pt-4 backdrop-blur-xl">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-foreground/80 hover:text-primary hover:bg-gradient-to-br hover:from-primary/10 hover:to-accent/10 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border/50 flex flex-col space-y-3">
              <div className="px-4 text-sm text-foreground/80 flex items-center gap-2">
                {member.name}
                {member.role === 'ADMIN' && (
                  <span className="text-xs bg-gradient-to-r from-primary/20 to-accent/20 text-primary px-3 py-1 rounded-full font-medium border border-primary/20">
                    Admin
                  </span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
