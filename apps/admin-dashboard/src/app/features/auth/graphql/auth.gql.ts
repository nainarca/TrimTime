import { gql } from 'apollo-angular';

export const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!, $role: String) {
    login(input: { username: $username, password: $password, role: $role }) {
      accessToken
      refreshToken
      userId
      isNewUser
    }
  }
`;

