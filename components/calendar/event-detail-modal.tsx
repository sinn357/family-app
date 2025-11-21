'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import { X, MapPin, Calendar, Clock, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { EventForm } from './event-form'

interface CalendarEvent {
  id: string
  title: string
  description: string | null
  startAt: string
  endAt: string | null
  location: string | null
  color: string | null
  isAllDay: boolean
  creator: {
    id: string
    name: string
  }
}

interface EventDetailModalProps {
  event: CalendarEvent
  currentUserId: string
  onClose: () => void
  onUpdate: () => void
}

export function EventDetailModal({
  event,
  currentUserId,
  onClose,
  onUpdate,
}: EventDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const canModify = event.creator.id === currentUserId

  const handleDelete = async () => {
    if (!confirm('이 일정을 삭제하시겠습니까?')) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/calendar/${event.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('삭제 실패')
      }

      toast.success('일정이 삭제되었습니다')
      onUpdate()
      onClose()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('일정 삭제 실패')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isEditing) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">일정 수정</h2>
            <button
              onClick={() => setIsEditing(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <EventForm
            initialData={{
              id: event.id,
              title: event.title,
              description: event.description || undefined,
              startAt: parseISO(event.startAt),
              endAt: event.endAt ? parseISO(event.endAt) : undefined,
              location: event.location || undefined,
              color: event.color || undefined,
              isAllDay: event.isAllDay,
            }}
            onSuccess={() => {
              setIsEditing(false)
              onUpdate()
            }}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div
              className="inline-block w-4 h-4 rounded mr-2"
              style={{ backgroundColor: event.color || '#3b82f6' }}
            />
            <h2 className="text-2xl font-bold inline">{event.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          {event.description && (
            <div>
              <p className="text-gray-700 whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          )}

          <div className="flex items-start gap-3 text-gray-600">
            <Calendar className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <div>
                {event.isAllDay
                  ? format(parseISO(event.startAt), 'yyyy년 M월 d일 (E)', {
                      locale: ko,
                    })
                  : format(
                      parseISO(event.startAt),
                      'yyyy년 M월 d일 (E) HH:mm',
                      { locale: ko }
                    )}
              </div>
              {event.endAt && (
                <div className="text-sm">
                  ~{' '}
                  {event.isAllDay
                    ? format(parseISO(event.endAt), 'yyyy년 M월 d일 (E)', {
                        locale: ko,
                      })
                    : format(
                        parseISO(event.endAt),
                        'yyyy년 M월 d일 (E) HH:mm',
                        { locale: ko }
                      )}
                </div>
              )}
            </div>
          </div>

          {event.location && (
            <div className="flex items-start gap-3 text-gray-600">
              <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>{event.location}</div>
            </div>
          )}

          <div className="text-sm text-gray-500 pt-4 border-t">
            작성자: {event.creator.name}
          </div>
        </div>

        {canModify && (
          <div className="flex gap-2 mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-2" />
              수정
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? '삭제 중...' : '삭제'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
