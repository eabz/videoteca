'use client'

import { Box, SimpleGrid } from '@chakra-ui/react'
import Image from 'next/image'
import Link from 'next/link'
import { Page } from '@/components/Page'

const collections = [
  { href: '/terralta', src: '/terralta.jpeg' },
  { href: '/lospuentes', src: '/lospuentes.jpeg' }
] as const

export default function Home() {
  return (
    <Page title="Videoteca México" align="center">
      <SimpleGrid columns={2} gap={{ base: '4', md: '6' }} maxW="460px" mx="auto" w="full">
        {collections.map((collection) => (
          <Link key={collection.href} href={collection.href}>
            <Box
              bg="bg.surface"
              rounded="xl"
              overflow="hidden"
              borderWidth="1px"
              borderColor="border.subtle"
              shadow="sm"
              display="flex"
              justifyContent="center"
              alignItems="center"
              py={{ base: '5', md: '7' }}
              px="4"
              minH={{ base: '140px', md: '168px' }}
              transition="transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease"
              _hover={{ transform: 'translateY(-3px)', shadow: 'md', borderColor: 'brand.200' }}
            >
              <Image src={collection.src} width={124} height={130} alt="" priority />
            </Box>
          </Link>
        ))}
      </SimpleGrid>
    </Page>
  )
}
