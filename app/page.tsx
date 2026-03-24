'use client'

import { Providers } from './providers'
import PollPage from './poll'

export default function Page() {
  return (
    <Providers>
      <PollPage />
    </Providers>
  )
}
