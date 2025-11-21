'use client'

import { useState } from 'react'
import { CalendarView } from './calendar-view'
import { EventForm } from './event-form'
import { EventDetailModal } from './event-detail-modal'
import { X } from 'lucide-react'

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

interface CalendarContainerProps {
  currentUserId: string
}

export function CalendarContainer({ currentUserId }: CalendarContainerProps) {
  const [refreshKey, setRefreshKey] = useState(0)
  const [showEventForm, setShowEventForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setShowEventForm(true)
  }

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
  }

  const handleAddEvent = () => {
    setSelectedDate(null)
    setShowEventForm(true)
  }

  return (
    <div>
      <CalendarView
        key={refreshKey}
        onDateClick={handleDateClick}
        onEventClick={handleEventClick}
        onAddEvent={handleAddEvent}
      />

      {/* Event Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">새 일정</h2>
              <button
                onClick={() => {
                  setShowEventForm(false)
                  setSelectedDate(null)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <EventForm
              initialData={
                selectedDate
                  ? {
                      title: '',
                      startAt: selectedDate,
                    }
                  : undefined
              }
              onSuccess={() => {
                setShowEventForm(false)
                setSelectedDate(null)
                handleRefresh()
              }}
              onCancel={() => {
                setShowEventForm(false)
                setSelectedDate(null)
              }}
            />
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          currentUserId={currentUserId}
          onClose={() => setSelectedEvent(null)}
          onUpdate={() => {
            handleRefresh()
            setSelectedEvent(null)
          }}
        />
      )}
    </div>
  )
}
