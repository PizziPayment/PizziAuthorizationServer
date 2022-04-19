import { Request, Response } from 'express'
import { TokenModel, TokensService } from 'pizzi-db'
import { ApiFailure } from '../../common/models/api.response.model'
import RefreshRequestModel from '../models/refresh.request.model'
import TokenResponseModel from '../models/token.response.model'

export async function refresh(req: Request<unknown, RefreshRequestModel>, res: Response<unknown, Record<string, TokenModel>>): Promise<void> {
  const token = res.locals.token
  const maybe_new_token = await TokensService.refreshToken(token)

  if (maybe_new_token.isOk()) {
    res.status(200).send(new TokenResponseModel(maybe_new_token.value))
  } else {
    res.status(500).send(new ApiFailure(req.url, 'Internal error'))
  }
}
