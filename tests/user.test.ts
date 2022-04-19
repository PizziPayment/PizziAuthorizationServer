import { ClientsService, rewriteTables } from 'pizzi-db'
import * as request from 'supertest'
import { App } from '../app/api'
import TokenResponseModel from '../app/authentication/models/token.response.model'
import { client, client_header, user } from './common/models'
import { configIntoOrmConfig, createUser, verifyReceivedToken } from './common/services'

// @ts-ignore
let sequelizes = []

beforeEach(async () => {
  sequelizes.push(await rewriteTables(configIntoOrmConfig()))
  await ClientsService.createClientFromIdAndSecret(client.id, client.secret)
})

afterAll(() => {
  // @ts-ignore
  sequelizes.map((sequelize) => sequelize.close())
})

describe('User login endpoint', () => {
  const endpoint = '/user/login'

  it('Should return 200 to a valid request with correct credentials', async () => {
    await createUser()

    const res = await request(App).post(endpoint).set(client_header).send({ email: user.email, password: user.password })

    expect(res.statusCode).toEqual(200)
    verifyReceivedToken(res.body as TokenResponseModel)
  })

  it('Should return 400 to an invalid request', async () => {
    await createUser()

    const res = await request(App).post(endpoint).set(client_header).send({ le_bruit: 'deLaFete' })

    expect(res.statusCode).toEqual(400)
    expect(typeof res.body.message).toEqual('string')
    expect(res.body.source).toEqual(endpoint)
  })

  it('Should return 401 to a valid request with incorrect credentials', async () => {
    await createUser()

    const res = await request(App)
      .post(endpoint)
      .set(client_header)
      .send({ email: user.email, password: user.password + 'no' })

    expect(res.statusCode).toEqual(401)
    expect(typeof res.body.message).toEqual('string')
    expect(res.body.source).toEqual(endpoint)
  })
})
