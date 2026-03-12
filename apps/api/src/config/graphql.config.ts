import { ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigService } from '@nestjs/config';

export function graphqlConfig(config: ConfigService): ApolloDriverConfig {
  return {
    autoSchemaFile: true,        // generates schema in-memory (code-first)
    sortSchema: true,
    playground: config.get('GRAPHQL_PLAYGROUND', 'true') === 'true',
    introspection: config.get('GRAPHQL_INTROSPECTION', 'true') === 'true',
    // GraphQL Subscriptions over WebSocket (graphql-ws protocol)
    subscriptions: {
      'graphql-ws': {
        path: '/graphql',
        onConnect: (ctx) => {
          // Attach connection params so guards can access the token
          const { connectionParams } = ctx;
          return { req: { headers: { authorization: (connectionParams as Record<string, string>)?.['authorization'] } } };
        },
      },
    },
    context: ({ req, res, extra }) => {
      const request = req ?? extra?.request;
      const user = request?.user;
      return {
        req: request,
        res,
        userId: user?.id,
        roles: user?.roles,
        shopIds: user?.shopIds,
      };
    },
    formatError: (error) => {
      // Strip internal error details in production
      if (process.env.NODE_ENV === 'production') {
        return {
          message: error.message,
          extensions: { code: error.extensions?.['code'] },
        };
      }
      return error;
    },
  };
}
