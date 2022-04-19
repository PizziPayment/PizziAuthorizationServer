import { NextFunction, Request, Response } from 'express'
import { ApiFailure, ApiResponseWrapper } from '../../common/models/api.response.model'
import { TokensService } from 'pizzi-db'

export default async function validToken(req: Request, res: Response<ApiResponseWrapper<unknown>>, next: NextFunction): Promise<Response | void> {
  const authorization_type = req.headers.authorization?.split(' ')

  if (authorization_type && authorization_type.length === 2 && authorization_type[0] === 'Bearer') {
    const access_token = authorization_type[1]
    const maybe_token = await TokensService.getTokenFromValue(access_token)

    if (maybe_token.isOk()) {
      if (maybe_token.value.access_expires_at.getTime() > new Date().getTime()) {
        res.locals.token = maybe_token.value
        return next()
      }
      return res.status(401).send(new ApiFailure(req.url, 'Expired token'))
    }
    return res.status(401).send(new ApiFailure(req.url, 'Invalid token'))
  }
  return res.status(400).send(new ApiFailure(req.url, 'No token given'))
}
