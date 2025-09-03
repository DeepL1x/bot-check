import { IsIP } from 'class-validator'

export class WhitelistOut {
  @IsIP()
  ip: string
}
