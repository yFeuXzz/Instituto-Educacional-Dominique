'use client'

import { Toaster } from '@/components/ui/toaster'
import { AdminSettingsButton } from '@/components/admin-settings-button'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <AdminSettingsButton />
      <Toaster />
    </>
  )
}