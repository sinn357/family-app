'use client'

import { Calendar, dateFnsLocalizer, type Event } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { ko } from 'date-fns/locale'

const locales = { ko }

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
})

interface TodoCalendarProps {
  todos: Array<{
    id: string
    title: string
    dueDate?: string | null
    isDone: boolean
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  }>
  onSelectDate?: (date: Date) => void
  onSelectTodo?: (todoId: string) => void
}

interface TodoEvent extends Event {
  todoId: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  isDone: boolean
}

export function TodoCalendar({ todos, onSelectDate, onSelectTodo }: TodoCalendarProps) {
  const events: TodoEvent[] = todos
    .filter((todo) => !!todo.dueDate)
    .map((todo) => {
      const date = new Date(todo.dueDate as string)
      return {
        title: todo.title,
        start: date,
        end: date,
        allDay: true,
        todoId: todo.id,
        priority: todo.priority,
        isDone: todo.isDone,
      }
    })

  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-3 md:p-4">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 520 }}
        views={['month']}
        selectable
        onSelectSlot={(slotInfo) => {
          if (slotInfo?.start && onSelectDate) {
            onSelectDate(slotInfo.start as Date)
          }
        }}
        onSelectEvent={(event) => {
          if (onSelectTodo && (event as TodoEvent).todoId) {
            onSelectTodo((event as TodoEvent).todoId)
          }
        }}
        eventPropGetter={(event) => {
          const priority = (event as TodoEvent).priority
          const isDone = (event as TodoEvent).isDone

          const priorityColors: Record<string, string> = {
            LOW: '#94a3b8',
            MEDIUM: '#6366f1',
            HIGH: '#f59e0b',
            URGENT: '#ef4444',
          }

          return {
            style: {
              backgroundColor: priority ? priorityColors[priority] : '#6366f1',
              opacity: isDone ? 0.5 : 1,
              borderRadius: '8px',
              border: 'none',
              padding: '4px 6px',
              fontSize: '0.85rem',
            },
          }
        }}
        messages={{
          next: '다음',
          previous: '이전',
          today: '오늘',
          month: '월',
          week: '주',
          day: '일',
          agenda: '일정',
        }}
      />
    </div>
  )
}
