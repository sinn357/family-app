import { getCurrentMember } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageCircle, FileText, CheckSquare, Calendar, FolderOpen, Settings, Shield, Camera } from 'lucide-react'

export default async function HomePage() {
  const member = await getCurrentMember()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return { text: 'Good Morning', emoji: '🌅' }
    if (hour < 18) return { text: 'Good Afternoon', emoji: '☀️' }
    return { text: 'Good Evening', emoji: '🌙' }
  }

  const greeting = getGreeting()

  const quickActions = [
    {
      href: '/chat',
      title: 'Chat',
      description: 'Real-time messaging with family',
      icon: MessageCircle,
      gradient: 'from-primary/10 to-primary/5',
      iconColor: 'text-primary',
    },
    {
      href: '/board',
      title: 'Board',
      description: 'Share posts and updates',
      icon: FileText,
      gradient: 'from-accent/10 to-accent/5',
      iconColor: 'text-accent',
    },
    {
      href: '/todos',
      title: 'Todos',
      description: 'Manage family tasks',
      icon: CheckSquare,
      gradient: 'from-success/10 to-success/5',
      iconColor: 'text-success',
    },
    {
      href: '/photos',
      title: 'Photos',
      description: 'Family album',
      icon: Camera,
      gradient: 'from-info/10 to-info/5',
      iconColor: 'text-info',
    },
    {
      href: '/calendar',
      title: 'Calendar',
      description: 'Schedule and events',
      icon: Calendar,
      gradient: 'from-warning/10 to-warning/5',
      iconColor: 'text-warning',
    },
    {
      href: '/files',
      title: 'Files',
      description: 'Shared documents',
      icon: FolderOpen,
      gradient: 'from-muted/10 to-muted/5',
      iconColor: 'text-muted-foreground',
    },
    {
      href: '/settings',
      title: 'Settings',
      description: 'App preferences',
      icon: Settings,
      gradient: 'from-muted/10 to-muted/5',
      iconColor: 'text-muted-foreground',
    },
  ]

  if (member?.role === 'ADMIN') {
    quickActions.push({
      href: '/admin',
      title: 'Admin',
      description: 'Manage members',
      icon: Shield,
      gradient: 'from-primary/10 to-accent/10',
      iconColor: 'text-primary',
    })
  }

  return (
    <div className="container mx-auto py-6 md:py-10 px-4 md:px-6">
      {/* Greeting Section */}
      <div className="mb-8 md:mb-12">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl md:text-5xl">{greeting.emoji}</span>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {greeting.text}, {member?.name}!
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Welcome to your family hub
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid gap-5 md:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <a key={action.href} href={action.href} className="group">
              <Card className="h-full cursor-pointer group-hover:scale-[1.02] transition-transform duration-200">
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`w-6 h-6 ${action.iconColor}`} />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {action.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {action.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
                    <span>Open</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </CardContent>
              </Card>
            </a>
          )
        })}
      </div>

      {/* Footer Note */}
      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          Built with love for the family ❤️
        </p>
      </div>
    </div>
  )
}
