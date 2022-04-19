import { NextFunction, Request, Response } from 'express'
import { ApiFailure, ApiResponseWrapper } from '../../common/models/api.response.model'
import RefreshRequestModel from '../models/refresh.request.model'

export default async function validRefreshRequest(
  req: Request<unknown, unknown, RefreshRequestModel>,
  res: Response<ApiResponseWrapper<unknown>>,
  next: NextFunction,
): Promise<void> {
  if (req.body.refresh_token !== undefined) {
    next()
  } else {
    res.status(400).send(new ApiFailure(req.url, 'Invalid no "refresh_token" field given'))
  }
}
