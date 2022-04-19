import { App } from '../app/api'
import { config } from '../app/common/config'
import { OrmConfig } from 'pizzi-db/dist/commons/models/orm.config.model'
import { ClientsService, rewriteTables, CredentialsService, EncryptionService, TokensService, CredentialModel, UsersServices } from 'pizzi-db'
import * as request from 'supertest'

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

const client = { client_id: 'toto', client_secret: 'tutu' }

async function getUserCredentials(email: string, password: string): Promise<CredentialModel> {
  return (await CredentialsService.getCredentialFromEmailAndPassword(email, EncryptionService.encrypt(password)))._unsafeUnwrap()
}

async function getUserToken(email: string, password: string): Promise<string> {
  let client_handle = (await ClientsService.getClientFromIdAndSecret(client.client_id, client.client_secret))._unsafeUnwrap()
  let credentials = await getUserCredentials(email, password)
  let token = (await TokensService.generateTokenBetweenClientAndCredential(client_handle.id, credentials.id))._unsafeUnwrap()

  return token.access_token
}

async function createUser() {
  const user_handle = (await UsersServices.createUser(user.name, user.surname, `${user.place.address}, ${user.place.city}`, user.place.zipcode))._unsafeUnwrap()
  ;(await CredentialsService.createCredentialWithId('user', user_handle.id, user.email, EncryptionService.encrypt(user.password)))._unsafeUnwrap()
}

function createBearerHeader(token: string): Object {
  return { Authorization: `Bearer ${token}` }
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

describe('Logout endpoint', () => {
  const endpoint = '/logout'

  it('Should return 204 to a valid request with correct credentials', async () => {
    await createUser()

    const token = await getUserToken(user.email, user.password)
    const res = await request(App).post(endpoint).set(createBearerHeader(token)).send()

    expect(res.statusCode).toEqual(204)
  })

  it('Should return 401 to a valid request with incorrect credentials', async () => {
    await createUser()

    const res = await request(App).post(endpoint).set(createBearerHeader('notarealtoken')).send()

    expect(res.statusCode).toEqual(401)
  })
})
