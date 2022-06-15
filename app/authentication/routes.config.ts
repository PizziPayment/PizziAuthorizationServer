import { Application } from 'express'
import { validBody } from '../common/middlewares/body.validation'
import login from './controllers/login.auth.controller'
import logout from './controllers/logout.auth.controller'
import validBasicAuth from './middlewares/basic_auth.validation.middleware'
import validGrantType from './middlewares/grant_type.request.validation'
import { validAccessToken } from './middlewares/token.validation.middleware'

export default function AuthenticationRouter(app: Application): void {
  app.post(`/login`, [validBasicAuth, validBody, validGrantType, login])
  app.post(`/logout`, [validAccessToken, logout])
}
