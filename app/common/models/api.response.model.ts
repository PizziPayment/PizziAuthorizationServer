export type ApiResponseWrapper<T> = T | ApiFailure

export class ApiFailure {
  constructor(source: string, message: string) {
    this.source = source
    this.message = message
  }

  source: string
  message: string
}
