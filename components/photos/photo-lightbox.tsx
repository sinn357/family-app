'use client'

import Image from 'next/image'
import { useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Photo {
  id: string
  imageUrl: string
  caption: string | null
  createdAt: string
  uploader: {
    id: string
    name: string
  }
}

interface PhotoLightboxProps {
  photos: Photo[]
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}

export function PhotoLightbox({
  photos,
  currentIndex,
  onClose,
  onNavigate,
}: PhotoLightboxProps) {
  const currentPhoto = photos[currentIndex]
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < photos.length - 1

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && hasPrev) onNavigate(currentIndex - 1)
      if (e.key === 'ArrowRight' && hasNext) onNavigate(currentIndex + 1)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, hasPrev, hasNext, onClose, onNavigate])

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const formattedDate = new Date(currentPhoto.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const uploaderLetter = currentPhoto.uploader.name.charAt(0).toUpperCase()

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <Button
        size="icon"
        variant="ghost"
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:bg-white/10 z-10"
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Previous button */}
      {hasPrev && (
        <Button
          size="icon"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation()
            onNavigate(currentIndex - 1)
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 z-10"
        >
          <ChevronLeft className="w-8 h-8" />
        </Button>
      )}

      {/* Next button */}
      {hasNext && (
        <Button
          size="icon"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation()
            onNavigate(currentIndex + 1)
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 z-10"
        >
          <ChevronRight className="w-8 h-8" />
        </Button>
      )}

      {/* Image container */}
      <div
        className="max-w-7xl max-h-[90vh] w-full px-4 flex flex-col items-center gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative w-full h-[70vh] flex items-center justify-center">
          <Image
            src={currentPhoto.imageUrl}
            alt={currentPhoto.caption || 'Photo'}
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Info */}
        <div className="bg-card/80 backdrop-blur-md rounded-2xl p-6 w-full max-w-2xl border border-border/50">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {uploaderLetter}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">
                {currentPhoto.uploader.name}
              </p>
              <p className="text-sm text-muted-foreground">{formattedDate}</p>
            </div>
          </div>

          {currentPhoto.caption && (
            <p className="text-foreground leading-relaxed">
              {currentPhoto.caption}
            </p>
          )}

          <p className="text-xs text-muted-foreground mt-3">
            {currentIndex + 1} / {photos.length}
          </p>
        </div>
      </div>
    </div>
  )
}
