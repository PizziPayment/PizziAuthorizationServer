import { NextFunction, Request, Response } from 'express'
import { TokensService } from 'pizzi-db'
import { ApiFailure, ApiResponseWrapper } from '../../common/models/api.response.model'
import RefreshRequestModel from '../models/refresh.request.model'

export async function validAccessToken(req: Request, res: Response<ApiResponseWrapper<unknown>>, next: NextFunction): Promise<void> {
  const authorization_type = req.headers.authorization?.split(' ')

  if (authorization_type && authorization_type.length === 2 && authorization_type[0] === 'Bearer') {
    const access_token = authorization_type[1]
    const maybe_token = await TokensService.getTokenFromAccessValue(access_token)

    if (maybe_token.isOk()) {
      if (maybe_token.value.access_expires_at.getTime() > new Date().getTime()) {
        res.locals.token = maybe_token.value
        next()
      } else {
        res.status(401).send(new ApiFailure(req.url, 'Expired access token'))
      }
    } else {
      res.status(401).send(new ApiFailure(req.url, 'Invalid access token'))
    }
  } else {
    res.status(400).send(new ApiFailure(req.url, 'No token given'))
  }
}

export async function validRefreshToken(
  req: Request<unknown, unknown, RefreshRequestModel>,
  res: Response<ApiResponseWrapper<unknown>>,
  next: NextFunction,
): Promise<void> {
  const maybe_token = await TokensService.getTokenFromRefreshValue(req.body.refresh_token)

  if (maybe_token.isOk()) {
    const token = maybe_token.value

    if (token.refresh_expires_at.getTime() > new Date().getTime()) {
      res.locals.token = maybe_token.value
      next()
    } else {
      res.status(401).send(new ApiFailure(req.url, 'Expired refresh token'))
    }
  } else {
    res.status(401).send(new ApiFailure(req.url, 'Invalid refresh token'))
  }
}
