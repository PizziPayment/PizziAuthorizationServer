import { createHash, randomBytes } from 'crypto'
import Credential from '../../common/services/orm/models/credentials.database.model'
import Token, { TokenCreation } from '../../common/services/orm/models/tokens.database.model'
import ClientModel from './models/client.model'
import CredentialModel from './models/credential.model'
import { Result, err, ok } from 'neverthrow'
import Client from '../../common/services/orm/models/clients.database.model'
import TokenModel from './models/token.model'

type AuthServiceResult<T> = Result<T, AuthServiceError>
enum AuthServiceError {
    OwnerNotFound,
    ClientNotFound,
    DatabaseError,
    TokenNotFound,
}

export default class AuthenticationService {
    static crypt(source: string): string {
        return createHash('sha256').update(source).digest('hex')
    }

    static async getOwnerFromCredentials(email: string, hashed_password: string): Promise<AuthServiceResult<CredentialModel>> {
        const credential = await Credential.findOne({
            where: { email: email, password: hashed_password },
        })

        if (!credential) {
            return err(AuthServiceError.OwnerNotFound)
        }
        return ok(credential)
    }

    private static generateToken(client: ClientModel, credential: CredentialModel): TokenCreation {
        const access_token = randomBytes(20).toString('hex')
        const refresh_token = randomBytes(20).toString('hex')
        const expires_at = new Date(new Date().setDate(new Date().getDate() + 1))

        return {
            access_token: access_token,
            refresh_token: refresh_token,
            expires_at: expires_at,
            client_id: client.id,
            credential_id: credential.id,
        }
    }

    static async generateTokenBetweenClientAndCredential(client: ClientModel, credential: CredentialModel): Promise<AuthServiceResult<TokenModel>> {
        try {
            const token = await Token.findOne({
                where: {
                    client_id /* foreign key */: client.id,
                    credential_id: credential.id,
                },
            })

            if (!token) {
                return ok(await Token.create(this.generateToken(client, credential)))
            } else {
                const today = new Date()

                if (new Date(token.expires_at).getTime() > today.getTime()) {
                    return ok(token)
                } else {
                    const new_token_attributes = this.generateToken(client, credential)

                    token.access_token = new_token_attributes.access_token
                    token.refresh_token = new_token_attributes.refresh_token
                    token.expires_at = new_token_attributes.expires_at
                    token.client_id = new_token_attributes.client_id
                    token.credential_id = new_token_attributes.credential_id
                    await token.save()
                    return ok(token)
                }
            }
        } catch {
            return err(AuthServiceError.DatabaseError)
        }
    }

    static async getTokenFromValue(token: string): Promise<AuthServiceResult<TokenModel>> {
        try {
            const maybe_token = await Token.findOne({ where: { access_token: token } })

            if (!maybe_token) {
                return err(AuthServiceError.TokenNotFound)
            }
            return ok(maybe_token)
        } catch {
            return err(AuthServiceError.DatabaseError)
        }
    }

    static async deleteUserToken(token: TokenModel): Promise<AuthServiceResult<void>> {
        try {
            const maybe_token = await Token.findOne({ where: { id: token.id } })

            if (!maybe_token) {
                return err(AuthServiceError.TokenNotFound)
            } else {
                await maybe_token.destroy()
                return ok(null)
            }
        } catch {
            return err(AuthServiceError.DatabaseError)
        }
    }
    static async getClientFromIdAndSecret(client_id: string, client_secret: string): Promise<AuthServiceResult<ClientModel>> {
        try {
            const client = await Client.findOne({ where: { client_id: client_id, client_secret: client_secret } })

            if (!client) {
                return err(AuthServiceError.ClientNotFound)
            }
            return ok(client)
        } catch {
            return err(AuthServiceError.DatabaseError)
        }
    }
}
