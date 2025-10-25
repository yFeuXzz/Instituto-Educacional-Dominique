'use client'

import { Toaster } from '@/components/ui/toaster'
import { SettingsButton } from '@/components/settings-button'

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <SettingsButton />
      <Toaster />
    </>
  )
}