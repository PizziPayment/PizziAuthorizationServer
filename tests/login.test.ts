import { ClientModel, ClientsService, createExpirationDate, CredentialModel, rewriteTables, TokensService } from 'pizzi-db'
import * as request from 'supertest'
import { App } from '../app/api'
import { GrantTypes, PasswordGrantTypeModel, RefreshTokenGrantTypeModel } from '../app/authentication/models/grant_type'
import TokenResponseModel from '../app/authentication/models/token.response.model'
import { client, client_header, user, shop } from './common/models'
import { configIntoOrmConfig, createShop, createUser, verifyReceivedToken } from './common/services'

// @ts-ignore
let sequelizes = []
let client_handle: ClientModel = undefined

beforeEach(async () => {
  sequelizes.push(await rewriteTables(configIntoOrmConfig()))

  const res = await ClientsService.createClientFromIdAndSecret(client.id, client.secret)
  expect(res.isOk()).toBeTruthy()
  client_handle = res._unsafeUnwrap()
})

afterAll(() => {
  // @ts-ignore
  sequelizes.map((sequelize) => sequelize.close())
})

describe('Login endpoint', () => {
  const endpoint = '/login'
  const credentials: Array<[string, () => Promise<[any, CredentialModel]>, string, string]> = [
    ['user', createUser, user.email, user.password],
    ['shop', createShop, shop.email, shop.password],
  ]

  describe('Grant Type:', () => {
    describe('Password', () => {
      describe('Should return 200 to a valid login request with correct credentials from a', () => {
        it.each(credentials)('%s', async (_, createCredential, username, password) => {
          await createCredential()

          const body: PasswordGrantTypeModel = { grant_type: GrantTypes.password, username: username, password: password }
          const res = await request(App).post(endpoint).set(client_header).send(body)

          expect(res.statusCode).toEqual(200)
          verifyReceivedToken(res.body as TokenResponseModel)
        })

        it('Should return 401 to a valid request with incorrect credentials', async () => {
          await createUser()

          const body: PasswordGrantTypeModel = { grant_type: GrantTypes.password, username: user.email, password: user.password + 'no' }
          const res = await request(App).post(endpoint).set(client_header).send(body)

          expect(res.statusCode).toEqual(401)
          expect(typeof res.body.message).toEqual('string')
          expect(res.body.source).toEqual(endpoint)
        })
      })
    })

    describe('Refresh Token', () => {
      describe('Should return 200 to refresh a valid refresh_token from a', () => {
        it.each(credentials)('%s', async (_, createCredential, _username, _password) => {
          const [__, created_cred] = await createCredential()
          let res_token = await TokensService.generateTokenBetweenClientAndCredential(client_handle.id, created_cred.id)
          expect(res_token.isOk()).toBeTruthy()
          const token = res_token._unsafeUnwrap()
          const body: RefreshTokenGrantTypeModel = { grant_type: GrantTypes.refresh_token, refresh_token: token.refresh_token }
          const res = await request(App).post(endpoint).set(client_header).send(body)
          expect(res.statusCode).toBe(200)
          verifyReceivedToken(res.body as TokenResponseModel)
        })
      })

      it('Should return 401 when the refresh token is expired', async () => {
        const [_, created_cred] = await createUser()
        const date = createExpirationDate('hour', -1)
        let res_token = await TokensService.generateTokenBetweenClientAndCredential(client_handle.id, created_cred.id, date, date)
        expect(res_token.isOk()).toBeTruthy()
        const token = res_token._unsafeUnwrap()
        const body: RefreshTokenGrantTypeModel = { grant_type: GrantTypes.refresh_token, refresh_token: token.refresh_token }
        const res = await request(App).post(endpoint).set(client_header).send(body)
        expect(res.statusCode).toBe(401)
      })
    })
  })

  describe('Should return 400 with', () => {
    const bodies: Array<[string, Object]> = [
      ['an empty body', {}],
      ['an invalid `grant_type` value', { grant_type: 'vlan' }],
      // Password
      ['an invalid username kind', { grant_type: 'password', username: 45 }],
      ['an invalid password kind', { grant_type: 'password', username: 'toto', password: true }],
      // Refresh Token
      ['an invalid refresh_token kind', { grant_type: 'refresh_token', refresh_token: 45 }],
    ]

    it.each(bodies)('%s', async (_, body) => {
      // await createUser()
      const res = await request(App).post(endpoint).set(client_header).send(body)

      expect(res.statusCode).toEqual(400)
      expect(typeof res.body.message).toEqual('string')
      expect(res.body.source).toEqual(endpoint)
    })
  })
})
