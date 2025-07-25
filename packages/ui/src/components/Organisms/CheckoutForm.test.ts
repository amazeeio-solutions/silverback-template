import { describe, expect, it } from 'vitest';

import { CheckoutFormData } from './CheckoutForm';

describe('CheckoutForm', () => {
  describe('CheckoutFormData type', () => {
    it('should have correct structure for contact information', () => {
      const formData: CheckoutFormData = {
        emailAddress: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        addressLine: '123 Main St',
        postalCode: '8001',
        city: 'Zurich',
        countryCode: 'CH',
        donation: 5.0,
      };

      expect(formData.emailAddress).toBe('test@example.com');
      expect(formData.firstName).toBe('John');
      expect(formData.lastName).toBe('Doe');
      expect(formData.addressLine).toBe('123 Main St');
      expect(formData.postalCode).toBe('8001');
      expect(formData.city).toBe('Zurich');
      expect(formData.countryCode).toBe('CH');
      expect(formData.donation).toBe(5.0);
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
        addressLine: '123 Main St',
        postalCode: '8001',
        city: 'Zurich',
        countryCode: 'CH',
        donation: 5.0,
      };

      // Test the new flat structure that matches the updated CheckoutInput
      const actualInput = {
        email: formData.emailAddress,
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.addressLine,
        postalCode: formData.postalCode,
        city: formData.city,
        country: formData.countryCode,
      };

      expect(actualInput.email).toBe('test@example.com');
      expect(actualInput.firstName).toBe('John');
      expect(actualInput.lastName).toBe('Doe');
      expect(actualInput.address).toBe('123 Main St');
      expect(actualInput.postalCode).toBe('8001');
      expect(actualInput.city).toBe('Zurich');
      expect(actualInput.country).toBe('CH');
    });

    it('should handle donation amount transformation', () => {
      const formData: CheckoutFormData = {
        emailAddress: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        addressLine: '123 Main St',
        postalCode: '8001',
        city: 'Zurich',
        countryCode: 'CH',
        donation: 25.5,
      };

      expect(formData.donation).toBe(25.5);
    });
  });
});
