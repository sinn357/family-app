'use client'

import { useState } from 'react'
import { FileUploadForm } from './file-upload-form'
import { FileList } from './file-list'

interface FilesContainerProps {
  currentUserId: string
}

export function FilesContainer({ currentUserId }: FilesContainerProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  return (
    <div className="grid gap-6 md:gap-8 lg:grid-cols-2">
      {/* Upload Form */}
      <div className="bg-white rounded-lg border p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold mb-4">
          파일 업로드
        </h2>
        <FileUploadForm onSuccess={() => setRefreshTrigger((prev) => prev + 1)} />
      </div>

      {/* File List */}
      <div className="bg-white rounded-lg border p-4 md:p-6 lg:col-span-1">
        <h2 className="text-lg md:text-xl font-semibold mb-4">
          업로드된 파일
        </h2>
        <FileList refreshTrigger={refreshTrigger} currentUserId={currentUserId} />
      </div>
    </div>
  )
}
