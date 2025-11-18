'use client'

import { useState } from 'react'
import { useMembers } from '@/lib/hooks/use-admin'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MemberForm } from './member-form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function MemberList() {
  const { data, isLoading, error } = useMembers()
  const [editingMember, setEditingMember] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading members...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red-500">Error loading members: {error.message}</p>
      </div>
    )
  }

  const members = data?.members || []

  function handleEdit(member: any) {
    setEditingMember(member)
    setIsDialogOpen(true)
  }

  function handleCloseDialog() {
    setIsDialogOpen(false)
    setEditingMember(null)
  }

  return (
    <>
      <div className="space-y-3">
        {members.map((member: any) => {
          const formattedDate = new Date(member.createdAt).toLocaleDateString(
            'en-US',
            {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }
          )

          return (
            <Card key={member.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-medium text-lg">{member.name}</h3>
                      <p className="text-sm text-gray-500">
                        Created on {formattedDate}
                      </p>
                    </div>
                    <Badge
                      variant={
                        member.role === 'ADMIN' ? 'default' : 'secondary'
                      }
                    >
                      {member.role}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(member)}
                  >
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingMember ? `Edit ${editingMember.name}` : 'Edit Member'}
            </DialogTitle>
          </DialogHeader>
          {editingMember && (
            <MemberForm
              member={editingMember}
              onSuccess={handleCloseDialog}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
