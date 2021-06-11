import { createHash, randomBytes } from 'crypto'
import Credential from '../../common/services/orm/models/credentials.database.model'
import Token from '../../common/services/orm/models/tokens.database.model'
import ClientModel from './models/client.model'
import CredentialModel from './models/credential.model'
import { Result, err, ok } from 'neverthrow'
import Client from '../../common/services/orm/models/clients.database.model'

type AuthServiceResult<T> = Result<T, AuthServiceError>
enum AuthServiceError {
    OwnerNotFound,
    ClientNotFound,
    DatabaseError,
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

    private static async newToken(client: ClientModel, credential: CredentialModel): Promise<Token> {
        const access_token = randomBytes(20).toString('hex')
        const refresh_token = randomBytes(20).toString('hex')
        const expires_at = new Date(new Date().setMonth(new Date().getDay() + 1))
        return await Token.create({
            access_token: access_token,
            refresh_token: refresh_token,
            expires_at: expires_at,
            client_id: client.id,
            credential_id: credential.id,
        })
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
                return ok(await this.newToken(client, credential))
            } else {
                const tomorrow = new Date(new Date().setMonth(new Date().getDay() + 1))

                if (new Date(token.expires_at).getUTCMilliseconds() <= tomorrow.getUTCMilliseconds()) {
                    return ok(token)
                } else {
                    return ok(await this.newToken(client, credential))
                }
            }
        } catch (e) {
            console.log(e)
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
