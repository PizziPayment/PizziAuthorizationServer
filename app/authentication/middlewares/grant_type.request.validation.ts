import { NextFunction, Request, Response } from 'express'
import { ApiFailure, ApiResponseWrapper } from '../../common/models/api.response.model'
import { GrantType, GrantTypes, PasswordGrantType, RefreshTokenGrantType } from '../models/grant_type'

export default async function validGrantType(
  req: Request<unknown, unknown, GrantType>,
  res: Response<ApiResponseWrapper<unknown>>,
  next: NextFunction,
): Promise<void> {
  const errors: Array<string> = []

  switch (req.body.grant_type) {
    case GrantTypes.password: {
      const body = req.body as PasswordGrantType

      if (typeof body.username !== 'string') {
        errors.push('invalid username field')
      }
      if (typeof body.password !== 'string') {
        errors.push('invalid password field')
      }
      break
    }
    case GrantTypes.refresh_token: {
      const body = req.body as RefreshTokenGrantType

      if (typeof body.refresh_token !== 'string') {
        errors.push('invalid refresh_token field')
      }
      break
    }
    default:
      errors.push('invalid or unsupported `grant_type`')
  }

  if (errors.length === 0) {
    next()
  } else {
    res.status(400).send(new ApiFailure(req.url, errors.join(',')))
  }
}
