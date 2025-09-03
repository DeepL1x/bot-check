import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { MongoServerError } from 'mongodb'
import { Whitelist } from '../schemas/whitelist.schema'

@Injectable()
export class WhitelistRepository {
  private logger: Logger
  constructor(
    @InjectModel(Whitelist.name)
    private readonly whitelistModel: Model<Whitelist>,
  ) {
    this.logger = new Logger(WhitelistRepository.name)
  }

  async findUnique(ip: string) {
    try {
      return await this.whitelistModel.findOne({ ip }).lean()
    } catch (error) {
      this.logger.error('Error during searching for whitelist record', {
        error,
      })
      throw new InternalServerErrorException()
    }
  }

  async create(ip: string) {
    try {
      return (await this.whitelistModel.create({ ip })).toObject<Whitelist>()
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        throw new ConflictException('Ip already whitelisted')
      }
      this.logger.error('Error during creation of whitelist record', {
        error,
      })
      throw new InternalServerErrorException()
    }
  }

  async delete(ip: string) {
    try {
      await this.whitelistModel.deleteOne({ ip })
      return true
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        throw new BadRequestException('Ip not found')
      }
      this.logger.error('Error during deletion of whitelist record', {
        error,
      })
      throw new InternalServerErrorException()
    }
  }
}
