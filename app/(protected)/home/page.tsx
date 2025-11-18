import { getCurrentMember } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function HomePage() {
  const member = await getCurrentMember()

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">
          Welcome, {member?.name}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Family collaboration platform for your family
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-primary/30">
          <CardHeader>
            <CardTitle className="text-primary">Chat</CardTitle>
            <CardDescription>
              Real-time messaging with family members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href="/chat"
              className="text-primary hover:text-primary/80 font-medium transition-colors inline-flex items-center gap-1"
            >
              Go to Chat →
            </a>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-accent/30">
          <CardHeader>
            <CardTitle className="text-primary">Family Board</CardTitle>
            <CardDescription>
              Share posts and updates with the family
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href="/board"
              className="text-primary hover:text-primary/80 font-medium transition-colors inline-flex items-center gap-1"
            >
              Go to Board →
            </a>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-primary/30">
          <CardHeader>
            <CardTitle className="text-primary">Checklist</CardTitle>
            <CardDescription>
              Manage family tasks and todos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href="/todos"
              className="text-primary hover:text-primary/80 font-medium transition-colors inline-flex items-center gap-1"
            >
              Go to Todos →
            </a>
          </CardContent>
        </Card>

        {member?.role === 'ADMIN' && (
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-accent/30">
            <CardHeader>
              <CardTitle className="text-primary">Admin Dashboard</CardTitle>
              <CardDescription>
                Manage family members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="/admin"
                className="text-primary hover:text-primary/80 font-medium transition-colors inline-flex items-center gap-1"
              >
                Go to Admin →
              </a>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
