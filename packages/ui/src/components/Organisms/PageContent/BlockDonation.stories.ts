import { DonationType, Markup, Url } from '@custom/schema';
import Landscape from '@stories/landscape.jpg?as=metadata';
import { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';

import { image } from '../../../helpers/image';
import { BlockDonation } from './BlockDonation';

export default {
  component: BlockDonation,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof BlockDonation>;

export const Default = {
  args: {
    heading: 'Support Our Mission',
    description:
      '<p>Your donation helps us provide essential services to those in need. Every contribution makes a real difference in our community.</p>' as Markup,
    presetAmounts: [25, 50, 100, 250],
    donationType: DonationType.General,
    ctaText: 'Donate Now',
    successUrl: 'https://example.com/thank-you' as Url,
  },
} satisfies StoryObj<typeof BlockDonation>;

export const WithImage = {
  args: {
    heading: 'Help Children Access Education',
    description:
      '<p>Support our education program that provides books, supplies, and mentoring to underprivileged children in our community.</p>' as Markup,
    presetAmounts: [20, 50, 100, 200],
    donationType: DonationType.Project,
    ctaText: 'Support Education',
    image: {
      source: image(Landscape, { width: 600, height: 600 }),
      alt: 'Children studying together',
    },
  },
} satisfies StoryObj<typeof BlockDonation>;

export const ProjectDonation = {
  args: {
    heading: 'Build a Community Garden',
    description:
      '<p>Help us create a beautiful community garden where families can grow fresh produce and children can learn about sustainable farming.</p>' as Markup,
    presetAmounts: [15, 35, 75, 150],
    donationType: DonationType.Project,
    ctaText: 'Fund This Project',
    image: {
      source: image(Landscape, { width: 600, height: 600 }),
      alt: 'Community garden with vegetables',
    },
  },
} satisfies StoryObj<typeof BlockDonation>;

export const Minimal = {
  args: {
    heading: 'Quick Support',
    description:
      '<p>Choose from these preset amounts to quickly support our cause.</p>' as Markup,
    presetAmounts: [10, 25, 50],
    donationType: DonationType.General,
    ctaText: 'Contribute',
  },
} satisfies StoryObj<typeof BlockDonation>;

export const LargeAmounts = {
  args: {
    heading: 'Major Donor Program',
    description:
      '<p>Join our major donor program and make a significant impact with your generous contribution.</p>' as Markup,
    presetAmounts: [500, 1000, 2500, 5000],
    donationType: DonationType.General,
    ctaText: 'Make a Major Gift',
  },
} satisfies StoryObj<typeof BlockDonation>;

export const WithInteraction = {
  args: {
    heading: 'Interactive Donation Example',
    description:
      '<p>This story demonstrates the interactive features of the donation component.</p>' as Markup,
    presetAmounts: [25, 50, 100, 250],
    donationType: DonationType.General,
    ctaText: 'Donate Now',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find and click a preset amount
    const fiftyButton = canvas.getByText('CHF 50');
    await userEvent.click(fiftyButton);

    // Verify the button is selected (it should have the orange background)
    await expect(fiftyButton).toHaveClass('bg-kls-orange-primary');

    // Check that the donate button shows the amount
    const donateButton = canvas.getByRole('button', {
      name: /Donate Now - CHF 50.00/,
    });
    await expect(donateButton).toBeInTheDocument();
  },
} satisfies StoryObj<typeof BlockDonation>;

export const EmergencyRelief = {
  args: {
    heading: 'Emergency Relief Fund',
    description:
      '<p>Support our emergency relief fund to help those in urgent need. When disasters strike, immediate action saves lives.</p>' as Markup,
    presetAmounts: [20, 50, 100, 250],
    donationType: DonationType.Emergency,
    ctaText: 'Help Now',
    image: {
      source: image(Landscape, { width: 600, height: 600 }),
      alt: 'Emergency relief volunteers helping disaster victims',
    },
  },
} satisfies StoryObj<typeof BlockDonation>;

export const MembershipDonation = {
  args: {
    heading: 'Monthly Partnership Program',
    description:
      '<p>Join our monthly giving community and make a sustained impact. Regular monthly donations help us plan ahead and provide consistent support to those in need.</p>' as Markup,
    presetAmounts: [15, 30, 75, 150],
    donationType: DonationType.Membership,
    ctaText: 'Become a Monthly Partner',
    image: {
      source: image(Landscape, { width: 600, height: 600 }),
      alt: 'Community members working together on sustainable projects',
    },
  },
} satisfies StoryObj<typeof BlockDonation>;

export const AllDonationTypes = {
  args: {
    heading: 'Donation Type Showcase',
    description:
      '<p>This story demonstrates all available donation types. Switch between stories to see how each type is visually distinguished with different badge colors and icons.</p>' as Markup,
    presetAmounts: [25, 50, 100, 200],
    donationType: DonationType.General,
    ctaText: 'Support Our Cause',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the donation type badge system with different colors and icons for all 7 donation types: General (star), Project (building), Membership (refresh), Emergency (warning), Education (graduation cap), Healthcare (heart), and Environment (globe).',
      },
    },
  },
} satisfies StoryObj<typeof BlockDonation>;

export const LongDescription = {
  args: {
    heading: 'Comprehensive Support Program',
    description: `
      <p>Our comprehensive support program addresses multiple aspects of community need through integrated services and partnerships.</p>
      <p>Your donation will support:</p>
      <ul>
        <li>Emergency food assistance for families in crisis</li>
        <li>Educational scholarships for deserving students</li>
        <li>Healthcare access programs for the underserved</li>
        <li>Job training and placement services</li>
      </ul>
      <p>Together, we can create lasting change in our community.</p>
    ` as Markup,
    presetAmounts: [30, 75, 150, 300],
    donationType: DonationType.General,
    ctaText: 'Support All Programs',
  },
} satisfies StoryObj<typeof BlockDonation>;

export const MultiLanguageUrls = {
  args: {
    heading: 'Multi-Language URL Generation',
    description:
      '<p>This story demonstrates how donation widgets generate language-aware URLs based on the current locale. The donate button will link to the appropriate language-specific donation page with amount parameters.</p>' as Markup,
    presetAmounts: [50, 100, 200, 500],
    donationType: DonationType.General,
    ctaText: 'Donate Now',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates language-aware URL generation: /en/donate, /de/spenden, /it/donazione, /french/don with amount parameters.',
      },
    },
  },
} satisfies StoryObj<typeof BlockDonation>;

export const EducationDonation = {
  args: {
    heading: 'Support Education Programs',
    description:
      '<p>Help us provide quality education, learning materials, and scholarships to students in need. Your donation directly impacts educational opportunities in our community.</p>' as Markup,
    presetAmounts: [25, 50, 100, 200],
    donationType: DonationType.Education,
    ctaText: 'Support Education',
    image: {
      source: image(Landscape, { width: 600, height: 600 }),
      alt: 'Students in a classroom learning together',
    },
  },
} satisfies StoryObj<typeof BlockDonation>;

export const HealthcareDonation = {
  args: {
    heading: 'Healthcare Access Initiative',
    description:
      '<p>Support our healthcare programs that provide essential medical services, health screenings, and wellness programs to underserved communities.</p>' as Markup,
    presetAmounts: [30, 75, 150, 300],
    donationType: DonationType.Healthcare,
    ctaText: 'Support Healthcare',
    image: {
      source: image(Landscape, { width: 600, height: 600 }),
      alt: 'Healthcare workers providing medical care',
    },
  },
} satisfies StoryObj<typeof BlockDonation>;

export const EnvironmentDonation = {
  args: {
    heading: 'Environmental Conservation Project',
    description:
      '<p>Join our efforts to protect the environment through conservation projects, sustainable practices, and renewable energy initiatives that benefit our planet.</p>' as Markup,
    presetAmounts: [20, 60, 120, 250],
    donationType: DonationType.Environment,
    ctaText: 'Protect Our Planet',
    image: {
      source: image(Landscape, { width: 600, height: 600 }),
      alt: 'Environmental conservation activities in nature',
    },
  },
} satisfies StoryObj<typeof BlockDonation>;
