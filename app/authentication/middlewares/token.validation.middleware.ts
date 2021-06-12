import { NextFunction, Request, Response } from 'express'
import { ApiResponseWrapper } from '../../common/models/api.response.model'
import AuthenticationService from '../services/authentication.service'

export default async function validToken(req: Request, res: Response<ApiResponseWrapper<unknown>>, next: NextFunction): Promise<Response | void> {
    const authorization_type = req.headers.authorization?.split(' ')

    if (authorization_type && authorization_type.length === 2 && authorization_type[0] === 'Bearer') {
        const access_token = authorization_type[1]
        const maybe_token = await AuthenticationService.getTokenFromValue(access_token)

        if (maybe_token.isOk()) {
            res.locals.token = maybe_token.value
            return next()
        } else {
            return res.status(401).send()
        }
    }
    return res.status(403).send()
}
