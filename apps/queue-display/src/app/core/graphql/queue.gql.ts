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
