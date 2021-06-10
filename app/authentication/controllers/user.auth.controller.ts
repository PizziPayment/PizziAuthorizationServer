import { Request, Response } from 'express'
import AuthenticationService from '../services/authentication.service'
import LoginRequestModel from '../models/login.request.model'
import ClientModel from '../services/models/client.model'

export async function login(req: Request<unknown, unknown, LoginRequestModel>, res: Response<unknown, Record<string, ClientModel>>): Promise<Response> {
    const maybe_owner = await AuthenticationService.getOwnerFromCredentials(req.body.email, AuthenticationService.crypt(req.body.password))

    if (maybe_owner.isOk() && maybe_owner.value.user_id /* check if the owner is a user */) {
        return res.status(200).send()
    }
    return res.status(403).send({ message: 'pute' })
}
