'use client'

import { Button } from '@/components/ui/button'

interface TodoFiltersProps {
  currentFilter: 'all' | 'assignedToMe' | 'createdByMe'
  onFilterChange: (filter: 'all' | 'assignedToMe' | 'createdByMe') => void
}

export function TodoFilters({ currentFilter, onFilterChange }: TodoFiltersProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      <Button
        variant={currentFilter === 'all' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('all')}
      >
        All
      </Button>
      <Button
        variant={currentFilter === 'assignedToMe' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('assignedToMe')}
      >
        Assigned to Me
      </Button>
      <Button
        variant={currentFilter === 'createdByMe' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('createdByMe')}
      >
        Created by Me
      </Button>
    </div>
  )
}
