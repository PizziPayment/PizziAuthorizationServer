import { NextFunction, Request, Response } from 'express'
import LoginRequestModel from '../models/login.request.model'
import { ApiFailure, ApiResponseWrapper } from '../../common/models/api.response.model'

type LoginRequest = Request<unknown, unknown, LoginRequestModel>

function isValidEmail(email: string): boolean {
    const rule = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/

    return rule.test(email)
}

function isValidPassword(password: string): boolean {
    const rule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/

    return rule.test(password)
}

export default function validLoginRequest(req: LoginRequest, res: Response<ApiResponseWrapper<unknown>>, next: NextFunction): Response | void {
    const errors: Array<string> = []

    if (req.body) {
        if (!req.body.email || !isValidEmail(req.body.email)) {
            errors.push('invalid "email"')
        }
        if (!req.body.password || !isValidPassword(req.body.password)) {
            errors.push('invalid "password"')
        }

        if (errors.length === 0) {
            return next()
        } else {
            return res.status(400).send(new ApiFailure(req.url, errors.join(',')))
        }
    } else {
        return res.status(400).send(new ApiFailure(req.url, 'No login body'))
    }
}
