import { CredentialModel, CredentialsService, EncryptionService, UserModel, UsersServices } from 'pizzi-db'
import { OrmConfig } from 'pizzi-db/dist/commons/models/orm.config.model'
import TokenResponseModel from '../../app/authentication/models/token.response.model'
import { config } from '../../app/common/config'
import { user } from './models'

export function configIntoOrmConfig(): OrmConfig {
  const database = config.database

  return {
    user: database.user,
    password: database.password,
    name: database.name,
    host: database.host,
    port: Number(database.port),
    logging: false,
  }
}

export async function createUser(): Promise<[UserModel, CredentialModel]> {
  const res_user = await UsersServices.createUser(user.name, user.surname, `${user.place.address}, ${user.place.city}`, user.place.zipcode)
  expect(res_user.isOk()).toBeTruthy()
  const created_user = res_user._unsafeUnwrap()

  const res_cred = await CredentialsService.createCredentialWithId('user', created_user.id, user.email, EncryptionService.encrypt(user.password))
  expect(res_cred.isOk()).toBeTruthy()
  const created_cred = res_cred._unsafeUnwrap()

  return [created_user, created_cred]
}

export async function verifyReceivedToken(token: TokenResponseModel) {
  expect(typeof token.access_token).toEqual('string')
  expect(typeof token.refresh_token).toEqual('string')
  expect(typeof token.access_token_expires_at).toEqual('string')
  expect(new Date(token.access_token_expires_at)).not.toBeNull()
  expect(typeof token.refresh_token_expires_at).toEqual('string')
  expect(new Date(token.refresh_token_expires_at)).not.toBeNull()
}
