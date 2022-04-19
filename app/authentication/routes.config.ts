import { Application } from 'express'
import { loginControllerFor } from './controllers/login.auth.controller'
import logout from './controllers/logout.auth.controller'
import { refresh } from './controllers/refresh.auth.controller'
import validBasicAuth from './middlewares/basic_auth.validation.middleware'
import validLoginRequest from './middlewares/login.request.validation.middleware'
import validRefreshRequest from './middlewares/refresh.request.validation'
import { validAccessToken, validRefreshToken } from './middlewares/token.validation.middleware'

const userBaseUrl = `/user`
const shopBaseUrl = `/shop`

export default function AuthenticationRouter(app: Application): void {
  app.post(`${userBaseUrl}/login`, [validLoginRequest, validBasicAuth, loginControllerFor('user')])
  app.post(`${shopBaseUrl}/login`, [validLoginRequest, validBasicAuth, loginControllerFor('shop')])
  app.post(`/refresh`, [validBasicAuth, validRefreshRequest, validRefreshToken, refresh])
  app.post(`/logout`, [validAccessToken, logout])
}
