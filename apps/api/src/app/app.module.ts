import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

// Infrastructure
import { DatabaseModule } from '../modules/database/database.module';
import { RedisModule } from '../modules/redis/redis.module';

// Feature modules
import { AuthModule } from '../modules/auth/auth.module';
import { UsersModule } from '../modules/users/users.module';
import { ShopsModule } from '../modules/shops/shops.module';
import { QueueModule } from '../modules/queue/queue.module';

// GraphQL config
import { graphqlConfig } from '../config/graphql.config';

@Module({
  imports: [
    // Config (global)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // GraphQL (Apollo + WebSocket subscriptions)
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => graphqlConfig(config),
    }),

    // Infrastructure (global)
    DatabaseModule,
    RedisModule,

    // Feature modules
    AuthModule,
    UsersModule,
    ShopsModule,
    QueueModule,

    // TODO Phase 2:
    // BarbersModule
    // ServicesModule
    // QrCodeModule
    // AppointmentsModule
    // NotificationsModule

    // TODO Phase 3:
    // SubscriptionsModule
    // AnalyticsModule
    // ReviewsModule
    // AdminModule
  ],
})
export class AppModule {}
