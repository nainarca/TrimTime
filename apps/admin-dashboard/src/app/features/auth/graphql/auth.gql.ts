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

export const REQUEST_OTP_MUTATION = gql`
  mutation RequestOtp($phone: String!) {
    requestOtp(input: { phone: $phone }) {
      success
      message
      expiresIn
      otp
    }
  }
`;

export const VERIFY_OTP_MUTATION = gql`
  mutation VerifyOtp($phone: String!, $otp: String!) {
    verifyOtp(input: { phone: $phone, otp: $otp }) {
      accessToken
      refreshToken
      userId
      isNewUser
    }
  }
`;

