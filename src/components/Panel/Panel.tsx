import { Box, type BoxProps } from '@chakra-ui/react'

interface IPanelProps extends BoxProps {
  children: React.ReactNode
}

export function Panel({ p = 5, width = 'full', children, ...props }: IPanelProps) {
  return (
    <Box
      bg="bg.surface"
      rounded="2xl"
      borderWidth="1px"
      borderColor="border.subtle"
      shadow="sm"
      mx="auto"
      p={p}
      width={width}
      {...props}
    >
      {children}
    </Box>
  )
}
