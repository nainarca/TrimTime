# Queue Engine Design

The queue subsystem is responsible for managing customer flow in real time. It lives mostly in the `queue` NestJS module and the `@trimtime/queue-engine` library.

## Customer queue flow

1. Customer (or guest) submits a request via mobile/QR or kiosk.
2. `joinQueue` service validates shop, branch, and optional barber.
3. Redis counter generates a sequential ticket number per shop per day.
4. A `QueueEntry` record is created with status `WAITING`.
5. `recalculateQueue` is invoked to sort entries, assign positions, and compute EWT.
6. Updated queue state is published over GraphQL subscription.

## Ticket number generation

- Redis key pattern: `ticketCounter:${shopId}:${YYYY-MM-DD}`.
- `INCR` command is used; first increment sets a TTL of 48h.
- `formatTicket` (in queue-engine lib) turns the integer into a string like `A001`.

## Estimated wait time (EWT) calculation

- After new entry or status change, `recalculateQueue` gathers raw entries.
- Sorting rules (priority, joinedAt) executed by `sortQueueEntries` from the queue-engine lib.
- `assignPositions` returns a map of entry IDs to numeric positions.
- Average service duration is fetched from the barber record or defaulted to 20 minutes.
- `calculateEwt` computes estimated minutes using current serving time, position, and buffer percent.
- Each entry is updated in the database with new position and `estimatedWaitMins`.

## Queue position updates

Positions are recalculated on:

- New join requests.
- Status transitions (CALLED, SERVING, SERVED, LEFT, NO_SHOW).
- Customer leave actions.

The results (position, EWT) are broadcast via the `queueUpdated` subscription.

## Queue status transitions

Valid states are enforced by helper functions (`isValidTransition`, `isTerminalStatus`). Typical flow:

```
WAITING → CALLED → SERVING → SERVED
          ↘ LEFT / NO_SHOW
```

Timestamps (`calledAt`, `servingAt`, etc.) are recorded at each step.

## Redis usage for queue counters

- Ticket counters: per-day keys as described above.
- TTL ensures counters reset automatically.
- Redis also serves as the PubSub store (via `pubSub` instance) for real-time events.

## Real-time queue

GraphQL subscriptions (`queueUpdated`) provide push notifications to clients. The payload includes:

```ts
interface QueueUpdateEvent {
  shopId: string;
  barberId: string | null;
  type: 'POSITION_UPDATE' | ...;
  entry: QueueEntry | null;
  activeEntries: QueueEntry[];
}
```

Clients filter by shop and barber to receive only relevant updates.

In summary, the queue engine combines Redis atomic counters, database-backed records, and library utilities to maintain accurate, scalable queue state and broadcast changes live.