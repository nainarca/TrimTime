import { PubSub } from 'graphql-subscriptions';

export const QUEUE_PUB_SUB = 'QUEUE_PUB_SUB';
export const pubSub = new PubSub();

export const QUEUE_EVENTS = {
  QUEUE_UPDATED: 'queue.updated',
} as const;
