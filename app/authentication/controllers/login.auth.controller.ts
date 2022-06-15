import { Request, Response } from 'express'
import { ClientModel, CredentialsService, EncryptionService, TokensService } from 'pizzi-db'
import { ApiFailure } from '../../common/models/api.response.model'
import { GrantType, GrantTypes, PasswordGrantType, RefreshTokenGrantType } from '../models/grant_type'
import TokenResponseModel from '../models/token.response.model'

export default async function login(req: Request<unknown, unknown, GrantType>, res: Response<unknown, Record<string, ClientModel>>): Promise<void> {
  switch (req.body.grant_type) {
    case GrantTypes.password: {
      const body = req.body as PasswordGrantType
      const maybe_credentials = await CredentialsService.getCredentialFromEmailAndPassword(body.username, EncryptionService.encrypt(body.password))

      if (maybe_credentials.isOk()) {
        const maybe_token = await TokensService.generateTokenBetweenClientAndCredential(res.locals.client.id, maybe_credentials.value.id)

        if (maybe_token.isOk()) {
          res.status(200).send(new TokenResponseModel(maybe_token.value))
        } else {
          res.status(500).send(new ApiFailure(req.url, 'Internal error'))
        }
      } else {
        res.status(401).send(new ApiFailure(req.url, 'Invalid credentials'))
      }
      break
    }
    case GrantTypes.refresh_token: {
      const body = req.body as RefreshTokenGrantType
      const maybe_token = await TokensService.getTokenFromRefreshValue(body.refresh_token)

      if (maybe_token.isOk()) {
        const token = maybe_token.value

        if (token.refresh_expires_at.getTime() > new Date().getTime()) {
          const maybe_new_token = await TokensService.refreshToken(maybe_token.value)

          if (maybe_new_token.isOk()) {
            res.status(200).send(new TokenResponseModel(maybe_new_token.value))
          } else {
            res.status(500).send(new ApiFailure(req.url, 'Internal error'))
          }
        } else {
          res.status(401).send(new ApiFailure(req.url, 'Expired refresh token'))
        }
      } else {
        res.status(401).send(new ApiFailure(req.url, 'Invalid refresh token'))
      }
      break
    }
  }
}
