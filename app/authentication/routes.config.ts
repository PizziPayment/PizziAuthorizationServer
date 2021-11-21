import { Application } from 'express'
import { loginControllerFor } from './controllers/login.auth.controller'
import validBasicAuth from './middlewares/basic_auth.validation.middleware'
import validLoginRequest from './middlewares/login.request.validation.middleware'
import logout from './controllers/logout.auth.controller'
import validToken from './middlewares/token.validation.middleware'

const baseUrl = '/auth'
const userBaseUrl = `${baseUrl}/user`
const shopBaseUrl = `${baseUrl}/shop`

export default function AuthenticationRouter(app: Application): void {
  app.post(`${userBaseUrl}/login`, [validLoginRequest, validBasicAuth, loginControllerFor('user')])
  app.post(`${shopBaseUrl}/login`, [validLoginRequest, validBasicAuth, loginControllerFor('shop')])
  app.post(`${baseUrl}/logout`, [validToken, logout])
}
