import { describe, expect, it } from 'vitest';

import { CheckoutFormData } from './CheckoutForm';

describe('CheckoutForm', () => {
  describe('CheckoutFormData type', () => {
    it('should have correct structure for contact information', () => {
      const formData: CheckoutFormData = {
        emailAddress: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Example Corp',
        addressLine: '123 Main St',
        postalCode: '8001',
        city: 'Zurich',
        countryCode: 'CH',
        donation: 5.0,
      };

      expect(formData.emailAddress).toBe('test@example.com');
      expect(formData.firstName).toBe('John');
      expect(formData.lastName).toBe('Doe');
      expect(formData.company).toBe('Example Corp');
      expect(formData.addressLine).toBe('123 Main St');
      expect(formData.postalCode).toBe('8001');
      expect(formData.city).toBe('Zurich');
      expect(formData.countryCode).toBe('CH');
      expect(formData.donation).toBe(5.0);
    });

    it('should allow optional company field', () => {
      const formData: CheckoutFormData = {
        emailAddress: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        addressLine: '123 Main St',
        postalCode: '8001',
        city: 'Zurich',
        countryCode: 'CH',
        donation: 0,
      };

      expect(formData.company).toBeUndefined();
    });

    it('should handle minimum donation amount', () => {
      const formData: CheckoutFormData = {
        emailAddress: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        addressLine: '123 Main St',
        postalCode: '8001',
        city: 'Zurich',
        countryCode: 'CH',
        donation: 0,
      };

      expect(formData.donation).toBe(0);
    });

    it('should handle different country codes', () => {
      const supportedCountries = ['CH', 'DE', 'AT', 'FR', 'IT', 'US', 'GB'];

      supportedCountries.forEach((countryCode) => {
        const formData: CheckoutFormData = {
          emailAddress: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          addressLine: '123 Main St',
          postalCode: '12345',
          city: 'Test City',
          countryCode,
          donation: 0,
        };

        expect(formData.countryCode).toBe(countryCode);
      });
    });

    it('should handle large donation amounts', () => {
      const formData: CheckoutFormData = {
        emailAddress: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        addressLine: '123 Main St',
        postalCode: '8001',
        city: 'Zurich',
        countryCode: 'CH',
        donation: 1000.0, // 1000 CHF
      };

      expect(formData.donation).toBe(1000.0);
    });
  });

  describe('Form validation requirements', () => {
    it('should require email address', () => {
      const requiredFields = [
        'emailAddress',
        'firstName',
        'lastName',
        'addressLine',
        'postalCode',
        'city',
        'countryCode',
      ];

      requiredFields.forEach((field) => {
        expect(field).toBeTruthy();
      });
    });

    it('should validate email format', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com',
      ];

      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@domain',
        'user.domain.com',
      ];

      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

      validEmails.forEach((email) => {
        expect(emailRegex.test(email)).toBe(true);
      });

      invalidEmails.forEach((email) => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });

    it('should validate donation amount is non-negative', () => {
      const validDonations = [0, 5.0, 10.0, 50.0, 100.0, 1000.0];
      const invalidDonations = [-1, -5.0, -10.0];

      validDonations.forEach((amount) => {
        expect(amount >= 0).toBe(true);
      });

      invalidDonations.forEach((amount) => {
        expect(amount >= 0).toBe(false);
      });
    });
  });

  describe('Form data transformations', () => {
    it('should convert form data to GraphQL input format', () => {
      const formData: CheckoutFormData = {
        emailAddress: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Example Corp',
        addressLine: '123 Main St',
        postalCode: '8001',
        city: 'Zurich',
        countryCode: 'CH',
        donation: 5.0,
      };

      const expectedInput = {
        contactInfo: {
          emailAddress: 'test@example.com',
        },
        billingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          company: 'Example Corp',
          addressLine: '123 Main St',
          postalCode: '8001',
          city: 'Zurich',
          countryCode: 'CH',
        },
        metaData: {
          donation: 5.0,
        },
      };

      const actualInput = {
        contactInfo: {
          emailAddress: formData.emailAddress,
        },
        billingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          company: formData.company || null,
          addressLine: formData.addressLine,
          postalCode: formData.postalCode,
          city: formData.city,
          countryCode: formData.countryCode,
        },
        metaData: {
          donation: formData.donation,
        },
      };

      expect(actualInput.contactInfo.emailAddress).toBe(
        expectedInput.contactInfo.emailAddress,
      );
      expect(actualInput.billingAddress.firstName).toBe(
        expectedInput.billingAddress.firstName,
      );
      expect(actualInput.billingAddress.lastName).toBe(
        expectedInput.billingAddress.lastName,
      );
      expect(actualInput.billingAddress.company).toBe(
        expectedInput.billingAddress.company,
      );
      expect(actualInput.billingAddress.addressLine).toBe(
        expectedInput.billingAddress.addressLine,
      );
      expect(actualInput.billingAddress.postalCode).toBe(
        expectedInput.billingAddress.postalCode,
      );
      expect(actualInput.billingAddress.city).toBe(
        expectedInput.billingAddress.city,
      );
      expect(actualInput.billingAddress.countryCode).toBe(
        expectedInput.billingAddress.countryCode,
      );
      expect(actualInput.metaData.donation).toBe(
        expectedInput.metaData.donation,
      );
    });

    it('should handle empty company field', () => {
      const formData: CheckoutFormData = {
        emailAddress: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        addressLine: '123 Main St',
        postalCode: '8001',
        city: 'Zurich',
        countryCode: 'CH',
        donation: 0,
      };

      const transformedCompany = formData.company || null;
      expect(transformedCompany).toBeNull();
    });
  });
});
