'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, MessageCircle, Camera, CheckSquare, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

export function FloatingBottomNav() {
  const pathname = usePathname()

  const mainLinks = [
    { href: '/home', label: 'Home', icon: Home },
    { href: '/chat', label: 'Chat', icon: MessageCircle },
    { href: '/photos', label: 'Photos', icon: Camera },
    { href: '/todos', label: 'Todos', icon: CheckSquare },
    { href: '/board', label: 'More', icon: Menu },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 pb-safe">
      <div className="mx-4 mb-4 bg-card/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-primary/10 border border-border/50 overflow-hidden">
        <div className="flex items-center justify-around px-2 py-3">
          {mainLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname?.startsWith(link.href) ?? false

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'group relative flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300',
                  isActive && 'scale-110'
                )}
              >
                {/* Active background */}
                {isActive && (
                  <span className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-2xl shadow-lg shadow-primary/30 animate-in fade-in zoom-in duration-300" />
                )}

                {/* Icon */}
                <Icon
                  className={cn(
                    'relative w-6 h-6 transition-all duration-300',
                    isActive
                      ? 'text-white scale-110'
                      : 'text-muted-foreground group-hover:text-primary group-hover:scale-110'
                  )}
                />

                {/* Label */}
                <span
                  className={cn(
                    'relative text-xs font-medium transition-all duration-300',
                    isActive
                      ? 'text-white'
                      : 'text-muted-foreground group-hover:text-primary'
                  )}
                >
                  {link.label}
                </span>

                {/* Active indicator dot */}
                {isActive && (
                  <span className="absolute -top-1 w-1.5 h-1.5 bg-white rounded-full shadow-lg animate-ping" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
