'use client'

import { Badge, Flex, Heading, HStack, IconButton, Spinner, Stack, Text, VStack } from '@chakra-ui/react'
import { createColumnHelper } from '@tanstack/react-table'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useMemo } from 'react'
import { EditIcon } from '@/components/Icons'
import { ImdbLink } from '@/components/ImdbLink'
import { Page } from '@/components/Page'
import { Poster } from '@/components/Poster'
import { type MovieColumnDef, type MovieTableFeatures, Table } from '@/components/Table'
import { useList } from '@/hooks'
import type { ListScope, Movie } from '@/types'
import { unixTimestampToDateString } from '@/utils'

const moviesColumnHelper = createColumnHelper<MovieTableFeatures, Movie>()

function StatusBadge({ label, tone }: { label: string; tone: 'ok' | 'warn' | 'danger' | 'info' }) {
  const palettes = {
    ok: 'green',
    warn: 'orange',
    danger: 'red',
    info: 'gray'
  } as const

  return (
    <Badge colorPalette={palettes[tone]} variant="subtle" rounded="full" px="2.5" py="0.5" fontWeight="medium">
      {label}
    </Badge>
  )
}

function movieBadges(movie: Movie) {
  return (
    <HStack gap="1.5" flexWrap="wrap">
      {movie.modified === 'unsuitable' ? (
        <StatusBadge label="Desaconsejable" tone="danger" />
      ) : movie.modified === 'yes' ? (
        <StatusBadge label="Editada" tone="warn" />
      ) : (
        <StatusBadge label="Sin editar" tone="ok" />
      )}
      {movie.type === 'movie' ? <StatusBadge label="Película" tone="ok" /> : <StatusBadge label="Serie" tone="info" />}
    </HStack>
  )
}

export function MovieList({ scope }: { scope: ListScope }) {
  const session = useSession()
  const { data: movies, error, loading } = useList(scope)
  const isAdmin = session.data?.scope === 'admin'

  const moviesColumns = useMemo(() => {
    const columns = [
      moviesColumnHelper.accessor('poster', {
        enableSorting: false,
        cell: (info) => {
          const title = info.row.original.translated_title || info.row.original.original_title

          return (
            <Flex justify="center" w="full">
              <Poster
                id={info.row.original.id}
                src={info.getValue()}
                alt={`Póster de ${title}`}
                width={48}
                height={68}
              />
            </Flex>
          )
        },
        header: () => '',
        size: 72
      }),
      moviesColumnHelper.accessor('original_title', {
        cell: (info) => (
          <Stack gap="1" minW="180px">
            <HStack gap="2" align="baseline">
              <Text fontWeight="semibold" lineHeight="short">
                {info.row.original.translated_title}
              </Text>
              <ImdbLink id={info.row.original.id} />
            </HStack>
            <Text fontSize="sm" color="fg.muted" lineHeight="short">
              {info.getValue()}
            </Text>
          </Stack>
        ),
        header: () => 'Título',
        minSize: 240
      }),
      moviesColumnHelper.accessor('year', {
        cell: (info) => (
          <Text fontSize="sm" fontVariantNumeric="tabular-nums" color="fg.muted">
            {info.getValue()}
          </Text>
        ),
        header: () => 'Año',
        size: 72
      }),
      moviesColumnHelper.accessor('publish_date', {
        cell: (info) => (
          <Text fontSize="sm" color="fg.muted" fontVariantNumeric="tabular-nums">
            {unixTimestampToDateString(info.getValue())}
          </Text>
        ),
        header: () => 'Publicada',
        size: 120
      }),
      moviesColumnHelper.accessor('modified', {
        cell: (info) =>
          info.getValue() === 'unsuitable' ? (
            <StatusBadge label="Desaconsejable" tone="danger" />
          ) : info.getValue() === 'yes' ? (
            <StatusBadge label="Editada" tone="warn" />
          ) : (
            <StatusBadge label="Sin editar" tone="ok" />
          ),
        header: () => 'Edición',
        size: 140
      }),
      moviesColumnHelper.accessor('type', {
        cell: (info) =>
          info.getValue() === 'movie' ? (
            <StatusBadge label="Película" tone="ok" />
          ) : (
            <StatusBadge label="Serie" tone="info" />
          ),
        header: () => 'Tipo',
        size: 110
      })
    ]

    if (!isAdmin) return columns

    return [
      ...columns,
      moviesColumnHelper.accessor('id', {
        enableSorting: false,
        cell: (info) => (
          <Link href={`/edit/${info.getValue()}`}>
            <IconButton aria-label="Editar película" size="sm" variant="ghost" colorPalette="brand" rounded="full">
              <EditIcon width="14" height="14" />
            </IconButton>
          </Link>
        ),
        header: () => '',
        size: 56
      })
    ]
  }, [isAdmin])

  if (loading) {
    return (
      <HStack w="full" justifyContent="center" minH="60vh">
        <Spinner color="brand.500" size="xl" />
      </HStack>
    )
  }

  if (error) {
    return (
      <Page title="No se pudo cargar">
        <VStack align="flex-start" gap="2" color="fg.muted">
          <Heading size="md">Error al cargar la lista</Heading>
          <Text>Reinicia la página. Si no funciona, ponte en contacto con los encargados.</Text>
        </VStack>
      </Page>
    )
  }

  return (
    <Page title="Películas">
      {movies ? (
        <Table
          columns={moviesColumns as MovieColumnDef[]}
          data={movies}
          renderMobileRow={(movie) => (
            <HStack
              align="stretch"
              gap="3"
              p="3"
              rounded="xl"
              borderWidth="1px"
              borderColor="border.subtle"
              bg="bg.surface"
              shadow="xs"
              overflow="hidden"
            >
              <Poster
                id={movie.id}
                src={movie.poster}
                alt={`Póster de ${movie.translated_title || movie.original_title}`}
                width={64}
                height={92}
              />
              <Stack gap="1.5" flex="1" minW="0" py="0.5">
                <HStack gap="2" align="baseline">
                  <Text fontWeight="semibold" lineHeight="short">
                    {movie.translated_title}
                  </Text>
                  <ImdbLink id={movie.id} />
                </HStack>
                <Text fontSize="sm" color="fg.muted" lineClamp={1}>
                  {movie.original_title}
                </Text>
                <Text fontSize="xs" color="fg.muted">
                  {movie.year} · {unixTimestampToDateString(movie.publish_date)}
                </Text>
                {movieBadges(movie)}
              </Stack>
              {isAdmin ? (
                <Link href={`/edit/${movie.id}`}>
                  <IconButton
                    aria-label="Editar película"
                    size="sm"
                    variant="ghost"
                    colorPalette="brand"
                    rounded="full"
                  >
                    <EditIcon width="14" height="14" />
                  </IconButton>
                </Link>
              ) : null}
            </HStack>
          )}
        />
      ) : null}
    </Page>
  )
}
