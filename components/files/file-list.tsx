'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Download, Trash2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface FileItem {
  id: string
  originalName: string
  url: string
  fileType: string
  fileSize: number
  description: string | null
  uploader: {
    id: string
    name: string
  }
  createdAt: string
}

interface FileListProps {
  refreshTrigger?: number
  currentUserId?: string
}

export function FileList({ refreshTrigger, currentUserId }: FileListProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/files')
      if (res.ok) {
        const data = await res.json()
        setFiles(data.files)
      }
    } catch (error) {
      console.error('Failed to fetch files:', error)
      toast.error('Failed to load files')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [refreshTrigger])

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      const res = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Delete failed')
      }

      toast.success('File deleted successfully')
      fetchFiles()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete file')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading files...</div>
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No files uploaded yet
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {files.map((file) => (
        <div
          key={file.id}
          className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-start gap-3">
            <FileText className="h-8 w-8 text-primary flex-shrink-0 mt-1" />

            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">{file.originalName}</h3>

              {file.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {file.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                <span>{file.uploader.name}</span>
                <span>•</span>
                <span>{formatFileSize(file.fileSize)}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(file.createdAt), { addSuffix: true, locale: ko })}</span>
              </div>
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(file.url, '_blank')}
              >
                <Download className="h-4 w-4" />
              </Button>

              {file.uploader.id === currentUserId && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(file.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
