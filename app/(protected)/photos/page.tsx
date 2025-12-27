'use client'

import { useState } from 'react'
import { PhotoGrid } from '@/components/photos/photo-grid'
import { PhotoUpload } from '@/components/photos/photo-upload'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Camera } from 'lucide-react'

export default function PhotosPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  return (
    <div className="container mx-auto py-6 md:py-10 px-4 md:px-6">
      <div className="flex items-center justify-between mb-8 md:mb-10 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-info/20 to-primary/10 flex items-center justify-center">
            <Camera className="w-6 h-6 text-info" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Family Album
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-0.5">
              Cherish our moments together 📷
            </p>
          </div>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Upload Photo</span>
              <span className="sm:hidden">Upload</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Upload New Photo
              </DialogTitle>
            </DialogHeader>
            <PhotoUpload onSuccess={() => setIsUploadOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <PhotoGrid />
    </div>
  )
}
