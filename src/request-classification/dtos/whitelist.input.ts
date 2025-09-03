import { IsIP } from 'class-validator'

export class WhitelistInput {
  @IsIP()
  ip: string
}
