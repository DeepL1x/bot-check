import { IsIP } from 'class-validator'

export class BlacklistOut {
  @IsIP()
  ip: string
}
