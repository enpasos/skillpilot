/** Closed schema locations. V1 paths stay compatible; extension IDs cannot collide by basename. */
export const curriculumContractLocation = (id: string): { sourcePath: string; packagePath: string } => {
  const prefixes = [
    ['https://skillpilot.com/schemas/curriculum-package/v1/', 'contracts/curriculum-package/v1/', 'schemas/'],
    ['https://skillpilot.com/schemas/curriculum-package/v1.1/', 'contracts/curriculum-package/v1.1/', 'schemas/v1.1/'],
    ['https://skillpilot.com/schemas/assessment-completion/v1/', 'contracts/assessment-completion/v1/', 'schemas/assessment-completion/'],
  ] as const
  for (const [prefix, source, packaged] of prefixes) {
    if (!id.startsWith(prefix)) continue
    const name = id.slice(prefix.length)
    if (!/^[a-z0-9][a-z0-9.-]*\.schema\.json$/u.test(name)) throw new Error(`Unsupported curriculum schema ID: ${id}`)
    return { sourcePath: `${source}${name}`, packagePath: `${packaged}${name}` }
  }
  throw new Error(`Unknown curriculum schema trust namespace: ${id}`)
}
