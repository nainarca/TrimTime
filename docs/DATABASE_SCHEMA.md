# Database Schema

The database is defined using Prisma in `prisma/schema.prisma`. Below are the core models used by TrimTime.

## User

| Field           | Type     | Description                        |
|-----------------|----------|------------------------------------|
| id              | String   | Primary key (UUID)                 |
| phone           | String?  | User phone (unique)                |
| email           | String?  | User email (unique)                |
| name            | String?  | Optional full name                 |
| avatarUrl       | String?  | Profile picture URL                |
| isVerified      | Boolean  | OTP verified flag                  |
| isActive        | Boolean  | Active account                     |
| preferredLang   | String   | Language code                      |
| createdAt       | DateTime | Creation timestamp                 |
| updatedAt       | DateTime | Updated timestamp                  |

### Relationships
- `roles` &rarr; UserRoleAssignment[]
- `ownedShops` &rarr; Shop[] (relation `ShopOwner`)
- other relations: queue entries, appointments, reviews, etc.

## Shop

| Field         | Type     | Description                    |
|---------------|----------|--------------------------------|
| id            | String   | Primary key                    |
| ownerId       | String   | FK to User (Shop owner)        |
| name          | String   | Shop name                      |
| slug          | String   | Unique URL slug                |
| description   | String?  | Optional description           |
| logoUrl       | String?  | Logo image URL                 |
| phone         | String   | Contact phone number           |
| email         | String?  | Contact email                  |
| country       | String   | ISO country code               |
| timezone      | String   | Default timezone               |
| currency      | String   | Currency code                  |
| isActive      | Boolean  | Active flag                    |
| isVerified    | Boolean  | Verified by admin              |
| createdAt     | DateTime | Created timestamp              |
| updatedAt     | DateTime | Updated timestamp              |

### Relationships
- `owner` &rarr; User
- `branches` &rarr; ShopBranch[]
- `userRoles` &rarr; UserRoleAssignment[]
- many others (barbers, services, queue entries...)

## ShopBranch

| Field      | Type     | Description                        |
|------------|----------|------------------------------------|
| id         | String   | Primary key                        |
| shopId     | String   | FK to Shop                         |
| name       | String   | Branch name                        |
| address    | String   | Street address                     |
| city       | String   | City name                          |
| latitude   | Decimal? | Optional GPS latitude              |
| longitude  | Decimal? | Optional GPS longitude             |
| phone      | String?  | Branch phone                       |
| isActive   | Boolean  | Active flag                        |
| isMain     | Boolean  | Indicates main branch              |
| createdAt  | DateTime | Timestamp                          |
| updatedAt  | DateTime | Timestamp                          |

### Relationships
- `shop` &rarr; Shop
- other relations: operatingHours, barbers, queueEntries, etc.

## QueueEntry

| Field            | Type        | Description                    |
|------------------|-------------|--------------------------------|
| id               | String      | Primary key                    |
| shopId           | String      | FK to Shop                     |
| branchId         | String      | FK to ShopBranch               |
| barberId         | String?     | FK to Barber                   |
| customerId       | String?     | FK to User (customer)          |
| guestPhone       | String?     | Guest phone number             |
| guestName        | String?     | Guest name                     |
| serviceId        | String?     | FK to Service                  |
| ticketNumber     | Int         | Daily sequence ticket number   |
| ticketDisplay    | String      | Formatted ticket ID (A001)     |
| entryType        | EntryType   | WALK_IN or APPOINTMENT         |
| priority         | Int         | Priority weighting             |
| status           | QueueStatus | WAITING/CALLED/SERVING/etc.    |
| position         | Int         | Current position in queue      |
| estimatedWaitMins| Int?        | EWT (minutes)                  |
| joinedAt         | DateTime    | When joined                    |
| calledAt         | DateTime?   | When called                    |
| servingAt        | DateTime?   | When service started           |
| servedAt         | DateTime?   | When service finished          |
| leftAt           | DateTime?   | When customer left             |
| noShowAt         | DateTime?   | When marked no-show            |
| appointmentId    | String?     | Optional FK to Appointment     |
| notes            | String?     | Free-text notes                |
| createdAt        | DateTime    | Timestamp                      |

### Relationships
- `shop` &rarr; Shop
- `branch` &rarr; ShopBranch
- `barber` &rarr; Barber
- `customer` &rarr; User
- `service` &rarr; Service
- `appointment` &rarr; Appointment
- `review` &rarr; Review

## UserRoleAssignment

| Field   | Type     | Description                          |
|---------|----------|--------------------------------------|
| id      | String   | Primary key                          |
| userId  | String   | FK to User                           |
| role    | UserRole | Role enum (CUSTOMER, SHOP_OWNER...)  |
| shopId  | String?  | Optional FK to Shop                  |
| createdAt| DateTime| Timestamp                            |

### Relationships
- `user` &rarr; User
- `shop` &rarr; Shop

## SubscriptionPlan

| Field       | Type     | Description                        |
|-------------|----------|------------------------------------|
| id          | String   | Primary key                        |
| name        | String   | Plan name (Free, Pro, etc.)        |
| priceCents  | Int      | Price in cents                     |
| isActive    | Boolean  | Flag                              |
| features    | String?  | JSON or comma-separated features   |
| createdAt   | DateTime | Timestamp                          |

### ER Diagram
```
User ---< UserRoleAssignment >--- Shop
User ---< QueueEntry >--- ShopBranch ---< Shop
Shop ---< ShopBranch
QueueEntry >--- Barber
QueueEntry >--- Service
QueueEntry >--- Appointment
```

(Arrows indicate FK relationships; many-to-many shown with assignment table.)