import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Infrastructure
import { DatabaseModule } from '../modules/database/database.module';
import { RedisModule } from '../modules/redis/redis.module';

// Feature modules
import { AuthModule } from '../modules/auth/auth.module';
import { UsersModule } from '../modules/users/users.module';
import { ShopsModule } from '../modules/shops/shops.module';
import { QueueModule } from '../modules/queue/queue.module';
import { NotificationModule } from '../modules/notifications/notification.module';
import { BarbersModule } from '../barbers/barbers.module';
import { ServicesModule } from '../services/services.module';
import { AppointmentsModule } from '../appointments/appointments.module';
import { ReportsModule } from '../reports/reports.module';
import { HealthModule } from '../health/health.module';

// GraphQL config
import { graphqlConfig } from '../config/graphql.config';

@Module({
  imports: [
    // Config (global)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Event emitter (used by QueueGateway to receive queue.updated events)
    EventEmitterModule.forRoot({ wildcard: false, maxListeners: 20 }),

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
    NotificationModule,
    BarbersModule,
    ServicesModule,
    AppointmentsModule,
    ReportsModule,
    HealthModule,

    // TODO Phase 3:
    // SubscriptionsModule
    // AnalyticsModule
    // ReviewsModule
    // AdminModule
  ],
})
export class AppModule {}
