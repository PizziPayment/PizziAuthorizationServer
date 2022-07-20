import { GrantTypes } from '../../authentication/models/grant_type'

export default class FieldValidationService {
  static isValidGrantType(grant_type: string | GrantTypes): boolean {
    return Object.values(GrantTypes).includes(grant_type as GrantTypes)
  }
}
