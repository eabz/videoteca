'use client'

import { Box, IconButton } from '@chakra-ui/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { AddIcon } from '@/components/Icons'

export function FloatingButton() {
  const session = useSession()
  const pathname = usePathname()

  if (!session.data?.admin) return null
  if (pathname === '/add' || pathname.startsWith('/edit')) return null

  return (
    <Box
      position="fixed"
      bottom={{ base: '5', md: '6' }}
      right={{ base: '4', md: '6' }}
      zIndex="20"
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      <Link href="/add">
        <IconButton
          aria-label="Agregar película"
          colorPalette="brand"
          rounded="full"
          w={{ base: '52px', md: '56px' }}
          h={{ base: '52px', md: '56px' }}
          shadow="lg"
        >
          <AddIcon width={22} height={22} />
        </IconButton>
      </Link>
    </Box>
  )
}
