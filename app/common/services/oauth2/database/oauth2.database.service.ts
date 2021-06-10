import ClientModel from './models/client.model'
import Client from '../../orm/models/clients.database.model'

export default class Oauth2DatabaseService {
    static async getClientByIdAndSecret(clientId: string, clientSecret: string): Promise<ClientModel | null> {
        const queried_client = await Client.findOne({ where: { client_id: clientId, client_secret: clientSecret } })

        if (!queried_client) {
            return null
        }
        return new ClientModel(queried_client.id, queried_client.client_id, queried_client.client_secret)
    }
}
