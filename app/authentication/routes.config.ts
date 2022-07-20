import { Application } from 'express'
import { validRequestBodyFor } from '../common/middlewares/request.validation.middleware'
import login from './controllers/login.auth.controller'
import logout from './controllers/logout.auth.controller'
import validBasicAuth from './middlewares/basic_auth.validation.middleware'
import validGrantType from './middlewares/grant_type.request.validation'
import { validAccessToken } from './middlewares/token.validation.middleware'
import { GrantTypeModel } from './models/grant_type'

export default function AuthenticationRouter(app: Application): void {
  app.post(`/login`, [validBasicAuth, validRequestBodyFor(GrantTypeModel.validator), validGrantType, login])
  app.post(`/logout`, [validAccessToken, logout])
}
