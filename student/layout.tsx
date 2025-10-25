'use client'

import { Toaster } from '@/components/ui/toaster'
import { StudentSettingsButton } from '@/components/student-settings-button'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <StudentSettingsButton />
      <Toaster />
    </>
  )
}