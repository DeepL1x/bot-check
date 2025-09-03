import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { BlacklistController } from './controllers/blacklist.controller'
import { RequestClassificationController } from './controllers/request-classification.controller'
import { WhitelistController } from './controllers/whitelist.controller'
import { BlacklistRepository } from './repositories/blacklist.repository'
import { WhitelistRepository } from './repositories/whitelist.repository'
import { Blacklist, BlacklistSchema } from './schemas/blacklist.schema'
import { Whitelist, WhitelistSchema } from './schemas/whitelist.schema'
import { BlacklistService } from './services/blacklist.service'
import { RequestClassificationService } from './services/request-classification.service'
import { WhitelistService } from './services/whitelist.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blacklist.name, schema: BlacklistSchema },
      { name: Whitelist.name, schema: WhitelistSchema },
    ]),
  ],
  controllers: [
    RequestClassificationController,
    WhitelistController,
    BlacklistController,
  ],
  providers: [
    RequestClassificationService,
    WhitelistRepository,
    WhitelistService,
    BlacklistService,
    BlacklistRepository,
  ],
})
export class RequestClassificationModule {}
