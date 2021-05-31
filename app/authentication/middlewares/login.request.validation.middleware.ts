import { NextFunction, Request, Response } from 'express'
import LoginRequestModel from '../models/login.request.model'
import { ApiFailure, ApiResponseWrapper } from '../../common/models/api.response.model'

type LoginRequest = Request<unknown, unknown, LoginRequestModel>

export default function validLoginRequest(req: LoginRequest, res: Response<ApiResponseWrapper<unknown>>, next: NextFunction): void {
    const errors: Array<string> = []

    if (req.body) {
        if (!req.body.email) {
            errors.push('invalid value for "email"')
        }
        if (!req.body.password) {
            errors.push('invalid value for "password"')
        }

        if (errors.length === 0) {
            next()
        } else {
            res.status(405).send(new ApiFailure(req.url, errors.join(',')))
        }
    } else {
        res.status(400).send(new ApiFailure(req.url, 'No login body'))
    }
}
