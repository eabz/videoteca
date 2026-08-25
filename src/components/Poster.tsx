'use client'

import { Box, Dialog, HStack, Text } from '@chakra-ui/react'
import { useSession } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ImdbLink } from '@/components/ImdbLink'

function posterUrl(id?: string, src?: string | null) {
  if (id && /^tt\d+$/.test(id)) return `/api/poster/${id}`
  if (src && src !== 'N/A' && !src.includes('m.media-amazon.com')) return src
  return null
}

function previewPosition(rect: DOMRect) {
  const width = 240
  const height = 360
  const gap = 12
  let left = rect.right + gap
  let top = rect.top + rect.height / 2 - height / 2

  if (left + width > window.innerWidth - gap) left = rect.left - width - gap
  if (left < gap) left = gap
  if (top < gap) top = gap
  if (top + height > window.innerHeight - gap) top = window.innerHeight - height - gap

  return { left, top, width, height }
}

export function Poster({
  id,
  src,
  alt,
  width = 140,
  height = 210
}: {
  id?: string
  src?: string | null
  alt: string
  width?: number
  height?: number
}) {
  const session = useSession()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(false)
  const [preview, setPreview] = useState<{ left: number; top: number; width: number; height: number } | null>(null)
  const url = posterUrl(id, src)
  const ready = session.status !== 'loading'
  const failed = Boolean(url && failedUrl === url)

  useEffect(() => {
    if (!hover || open || !triggerRef.current) {
      setPreview(null)
      return
    }

    setPreview(previewPosition(triggerRef.current.getBoundingClientRect()))
  }, [hover, open])

  if (!url || failed || !ready) {
    return (
      <Box display="inline-flex">
        <Box
          w={`${width}px`}
          h={`${height}px`}
          rounded="lg"
          bg="bg.muted"
          display="flex"
          alignItems="center"
          justifyContent="center"
          px="2"
          flexShrink={0}
        >
          <Text fontSize="xs" color="fg.muted" textAlign="center">
            {ready && (!url || failed) ? 'Sin póster' : ''}
          </Text>
        </Box>
      </Box>
    )
  }

  return (
    <>
      <Box display="inline-flex">
        <Dialog.Root open={open} onOpenChange={(details) => setOpen(details.open)} placement="center" size="sm">
          <Dialog.Trigger asChild>
            <button
              ref={triggerRef}
              type="button"
              aria-label={`Ampliar ${alt}`}
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              onClick={() => setHover(false)}
              style={{
                width,
                height,
                padding: 0,
                border: 0,
                background: 'transparent',
                cursor: 'zoom-in',
                flexShrink: 0,
                display: 'block'
              }}
            >
              <Box
                w={`${width}px`}
                h={`${height}px`}
                rounded="lg"
                overflow="hidden"
                bg="bg.muted"
                shadow="sm"
                borderWidth="1px"
                borderColor="border.subtle"
                _hover={{ shadow: 'md', borderColor: 'brand.200' }}
              >
                {/* biome-ignore lint/performance/noImgElement: OMDB Amazon URLs 404 through next/image; we proxy posters instead */}
                <img
                  src={url}
                  alt={alt}
                  width={width}
                  height={height}
                  onError={() => setFailedUrl(url)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </Box>
            </button>
          </Dialog.Trigger>
          <Dialog.Backdrop bg="blackAlpha.700" />
          <Dialog.Positioner>
            <Dialog.Content bg="transparent" shadow="none" p="0" maxW="min(90vw, 420px)" overflow="hidden">
              <Dialog.Title position="absolute" w="1px" h="1px" overflow="hidden" p="0" border="0">
                {alt}
              </Dialog.Title>
              <Box rounded="xl" overflow="hidden" shadow="xl" bg="bg.muted">
                {/* biome-ignore lint/performance/noImgElement: lightbox uses the same auth-gated poster proxy */}
                <img
                  src={url}
                  alt={alt}
                  style={{ width: '100%', height: 'auto', maxHeight: '80vh', objectFit: 'contain', display: 'block' }}
                />
              </Box>
              {id ? (
                <HStack justify="center" mt="3">
                  <Box bg="bg.surface" rounded="full" px="3" py="1.5">
                    <ImdbLink id={id} label="Ver en IMDB" />
                  </Box>
                </HStack>
              ) : null}
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      </Box>

      {hover && !open && preview && typeof document !== 'undefined'
        ? createPortal(
            <Box
              position="fixed"
              left={`${preview.left}px`}
              top={`${preview.top}px`}
              w={`${preview.width}px`}
              h={`${preview.height}px`}
              zIndex="tooltip"
              pointerEvents="none"
              rounded="xl"
              overflow="hidden"
              shadow="xl"
              borderWidth="1px"
              borderColor="border.subtle"
              bg="bg.muted"
              display={{ base: 'none', md: 'block' }}
            >
              {/* biome-ignore lint/performance/noImgElement: hover preview uses the same poster proxy */}
              <img
                src={url}
                alt=""
                width={preview.width}
                height={preview.height}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </Box>,
            document.body
          )
        : null}
    </>
  )
}
