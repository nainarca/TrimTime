import { ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigService } from '@nestjs/config';
export declare function graphqlConfig(config: ConfigService): ApolloDriverConfig;
