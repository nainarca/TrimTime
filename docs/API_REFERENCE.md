# API Reference

The TrimTime backend exposes a GraphQL API. Below are all available operations grouped by type.

## Queries

### `shopBySlug`
- **Description:** Get shop by URL slug (public).
- **Input:** `{ slug: String! }`
- **Example request:**
  ```graphql
  query {
    shopBySlug(slug: "barber-king") {
      id
      name
      slug
    }
  }
  ```
- **Example response:**
  ```json
  {
    "data": { "shopBySlug": { "id": "...,", "name": "Barber King", "slug": "barber-king" } }
  }
  ```

### `myShop`
- **Description:** Get authenticated owner's shop.
- **Input:** none (requires JWT header).
- **Example request:**
  ```graphql
  query {
    myShop { id name slug }
  }
  ```

### `shopBranches`
- **Description:** List branches for a shop.
- **Input:** `{ shopId: ID! }`
- **Example response:** list of `BranchModel`.

### `me`
- **Description:** Get authenticated user profile.
- **Input:** none (JWT required).

### `activeQueue`
- **Description:** Get active queue entries for a shop or barber.
- **Input:** `{ shopId: ID!, barberId: ID }`

### `queueEntry`
- **Description:** Get a single queue entry by ID.
- **Input:** `{ entryId: ID! }`

### `queueStats`
- **Description:** Get queue statistics for a shop or barber.
- **Input:** `{ shopId: ID!, barberId: ID }`

## Mutations

### Authentication

#### `requestOtp`
- **Description:** Send OTP to a phone number.
- **Input:** `{ input: RequestOtpInput! }` (phone string)

#### `verifyOtp`
- **Description:** Verify OTP, receive tokens.
- **Input:** `{ input: VerifyOtpInput! }` (phone, otp)

#### `refreshToken`
- **Description:** Exchange refresh token for new tokens.
- **Input:** `{ refreshToken: String! }`

#### `logout`
- **Description:** Revoke refresh token.
- **Requires:** JWT

### Shops

#### `createShop`
- **Description:** Create a new shop (owner only).
- **Input:** `{ input: CreateShopInput! }`

#### `updateShop`
- **Description:** Update shop details (owner only).
- **Input:** `{ shopId: ID!, input: UpdateShopInput! }`

### Users

#### `updateProfile`
- **Description:** Update own profile details.
- **Input:** `{ input: UpdateProfileInput! }`

### Queue

#### `joinQueue`
- **Description:** Join a queue (authenticated or guest).
- **Input:** `{ input: JoinQueueInput! }`

#### `updateQueueStatus`
- **Description:** Update queue entry status (barber/owner).
- **Requires:** JWT
- **Input:** `{ input: UpdateQueueStatusInput! }`

#### `leaveQueue`
- **Description:** Customer leaves their own queue entry.
- **Requires:** JWT
- **Input:** `{ entryId: ID! }`

## Subscriptions

### `queueUpdated`
- **Description:** Real-time queue updates for a shop or barber.
- **Input:** `{ shopId: ID!, barberId: ID }`

**Payload type:** `QueueUpdateEvent` containing shopId, barberId, type, entry, and activeEntries.

The examples above illustrate fundamentals; the playground at `/graphql` can be used to inspect input types and responses interactively.