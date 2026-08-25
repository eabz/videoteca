'use client'

import { Box, Table as ChakraTable, Flex, IconButton, Input, Stack, Text } from '@chakra-ui/react'
import {
  type ColumnDef,
  columnSizingFeature,
  createPaginatedRowModel,
  createSortedRowModel,
  flexRender,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  tableFeatures,
  useTable
} from '@tanstack/react-table'
import { matchSorter } from 'match-sorter'
import { type ReactElement, type ReactNode, useEffect, useState } from 'react'
import { ArrowDownIcon, ArrowUpIcon, ChevronLeftIcon, ChevronRightIcon } from '@/components/Icons'
import { Panel } from '@/components/Panel'
import type { Movie } from '@/types'

export const movieTableFeatures = tableFeatures({
  columnSizingFeature,
  rowPaginationFeature,
  rowSortingFeature,
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic
  }
})

export type MovieTableFeatures = typeof movieTableFeatures
export type MovieColumnDef = ColumnDef<MovieTableFeatures, Movie, unknown>

interface ITableProps {
  columns: MovieColumnDef[]
  data: Movie[]
  renderMobileRow?: (movie: Movie) => ReactNode
}

const sortedIcons: Record<string, ReactElement> = {
  asc: <ArrowUpIcon height="3" width="3" />,
  desc: <ArrowDownIcon height="3" width="3" />
}

export function Table({ columns, data, renderMobileRow }: ITableProps) {
  const [tableData, setTableData] = useState(data)
  const [filter, setFilter] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!filter) {
      setTableData(data)
    } else {
      setTableData(
        matchSorter(data, filter, {
          keys: ['original_title', 'translated_title', 'year']
        })
      )
    }
  }, [data, filter])

  const table = useTable({
    features: movieTableFeatures,
    columns,
    data: tableData,
    getRowId: (row) => row.id,
    initialState: {
      pagination: { pageIndex: 0, pageSize: 8 }
    }
  })

  const page = table.state.pagination.pageIndex + 1
  const total = table.getPageCount()
  const from = tableData.length === 0 ? 0 : table.state.pagination.pageIndex * table.state.pagination.pageSize + 1
  const to = Math.min(tableData.length, page * table.state.pagination.pageSize)
  const paginationLabel =
    tableData.length === 0 ? 'Sin resultados' : `${from}–${to} de ${tableData.length}${filter ? ' coincidencias' : ''}`

  const rows = table.getRowModel().rows

  return (
    <Panel p="0" overflow="hidden">
      <Stack gap="0">
        <Flex
          justifyContent="space-between"
          align={{ base: 'stretch', sm: 'center' }}
          gap="3"
          px={{ base: '3', md: '5' }}
          py="4"
          borderBottomWidth="1px"
          borderColor="border.subtle"
          direction={{ base: 'column', sm: 'row' }}
        >
          <Input
            maxWidth={{ base: 'full', sm: '320px' }}
            bg="bg.canvas"
            borderColor="border.subtle"
            rounded="xl"
            placeholder="Buscar título o año"
            type="search"
            onChange={(input) => setFilter(input.target.value === '' ? undefined : input.target.value)}
          />
          <Text fontSize="sm" color="fg.muted">
            {data.length} {data.length === 1 ? 'título' : 'títulos'}
          </Text>
        </Flex>

        {renderMobileRow ? (
          <Stack gap="3" p="3" display={{ base: 'flex', md: 'none' }}>
            {rows.length === 0 ? (
              <Box py="10" textAlign="center" color="fg.muted" fontSize="sm">
                No hay películas que coincidan con la búsqueda.
              </Box>
            ) : (
              rows.map((row) => <Box key={row.id}>{renderMobileRow(row.original)}</Box>)
            )}
          </Stack>
        ) : null}

        <ChakraTable.ScrollArea display={{ base: renderMobileRow ? 'none' : 'block', md: 'block' }}>
          <ChakraTable.Root size="md" variant="line" striped interactive colorPalette="brand">
            <ChakraTable.Header>
              {table.getHeaderGroups().map((headerGroup) => (
                <ChakraTable.Row key={headerGroup.id} bg="bg.muted">
                  {headerGroup.headers.map((header) => (
                    <ChakraTable.ColumnHeader
                      key={header.id}
                      colSpan={header.colSpan}
                      w={header.getSize()}
                      color="fg.muted"
                      fontSize="11px"
                      fontWeight="semibold"
                      letterSpacing="0.1em"
                      textTransform="uppercase"
                      whiteSpace="nowrap"
                      cursor={header.column.getCanSort() ? 'pointer' : 'default'}
                      onClick={header.column.getToggleSortingHandler()}
                      _hover={header.column.getCanSort() ? { color: 'brand.700' } : undefined}
                    >
                      {header.isPlaceholder ? null : (
                        <Flex align="center" gap="1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() ? (
                            <Text as="span" color="brand.500">
                              {sortedIcons[header.column.getIsSorted() || '']}
                            </Text>
                          ) : null}
                        </Flex>
                      )}
                    </ChakraTable.ColumnHeader>
                  ))}
                </ChakraTable.Row>
              ))}
            </ChakraTable.Header>
            <ChakraTable.Body>
              {rows.length === 0 ? (
                <ChakraTable.Row>
                  <ChakraTable.Cell colSpan={columns.length}>
                    <Box py="16" textAlign="center" color="fg.muted">
                      No hay películas que coincidan con la búsqueda.
                    </Box>
                  </ChakraTable.Cell>
                </ChakraTable.Row>
              ) : (
                rows.map((row) => (
                  <ChakraTable.Row key={row.id}>
                    {row.getAllCells().map((cell) => (
                      <ChakraTable.Cell key={cell.id} w={cell.column.getSize()} verticalAlign="middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </ChakraTable.Cell>
                    ))}
                  </ChakraTable.Row>
                ))
              )}
            </ChakraTable.Body>
          </ChakraTable.Root>
        </ChakraTable.ScrollArea>

        <Flex
          alignItems="center"
          justifyContent="space-between"
          px={{ base: '3', md: '5' }}
          py="3"
          borderTopWidth="1px"
          borderColor="border.subtle"
          bg="bg.canvas"
          gap="3"
        >
          <IconButton
            aria-label="Página anterior"
            variant="outline"
            colorPalette="brand"
            disabled={!table.getCanPreviousPage()}
            rounded="full"
            size="sm"
            minW="40px"
            onClick={() => table.previousPage()}
          >
            <ChevronLeftIcon height="4" width="4" />
          </IconButton>

          <Text fontSize={{ base: 'xs', sm: 'sm' }} color="fg.muted" textAlign="center">
            {paginationLabel}
            {total > 1 ? ` · pág. ${page}` : ''}
          </Text>
          <IconButton
            aria-label="Página siguiente"
            variant="outline"
            colorPalette="brand"
            disabled={!table.getCanNextPage()}
            rounded="full"
            size="sm"
            minW="40px"
            onClick={() => table.nextPage()}
          >
            <ChevronRightIcon height="4" width="4" />
          </IconButton>
        </Flex>
      </Stack>
    </Panel>
  )
}
