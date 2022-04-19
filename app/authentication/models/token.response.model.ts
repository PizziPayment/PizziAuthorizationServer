import { TokenModel } from 'pizzi-db'

export default class TokenResponseModel {
  constructor(model: TokenModel) {
    this.access_token = model.access_token
    this.refresh_token = model.refresh_token
    this.access_token_expires_at = model.access_expires_at
    this.refresh_token_expires_at = model.refresh_expires_at
  }

  access_token: string
  refresh_token: string
  access_token_expires_at: Date
  refresh_token_expires_at: Date
}
