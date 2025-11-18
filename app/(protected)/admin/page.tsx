import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { MemberList } from '@/components/admin/member-list'
import { MemberForm } from '@/components/admin/member-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default async function AdminPage() {
  try {
    await requireAdmin()
  } catch {
    redirect('/home')
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">Create Member</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-primary">Create New Member</DialogTitle>
            </DialogHeader>
            <MemberForm />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-8 border-l-4 border-l-primary/30">
        <CardHeader>
          <CardTitle className="text-primary">Family Members</CardTitle>
        </CardHeader>
        <CardContent>
          <MemberList />
        </CardContent>
      </Card>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <h2 className="font-semibold text-primary mb-2">Admin Features</h2>
        <ul className="text-sm text-foreground/70 space-y-1">
          <li>• Create new family members with custom roles</li>
          <li>• Edit member names and passwords</li>
          <li>• View member creation dates</li>
          <li>• Manage member access levels (Member/Admin)</li>
        </ul>
      </div>
    </div>
  )
}
