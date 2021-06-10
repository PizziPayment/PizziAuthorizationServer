import { Application } from 'express'
import { login as userLogin } from './controllers/user.auth.controller'
import { login as shopLogin } from './controllers/shop.auth.controller'
import validLoginRequest from './middlewares/login.request.validation.middleware'
import validBasicAuth from './middlewares/basic_auth.validation.middleware'

const baseUrl = '/auth'
const userBaseUrl = `${baseUrl}/user`
const shopBaseUrl = `${baseUrl}/shop`

export default function AuthenticationRouter(app: Application): void {
    app.post(`${userBaseUrl}/login`, [validLoginRequest, validBasicAuth, userLogin])
    app.post(`${shopBaseUrl}/login`, [validLoginRequest, validBasicAuth, shopLogin])
    app.post(`${baseUrl}/logout`, [])
}
