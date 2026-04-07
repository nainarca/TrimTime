export const environment = {
  production: false,
  apiUrl:     'http://localhost:3000',
  graphqlUrl: 'http://localhost:3000/graphql',
  wsUrl:      'ws://localhost:3000/graphql',
  /**
   * Pre-filled on the login page in dev. Demo `login` ignores password content beyond min length;
   * use seeded users so roles/data match `npx prisma db seed`.
   */
  devLoginDefaults: {
    ADMIN: { username: 'admin@trimtime.app', password: 'demo1234' },
    OWNER: { username: 'owner@demo.trimtime.app', password: 'demo1234' },
    STAFF: { username: 'mike@demo.trimtime.app', password: 'demo1234' },
    /** Matches API demo default when DEV_STATIC_OTP is unset (non-production). */
    CUSTOMER: { phone: '+919900010001', otp: '123456' },
  } as const,
};
