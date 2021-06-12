import { Request, Response } from 'express'
import AuthenticationService from '../services/authentication.service'
import TokenModel from '../services/models/token.model'

export default async function logout(req: Request, res: Response<unknown, Record<string, TokenModel>>): Promise<Response> {
    const token = res.locals.token

    if ((await AuthenticationService.deleteUserToken(token)).isOk()) {
        return res.status(200).send()
    } else {
        return res.status(500).send()
    }
}
