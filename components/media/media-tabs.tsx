'use client'

import { useState } from 'react'
import { PhotoGrid } from '@/components/photos/photo-grid'
import { PhotoUpload } from '@/components/photos/photo-upload'
import { FileUploadForm } from '@/components/files/file-upload-form'
import { FileList } from '@/components/files/file-list'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Camera, FolderOpen, Plus } from 'lucide-react'

interface MediaTabsProps {
  currentUserId: string
  defaultTab?: 'photos' | 'files'
}

export function MediaTabs({ currentUserId, defaultTab = 'photos' }: MediaTabsProps) {
  const [activeTab, setActiveTab] = useState<'photos' | 'files'>(defaultTab)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant={activeTab === 'photos' ? 'default' : 'outline'}
          onClick={() => setActiveTab('photos')}
          className="gap-2"
        >
          <Camera className="w-4 h-4" />
          사진
        </Button>
        <Button
          variant={activeTab === 'files' ? 'default' : 'outline'}
          onClick={() => setActiveTab('files')}
          className="gap-2"
        >
          <FolderOpen className="w-4 h-4" />
          파일
        </Button>
      </div>

      {activeTab === 'photos' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Family Album</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Cherish our moments together 📷
              </p>
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
                  <DialogTitle className="text-xl">Upload New Photo</DialogTitle>
                </DialogHeader>
                <PhotoUpload onSuccess={() => setIsUploadOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          <PhotoGrid />
        </div>
      )}

      {activeTab === 'files' && (
        <div className="grid gap-6 md:gap-8 lg:grid-cols-2">
          <Card className="p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4">파일 업로드</h2>
            <FileUploadForm onSuccess={() => setRefreshTrigger((prev) => prev + 1)} />
          </Card>
          <Card className="p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4">업로드된 파일</h2>
            <FileList refreshTrigger={refreshTrigger} currentUserId={currentUserId} />
          </Card>
        </div>
      )}
    </div>
  )
}
