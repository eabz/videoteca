'use client'

import { useQuery } from '@tanstack/react-query'
import type { ListScope, Movie } from '@/types'
import { fetchList } from './useMovie'

export function useList(scope: ListScope): {
  data: Movie[] | undefined
  loading: boolean
  error: boolean
} {
  const { isLoading, isError, data } = useQuery({
    queryFn: () => fetchList(scope),
    queryKey: ['list', scope]
  })

  return { data, error: isError, loading: isLoading }
}
