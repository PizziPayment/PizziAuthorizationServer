import { Request, Response } from 'express'
import ClientModel from '../services/models/client.model'
import LoginRequestModel from '../models/login.request.model'
import AuthenticationService from '../services/authentication.service'

export async function login(req: Request<unknown, unknown, LoginRequestModel>, res: Response<unknown, Record<string, ClientModel>>): Promise<Response> {
    const maybe_owner = await AuthenticationService.getOwnerFromCredentials(req.body.email, AuthenticationService.crypt(req.body.password))

    if (maybe_owner.isOk() && maybe_owner.value.shop_id /* check if the owner is a shop */) {
        return res.status(200).send()
    }
    return res.status(403).send({ message: 'pute' })
}
