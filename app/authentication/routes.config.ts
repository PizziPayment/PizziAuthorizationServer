import { Application } from 'express'
import { loginControllerFor } from './controllers/login.auth.controller'
import logout from './controllers/logout.auth.controller'
import { refresh } from './controllers/refresh.auth.controller'
import validBasicAuth from './middlewares/basic_auth.validation.middleware'
import validLoginRequest from './middlewares/login.request.validation.middleware'
import validRefreshRequest from './middlewares/refresh.request.validation'
import { validAccessToken, validRefreshToken } from './middlewares/token.validation.middleware'
import { validBody } from '../common/middlewares/body.validation'

const userBaseUrl = `/user`
const shopBaseUrl = `/shop`

export default function AuthenticationRouter(app: Application): void {
  app.post(`${userBaseUrl}/login`, [validBasicAuth, validBody, validLoginRequest, loginControllerFor('user')])
  app.post(`${shopBaseUrl}/login`, [validBasicAuth, validBody, validLoginRequest, loginControllerFor('shop')])
  app.post(`/refresh`, [validBasicAuth, validBody, validRefreshRequest, validRefreshToken, refresh])
  app.post(`/logout`, [validAccessToken, logout])
}
