import { z } from 'zod'

export const MOVIE_TYPES = ['movie', 'series'] as const
export const MODIFIED_VALUES = ['yes', 'no', 'unsuitable'] as const

export interface Movie {
  countries: string[]
  genres: string[]
  feedback?: string
  id: string
  languages: string[]
  modified: (typeof MODIFIED_VALUES)[number]
  original_title: string
  plot: string
  published_by: string
  release_date: number
  publish_date: number
  sf: boolean
  sv: boolean
  type: (typeof MOVIE_TYPES)[number]
  translated_title: string
  year: number
  poster: string
}

export const MovieValidator = z.object({
  countries: z.array(z.string().min(1)).min(1),
  genres: z.array(z.string().min(1)).min(1),
  feedback: z.string().optional(),
  id: z.string().regex(/^tt\d+$/, 'IMDB id must look like tt1234567'),
  languages: z.array(z.string().min(1)).min(1),
  modified: z.enum(MODIFIED_VALUES),
  original_title: z.string().min(1),
  plot: z.string().min(1),
  published_by: z.string().min(1),
  release_date: z.number().int(),
  publish_date: z.number().int(),
  sf: z.boolean(),
  sv: z.boolean(),
  type: z.enum(MOVIE_TYPES),
  translated_title: z.string().min(1),
  year: z.number().int(),
  poster: z.string().min(1)
})
