type InterpolationValue = string | number

export const interpolateTemplate = (
  template: string,
  values: Record<string, InterpolationValue> | InterpolationValue[],
): string => {
  if (Array.isArray(values)) {
    return template.replace(/\{(\d+)\}/g, (match, indexText) => {
      const value = values[Number(indexText)]
      return value === undefined ? match : String(value)
    })
  }

  return template.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (match, key) => {
    const value = values[key]
    return value === undefined ? match : String(value)
  })
}
