export function maskIdentityNo(id: string | null | undefined): string | null {
  if (!id) return null
  if (id.length <= 5) return id
  const head = id.slice(0, 3)
  const tail = id.slice(-2)
  return `${head}${'*'.repeat(id.length - 5)}${tail}`
}
