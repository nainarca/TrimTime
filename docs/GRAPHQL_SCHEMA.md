# GraphQL Schema Documentation

This document describes the full GraphQL schema exposed by the TrimTime API, including all queries, mutations, and subscriptions with example payloads.

## Queries

### `shopBySlug(slug: String!): ShopModel`
Retrieve a shop by its URL-friendly slug.

```graphql
query GetShop($slug: String!) {
  shopBySlug(slug: $slug) {
    id
    name
    country
    timezone
  }
}
```

### `myShop: ShopModel`
Returns the shop owned by the authenticated user. Requires a JWT in the Authorization header.

```graphql
query {
  myShop { id name slug }
}
```

### `shopBranches(shopId: ID!): [BranchModel]`
Lists branches belonging to a given shop.

```graphql
query {
  shopBranches(shopId: "shop123") {
    id
    name
    phone
  }
}
```

### `me: UserModel`
Returns profile of currently authenticated user.

```graphql
query {
  me { id phone email name }
}
```

### `activeQueue(shopId: ID!, barberId: ID): [QueueEntryModel]`
Fetch active queue entries for a shop or specific barber.

### `queueEntry(entryId: ID!): QueueEntryModel`
Get a single queue entry by its ID.

### `queueStats(shopId: ID!, barberId: ID): QueueStatsModel`
Get statistics (wait count, serving count, avg wait) for a shop/barber.

## Mutations

### Authentication

```graphql
mutation RequestOtp($input: RequestOtpInput!) {
  requestOtp(input: $input) {
    success message expiresIn
  }
}

mutation VerifyOtp($input: VerifyOtpInput!) {
  verifyOtp(input: $input) {
    accessToken refreshToken userId
  }
}

mutation RefreshToken($refreshToken: String!) {
  refreshToken(refreshToken: $refreshToken) {
    accessToken refreshToken
  }
}

mutation Logout {
  logout
}
```

### Shops & Users

```graphql
mutation CreateShop($input: CreateShopInput!) {
  createShop(input: $input) {
    id name phone slug
  }
}

mutation UpdateShop($shopId: ID!, $input: UpdateShopInput!) {
  updateShop(shopId: $shopId, input: $input) { id name }
}

mutation UpdateProfile($input: UpdateProfileInput!) {
  updateProfile(input: $input) { id name email }
}
```

### Queue

```graphql
mutation JoinQueue($input: JoinQueueInput!) {
  joinQueue(input: $input) {
    id ticketDisplay position estimatedWaitMins status
  }
}

mutation UpdateQueueStatus($input: UpdateQueueStatusInput!) {
  updateQueueStatus(input: $input) {
    id status calledAt servingAt
  }
}

mutation LeaveQueue($entryId: ID!) {
  leaveQueue(entryId: $entryId) { id status }
}
```

## Subscriptions

### `queueUpdated(shopId: ID!, barberId: ID): QueueUpdateEvent`
Subscribe to real-time queue updates for a shop and optional barber.

```graphql
subscription OnQueueUpdated($shopId: ID!, $barberId: ID) {
  queueUpdated(shopId: $shopId, barberId: $barberId) {
    type
    entry { id status position }
    activeEntries { id ticketDisplay position }
  }
}
```

## Types

The following types are defined in the schema (selected fields shown):

```graphql
type ShopModel {
  id: ID!
  name: String!
  slug: String!
  phone: String!
  country: String!
  timezone: String!
}

type BranchModel {
  id: ID!
  shopId: String!
  name: String!
  phone: String
}

type UserModel {
  id: ID!
  phone: String!
  email: String
  name: String
  isVerified: Boolean!
}

type QueueEntryModel {
  id: ID!
  ticketDisplay: String!
  status: QueueStatus!
  position: Int!
  estimatedWaitMins: Int
}

enum QueueStatus { WAITING CALLED SERVING SERVED LEFT NO_SHOW }

type QueueStatsModel {
  waitingCount: Int!
  servingCount: Int!
  avgWaitMins: Int
  servedTodayCount: Int!
}

type QueueUpdateEvent {
  shopId: String!
  barberId: String
  type: String!
  entry: QueueEntryModel
  activeEntries: [QueueEntryModel!]
}
```

Additional input types (`CreateShopInput`, `JoinQueueInput`, etc.) and enums are defined in the GraphQL schema and can be inspected via playground when the server is running.

This document provides a complete overview of the GraphQL API surface with examples to assist development and integration.