import { ObjectDescriptor, TypeValidator } from 'record-validator'
import FieldValidationService from '../../common/services/field.validation.service'
import { withFieldValidator } from '../../common/services/error_handling'

export enum GrantTypes {
  password = 'password',
  refresh_token = 'refresh_token',
}

export class GrantTypeModel {
  static descriptor: ObjectDescriptor<Required<GrantTypeModel>> = {
    grant_type: { type: 'string', customValidator: withFieldValidator(FieldValidationService.isValidGrantType) },
  }

  static validator: TypeValidator<Required<GrantTypeModel>> = new TypeValidator(this.descriptor)

  grant_type: GrantTypes
}

export class PasswordGrantTypeModel extends GrantTypeModel {
  static descriptor: ObjectDescriptor<Required<PasswordGrantTypeModel>> = {
    grant_type: { type: 'string', customValidator: withFieldValidator(FieldValidationService.isValidGrantType) },
    username: { type: 'string' },
    password: { type: 'string' },
  }

  static validator: TypeValidator<Required<PasswordGrantTypeModel>> = new TypeValidator(this.descriptor)

  username: string
  password: string
}

export class RefreshTokenGrantTypeModel extends GrantTypeModel {
  static descriptor: ObjectDescriptor<Required<RefreshTokenGrantTypeModel>> = {
    grant_type: { type: 'string', customValidator: withFieldValidator(FieldValidationService.isValidGrantType) },
    refresh_token: { type: 'string' },
  }

  static validator: TypeValidator<Required<RefreshTokenGrantTypeModel>> = new TypeValidator(this.descriptor)

  refresh_token: string
}
