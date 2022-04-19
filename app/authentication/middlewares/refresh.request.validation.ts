import { NextFunction, Request, Response } from 'express'
import { ApiFailure, ApiResponseWrapper } from '../../common/models/api.response.model'
import RefreshRequestModel from '../models/refresh.request.model'

export default async function validRefreshRequest(
  req: Request<unknown, unknown, RefreshRequestModel>,
  res: Response<ApiResponseWrapper<unknown>>,
  next: NextFunction,
): Promise<Response | void> {
  if (req.body !== undefined) {
    if (req.body.refresh_token !== undefined) {
      return next()
    } else {
      return res.status(400).send(new ApiFailure(req.url, 'Invalid no "refresh_token" field given'))
    }
  } else {
    return res.status(400).send(new ApiFailure(req.url, 'No login body'))
  }
}
