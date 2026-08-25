import { Heading, Stack, Text } from '@chakra-ui/react'

export function Page({
  children,
  title,
  eyebrow,
  description,
  align = 'start'
}: {
  children: React.ReactNode
  title?: string
  eyebrow?: string
  description?: string
  align?: 'start' | 'center'
}) {
  const centered = align === 'center'

  return (
    <Stack
      as="main"
      gap="6"
      px={{ base: '3', md: '8', lg: '12' }}
      py={{ base: '5', md: '8' }}
      pb={{ base: '24', md: '8' }}
      maxW="1320px"
      mx="auto"
      w="full"
    >
      {title ? (
        <Stack gap="1" align={centered ? 'center' : 'stretch'} textAlign={centered ? 'center' : 'start'}>
          {eyebrow ? (
            <Text fontSize="xs" fontWeight="semibold" letterSpacing="0.18em" textTransform="uppercase" color="fg.muted">
              {eyebrow}
            </Text>
          ) : null}
          <Heading
            fontFamily="heading"
            fontWeight="medium"
            fontSize={{ base: '2xl', md: '4xl' }}
            letterSpacing="-0.03em"
          >
            {title}
          </Heading>
          {description ? (
            <Text color="fg.muted" fontSize={{ base: 'md', md: 'lg' }}>
              {description}
            </Text>
          ) : null}
        </Stack>
      ) : null}
      {children}
    </Stack>
  )
}
