import { redirect } from 'next/navigation'
import { getCurrentMember } from '@/lib/auth'
import { ProtectedNav } from '@/components/auth/protected-nav'
import { NotificationSettings } from '@/components/notifications/notification-settings'
import { MemberList } from '@/components/admin/member-list'
import { MemberForm } from '@/components/admin/member-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import Link from 'next/link'
import { Bell, User, Info, LifeBuoy, Shield, Plus } from 'lucide-react'

export default async function SettingsPage() {
  const member = await getCurrentMember()

  if (!member) {
    redirect('/login')
  }

  return (
    <>
      <ProtectedNav member={member} />
      <main className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <section>
            <h1 className="text-2xl font-bold">설정</h1>
            <p className="text-sm text-muted-foreground mt-1">
              필요한 메뉴만 빠르게 접근하세요
            </p>
          </section>

          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <a href="#notifications">
              <Card className="hover:bg-accent/40 transition-colors">
                <CardHeader className="p-4">
                  <Bell className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm mt-2">알림 설정</CardTitle>
                  <CardDescription className="text-xs">댓글/멘션/할일</CardDescription>
                </CardHeader>
              </Card>
            </a>
            <a href="#account">
              <Card className="hover:bg-accent/40 transition-colors">
                <CardHeader className="p-4">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm mt-2">계정 정보</CardTitle>
                  <CardDescription className="text-xs">내 프로필 확인</CardDescription>
                </CardHeader>
              </Card>
            </a>
            <a href="#support">
              <Card className="hover:bg-accent/40 transition-colors">
                <CardHeader className="p-4">
                  <LifeBuoy className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm mt-2">도움말</CardTitle>
                  <CardDescription className="text-xs">자주 묻는 질문</CardDescription>
                </CardHeader>
              </Card>
            </a>
            <a href="#about">
              <Card className="hover:bg-accent/40 transition-colors">
                <CardHeader className="p-4">
                  <Info className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm mt-2">앱 정보</CardTitle>
                  <CardDescription className="text-xs">버전/정책</CardDescription>
                </CardHeader>
              </Card>
            </a>
          </section>

          <section id="notifications">
            <Card>
              <CardHeader>
                <CardTitle>알림 설정</CardTitle>
                <CardDescription>받고 싶은 알림을 선택하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <NotificationSettings />
              </CardContent>
            </Card>
          </section>

          <section id="account">
            <Card>
              <CardHeader>
                <CardTitle>계정 정보</CardTitle>
                <CardDescription>현재 로그인된 정보</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">이름</span>
                  <span>{member.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">권한</span>
                  <span>{member.role === 'ADMIN' ? '관리자' : '가족 구성원'}</span>
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="support">
            <Card>
              <CardHeader>
                <CardTitle>도움말</CardTitle>
                <CardDescription>필요한 도움을 빠르게 찾아보세요</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>채팅/사진/할일 기능은 메뉴에서 바로 접근할 수 있습니다.</p>
                <p>문제가 계속되면 관리자에게 문의해주세요.</p>
              </CardContent>
            </Card>
          </section>

          <section id="about">
            <Card>
              <CardHeader>
                <CardTitle>앱 정보</CardTitle>
                <CardDescription>가족 앱의 기본 정보</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <p>Family App</p>
                <p>버전 0.1.0</p>
              </CardContent>
            </Card>
          </section>

          {member.role === 'ADMIN' && (
            <section id="admin">
              <Card>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle>관리자 설정</CardTitle>
                      <CardDescription>가족 구성원을 관리합니다</CardDescription>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        구성원 추가
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>가족 구성원 추가</DialogTitle>
                      </DialogHeader>
                      <MemberForm />
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <MemberList />
                </CardContent>
              </Card>
            </section>
          )}
        </div>
      </main>
    </>
  )
}
