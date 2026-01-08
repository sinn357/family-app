import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface Reaction {
  id: string
  userId: string
  emoji: string
  user: {
    name: string
  }
}

interface MessageReactionsProps {
  reactions: Reaction[]
  currentUserId: string
  onReactionClick: (emoji: string) => void
}

export function MessageReactions({
  reactions,
  currentUserId,
  onReactionClick,
}: MessageReactionsProps) {
  if (!reactions || reactions.length === 0) return null

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = []
    }
    acc[reaction.emoji].push(reaction)
    return acc
  }, {} as Record<string, Reaction[]>)

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {Object.entries(groupedReactions).map(([emoji, reactionList]) => {
        const count = reactionList.length
        const hasReacted = reactionList.some((r) => r.userId === currentUserId)
        const userNames = reactionList.map((r) => r.user.name).join(', ')

        return (
          <TooltipProvider key={emoji}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReactionClick(emoji)}
                  className={`h-6 px-2 text-xs gap-1 ${
                    hasReacted
                      ? 'bg-primary/10 border-primary hover:bg-primary/20'
                      : 'hover:bg-accent'
                  }`}
                >
                  <span>{emoji}</span>
                  {count > 1 && <span className="text-muted-foreground">{count}</span>}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{userNames}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      })}
    </div>
  )
}
