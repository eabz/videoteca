import type { SVGProps } from 'react'

export type IconProps = SVGProps<SVGSVGElement> & {
  boxSize?: string | number
}

export function SvgIcon({
  viewBox,
  boxSize,
  width,
  height,
  children,
  ...props
}: IconProps & { viewBox: string; children: React.ReactNode }) {
  const size = boxSize ?? width ?? height ?? '1em'
  const labeled = typeof props['aria-label'] === 'string' || typeof props['aria-labelledby'] === 'string'

  return (
    // Decorative icons live inside labeled buttons; a <title> would show a native tooltip on hover.
    // biome-ignore lint/a11y/noSvgWithoutTitle: parent controls the accessible name
    <svg
      fill="currentColor"
      viewBox={viewBox}
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
      {...props}
      aria-hidden={labeled ? undefined : true}
      role={labeled ? 'img' : undefined}
    >
      {children}
    </svg>
  )
}
