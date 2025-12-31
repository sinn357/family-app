'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useDeletePhoto } from '@/lib/hooks/use-photos'
import { Button } from '@/components/ui/button'
import { Trash2, User } from 'lucide-react'
import { toast } from 'sonner'

interface PhotoCardProps {
  photo: {
    id: string
    imageUrl: string
    caption: string | null
    createdAt: string
    uploader: {
      id: string
      name: string
    }
  }
  onClick: () => void
}

export function PhotoCard({ photo, onClick }: PhotoCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const deletePhoto = useDeletePhoto()

  // Get current user ID from session
  useState(() => {
    async function fetchSession() {
      try {
        const res = await fetch('/api/auth/session', {
          credentials: 'include',
        })
        if (res.ok) {
          const data = await res.json()
          setCurrentUserId(data.member.id)
        }
      } catch (err) {
        console.error('Failed to fetch session:', err)
      }
    }
    fetchSession()
  })

  const isOwner = currentUserId === photo.uploader.id
  const uploaderLetter = photo.uploader.name.charAt(0).toUpperCase()

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()

    if (!confirm('이 사진을 삭제하시겠습니까?')) return

    try {
      await deletePhoto.mutateAsync(photo.id)
      toast.success('사진이 삭제되었습니다')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error(error instanceof Error ? error.message : '삭제 실패')
    }
  }

  return (
    <div
      className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <Image
        src={photo.imageUrl}
        alt={photo.caption || '가족 사진'}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-300"
      />

      {/* Overlay on hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold">
              {uploaderLetter}
            </div>
            <span className="text-sm font-medium">{photo.uploader.name}</span>
          </div>
          {photo.caption && (
            <p className="text-sm line-clamp-2">{photo.caption}</p>
          )}
        </div>

        {/* Delete button for owner */}
        {isOwner && (
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={handleDelete}
            disabled={deletePhoto.isPending}
            className="absolute top-2 right-2 bg-destructive/20 hover:bg-destructive/40 text-white backdrop-blur-sm"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
