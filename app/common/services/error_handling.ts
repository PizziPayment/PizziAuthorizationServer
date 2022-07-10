export function withFieldValidator<T>(f: (value: T) => boolean): (key: string, value: T) => null | string {
  return (key, value) => {
    if (f(value)) {
      return null
    } else {
      return `Invalid field ${key}`
    }
  }
}
