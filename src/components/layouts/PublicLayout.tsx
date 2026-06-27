import type { ReactNode } from 'react'
import { Header } from '@/components/layout'
import { Footer } from '@/components/layout'

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}
