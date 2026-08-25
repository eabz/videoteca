'use client'

import { Box, Button, HStack, Input, Text, Textarea, VStack } from '@chakra-ui/react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { AppCheckbox, RadioOptions } from '@/components/FormControls'
import { ImdbLink } from '@/components/ImdbLink'
import { Page } from '@/components/Page'
import { Panel } from '@/components/Panel'
import { Poster } from '@/components/Poster'
import { addMovie, fetchMovieMetadata } from '@/hooks'
import type { Movie, MovieMetadata } from '@/types'
import { getCurrentDate } from '@/utils'

function normalizeImdbId(value: string): string {
  return value.match(/tt\d+/)?.[0] ?? value.trim()
}

export default function AddMovie() {
  const session = useSession()
  const router = useRouter()

  const [imdbId, setImdbID] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [movieMetadata, setMovieMetadata] = useState<MovieMetadata | undefined>()
  const [spanishTitle, setSpanishTitle] = useState<string | undefined>()
  const [addToSv, setAddToSv] = useState(true)
  const [addToSf, setAddToSf] = useState(true)
  const [feedback, setFeedback] = useState<string | undefined>(undefined)
  const [modified, setModified] = useState<'yes' | 'no' | 'unsuitable'>('no')
  const [checkbox, setCheckbox] = useState('2')
  const [addedBy, setAddedBy] = useState('cr')
  const [loadingUpload, setLoadingUpload] = useState(false)
  const [errorUpload, setErrorUpload] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  useEffect(() => {
    if (session.status === 'loading') return

    if (session.status === 'unauthenticated' || !session.data?.admin) {
      router.replace('/')
    }
  }, [session, router])

  const handleImdbIDChange = (id: string) => {
    const normalized = normalizeImdbId(id)
    setImdbID(normalized === '' ? undefined : normalized)
  }

  const fetchImdbMetadata = async () => {
    if (!imdbId) return

    setLoading(true)
    setError(null)
    setMovieMetadata(undefined)

    try {
      const metadata = await fetchMovieMetadata(imdbId)

      setMovieMetadata(metadata)
      setUploadSuccess(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la información de la película.')
      setUploadSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  const handleSpanishTitle = (title: string) => {
    setSpanishTitle(title === '' ? undefined : title)
  }

  const handleFeedback = (value: string) => {
    setFeedback(value === '' ? undefined : value)
  }

  const handleModifiedChange = (value: string) => {
    setCheckbox(value)

    if (value === '1') setModified('yes')
    if (value === '2') setModified('no')
    if (value === '3') setModified('unsuitable')
  }

  const handleUpload = async () => {
    if (!movieMetadata || !spanishTitle || !session.data?.id) return

    setLoadingUpload(true)
    setErrorUpload(null)

    const movie: Movie = {
      countries: movieMetadata.countries,
      genres: movieMetadata.genres,
      feedback,
      id: movieMetadata.id,
      languages: movieMetadata.languages,
      modified,
      original_title: movieMetadata.original_title,
      plot: movieMetadata.plot,
      publish_date: getCurrentDate(),
      published_by: addedBy,
      release_date: movieMetadata.release_date,
      sf: addToSf,
      sv: addToSv,
      type: movieMetadata.type,
      translated_title: spanishTitle,
      year: movieMetadata.year,
      poster: movieMetadata.poster ?? 'N/A'
    }

    try {
      await addMovie(movie)
      setMovieMetadata(undefined)
      setUploadSuccess(true)
    } catch (err) {
      setErrorUpload(
        err instanceof Error ? err.message : 'No se pudo guardar la película. Revisá la información y volvé a intentar.'
      )
    } finally {
      setLoadingUpload(false)
    }
  }

  return (
    <Page title="Agregar película" eyebrow="Catálogo" align="center">
      <Panel maxW="640px">
        <VStack py="2" gap="4">
          <HStack width="full" flexWrap="wrap" gap="3">
            <Input
              colorPalette="brand"
              placeholder="ID de IMDB"
              rounded="xl"
              bg="bg.canvas"
              flex="1"
              minW={{ base: 'full', sm: '180px' }}
              onChange={(e) => handleImdbIDChange(e.target.value)}
            />
            <Button
              w={{ base: 'full', sm: 'auto' }}
              minW="180px"
              colorPalette="brand"
              rounded="xl"
              disabled={!imdbId}
              loading={loading}
              onClick={fetchImdbMetadata}
            >
              Cargar información
            </Button>
          </HStack>

          {error ? (
            <Text color="red.600" fontSize="xs" maxWidth="500px" textAlign="center">
              {error}
            </Text>
          ) : null}

          {uploadSuccess ? (
            <Text color="green.600" fontSize="lg" py="10">
              La pelicula se agrego correctamente
            </Text>
          ) : null}

          {movieMetadata ? (
            <VStack py="5" maxWidth="600px" textAlign="center" align="center" w="full">
              <Text fontSize="18px" fontWeight="bold">
                Título
              </Text>
              <Text>{movieMetadata.original_title}</Text>
              <ImdbLink id={movieMetadata.id} label="Ver en IMDB" />
              <Text fontSize="18px" fontWeight="bold">
                Póster
              </Text>
              <Poster
                id={movieMetadata.id}
                src={movieMetadata.poster}
                alt={`Póster de ${movieMetadata.original_title}`}
                width={160}
                height={240}
              />
              <Text fontSize="18px" fontWeight="bold">
                Título en Español
              </Text>
              <Input
                colorPalette="brand"
                maxWidth="300px"
                w="full"
                onChange={(e) => handleSpanishTitle(e.target.value)}
              />
              <Text fontSize="18px" fontWeight="bold">
                Año de lanzamiento
              </Text>
              <Text>{movieMetadata.year_label}</Text>
              <Text fontSize="18px" fontWeight="bold">
                País
              </Text>
              <Text>{movieMetadata.countries.join(', ')}</Text>
              <Text fontSize="18px" fontWeight="bold">
                Género
              </Text>
              <Text>{movieMetadata.genres.join(', ')}</Text>
              <Text fontSize="18px" fontWeight="bold">
                Idiomas
              </Text>
              <Text>{movieMetadata.languages.join(', ')}</Text>
              <Text fontSize="18px" fontWeight="bold">
                Trama
              </Text>
              <Text>{movieMetadata.plot}</Text>
              <Text fontSize="18px" fontWeight="bold">
                Fecha de Publicación
              </Text>
              <Text>{movieMetadata.released_label}</Text>
              <Text fontSize="18px" fontWeight="bold">
                Tipo
              </Text>
              <Text>{movieMetadata.type === 'series' ? 'Serie' : 'Película'}</Text>
              <Text fontSize="18px" fontWeight="bold">
                Editada
              </Text>
              <RadioOptions
                value={checkbox}
                onChange={handleModifiedChange}
                options={[
                  { value: '1', label: 'Sí' },
                  { value: '2', label: 'No' },
                  { value: '3', label: 'Desaconsejable' }
                ]}
              />
              <Text fontSize="18px" fontWeight="bold">
                Agregada por
              </Text>
              <RadioOptions
                value={addedBy}
                onChange={setAddedBy}
                options={[
                  { value: 'cr', label: 'cr' },
                  { value: 'dlg', label: 'dlg' },
                  { value: 'dly', label: 'dly' }
                ]}
              />
              <Text fontSize="18px" fontWeight="bold">
                Agregar a listas
              </Text>
              <HStack gap="8" flexWrap="wrap" justify="center">
                <AppCheckbox defaultChecked onCheckedChange={setAddToSv}>
                  <Box
                    as="span"
                    display="inline-flex"
                    rounded="lg"
                    overflow="hidden"
                    borderWidth="1px"
                    borderColor="border.subtle"
                  >
                    <Image src="/lospuentes.jpeg" width={52} height={54} alt="" />
                  </Box>
                </AppCheckbox>
                <AppCheckbox defaultChecked onCheckedChange={setAddToSf}>
                  <Box
                    as="span"
                    display="inline-flex"
                    rounded="lg"
                    overflow="hidden"
                    borderWidth="1px"
                    borderColor="border.subtle"
                  >
                    <Image src="/terralta.jpeg" width={52} height={54} alt="" />
                  </Box>
                </AppCheckbox>
              </HStack>
              <Text fontSize="18px" fontWeight="bold">
                Comentario
              </Text>
              <Textarea
                colorPalette="brand"
                maxWidth="400px"
                w="full"
                onChange={(e) => handleFeedback(e.target.value)}
              />
              <Button
                colorPalette="brand"
                disabled={!movieMetadata || !spanishTitle}
                loading={loadingUpload}
                my="5"
                width={{ base: 'full', sm: '180px' }}
                rounded="xl"
                onClick={handleUpload}
              >
                Agregar
              </Button>
              {errorUpload ? (
                <Text color="red.600" fontSize="xs" maxWidth="500px">
                  {errorUpload}
                </Text>
              ) : null}
            </VStack>
          ) : null}
        </VStack>
      </Panel>
    </Page>
  )
}
