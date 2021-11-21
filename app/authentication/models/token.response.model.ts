export default class TokenResponseModel {
  constructor(access_token: string, refresh_token: string, access_token_expires_at: Date) {
    this.access_token = access_token
    this.refresh_token = refresh_token
    this.access_token_expires_at = access_token_expires_at
  }

  access_token: string
  refresh_token: string
  access_token_expires_at: Date
}
