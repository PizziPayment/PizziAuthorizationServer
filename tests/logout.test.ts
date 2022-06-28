import { ClientModel, ClientsService, CredentialModel, rewriteTables, TokenModel, TokensService, TokensServiceError } from 'pizzi-db'
import * as request from 'supertest'
import { App } from '../app/api'
import { client } from './common/models'
import { configIntoOrmConfig, createUser } from './common/services'

async function createToken(credential: CredentialModel, client: ClientModel): Promise<TokenModel> {
  const res = await TokensService.generateTokenBetweenClientAndCredential(client.id, credential.id)
  expect(res.isOk()).toBeTruthy()

  return res._unsafeUnwrap()
}

function createBearerHeader(token: string): Object {
  return { Authorization: `Bearer ${token}` }
}

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

describe('Logout endpoint', () => {
  const endpoint = '/logout'

  it('Should return 204 to a valid request with correct credentials', async () => {
    let [_, created_cred] = await createUser()

    const token = await createToken(created_cred, client_handle)

    expect((await request(App).post(endpoint).set(createBearerHeader(token.access_token)).send()).statusCode).toEqual(204)

    const res = await TokensService.getTokenFromId(token.id)
    expect(res.isErr()).toBeTruthy()
    expect(res._unsafeUnwrapErr()).toBe(TokensServiceError.TokenNotFound)
  })

  it('Should return 401 to a valid request with incorrect credentials', async () => {
    await createUser()

    const res = await request(App).post(endpoint).set(createBearerHeader('notarealtoken')).send()

    expect(res.statusCode).toEqual(401)
  })
})
