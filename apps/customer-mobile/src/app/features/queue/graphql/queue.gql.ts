import { gql } from 'apollo-angular';

export const SHOP_BY_SLUG_QUERY = gql`
  query ShopBySlug($slug: String!) {
    shopBySlug(slug: $slug) {
      id
      name
      slug
      description
      country
      timezone
      currency
      isActive
      isVerified
    }
  }
`;

export const SHOP_BRANCHES_BY_SLUG_QUERY = gql`
  query ShopBranchesBySlug($slug: String!) {
    shopBranchesBySlug(slug: $slug) {
      id
      name
      address
      city
      isMain
      isActive
    }
  }
`;

export const JOIN_QUEUE_MUTATION = gql`
  mutation JoinQueue($input: JoinQueueInput!) {
    joinQueue(input: $input) {
      id
      ticketDisplay
      status
      position
      estimatedWaitMins
      joinedAt
      shopId
      branchId
      guestName
      guestPhone
    }
  }
`;

export const QUEUE_ENTRY_QUERY = gql`
  query QueueEntry($entryId: ID!) {
    queueEntry(entryId: $entryId) {
      id
      shopId
      branchId
      ticketDisplay
      status
      position
      estimatedWaitMins
      joinedAt
      guestName
      guestPhone
    }
  }
`;

export const QUEUE_UPDATED_SUBSCRIPTION = gql`
  subscription QueueUpdated($shopId: ID!, $barberId: ID) {
    queueUpdated(shopId: $shopId, barberId: $barberId) {
      type
      entry {
        id
        status
        position
        estimatedWaitMins
      }
      activeEntries {
        id
        ticketDisplay
        status
        position
        estimatedWaitMins
      }
    }
  }
`;
