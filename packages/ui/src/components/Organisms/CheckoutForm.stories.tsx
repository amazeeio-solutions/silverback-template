import { CheckoutMutation } from '@custom/schema';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';

import { CheckoutForm } from './CheckoutForm';

const meta: Meta<typeof CheckoutForm> = {
  title: 'Organisms/CheckoutForm',
  component: CheckoutForm,
  parameters: {
    layout: 'fullscreen',
    executors: {
      [CheckoutMutation]: () => {},
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onSuccess: { action: 'checkout success' },
    onCancel: { action: 'checkout cancel' },
  },
} satisfies Meta<typeof CheckoutForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    executors: {
      [CheckoutMutation]: async (variables: unknown) => {
        action('CheckoutMutation')(variables);
        return {
          checkout: {
            order: {
              id: '1',
              orderNumber: 'ORD-2024-001',
              status: 'confirmed',
              totalAmount: 299.99,
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

export const WithError: Story = {
  args: {},
  parameters: {
    executors: {
      [CheckoutMutation]: async (variables: unknown) => {
        action('CheckoutMutation')(variables);
        return {
          checkout: {
            order: null,
            errors: [
              { message: 'Invalid email address format' },
              { message: 'Postal code is required for selected country' },
            ],
          },
        };
      },
    } as const,
  },
};

export const WithoutCancel: Story = {
  args: {
    onCancel: undefined,
  },
  parameters: {
    executors: {
      [CheckoutMutation]: async (variables: unknown) => {
        action('CheckoutMutation')(variables);
        return {
          checkout: {
            order: {
              id: '1',
              orderNumber: 'ORD-2024-001',
              status: 'confirmed',
              totalAmount: 299.99,
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

export const Loading: Story = {
  args: {},
  parameters: {
    executors: {
      [CheckoutMutation]: async (variables: unknown) => {
        action('CheckoutMutation')(variables);
        // Simulate loading by returning a promise that never resolves
        return new Promise(() => {});
      },
    } as const,
  },
};

export const InteractionTests: Story = {
  parameters: {
    executors: {
      [CheckoutMutation]: async (variables: unknown) => {
        action('CheckoutMutation')(variables);
        return {
          checkout: {
            order: {
              id: '1',
              orderNumber: 'ORD-2024-001',
              status: 'confirmed',
              totalAmount: 299.99,
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

    // Fill out contact information
    const emailInput = canvas.getByLabelText(/email address/i);
    await userEvent.type(emailInput, 'john.doe@example.com');

    // Fill out billing address
    const firstNameInput = canvas.getByLabelText(/first name/i);
    await userEvent.type(firstNameInput, 'John');

    const lastNameInput = canvas.getByLabelText(/last name/i);
    await userEvent.type(lastNameInput, 'Doe');

    const companyInput = canvas.getByLabelText(/company/i);
    await userEvent.type(companyInput, 'Example Corp');

    const addressInput = canvas.getByLabelText(/street address/i);
    await userEvent.type(addressInput, '123 Main Street');

    const postalCodeInput = canvas.getByLabelText(/postal code/i);
    await userEvent.type(postalCodeInput, '8001');

    const cityInput = canvas.getByLabelText(/city/i);
    await userEvent.type(cityInput, 'Zurich');

    const countrySelect = canvas.getByLabelText(/country/i);
    await userEvent.selectOptions(countrySelect, 'CH');

    // Fill out donation
    const donationInput = canvas.getByLabelText(/donation amount/i);
    await userEvent.type(donationInput, '5.00');

    // Test form submission
    const submitButton = canvas.getByText(/complete order/i);
    await userEvent.click(submitButton);
  },
};

export const ValidationTests: Story = {
  parameters: {
    executors: {
      [CheckoutMutation]: async (variables: unknown) => {
        action('CheckoutMutation')(variables);
        return {
          checkout: {
            order: {
              id: '1',
              orderNumber: 'ORD-2024-001',
              status: 'confirmed',
              totalAmount: 299.99,
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

    // Test form validation by trying to submit empty form
    const submitButton = canvas.getByText(/complete order/i);
    await userEvent.click(submitButton);

    // Test invalid email
    const emailInput = canvas.getByLabelText(/email address/i);
    await userEvent.type(emailInput, 'invalid-email');
    await userEvent.click(submitButton);

    // Test negative donation
    const donationInput = canvas.getByLabelText(/donation amount/i);
    await userEvent.type(donationInput, '-1.00');
    await userEvent.click(submitButton);

    // Test cancel button if present
    const cancelButton = canvas.queryByText(/cancel/i);
    if (cancelButton) {
      await userEvent.click(cancelButton);
    }
  },
};
