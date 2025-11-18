import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentMember } from '@/lib/auth'
import { SignupForm } from '@/components/auth/signup-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function SignupPage() {
  // If already logged in, redirect to home
  const member = await getCurrentMember()
  if (member) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Create Account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your name and password to create an account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SignupForm />
          <div className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
