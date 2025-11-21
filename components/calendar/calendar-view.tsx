'use client'

import { useState, useEffect } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO
} from 'date-fns'
import { ko } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

interface CalendarViewProps {
  onDateClick?: (date: Date) => void
  onEventClick?: (event: CalendarEvent) => void
  onAddEvent?: () => void
}

export function CalendarView({ onDateClick, onEventClick, onAddEvent }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchEvents = async () => {
    setIsLoading(true)
    try {
      const start = startOfMonth(currentMonth)
      const end = endOfMonth(currentMonth)

      const res = await fetch(
        `/api/calendar?start=${start.toISOString()}&end=${end.toISOString()}`
      )

      if (res.ok) {
        const data = await res.json()
        setEvents(data.events)
      }
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [currentMonth])

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold">
          {format(currentMonth, 'yyyy년 M월', { locale: ko })}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
          >
            오늘
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          {onAddEvent && (
            <Button size="sm" onClick={onAddEvent}>
              <Plus className="h-4 w-4 mr-1" />
              <span className="hidden md:inline">일정 추가</span>
            </Button>
          )}
        </div>
      </div>
    )
  }

  const renderDays = () => {
    const days = ['일', '월', '화', '수', '목', '금', '토']
    return (
      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map((day, i) => (
          <div
            key={i}
            className={`text-center text-sm font-semibold py-2 ${
              i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : ''
            }`}
          >
            {day}
          </div>
        ))}
      </div>
    )
  }

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })

    const rows = []
    let days = []
    let day = startDate

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day
        const dayEvents = events.filter((event) =>
          isSameDay(parseISO(event.startAt), cloneDay)
        )

        days.push(
          <div
            key={day.toString()}
            className={`min-h-[80px] md:min-h-[120px] border rounded p-1 md:p-2 cursor-pointer transition-colors ${
              !isSameMonth(day, monthStart)
                ? 'bg-gray-50 text-gray-400'
                : 'bg-white hover:bg-gray-50'
            } ${isSameDay(day, new Date()) ? 'border-primary border-2' : ''}`}
            onClick={() => onDateClick?.(cloneDay)}
          >
            <div
              className={`text-sm md:text-base font-medium mb-1 ${
                isSameDay(day, new Date()) ? 'text-primary' : ''
              }`}
            >
              {format(day, 'd')}
            </div>
            <div className="space-y-1">
              {dayEvents.slice(0, 2).map((event) => (
                <div
                  key={event.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    onEventClick?.(event)
                  }}
                  className="text-xs p-1 rounded truncate"
                  style={{
                    backgroundColor: event.color || '#3b82f6',
                    color: 'white',
                  }}
                  title={event.title}
                >
                  {event.title}
                </div>
              ))}
              {dayEvents.length > 2 && (
                <div className="text-xs text-gray-500">
                  +{dayEvents.length - 2} more
                </div>
              )}
            </div>
          </div>
        )
        day = addDays(day, 1)
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>
      )
      days = []
    }

    return <div className="space-y-1">{rows}</div>
  }

  return (
    <div className="bg-white rounded-lg border p-4">
      {renderHeader()}
      {renderDays()}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        renderCells()
      )}
    </div>
  )
}
