import { redirect } from 'next/navigation'

export default async function RootPage() {
  // Redirect to login - the actual home is at (protected)/page.tsx
  redirect('/login')
}
