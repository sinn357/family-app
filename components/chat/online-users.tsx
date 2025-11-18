import { Users } from 'lucide-react'

interface OnlineUsersProps {
  onlineUsers: Array<{ userId: string; userName: string; status: string }>
  currentUserId: string
}

export function OnlineUsers({ onlineUsers, currentUserId }: OnlineUsersProps) {
  // Filter out offline users and current user
  const activeUsers = onlineUsers.filter(
    (user) => user.status === 'online' && user.userId !== currentUserId
  )

  if (activeUsers.length === 0) return null

  return (
    <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
      <div className="flex items-center gap-2 text-green-700">
        <Users className="h-4 w-4" />
        <span className="text-sm font-medium">
          {activeUsers.length === 1 ? '1 family member' : `${activeUsers.length} family members`} online
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {activeUsers.map((user) => (
          <div
            key={user.userId}
            className="flex items-center gap-1 text-xs bg-white px-2 py-1 rounded-full border border-green-200"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span>{user.userName}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
