export const LIST_SCOPES = ['lospuentes', 'terralta'] as const

export type ListScope = (typeof LIST_SCOPES)[number]

export const USER_SCOPES = [...LIST_SCOPES, 'admin'] as const

export type UserScope = (typeof USER_SCOPES)[number]

export const isListScope = (value: string): value is ListScope => {
  return LIST_SCOPES.includes(value as ListScope)
}

export const canAccessList = (userScope: string | undefined, listScope: ListScope): boolean => {
  return userScope === 'admin' || userScope === listScope
}
