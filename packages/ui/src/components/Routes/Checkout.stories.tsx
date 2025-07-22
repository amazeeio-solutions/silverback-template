import { CartQuery, CheckoutMutation, FrameQuery } from '@custom/schema';
import Portrait from '@stories/portrait.jpg?as=metadata';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';

import { image } from '../../helpers/image';
import { Default as FrameStory } from '../Routes/Frame.stories';
import { Checkout } from './Checkout';

const meta: Meta<typeof Checkout> = {
  title: 'Routes/Checkout',
  component: Checkout,
  parameters: {
    layout: 'fullscreen',
    executors: {
      [FrameQuery]: FrameStory.parameters.executors[FrameQuery],
      [CartQuery]: () => {},
      [CheckoutMutation]: () => {},
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Checkout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    executors: {
      [CartQuery]: {
        cart: {
          items: [
            {
              id: '1',
              title: 'Premium Wireless Headphones',
              price: 199.99,
              quantity: 2,
              sku: 'WH-001',
              maxStock: 10,
              teaserImage: {
                alt: 'Premium Wireless Headphones',
                source: image(Portrait, { width: 200, height: 200 }),
              },
            },
            {
              id: '2',
              title: 'Smart Watch',
              price: 299.99,
              quantity: 1,
              sku: 'SW-002',
              maxStock: 5,
              teaserImage: {
                alt: 'Smart Watch',
                source: image(Portrait, { width: 200, height: 200 }),
              },
            },
          ],
          totalItems: 3,
          totalPrice: 699.97,
        },
      },
      [CheckoutMutation]: async (variables: unknown) => {
        action('CheckoutMutation')(variables);
        return {
          checkout: {
            order: {
              id: '1',
              orderNumber: 'ORD-2024-001',
              status: 'confirmed',
              totalAmount: 699.97,
              items: [
                {
                  id: '1',
                  title: 'Premium Wireless Headphones',
                  price: 199.99,
                  quantity: 2,
                  sku: 'WH-001',
                },
                {
                  id: '2',
                  title: 'Smart Watch',
                  price: 299.99,
                  quantity: 1,
                  sku: 'SW-002',
                },
              ],
            },
            errors: [],
          },
        };
      },
    } as const,
  },
};

export const EmptyCart: Story = {
  parameters: {
    executors: {
      [CartQuery]: {
        cart: {
          items: [],
          totalItems: 0,
          totalPrice: 0,
        },
      },
      [CheckoutMutation]: async (variables: unknown) => {
        action('CheckoutMutation')(variables);
        return {
          checkout: {
            order: null,
            errors: [{ message: 'Cart is empty' }],
          },
        };
      },
    } as const,
  },
};

export const SingleItem: Story = {
  parameters: {
    executors: {
      [CartQuery]: {
        cart: {
          items: [
            {
              id: '1',
              title: 'Premium Wireless Headphones',
              price: 199.99,
              quantity: 1,
              sku: 'WH-001',
              maxStock: 10,
              teaserImage: {
                alt: 'Premium Wireless Headphones',
                source: image(Portrait, { width: 200, height: 200 }),
              },
            },
          ],
          totalItems: 1,
          totalPrice: 199.99,
        },
      },
      [CheckoutMutation]: async (variables: unknown) => {
        action('CheckoutMutation')(variables);
        return {
          checkout: {
            order: {
              id: '1',
              orderNumber: 'ORD-2024-001',
              status: 'confirmed',
              totalAmount: 199.99,
              items: [
                {
                  id: '1',
                  title: 'Premium Wireless Headphones',
                  price: 199.99,
                  quantity: 1,
                  sku: 'WH-001',
                },
              ],
            },
            errors: [],
          },
        };
      },
    } as const,
  },
};

export const ItemsWithoutImages: Story = {
  parameters: {
    executors: {
      [CartQuery]: {
        cart: {
          items: [
            {
              id: '1',
              title: 'Digital Download - Software License',
              price: 49.99,
              quantity: 3,
              sku: 'DL-001',
              maxStock: 999,
            },
            {
              id: '2',
              title: 'Online Course Access',
              price: 99.99,
              quantity: 1,
              sku: 'OC-002',
              maxStock: 999,
            },
          ],
          totalItems: 4,
          totalPrice: 249.96,
        },
      },
      [CheckoutMutation]: async (variables: unknown) => {
        action('CheckoutMutation')(variables);
        return {
          checkout: {
            order: {
              id: '1',
              orderNumber: 'ORD-2024-001',
              status: 'confirmed',
              totalAmount: 249.96,
              items: [
                {
                  id: '1',
                  title: 'Digital Download - Software License',
                  price: 49.99,
                  quantity: 3,
                  sku: 'DL-001',
                },
                {
                  id: '2',
                  title: 'Online Course Access',
                  price: 99.99,
                  quantity: 1,
                  sku: 'OC-002',
                },
              ],
            },
            errors: [],
          },
        };
      },
    } as const,
  },
};

export const HighValueOrder: Story = {
  parameters: {
    executors: {
      [CartQuery]: {
        cart: {
          items: [
            {
              id: '1',
              title: 'Professional Camera Equipment',
              price: 2999.99,
              quantity: 2,
              sku: 'CAM-001',
              maxStock: 3,
              teaserImage: {
                alt: 'Professional Camera Equipment',
                source: image(Portrait, { width: 200, height: 200 }),
              },
            },
            {
              id: '2',
              title: 'High-End Laptop',
              price: 3499.99,
              quantity: 1,
              sku: 'LAP-002',
              maxStock: 2,
              teaserImage: {
                alt: 'High-End Laptop',
                source: image(Portrait, { width: 200, height: 200 }),
              },
            },
          ],
          totalItems: 3,
          totalPrice: 9499.97,
        },
      },
      [CheckoutMutation]: async (variables: unknown) => {
        action('CheckoutMutation')(variables);
        return {
          checkout: {
            order: {
              id: '1',
              orderNumber: 'ORD-2024-001',
              status: 'confirmed',
              totalAmount: 9499.97,
              items: [
                {
                  id: '1',
                  title: 'Professional Camera Equipment',
                  price: 2999.99,
                  quantity: 2,
                  sku: 'CAM-001',
                },
                {
                  id: '2',
                  title: 'High-End Laptop',
                  price: 3499.99,
                  quantity: 1,
                  sku: 'LAP-002',
                },
              ],
            },
            errors: [],
          },
        };
      },
    } as const,
  },
};

export const CheckoutWithError: Story = {
  parameters: {
    executors: {
      [CartQuery]: {
        cart: {
          items: [
            {
              id: '1',
              title: 'Premium Wireless Headphones',
              price: 199.99,
              quantity: 1,
              sku: 'WH-001',
              maxStock: 10,
              teaserImage: {
                alt: 'Premium Wireless Headphones',
                source: image(Portrait, { width: 200, height: 200 }),
              },
            },
          ],
          totalItems: 1,
          totalPrice: 199.99,
        },
      },
      [CheckoutMutation]: async (variables: unknown) => {
        action('CheckoutMutation')(variables);
        return {
          checkout: {
            order: null,
            errors: [
              { message: 'Payment processing failed' },
              { message: 'Please check your payment information' },
            ],
          },
        };
      },
    } as const,
  },
};

export const InteractionTests: Story = {
  parameters: {
    executors: {
      [CartQuery]: {
        cart: {
          items: [
            {
              id: '1',
              title: 'Premium Wireless Headphones',
              price: 199.99,
              quantity: 1,
              sku: 'WH-001',
              maxStock: 10,
              teaserImage: {
                alt: 'Premium Wireless Headphones',
                source: image(Portrait, { width: 200, height: 200 }),
              },
            },
          ],
          totalItems: 1,
          totalPrice: 199.99,
        },
      },
      [CheckoutMutation]: async (variables: unknown) => {
        action('CheckoutMutation')(variables);
        return {
          checkout: {
            order: {
              id: '1',
              orderNumber: 'ORD-2024-001',
              status: 'confirmed',
              totalAmount: 199.99,
              items: [
                {
                  id: '1',
                  title: 'Premium Wireless Headphones',
                  price: 199.99,
                  quantity: 1,
                  sku: 'WH-001',
                },
              ],
            },
            errors: [],
          },
        };
      },
    } as const,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Fill out the checkout form
    const emailInput = canvas.getByLabelText(/email address/i);
    await userEvent.type(emailInput, 'john.doe@example.com');

    const firstNameInput = canvas.getByLabelText(/first name/i);
    await userEvent.type(firstNameInput, 'John');

    const lastNameInput = canvas.getByLabelText(/last name/i);
    await userEvent.type(lastNameInput, 'Doe');

    const addressInput = canvas.getByLabelText(/street address/i);
    await userEvent.type(addressInput, '123 Main Street');

    const postalCodeInput = canvas.getByLabelText(/postal code/i);
    await userEvent.type(postalCodeInput, '8001');

    const cityInput = canvas.getByLabelText(/city/i);
    await userEvent.type(cityInput, 'Zurich');

    // Add a donation
    const donationInput = canvas.getByLabelText(/donation amount/i);
    await userEvent.type(donationInput, '2.50');

    // Test cancel button
    const cancelButton = canvas.getByText(/cancel/i);
    await userEvent.click(cancelButton);

    // Test complete order button
    const completeOrderButton = canvas.getByText(/complete order/i);
    await userEvent.click(completeOrderButton);
  },
};

export const PaymentRedirectScenario: Story = {
  parameters: {
    executors: {
      [CartQuery]: {
        cart: {
          items: [
            {
              id: '1',
              title: 'Premium Wireless Headphones',
              price: 199.99,
              quantity: 1,
              sku: 'WH-001',
              maxStock: 10,
              teaserImage: {
                alt: 'Premium Wireless Headphones',
                source: image(Portrait, { width: 200, height: 200 }),
              },
            },
          ],
          totalItems: 1,
          totalPrice: 199.99,
        },
      },
      [CheckoutMutation]: async (variables: unknown) => {
        action('CheckoutMutation - Payment Redirect')(variables);
        return {
          checkout: {
            order: null,
            errors: [],
            paymentRedirectUrl: 'https://payment-provider.com/checkout/abc123',
          },
        };
      },
    } as const,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Fill out the checkout form with donation requiring payment
    const emailInput = canvas.getByLabelText(/email address/i);
    await userEvent.type(emailInput, 'john.doe@example.com');

    const firstNameInput = canvas.getByLabelText(/first name/i);
    await userEvent.type(firstNameInput, 'John');

    const lastNameInput = canvas.getByLabelText(/last name/i);
    await userEvent.type(lastNameInput, 'Doe');

    const addressInput = canvas.getByLabelText(/street address/i);
    await userEvent.type(addressInput, 'Bahnhofstrasse 1');

    const postalCodeInput = canvas.getByLabelText(/postal code/i);
    await userEvent.type(postalCodeInput, '8001');

    const cityInput = canvas.getByLabelText(/city/i);
    await userEvent.type(cityInput, 'Zurich');

    // Add a significant donation requiring payment
    const donationInput = canvas.getByLabelText(/donation amount/i);
    await userEvent.type(donationInput, '50.00');

    // Submit and expect redirect to payment provider
    const completeOrderButton = canvas.getByText(/complete order/i);
    await userEvent.click(completeOrderButton);
  },
};

export const FreeCheckoutScenario: Story = {
  parameters: {
    executors: {
      [CartQuery]: {
        cart: {
          items: [
            {
              id: '1',
              title: 'Free Educational Brochure',
              price: 0,
              quantity: 1,
              sku: 'EDU-001',
              maxStock: 999,
              teaserImage: {
                alt: 'Educational Brochure',
                source: image(Portrait, { width: 200, height: 200 }),
              },
            },
          ],
          totalItems: 1,
          totalPrice: 0,
        },
      },
      [CheckoutMutation]: async (variables: unknown) => {
        action('CheckoutMutation - Free Checkout')(variables);
        return {
          checkout: {
            order: {
              id: '2',
              orderNumber: 'ORD-2024-FREE-001',
              status: 'confirmed',
              totalAmount: 0,
              items: [
                {
                  id: '1',
                  title: 'Free Educational Brochure',
                  price: 0,
                  quantity: 1,
                  sku: 'EDU-001',
                },
              ],
            },
            errors: [],
            paymentRedirectUrl: null,
          },
        };
      },
    } as const,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Fill out the checkout form for free items
    const emailInput = canvas.getByLabelText(/email address/i);
    await userEvent.type(emailInput, 'jane.doe@example.com');

    const firstNameInput = canvas.getByLabelText(/first name/i);
    await userEvent.type(firstNameInput, 'Jane');

    const lastNameInput = canvas.getByLabelText(/last name/i);
    await userEvent.type(lastNameInput, 'Doe');

    const addressInput = canvas.getByLabelText(/street address/i);
    await userEvent.type(addressInput, 'Musterstrasse 123');

    const postalCodeInput = canvas.getByLabelText(/postal code/i);
    await userEvent.type(postalCodeInput, '3000');

    const cityInput = canvas.getByLabelText(/city/i);
    await userEvent.type(cityInput, 'Bern');

    // No donation for free checkout
    const donationInput = canvas.getByLabelText(/donation amount/i);
    await userEvent.type(donationInput, '0');

    // Submit and expect direct success
    const completeOrderButton = canvas.getByText(/complete order/i);
    await userEvent.click(completeOrderButton);
  },
};
