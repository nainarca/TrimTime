import { PubSub } from 'graphql-subscriptions';
/**
 * In-process PubSub for GraphQL subscriptions.
 * For production with multiple API instances, replace with RedisPubSub
 * from `graphql-redis-subscriptions` package.
 */
export declare const QUEUE_PUB_SUB = "QUEUE_PUB_SUB";
export declare const pubSub: PubSub;
export declare const QUEUE_EVENTS: {
    readonly QUEUE_UPDATED: "queue.updated";
};
