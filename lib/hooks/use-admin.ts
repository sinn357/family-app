import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateMemberInput, UpdateMemberInput } from '@/lib/validations/admin'

/**
 * Get all family members
 */
export function useMembers() {
  return useQuery({
    queryKey: ['admin', 'members'],
    queryFn: async () => {
      const res = await fetch('/api/admin/members', {
        credentials: 'include',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to fetch members')
      }
      return res.json()
    },
  })
}

/**
 * Create a new family member
 */
export function useCreateMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateMemberInput) => {
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create member')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'members'] })
    },
  })
}

/**
 * Update a family member
 */
export function useUpdateMember(memberId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateMemberInput) => {
      const res = await fetch(`/api/admin/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update member')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'members'] })
    },
  })
}
