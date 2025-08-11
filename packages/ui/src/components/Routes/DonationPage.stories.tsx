import { Locale } from '@custom/schema';
import type { Meta, StoryObj } from '@storybook/react';

import { DonationPageWithData } from './DonationPage';

const meta = {
  title: 'Routes/DonationPage',
  component: DonationPageWithData,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof DonationPageWithData>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockDonationPageData = {
  page: {
    locale: Locale.En,
    path: '/en/donate/emergency-fund',
    title: 'Emergency Relief Fund',
    hero: {
      headline: 'Help Families in Crisis',
      lead: 'Your donation provides immediate assistance to families facing emergencies.',
      image: {
        landscape: 'https://picsum.photos/2000/500?random=1',
        alt: 'Families receiving emergency aid',
      },
    },
    content: [
      {
        __typename: 'BlockMarkup',
        markup: `
          <h2>Why Your Support Matters</h2>
          <p>Natural disasters, economic hardship, and unexpected crises can devastate families overnight. Your donation to our Emergency Relief Fund helps provide:</p>
          <ul>
            <li>Emergency food and water supplies</li>
            <li>Temporary shelter and housing assistance</li>
            <li>Medical care and emergency healthcare</li>
            <li>Educational support for displaced children</li>
            <li>Long-term rebuilding assistance</li>
          </ul>
          <p>Every donation, no matter the size, makes a real difference in someone's life.</p>
        `,
      },
    ],
    metaTags: [],
    translations: [
      { locale: Locale.En, path: '/en/donate/emergency-fund' },
      { locale: Locale.De, path: '/de/spenden/nothilfe-fonds' },
      { locale: Locale.It, path: '/it/dona/fondo-emergenza' },
    ],
    goalAmount: 50000,
    currentAmount: 32500,
    campaignEndDate: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    ).toISOString(), // 30 days from now
    campaignDescription: `
      <p>Our Emergency Relief Fund is currently supporting 150 families affected by recent flooding. With your help, we can reach our goal of supporting 200 families with immediate relief and long-term recovery assistance.</p>
    `,
  },
};

export const Default: Story = {
  args: {
    pathname: '/en/donate/emergency-fund',
  },
  parameters: {
    mockData: [
      {
        request: {
          query: 'ViewPageQuery',
          variables: { pathname: '/en/donate/emergency-fund' },
        },
        result: { data: mockDonationPageData },
      },
    ],
  },
};

export const NearGoal: Story = {
  args: {
    pathname: '/en/donate/emergency-fund',
  },
  parameters: {
    mockData: [
      {
        request: {
          query: 'ViewPageQuery',
          variables: { pathname: '/en/donate/emergency-fund' },
        },
        result: {
          data: {
            page: {
              ...mockDonationPageData.page,
              currentAmount: 47500,
              goalAmount: 50000,
            },
          },
        },
      },
    ],
  },
};

export const GoalReached: Story = {
  args: {
    pathname: '/en/donate/emergency-fund',
  },
  parameters: {
    mockData: [
      {
        request: {
          query: 'ViewPageQuery',
          variables: { pathname: '/en/donate/emergency-fund' },
        },
        result: {
          data: {
            page: {
              ...mockDonationPageData.page,
              currentAmount: 55000,
              goalAmount: 50000,
            },
          },
        },
      },
    ],
  },
};

export const ExpiredCampaign: Story = {
  args: {
    pathname: '/en/donate/emergency-fund',
  },
  parameters: {
    mockData: [
      {
        request: {
          query: 'ViewPageQuery',
          variables: { pathname: '/en/donate/emergency-fund' },
        },
        result: {
          data: {
            page: {
              ...mockDonationPageData.page,
              campaignEndDate: new Date(
                Date.now() - 5 * 24 * 60 * 60 * 1000,
              ).toISOString(), // 5 days ago
            },
          },
        },
      },
    ],
  },
};

export const NoGoalAmount: Story = {
  args: {
    pathname: '/en/donate/general',
  },
  parameters: {
    mockData: [
      {
        request: {
          query: 'ViewPageQuery',
          variables: { pathname: '/en/donate/general' },
        },
        result: {
          data: {
            page: {
              ...mockDonationPageData.page,
              title: 'General Donations',
              hero: {
                headline: 'Support Our Mission',
                lead: 'Your donation helps us continue our important work in the community.',
              },
              goalAmount: undefined,
              currentAmount: undefined,
              campaignEndDate: undefined,
            },
          },
        },
      },
    ],
  },
};

export const ProjectFunding: Story = {
  args: {
    pathname: '/en/donate/school-project',
  },
  parameters: {
    mockData: [
      {
        request: {
          query: 'ViewPageQuery',
          variables: { pathname: '/en/donate/school-project' },
        },
        result: {
          data: {
            page: {
              ...mockDonationPageData.page,
              title: 'New School Building Project',
              hero: {
                headline: 'Building Dreams, One Brick at a Time',
                lead: 'Help us build a new school for 500 children in rural communities.',
                image: {
                  landscape: 'https://picsum.photos/2000/500?random=2',
                  alt: 'Children at construction site of new school',
                },
              },
              goalAmount: 150000,
              currentAmount: 89500,
              campaignEndDate: new Date(
                Date.now() + 90 * 24 * 60 * 60 * 1000,
              ).toISOString(), // 90 days from now
              campaignDescription: `
                <p>We're building a new school that will serve 500 children from 12 surrounding villages. The new facility will include:</p>
                <ul>
                  <li>20 modern classrooms</li>
                  <li>Science and computer laboratories</li>
                  <li>Library and resource center</li>
                  <li>Playground and sports facilities</li>
                  <li>Clean water and sanitation facilities</li>
                </ul>
              `,
            },
          },
        },
      },
    ],
  },
};
