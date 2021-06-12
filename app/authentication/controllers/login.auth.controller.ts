import { Request, Response } from 'express'
import LoginRequestModel from '../models/login.request.model'
import ClientModel from '../services/models/client.model'
import AuthenticationService from '../services/authentication.service'
import TokenResponseModel from '../models/token.response.model'
import { ApiFailure } from '../../common/models/api.response.model'

export function loginControllerFor(
    owner_type: 'shop' | 'user' | 'admin'
): (req: Request<unknown, unknown, LoginRequestModel>, res: Response<unknown, Record<string, ClientModel>>) => Promise<Response> {
    const owner_type_id: 'shop_id' | 'user_id' | 'admin_id' = `${owner_type}_id`

    return async function login(req: Request<unknown, unknown, LoginRequestModel>, res: Response<unknown, Record<string, ClientModel>>): Promise<Response> {
        const maybe_owner = await AuthenticationService.getOwnerFromCredentials(req.body.email, AuthenticationService.crypt(req.body.password))

        if (maybe_owner.isOk() && maybe_owner.value[owner_type_id] /* check if the owner is valid */) {
            const token = await AuthenticationService.generateTokenBetweenClientAndCredential(res.locals.client, maybe_owner.value)

            if (token.isOk()) {
                return res.status(200).send(new TokenResponseModel(token.value.access_token, token.value.refresh_token, token.value.expires_at))
            } else {
                return res.status(500).send(new ApiFailure(req.url, 'Internal error'))
            }
        }
        return res.status(403).send(new ApiFailure(req.url, 'Invalid credentials'))
    }
}
