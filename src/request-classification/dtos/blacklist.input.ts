import { IsIP } from 'class-validator'

export class BlacklistInput {
  @IsIP()
  ip: string
}
