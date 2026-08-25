'use client'

import { Box, Button, Heading, IconButton, Input, Text, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useActionState, useEffect, useState } from 'react'
import { EyeIcon, EyeSlashedIcon } from '@/components'
import { Panel } from '@/components/Panel'
import { loginAction } from './actions'

export default function LogIn() {
  const session = useSession()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [state, formAction, pending] = useActionState(loginAction, undefined)

  useEffect(() => {
    if (session.status !== 'authenticated') return

    if (session.data.scope === 'admin') router.replace('/')
    if (session.data.scope === 'terralta') router.replace('/terralta')
    if (session.data.scope === 'lospuentes') router.replace('/lospuentes')
  }, [session, router])

  return (
    <VStack minH="calc(100vh - 64px)" justify="center" px="4" py="12">
      <Panel maxW="420px" width="full" p={{ base: 6, md: 8 }}>
        <VStack gap="6" align="stretch">
          <VStack gap="1" textAlign="center">
            <Text fontSize="xs" letterSpacing="0.18em" textTransform="uppercase" color="fg.muted" fontWeight="semibold">
              Videoteca México
            </Text>
            <Heading fontFamily="heading" fontWeight="medium" fontSize="3xl">
              Iniciar sesión
            </Heading>
          </VStack>
          <form action={formAction}>
            <VStack gap="3">
              <Input
                name="username"
                autoComplete="username"
                rounded="xl"
                bg="bg.canvas"
                placeholder="Usuario"
                type="text"
                required
              />

              <Box position="relative" width="100%">
                <Input
                  name="password"
                  autoComplete="current-password"
                  rounded="xl"
                  bg="bg.canvas"
                  pe="12"
                  placeholder="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  required
                />
                <IconButton
                  type="button"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  colorPalette="brand"
                  rounded="full"
                  size="sm"
                  variant="ghost"
                  position="absolute"
                  right="2"
                  top="50%"
                  transform="translateY(-50%)"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeSlashedIcon boxSize="5" /> : <EyeIcon boxSize="5" />}
                </IconButton>
              </Box>
              <Button type="submit" colorPalette="brand" rounded="xl" width="full" loading={pending} mt="2">
                Entrar
              </Button>

              {state?.error === 'invalid' ? (
                <Text color="red.700" fontSize="sm" textAlign="center">
                  La información de usuario o la contraseña no son correctas
                </Text>
              ) : null}
            </VStack>
          </form>
        </VStack>
      </Panel>
    </VStack>
  )
}
