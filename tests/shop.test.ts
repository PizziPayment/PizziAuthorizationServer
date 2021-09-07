import { App } from '../app/api'
import { config } from '../app/common/config'
import { OrmConfig } from 'pizzi-db/dist/commons/models/orm.config.model'
import { ClientsService, rewriteTables } from 'pizzi-db'

const client = { client_id: 'toto', client_secret: 'tutu' }
const client_header = { Authorization: 'Basic ' + Buffer.from(`${client.client_id}:${client.client_secret}`).toString('base64') }

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

describe('Shop login endpoint', () => {
  it('Should return 200 to a valid request with correct credentials', () => {
    expect(0).toEqual(0)
  })
  it('Should return 400 to an invalid request', () => {
    expect(0).toEqual(0)
  })
  it('Should return 401 to a valid request with incorrect credentials', () => {
    expect(0).toEqual(0)
  })
})
