import { NextFunction, Request, Response } from 'express'
import { ApiFailure, ApiResponseWrapper } from '../../common/models/api.response.model'

export async function validBody(req: Request, res: Response<ApiResponseWrapper<unknown>>, next: NextFunction): Promise<void> {
  if (req.body) {
    next()
  } else {
    res.status(400).send(new ApiFailure(req.url, 'No body'))
  }
}