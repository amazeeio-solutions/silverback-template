import gql from 'noop-tag';
import { describe, expect, it } from 'vitest';

import { fetch } from '../lib.js';

describe('Donation System', () => {
  describe('BlockDonation Integration', () => {
    it('verifies BlockDonation is included in PageContent union', async () => {
      const result = await fetch(gql`
        {
          __type(name: "PageContent") {
            name
            kind
            possibleTypes {
              name
            }
          }
        }
      `);
      expect(result.data.__type.possibleTypes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'BlockDonation' }),
        ]),
      );
    });

    it('verifies BlockDonation is included in CommonContent union', async () => {
      const result = await fetch(gql`
        {
          __type(name: "CommonContent") {
            name
            kind
            possibleTypes {
              name
            }
          }
        }
      `);
      expect(result.data.__type.possibleTypes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'BlockDonation' }),
        ]),
      );
    });

    it('verifies BlockDonation schema structure', async () => {
      const result = await fetch(gql`
        {
          __type(name: "BlockDonation") {
            name
            fields {
              name
              type {
                name
                kind
                ofType {
                  name
                  kind
                }
              }
            }
          }
        }
      `);

      const fields = result.data.__type.fields;
      const fieldNames = fields.map((field: { name: string }) => field.name);

      expect(fieldNames).toContain('heading');
      expect(fieldNames).toContain('description');
      expect(fieldNames).toContain('presetAmounts');
      expect(fieldNames).toContain('donationType');
      expect(fieldNames).toContain('ctaText');
      expect(fieldNames).toContain('successUrl');
      expect(fieldNames).toContain('image');
    });

    it('resolves donation block data correctly', async () => {
      const result = await fetch(gql`
        {
          page(path: "/french/don") {
            content {
              __typename
              ... on BlockDonation {
                heading
                description
                presetAmounts
                donationType
                ctaText
                successUrl
              }
            }
          }
        }
      `);

      const donationBlock = result.data.page.content.find(
        (block: { __typename: string }) => block.__typename === 'BlockDonation',
      );

      expect(donationBlock).toBeDefined();
      expect(donationBlock.heading).toBe('Soutenez Notre Cause');
      expect(donationBlock.presetAmounts).toEqual([25, 50, 100, 250]);
      expect(donationBlock.donationType).toBe('general');
      expect(donationBlock.ctaText).toBe('Faites un don maintenant');
    });
  });

  describe('Mutation Integration Tests', () => {
    it('processes a successful one-time GENERAL donation', async () => {
      const result = await fetch(gql`
        mutation {
          processDonation(
            input: {
              amount: 50.0
              donationType: GENERAL
              frequency: ONCE
              email: "donor@example.com"
              firstName: "Jane"
              lastName: "Doe"
              message: "Happy to support your cause"
            }
          ) {
            donation {
              id
              donationNumber
              amount
              donationType
              frequency
              status
              email
              firstName
              lastName
              message
              anonymous
            }
            errors {
              message
              key
              field
            }
            paymentRedirectUrl
          }
        }
      `);

      expect(result.data.processDonation.donation).toBeDefined();
      expect(result.data.processDonation.donation.amount).toBe(50);
      expect(result.data.processDonation.donation.donationType).toBe('GENERAL');
      expect(result.data.processDonation.donation.frequency).toBe('ONCE');
      expect(result.data.processDonation.donation.email).toBe(
        'donor@example.com',
      );
      expect(result.data.processDonation.donation.firstName).toBe('Jane');
      expect(result.data.processDonation.donation.lastName).toBe('Doe');
      expect(result.data.processDonation.donation.message).toBe(
        'Happy to support your cause',
      );
      expect(result.data.processDonation.donation.anonymous).toBe(false);
      expect(result.data.processDonation.errors).toBeNull();
      expect(result.data.processDonation.paymentRedirectUrl).toContain(
        'https://payment.example.com/redirect/',
      );
    });

    it('processes a monthly PROJECT donation with address', async () => {
      const result = await fetch(gql`
        mutation {
          processDonation(
            input: {
              amount: 25.0
              donationType: PROJECT
              frequency: MONTHLY
              email: "monthly.donor@example.com"
              firstName: "John"
              lastName: "Smith"
              address: "Musterstrasse 123"
              city: "Zürich"
              postalCode: "8001"
              country: "CH"
            }
          ) {
            donation {
              id
              donationNumber
              amount
              donationType
              frequency
              status
              email
              firstName
              lastName
              anonymous
            }
            errors {
              message
              key
              field
            }
            paymentRedirectUrl
          }
        }
      `);

      expect(result.data.processDonation.donation).toBeDefined();
      expect(result.data.processDonation.donation.amount).toBe(25);
      expect(result.data.processDonation.donation.donationType).toBe('PROJECT');
      expect(result.data.processDonation.donation.frequency).toBe('MONTHLY');
      expect(result.data.processDonation.donation.email).toBe(
        'monthly.donor@example.com',
      );
      expect(result.data.processDonation.donation.firstName).toBe('John');
      expect(result.data.processDonation.donation.lastName).toBe('Smith');
      expect(result.data.processDonation.errors).toBeNull();
    });

    it('processes an anonymous EMERGENCY donation', async () => {
      const result = await fetch(gql`
        mutation {
          processDonation(
            input: {
              amount: 100.0
              donationType: EMERGENCY
              frequency: ONCE
              email: "anonymous@example.com"
              firstName: "Anonymous"
              lastName: "Donor"
              anonymous: true
            }
          ) {
            donation {
              id
              donationNumber
              amount
              donationType
              frequency
              email
              firstName
              lastName
              anonymous
            }
            errors {
              message
              key
              field
            }
          }
        }
      `);

      expect(result.data.processDonation.donation).toBeDefined();
      expect(result.data.processDonation.donation.amount).toBe(100);
      expect(result.data.processDonation.donation.donationType).toBe(
        'EMERGENCY',
      );
      expect(result.data.processDonation.donation.frequency).toBe('ONCE');
      expect(result.data.processDonation.donation.anonymous).toBe(true);
      expect(result.data.processDonation.errors).toBeNull();
    });

    it('handles donation with invalid email address', async () => {
      const result = await fetch(gql`
        mutation {
          processDonation(
            input: {
              amount: 50.0
              donationType: GENERAL
              frequency: ONCE
              email: "invalid-email"
              firstName: "Test"
              lastName: "User"
            }
          ) {
            donation {
              id
            }
            errors {
              message
              key
              field
            }
          }
        }
      `);

      expect(result.data.processDonation.donation).toBeNull();
      expect(result.data.processDonation.errors).toBeDefined();
      expect(result.data.processDonation.errors.length).toBeGreaterThan(0);
      expect(result.data.processDonation.errors[0].field).toBe('email');
      expect(result.data.processDonation.errors[0].key).toBe('invalid_email');
    });

    it('handles donation with zero amount', async () => {
      const result = await fetch(gql`
        mutation {
          processDonation(
            input: {
              amount: 0.0
              donationType: GENERAL
              frequency: ONCE
              email: "test@example.com"
              firstName: "Test"
              lastName: "User"
            }
          ) {
            donation {
              id
            }
            errors {
              message
              key
              field
            }
          }
        }
      `);

      expect(result.data.processDonation.donation).toBeNull();
      expect(result.data.processDonation.errors).toBeDefined();
      expect(result.data.processDonation.errors[0].field).toBe('amount');
      expect(result.data.processDonation.errors[0].key).toBe('invalid_amount');
    });

    it('handles donation with missing required fields', async () => {
      const result = await fetch(gql`
        mutation {
          processDonation(
            input: {
              amount: 50.0
              donationType: GENERAL
              frequency: ONCE
              email: ""
              firstName: ""
              lastName: ""
            }
          ) {
            donation {
              id
            }
            errors {
              message
              key
              field
            }
          }
        }
      `);

      expect(result.data.processDonation.donation).toBeNull();
      expect(result.data.processDonation.errors).toBeDefined();
      expect(result.data.processDonation.errors.length).toBe(3);

      const errorFields = result.data.processDonation.errors.map(
        (error: { field: string }) => error.field,
      );
      expect(errorFields).toContain('email');
      expect(errorFields).toContain('firstName');
      expect(errorFields).toContain('lastName');
    });

    it('handles donation with international characters', async () => {
      const result = await fetch(gql`
        mutation {
          processDonation(
            input: {
              amount: 150.0
              donationType: PROJECT
              frequency: QUARTERLY
              email: "intl.donor@example.com"
              firstName: "François"
              lastName: "Müller-Åström"
              message: "Merci beaucoup pour votre travail fantastique! 谢谢你们的工作。"
              address: "Rue de la Paix 123"
              city: "Genève"
              postalCode: "1201"
              country: "CH"
            }
          ) {
            donation {
              id
              amount
              donationType
              frequency
              firstName
              lastName
              message
            }
            errors {
              message
              key
              field
            }
          }
        }
      `);

      expect(result.data.processDonation.donation).toBeDefined();
      expect(result.data.processDonation.donation.amount).toBe(150);
      expect(result.data.processDonation.donation.firstName).toBe('François');
      expect(result.data.processDonation.donation.lastName).toBe(
        'Müller-Åström',
      );
      expect(result.data.processDonation.donation.message).toContain(
        'Merci beaucoup',
      );
      expect(result.data.processDonation.errors).toBeNull();
    });

    it('handles very small decimal amounts', async () => {
      const result = await fetch(gql`
        mutation {
          processDonation(
            input: {
              amount: 0.01
              donationType: GENERAL
              frequency: ONCE
              email: "penny@example.com"
              firstName: "Penny"
              lastName: "Donor"
            }
          ) {
            donation {
              id
              amount
              donationType
              frequency
            }
            errors {
              message
              key
              field
            }
          }
        }
      `);

      expect(result.data.processDonation.donation).toBeDefined();
      expect(result.data.processDonation.donation.amount).toBe(0.01);
      expect(result.data.processDonation.errors).toBeNull();
    });

    it('handles large donation amounts', async () => {
      const result = await fetch(gql`
        mutation {
          processDonation(
            input: {
              amount: 10000.0
              donationType: GENERAL
              frequency: ONCE
              email: "bigdonor@example.com"
              firstName: "Max"
              lastName: "Generous"
              message: "Large contribution for your cause"
            }
          ) {
            donation {
              id
              amount
              donationType
              frequency
              message
            }
            errors {
              message
              key
              field
            }
          }
        }
      `);

      expect(result.data.processDonation.donation).toBeDefined();
      expect(result.data.processDonation.donation.amount).toBe(10000);
      expect(result.data.processDonation.donation.message).toBe(
        'Large contribution for your cause',
      );
      expect(result.data.processDonation.errors).toBeNull();
    });
  });

  describe('Multi-language Support', () => {
    it('handles donation processing with German locale context', async () => {
      const result = await fetch(gql`
        mutation {
          processDonation(
            input: {
              amount: 75.0
              donationType: MEMBERSHIP
              frequency: YEARLY
              email: "german.donor@example.com"
              firstName: "Hans"
              lastName: "Müller"
              message: "Gerne unterstütze ich Ihre Organisation"
            }
          ) {
            donation {
              donationNumber
              amount
              donationType
              frequency
              firstName
              lastName
              message
            }
            errors {
              message
              key
              field
            }
          }
        }
      `);

      expect(result.data.processDonation.donation).toBeDefined();
      expect(result.data.processDonation.donation.amount).toBe(75);
      expect(result.data.processDonation.donation.donationType).toBe(
        'MEMBERSHIP',
      );
      expect(result.data.processDonation.donation.frequency).toBe('YEARLY');
      expect(result.data.processDonation.donation.firstName).toBe('Hans');
      expect(result.data.processDonation.donation.lastName).toBe('Müller');
      expect(result.data.processDonation.donation.message).toBe(
        'Gerne unterstütze ich Ihre Organisation',
      );
      expect(result.data.processDonation.errors).toBeNull();
    });
  });
});
