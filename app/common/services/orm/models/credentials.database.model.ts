import { AutoIncrement, Column, Model, PrimaryKey, Table } from 'sequelize-typescript'

@Table({ tableName: 'credentials', timestamps: false })
export default class Credential extends Model<Credential> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id!: number

    @Column
    email!: string

    @Column
    password!: string

    @Column
    user_id?: number

    @Column
    shop_id?: number

    @Column
    admin_id?: number
}
