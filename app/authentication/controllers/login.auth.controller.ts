import { Request, Response } from 'express'
import LoginRequestModel from '../models/login.request.model'
import TokenResponseModel from '../models/token.response.model'
import { ApiFailure } from '../../common/models/api.response.model'
import { ClientModel, CredentialsService, EncryptionService, TokensService } from 'pizzi-db'

export function loginControllerFor(
  owner_type: 'shop' | 'user' | 'admin',
): (req: Request<unknown, unknown, LoginRequestModel>, res: Response<unknown, Record<string, ClientModel>>) => Promise<Response> {
  const owner_type_id: 'shop_id' | 'user_id' | 'admin_id' = `${owner_type}_id`

  return async function login(req: Request<unknown, unknown, LoginRequestModel>, res: Response<unknown, Record<string, ClientModel>>): Promise<Response> {
    const maybe_credentials = await CredentialsService.getCredentialFromMailAndPassword(req.body.email, EncryptionService.encrypt(req.body.password))

    if (maybe_credentials.isOk() && maybe_credentials.value[owner_type_id] /* checks if the owner is valid */) {
      const token = await TokensService.generateTokenBetweenClientAndCredential(res.locals.client, maybe_credentials.value)

      if (token.isOk()) {
        return res.status(200).send(new TokenResponseModel(token.value.access_token, token.value.refresh_token, token.value.expires_at))
      } else {
        return res.status(500).send(new ApiFailure(req.url, 'Internal error'))
      }
    }
    return res.status(401).send(new ApiFailure(req.url, 'Invalid credentials'))
  }
}
