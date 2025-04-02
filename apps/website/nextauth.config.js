const AUTH_DRUPAL_URL = process.env.AUTH_DRUPAL_URL || 'http://127.0.0.1:8888';

/** @type {import("next-auth").NextAuthOptions} */
export const authConfig = {
  providers: [
    // Drupal provider.
    // Other providers can be added here (e.g. Google, Keycloak).
    {
      // Client ID and secret are set in the Drupal Consumer.
      clientId: process.env.AUTH_DRUPAL_ID || 'website',
      clientSecret: process.env.AUTH_DRUPAL_SECRET || 'website',
      id: 'drupal',
      name: 'Drupal',
      type: 'oauth',
      // Language prefix is added to prevent 301
      // that will not be handled by NextAuth.
      authorization: {
        url: `${AUTH_DRUPAL_URL}/en/oauth/authorize`,
        params: {
          scope: 'authenticated',
        },
      },
      token: `${AUTH_DRUPAL_URL}/en/oauth/token`,
      userinfo: {
        // Additional userinfo can be fetched with an extra request
        // using the access token.
        url: `${AUTH_DRUPAL_URL}/en/oauth/userinfo`,
      },
      profile(profile, tokens) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          tokens: tokens,
        };
      },
    },
  ],
  // Persist the user object in the session.
  // @todo use the refresh token
  // https://github.com/nextauthjs/next-auth-refresh-token-example/blob/main/pages/api/auth/%5B...nextauth%5D.js
  callbacks: {
    async jwt({ token, user }) {
      return { ...token, ...user };
    },
    async session({ session, token }) {
      session.user = token;
      return session;
    },
  },
  secret: 'banana',
  theme: {
    logo: 'https://www.amazeelabs.com/images/icon.png',
    colorScheme: 'light',
    brandColor: '#951B81',
  },
};
