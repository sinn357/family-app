'use client'

import { useState } from 'react'
import { usePhotos } from '@/lib/hooks/use-photos'
import { PhotoCard } from './photo-card'
import { PhotoLightbox } from './photo-lightbox'

export function PhotoGrid() {
  const { data: photos, isLoading, error } = usePhotos()
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null)

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-2xl bg-muted/50 animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load photos</p>
      </div>
    )
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">📷</span>
        </div>
        <p className="text-muted-foreground text-lg">No photos yet</p>
        <p className="text-muted-foreground text-sm mt-1">
          Upload your first family photo!
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            onClick={() => setSelectedPhotoIndex(index)}
          />
        ))}
      </div>

      {selectedPhotoIndex !== null && (
        <PhotoLightbox
          photos={photos}
          currentIndex={selectedPhotoIndex}
          onClose={() => setSelectedPhotoIndex(null)}
          onNavigate={setSelectedPhotoIndex}
        />
      )}
    </>
  )
}
