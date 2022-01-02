import { App } from '../app/api'
import { config } from '../app/common/config'
import { OrmConfig } from 'pizzi-db/dist/commons/models/orm.config.model'
import { ClientsService, rewriteTables, UsersServices, CredentialsService, EncryptionService } from 'pizzi-db'
import * as request from 'supertest'

const client = { client_id: 'toto', client_secret: 'tutu' }
const client_header = { Authorization: 'Basic ' + Buffer.from(`${client.client_id}:${client.client_secret}`).toString('base64') }

const user = {
  name: 'toto',
  surname: 'tutu',
  email: 'toto@tutu.tata',
  password: 'gY@3Cwl4FmLlQ@HycAf',
  place: {
    address: '13 rue de la ville',
    city: 'Ville',
    zipcode: 25619,
  },
}

async function createUser() {
  const user_handle = (await UsersServices.createUser(user.name, user.surname, `${user.place.address}, ${user.place.city}`, user.place.zipcode))._unsafeUnwrap();
  (await CredentialsService.createCredentialWithId('user', user_handle.id, user.email, EncryptionService.encrypt(user.password)))._unsafeUnwrap()
}

beforeEach(async () => {
  const database = config.database
  const orm_config: OrmConfig = {
    user: database.user,
    password: database.password,
    name: database.name,
    host: database.host,
    port: Number(database.port),
    logging: false,
  }

  await rewriteTables(orm_config)
  await ClientsService.createClientFromIdAndSecret(client.client_id, client.client_secret)
})

describe('User login endpoint', () => {
  const endpoint = '/user/login'

  it('Should return 200 to a valid request with correct credentials', async () => {
    await createUser()

    const res = await request(App).post(endpoint).set(client_header).send({ email: user.email, password: user.password })

    expect(res.statusCode).toEqual(200)
    expect(typeof res.body.access_token).toEqual('string')
    expect(typeof res.body.refresh_token).toEqual('string')
    expect(typeof res.body.access_token_expires_at).toEqual('string')
  })

  it('Should return 400 to an invalid request', async () => {
    await createUser()

    const res = await request(App).post(endpoint).set(client_header).send({ le_bruit: "deLaFete" })

    expect(res.statusCode).toEqual(400)
    expect(typeof res.body.message).toEqual('string')
    expect(res.body.source).toEqual(endpoint)
  })

  it('Should return 401 to a valid request with incorrect credentials', async () => {
    await createUser()

    const res = await request(App).post(endpoint).set(client_header).send({ email: user.email, password: user.password + 'no' })

    expect(res.statusCode).toEqual(401)
    expect(typeof res.body.message).toEqual('string')
    expect(res.body.source).toEqual(endpoint)
  })
})
