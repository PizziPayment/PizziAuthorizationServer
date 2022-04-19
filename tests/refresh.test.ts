import { ClientModel, ClientsService, createExpirationDate, rewriteTables, TokensService } from 'pizzi-db'
import * as request from 'supertest'
import { App } from '../app/api'
import RefreshRequestModel from '../app/authentication/models/refresh.request.model'
import TokenResponseModel from '../app/authentication/models/token.response.model'
import { client, client_header } from './common/models'
import { configIntoOrmConfig, createUser, verifyReceivedToken } from './common/services'

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

describe('Refresh endpoint', () => {
  const endpoint = '/refresh'

  it('should return 200 to refresh a token', async () => {
    const [_, created_cred] = await createUser()

    let res_token = await TokensService.generateTokenBetweenClientAndCredential(client_handle.id, created_cred.id)
    expect(res_token.isOk()).toBeTruthy()
    const token = res_token._unsafeUnwrap()
    const body: RefreshRequestModel = { refresh_token: token.refresh_token }

    const res = await request(App).post(endpoint).set(client_header).send(body)

    expect(res.statusCode).toBe(200)
    verifyReceivedToken(res.body as TokenResponseModel)
  })

  describe('should return', () => {
    const params = [
      { name: 'body is missing', body: undefined, code: 400 },
      { name: 'refresh token field is missing', body: {}, code: 400 },
      { name: 'refresh token field is invalid', body: { refresh_token: 'invalid' }, code: 401 },
    ]

    it.each(params)('$code when the $name', async ({ name, body, code }) => {
      await createUser()

      expect((await request(App).post(endpoint).set(client_header).send(body)).statusCode).toBe(code)
    })
  })

  it('should return 401 when the refresh token is expired', async () => {
    const [_, created_cred] = await createUser()
    const date = createExpirationDate('hour', -1)

    let res_token = await TokensService.generateTokenBetweenClientAndCredential(client_handle.id, created_cred.id, date, date)
    expect(res_token.isOk()).toBeTruthy()
    const token = res_token._unsafeUnwrap()
    const body: RefreshRequestModel = { refresh_token: token.refresh_token }

    const res = await request(App).post(endpoint).set(client_header).send(body)

    expect(res.statusCode).toBe(401)
  })
})
