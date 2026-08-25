'use client'

import { Box, Button, Heading, HStack, Input, Spinner, Text, Textarea, VStack } from '@chakra-ui/react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { AppCheckbox, RadioOptions } from '@/components/FormControls'
import { ImdbLink } from '@/components/ImdbLink'
import { Page } from '@/components/Page'
import { Panel } from '@/components/Panel'
import { Poster } from '@/components/Poster'
import { addMovie, useMovie } from '@/hooks'
import type { Movie } from '@/types'
import { unixTimestampToDateString } from '@/utils'

const modifiedToRadio = (value: Movie['modified']) => {
  if (value === 'yes') return '1'
  if (value === 'unsuitable') return '3'
  return '2'
}

const radioToModified = (value: string): Movie['modified'] => {
  if (value === '1') return 'yes'
  if (value === '3') return 'unsuitable'
  return 'no'
}

export default function Edit() {
  const session = useSession()
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const movieId = params.id
  const { data: movie, error, loading } = useMovie(movieId)

  const [spanishTitle, setSpanishTitle] = useState<string | undefined>(undefined)
  const [addToSv, setAddToSv] = useState(false)
  const [addToSf, setAddToSf] = useState(false)
  const [feedback, setFeedback] = useState<string | undefined>(undefined)
  const [modified, setModified] = useState<Movie['modified']>('no')
  const [addedBy, setAddedBy] = useState('cr')
  const [loadingUpload, setLoadingUpload] = useState(false)
  const [errorUpload, setErrorUpload] = useState<string | null>(null)

  useEffect(() => {
    if (session.status === 'loading') return

    if (session.status === 'unauthenticated' || !session.data?.admin) {
      router.replace('/')
    }
  }, [session, router])

  useEffect(() => {
    if (!movie) return

    setSpanishTitle(movie.translated_title)
    setAddToSv(movie.sv)
    setAddToSf(movie.sf)
    setFeedback(movie.feedback)
    setModified(movie.modified)
    setAddedBy(movie.published_by)
  }, [movie])

  const handleSpanishTitle = (title: string) => {
    setSpanishTitle(title === '' ? undefined : title)
  }

  const handleFeedback = (value: string) => {
    setFeedback(value === '' ? undefined : value)
  }

  const handleUpload = async () => {
    if (!movie || !spanishTitle) return

    setLoadingUpload(true)
    setErrorUpload(null)

    const newMovie: Movie = {
      countries: movie.countries,
      genres: movie.genres,
      feedback,
      id: movie.id,
      languages: movie.languages,
      modified,
      published_by: addedBy,
      release_date: movie.release_date,
      original_title: movie.original_title,
      plot: movie.plot,
      publish_date: movie.publish_date,
      sf: addToSf,
      sv: addToSv,
      type: movie.type,
      translated_title: spanishTitle,
      year: movie.year,
      poster: movie.poster
    }

    try {
      await addMovie(newMovie)
      router.replace('/')
    } catch (err) {
      setErrorUpload(
        err instanceof Error ? err.message : 'No se pudo guardar la película. Revisá la información y volvé a intentar.'
      )
    } finally {
      setLoadingUpload(false)
    }
  }

  return (
    <Page title="Editar película" eyebrow="Catálogo">
      {loading ? (
        <HStack w="full" justifyContent="center" minH="40vh">
          <Spinner color="brand.500" size="xl" />
        </HStack>
      ) : null}

      {error ? (
        <VStack align="flex-start" gap="2" color="fg.muted">
          <Heading size="md">No existe</Heading>
          <Text>La película que quieres editar no se encuentra en la base de datos.</Text>
          <Text>Revisa que el ID sea correcto y vuelve a intentar.</Text>
        </VStack>
      ) : null}

      {movie ? (
        <Panel maxW="640px">
          <VStack py="2" gap="3" textAlign="center" align="center" w="full">
            <Text fontSize="18px" fontWeight="bold">
              Título
            </Text>
            <Text>{movie.original_title}</Text>
            <ImdbLink id={movie.id} label="Ver en IMDB" />
            <Text fontSize="18px" fontWeight="bold">
              Póster
            </Text>
            <Poster
              id={movie.id}
              src={movie.poster}
              alt={`Póster de ${movie.original_title}`}
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
              defaultValue={spanishTitle}
              onChange={(e) => handleSpanishTitle(e.target.value)}
            />
            <Text fontSize="18px" fontWeight="bold">
              Año de lanzamiento
            </Text>
            <Text>{movie.year}</Text>
            <Text fontSize="18px" fontWeight="bold">
              País
            </Text>
            <Text>{movie.countries.join(', ')}</Text>
            <Text fontSize="18px" fontWeight="bold">
              Género
            </Text>
            <Text>{movie.genres.join(', ')}</Text>
            <Text fontSize="18px" fontWeight="bold">
              Idiomas
            </Text>
            <Text>{movie.languages.join(', ')}</Text>
            <Text fontSize="18px" fontWeight="bold">
              Trama
            </Text>
            <Text>{movie.plot}</Text>
            <Text fontSize="18px" fontWeight="bold">
              Fecha de Publicación
            </Text>
            <Text>{unixTimestampToDateString(movie.publish_date)}</Text>
            <Text fontSize="18px" fontWeight="bold">
              Tipo
            </Text>
            <Text>{movie.type === 'series' ? 'Serie' : movie.type === 'movie' ? 'Película' : movie.type}</Text>
            <Text fontSize="18px" fontWeight="bold">
              Editada
            </Text>
            <RadioOptions
              value={modifiedToRadio(modified)}
              onChange={(value) => setModified(radioToModified(value))}
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
              <AppCheckbox checked={addToSv} onCheckedChange={setAddToSv}>
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
              <AppCheckbox checked={addToSf} onCheckedChange={setAddToSf}>
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
              defaultValue={feedback}
              onChange={(e) => handleFeedback(e.target.value)}
            />
            <Button
              colorPalette="brand"
              my="5"
              width={{ base: 'full', sm: '180px' }}
              rounded="xl"
              onClick={handleUpload}
              disabled={!spanishTitle || !movie}
              loading={loadingUpload}
            >
              Actualizar
            </Button>
            {errorUpload ? (
              <Text color="red.600" fontSize="xs" maxWidth="500px">
                {errorUpload}
              </Text>
            ) : null}
          </VStack>
        </Panel>
      ) : null}
    </Page>
  )
}
