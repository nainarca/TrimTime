import { gql } from 'apollo-angular';

export const ACTIVE_QUEUE_QUERY = gql`
  query ActiveQueue($shopId: ID!, $barberId: ID) {
    activeQueue(shopId: $shopId, barberId: $barberId) {
      id
      ticketDisplay
      status
      position
      estimatedWaitMins
      entryType
      joinedAt
      barberId
      customerId
      guestName
      guestPhone
    }
  }
`;

export const QUEUE_STATS_QUERY = gql`
  query QueueStats($shopId: ID!, $barberId: ID) {
    queueStats(shopId: $shopId, barberId: $barberId) {
      waitingCount
      servingCount
      avgWaitMins
      servedTodayCount
    }
  }
`;

export const UPDATE_QUEUE_STATUS_MUTATION = gql`
  mutation UpdateQueueStatus($entryId: ID!, $newStatus: QueueStatus!) {
    updateQueueStatus(input: { entryId: $entryId, newStatus: $newStatus }) {
      id
      status
      position
      estimatedWaitMins
    }
  }
`;

export const QUEUE_UPDATED_SUBSCRIPTION = gql`
  subscription QueueUpdated($shopId: ID!, $barberId: ID) {
    queueUpdated(shopId: $shopId, barberId: $barberId) {
      shopId
      barberId
      type
      activeEntries {
        id
        ticketDisplay
        status
        position
        estimatedWaitMins
        entryType
        joinedAt
        barberId
        customerId
        guestName
        guestPhone
      }
    }
  }
`;

