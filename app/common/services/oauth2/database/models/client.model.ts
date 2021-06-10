export default class ClientModel {
    constructor(id: number, clientId: string, clientSecret: string) {
        this.id = id
        this.clientId = clientId
        this.clientSecret = clientSecret
    }
    id: number
    clientId: string
    clientSecret: string
}
