'use client'

import { Box, type BoxProps, HStack, Text } from '@chakra-ui/react'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { HomeIcon, LogoutIcon } from '@/components/Icons'

function NavCircle({ children, ...props }: BoxProps) {
  return (
    <Box
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      w="40px"
      h="40px"
      minW="40px"
      rounded="full"
      color="#f7f1e8"
      bg="transparent"
      cursor="pointer"
      transition="background 0.15s ease, color 0.15s ease"
      _hover={{ bg: 'rgba(247, 241, 232, 0.14)', color: '#fffaf4' }}
      _active={{ bg: 'rgba(247, 241, 232, 0.24)' }}
      _focusVisible={{ outline: '2px solid #e8c3a6', outlineOffset: '2px' }}
      {...props}
    >
      {children}
    </Box>
  )
}

export function NavBar() {
  const session = useSession()

  return (
    <HStack
      position="sticky"
      top="0"
      zIndex="10"
      width="full"
      justify="space-between"
      minH="56px"
      px={{ base: '2', md: '6' }}
      pt="env(safe-area-inset-top)"
      bg="#1c1915"
      color="#f7f1e8"
      borderBottomWidth="1px"
      borderColor="#2c2822"
    >
      <HStack gap="1">
        <Link href="/" aria-label="Inicio">
          <NavCircle>
            <HomeIcon width={20} height={20} />
          </NavCircle>
        </Link>
        <Text
          asChild
          fontFamily="heading"
          fontSize={{ base: 'sm', sm: 'md', md: 'lg' }}
          letterSpacing="-0.02em"
          lineHeight="1.2"
          pe="2"
          _hover={{ color: '#fffaf4' }}
        >
          <Link href="/">Videoteca México</Link>
        </Text>
      </HStack>

      {session.status === 'authenticated' ? (
        <HStack gap="1">
          <Text fontSize="sm" color="#cbbba8" display={{ base: 'none', md: 'block' }} pe="1">
            {session.data.id}
          </Text>
          <button
            type="button"
            aria-label="Cerrar sesión"
            onClick={() => signOut({ redirectTo: '/' })}
            style={{ background: 'none', border: 0, padding: 0 }}
          >
            <NavCircle>
              <LogoutIcon width={18} height={18} />
            </NavCircle>
          </button>
        </HStack>
      ) : null}
    </HStack>
  )
}
