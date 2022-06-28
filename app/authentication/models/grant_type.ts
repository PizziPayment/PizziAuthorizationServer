export enum GrantTypes {
  password = 'password',
  refresh_token = 'refresh_token',
}

export class GrantType {
  grant_type: GrantTypes
}

export class PasswordGrantType extends GrantType {
  username: string
  password: string
}

export class RefreshTokenGrantType extends GrantType {
  refresh_token: string
}
