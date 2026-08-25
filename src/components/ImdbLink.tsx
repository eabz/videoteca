import { Text } from '@chakra-ui/react'
import Link from 'next/link'

export function imdbTitleUrl(id: string) {
  return `https://www.imdb.com/title/${id}`
}

export function ImdbLink({ id, label = 'IMDB' }: { id: string; label?: string }) {
  if (!/^tt\d+$/.test(id)) return null

  return (
    <Text
      asChild
      color="brand.700"
      fontWeight="semibold"
      fontSize="xs"
      letterSpacing="0.04em"
      _hover={{ color: 'brand.500', textDecoration: 'underline' }}
    >
      <Link href={imdbTitleUrl(id)} target="_blank" rel="noreferrer">
        {label}
      </Link>
    </Text>
  )
}
