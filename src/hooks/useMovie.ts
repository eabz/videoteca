'use client'

import { useQuery } from '@tanstack/react-query'
import { readResponseError } from '@/lib/api-error'
import type { ListScope, Movie, MovieMetadata } from '@/types'

export async function addMovie(movie: Movie): Promise<void> {
  const req = await fetch('/api/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(movie)
  })

  if (!req.ok) {
    throw new Error(
      await readResponseError(req, 'No se pudo guardar la película. Revisá la información y volvé a intentar.')
    )
  }

  const response = (await req.json()) as { success?: boolean }

  if (!response.success) {
    throw new Error('No se pudo guardar la película. Revisá la información y volvé a intentar.')
  }
}

export async function fetchMovieMetadata(id: string): Promise<MovieMetadata> {
  const req = await fetch(`/api/metadata/${encodeURIComponent(id)}`)

  if (!req.ok) {
    throw new Error(await readResponseError(req, 'No se pudo cargar la información de la película.'))
  }

  return (await req.json()) as MovieMetadata
}

async function fetchMovie(id: string): Promise<Movie | undefined> {
  const req = await fetch(`/api/movie/${id}`)

  if (!req.ok) {
    throw new Error('unable to get movie')
  }

  return await req.json()
}

export function useMovie(id: string): {
  data: Movie | undefined
  loading: boolean
  error: boolean
} {
  const { isLoading, isError, data } = useQuery({
    queryFn: () => fetchMovie(id),
    queryKey: ['movie', id],
    enabled: Boolean(id)
  })

  return { data, error: isError, loading: isLoading }
}

export async function fetchList(scope: ListScope): Promise<Movie[]> {
  const req = await fetch(`/api/list/${scope}`)

  if (!req.ok) {
    throw new Error('unable to get movies list')
  }

  return await req.json()
}
