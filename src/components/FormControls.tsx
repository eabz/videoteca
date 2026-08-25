'use client'

import { Checkbox, HStack, RadioGroup } from '@chakra-ui/react'

export function RadioOptions({
  value,
  onChange,
  options
}: {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <RadioGroup.Root
      value={value}
      onValueChange={(details) => {
        if (details.value) onChange(details.value)
      }}
      colorPalette="brand"
    >
      <HStack gap="4" flexWrap="wrap">
        {options.map((option) => (
          <RadioGroup.Item key={option.value} value={option.value}>
            <RadioGroup.ItemHiddenInput />
            <RadioGroup.ItemIndicator />
            <RadioGroup.ItemText>{option.label}</RadioGroup.ItemText>
          </RadioGroup.Item>
        ))}
      </HStack>
    </RadioGroup.Root>
  )
}

export function AppCheckbox({
  checked,
  defaultChecked,
  onCheckedChange,
  children
}: {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange: (checked: boolean) => void
  children: React.ReactNode
}) {
  return (
    <Checkbox.Root
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={(details) => onCheckedChange(Boolean(details.checked))}
      colorPalette="brand"
    >
      <Checkbox.HiddenInput />
      <Checkbox.Control>
        <Checkbox.Indicator />
      </Checkbox.Control>
      <Checkbox.Label>{children}</Checkbox.Label>
    </Checkbox.Root>
  )
}
