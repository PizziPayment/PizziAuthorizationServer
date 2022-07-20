import { NextFunction, Request, Response } from 'express'
import { ApiFailure, ApiResponseWrapper } from '../../common/models/api.response.model'
import { GrantTypeModel, GrantTypes, PasswordGrantTypeModel, RefreshTokenGrantTypeModel } from '../models/grant_type'

export default async function validGrantType(
  req: Request<unknown, unknown, GrantTypeModel>,
  res: Response<ApiResponseWrapper<unknown>>,
  next: NextFunction,
): Promise<void> {
  let error = null

  switch (req.body.grant_type) {
    case GrantTypes.password: {
      error = PasswordGrantTypeModel.validator.test(req.body as PasswordGrantTypeModel)
      break
    }
    case GrantTypes.refresh_token: {
      error = RefreshTokenGrantTypeModel.validator.test(req.body as RefreshTokenGrantTypeModel)
      break
    }
    default:
      error = 'invalid or unsupported `grant_type`'
  }

  if (error === null) {
    next()
  } else {
    res.status(400).send(new ApiFailure(req.url, error))
  }
}
