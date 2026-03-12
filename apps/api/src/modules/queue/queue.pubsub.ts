import { PubSub } from 'graphql-subscriptions';

/**
 * In-process PubSub for GraphQL subscriptions.
 * For production with multiple API instances, replace with RedisPubSub
 * from `graphql-redis-subscriptions` package.
 */
export const QUEUE_PUB_SUB = 'QUEUE_PUB_SUB';
export const pubSub = new PubSub();

export const QUEUE_EVENTS = {
  QUEUE_UPDATED: 'queue.updated',
} as const;
