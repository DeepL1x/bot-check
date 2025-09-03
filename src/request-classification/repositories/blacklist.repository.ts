import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { MongoServerError } from 'mongodb'
import { Model } from 'mongoose'

import { Blacklist } from '../schemas/blacklist.schema'
import { Whitelist } from '../schemas/whitelist.schema'

@Injectable()
export class BlacklistRepository {
  private logger: Logger
  constructor(
    @InjectModel(Blacklist.name)
    private readonly blacklistModel: Model<Blacklist>,
  ) {
    this.logger = new Logger(BlacklistRepository.name)
  }

  async findUnique(ip: string) {
    try {
      return await this.blacklistModel.findOne({ ip }).lean()
    } catch (error) {
      this.logger.error('Error during searching for blacklist record', {
        error,
      })
      throw new InternalServerErrorException()
    }
  }

  async create(ip: string) {
    try {
      return (await this.blacklistModel.create({ ip })).toObject<Whitelist>()
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        throw new ConflictException('Ip is already blacklisted')
      }
      this.logger.error('Error during creation of blacklist record', {
        error,
      })
      throw new InternalServerErrorException()
    }
  }

  async delete(ip: string) {
    try {
      await this.blacklistModel.deleteOne({ ip })
      return true
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        throw new BadRequestException('Ip not found')
      }
      this.logger.error('Error during deletion of blacklist record', {
        error,
      })
      throw new InternalServerErrorException()
    }
  }
}
