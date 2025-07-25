import { Locale } from '@custom/schema';
import type { Response } from 'express';

import { CartService } from '../services/cart.service.js';
import type { CustomRequest } from '../types.js';

// Initialize the cart service
const cartService = new CartService();

// Cleanup expired sessions every 10 minutes
setInterval(
  () => {
    cartService.cleanupExpiredSessions();
  },
  10 * 60 * 1000,
);

// GraphQL Context type
export interface Context {
  req: CustomRequest;
  res: Response;
  sessionId?: string;
}

// Helper to get session ID from request
function getSessionId(context: Context): string | undefined {
  return context.sessionId || context.req.session?.guestId;
}

// Helper to extract language from Accept-Language header
function extractLanguageFromHeaders(acceptLanguage: string): string {
  // Parse Accept-Language header (e.g., "en-US,en;q=0.9,de;q=0.8")
  const languages = acceptLanguage
    .split(',')
    .map((lang) => {
      const [code, qValue] = lang.trim().split(';q=');
      return {
        code: code.toLowerCase(),
        quality: qValue ? parseFloat(qValue) : 1.0,
      };
    })
    .sort((a, b) => b.quality - a.quality);

  // Map common language codes to our supported Locale values
  for (const lang of languages) {
    if (lang.code.startsWith('de')) {
      return Locale.De;
    }
    if (lang.code.startsWith('fr')) {
      return Locale.French;
    }
    if (lang.code.startsWith('it')) {
      return Locale.It;
    }
    if (lang.code.startsWith('en')) {
      return Locale.En;
    }
  }

  // Default to English
  return Locale.En;
}

// Resolvers
export const resolvers = {
  Query: {
    cart: async (_: unknown, __: unknown, context: Context) => {
      const sessionId = getSessionId(context);

      if (!sessionId) {
        // Return empty cart for unauthenticated requests
        return {
          items: [],
          totalItems: 0,
          totalPrice: 0,
        };
      }

      try {
        return cartService.getCart(sessionId);
      } catch {
        // Return empty cart if session is invalid
        return {
          items: [],
          totalItems: 0,
          totalPrice: 0,
        };
      }
    },
  },

  Mutation: {
    loginAsGuest: (_: unknown, __: unknown, context: Context) => {
      const guestUser = cartService.createGuestSession();

      // Store session ID in the session
      if (context.req.session) {
        context.req.session.guestId = guestUser._id;
      }

      return guestUser;
    },

    addToCart: async (
      _: unknown,
      args: { input: { productId: string; quantity?: number } },
      context: Context,
    ) => {
      const sessionId = getSessionId(context);

      if (!sessionId) {
        throw new Error('Authentication required');
      }

      try {
        const cart = await cartService.addToCart(
          sessionId,
          args.input.productId,
          args.input.quantity || 1,
        );
        return {
          cart,
          errors: [],
        };
      } catch (error: unknown) {
        return {
          cart: null,
          errors: [
            {
              message: error instanceof Error ? error.message : 'Unknown error',
              key: 'cart',
              field: null,
            },
          ],
        };
      }
    },

    updateCartItem: async (
      _: unknown,
      args: { input: { itemId: string; quantity: number } },
      context: Context,
    ) => {
      const sessionId = getSessionId(context);

      if (!sessionId) {
        throw new Error('Authentication required');
      }

      try {
        const cart = await cartService.updateCartItem(
          sessionId,
          args.input.itemId,
          args.input.quantity,
        );
        return {
          cart,
          errors: [],
        };
      } catch (error: unknown) {
        return {
          cart: null,
          errors: [
            {
              message: error instanceof Error ? error.message : 'Unknown error',
              key: 'cart',
              field: null,
            },
          ],
        };
      }
    },

    removeFromCart: async (
      _: unknown,
      args: { productId: string },
      context: Context,
    ) => {
      const sessionId = getSessionId(context);

      if (!sessionId) {
        throw new Error('Authentication required');
      }

      try {
        const cart = cartService.removeFromCart(sessionId, args.productId);
        return {
          cart,
          errors: [],
        };
      } catch (error: unknown) {
        return {
          cart: null,
          errors: [
            {
              message: error instanceof Error ? error.message : 'Unknown error',
              key: 'cart',
              field: null,
            },
          ],
        };
      }
    },

    clearCart: async (_: unknown, __: unknown, context: Context) => {
      const sessionId = getSessionId(context);

      if (!sessionId) {
        throw new Error('Authentication required');
      }

      try {
        const cart = cartService.clearCart(sessionId);
        return {
          cart,
          errors: [],
        };
      } catch (error: unknown) {
        return {
          cart: null,
          errors: [
            {
              message: error instanceof Error ? error.message : 'Unknown error',
              key: 'cart',
              field: null,
            },
          ],
        };
      }
    },

    checkout: async (
      _: unknown,
      args: {
        input: {
          email: string;
          firstName: string;
          lastName: string;
          address?: string;
          city?: string;
          postalCode?: string;
          country?: string;
        };
      },
      context: Context,
    ) => {
      const sessionId = getSessionId(context);

      if (!sessionId) {
        throw new Error('Authentication required');
      }

      try {
        // Extract user language from request headers or default to 'en'
        const acceptLanguage = context.req.headers['accept-language'] || '';
        const userLanguage = extractLanguageFromHeaders(acceptLanguage);

        const result = await cartService.processCheckout(
          sessionId,
          userLanguage,
        );
        return {
          order: result.order,
          errors: [],
          paymentRedirectUrl: result.paymentRedirectUrl,
        };
      } catch (error: unknown) {
        return {
          order: null,
          errors: [
            {
              message: error instanceof Error ? error.message : 'Unknown error',
              key: 'checkout',
              field: null,
            },
          ],
          paymentRedirectUrl: null,
        };
      }
    },
  },
};
