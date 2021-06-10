import { AutoIncrement, Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript'

interface TokenAttributes {
    id: number
    access_token: string
    refresh_token: string
    expires_at: Date
    client_id: number
    credential_id: number
}

type TokenCreation = Omit<TokenAttributes, 'id'>

@Table({ tableName: 'tokens', timestamps: false })
export default class Token extends Model<TokenAttributes, TokenCreation> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id!: number

    @Column
    access_token!: string

    @Column
    refresh_token!: string

    @Column(DataType.DATE)
    expires_at!: Date

    @Column
    client_id!: number

    @Column
    credential_id!: number
}
