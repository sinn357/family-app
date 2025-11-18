import { getCurrentMember } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function HomePage() {
  const member = await getCurrentMember()

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {member?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Family collaboration platform for your family
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Chat</CardTitle>
            <CardDescription>
              Real-time messaging with family members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href="/chat"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Go to Chat →
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Family Board</CardTitle>
            <CardDescription>
              Share posts and updates with the family
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href="/board"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Go to Board →
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Checklist</CardTitle>
            <CardDescription>
              Manage family tasks and todos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href="/todos"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Go to Todos →
            </a>
          </CardContent>
        </Card>

        {member?.role === 'ADMIN' && (
          <Card>
            <CardHeader>
              <CardTitle>Admin Dashboard</CardTitle>
              <CardDescription>
                Manage family members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="/admin"
                className="text-blue-600 hover:text-blue-800 font-medium"
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
