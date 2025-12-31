'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchResults } from './search-results'
import { useDebounce } from '@/lib/hooks/use-debounce'

export function SearchDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 500)

  // Fetch search results
  const fetchResults = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults(null)
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery) {
      fetchResults(debouncedQuery)
    }
  }, [debouncedQuery, fetchResults])

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Reset when closed
  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setResults(null)
    }
  }, [isOpen])

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="relative"
      >
        <Search className="h-5 w-5" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setIsOpen(false)}
          />

          {/* Search Modal */}
          <div className="fixed inset-x-4 top-20 z-50 mx-auto max-w-2xl md:inset-x-auto">
            <div className="rounded-lg border bg-white shadow-lg dark:bg-gray-900">
              {/* Search Input */}
              <div className="flex items-center border-b px-4 py-3">
                <Search className="h-5 w-5 text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="게시글, 댓글, 할일 검색..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm"
                  autoFocus
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Search Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 text-center text-sm text-gray-500">
                    검색 중...
                  </div>
                ) : query.trim().length < 2 ? (
                  <div className="p-8 text-center text-sm text-gray-500">
                    검색하려면 2자 이상 입력하세요
                  </div>
                ) : results ? (
                  <SearchResults results={results} onClose={() => setIsOpen(false)} />
                ) : null}
              </div>

              {/* Keyboard Hint */}
              <div className="border-t px-4 py-2 text-xs text-gray-500 flex items-center justify-between">
                <span>ESC를 눌러 닫기</span>
                <span className="hidden sm:inline">⌘K로 열기</span>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
