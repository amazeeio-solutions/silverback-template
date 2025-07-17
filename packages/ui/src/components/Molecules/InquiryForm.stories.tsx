import { CreateSubmissionMutation } from '@custom/schema';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';

import { InquiryForm } from './InquiryForm';

export default {
  title: 'Components/Molecules/InquiryForm',
  component: InquiryForm,
  parameters: {
    executors: {
      [CreateSubmissionMutation]: () => {},
    },
  },
} satisfies Meta<typeof InquiryForm>;

export const Empty = {} satisfies StoryObj<typeof InquiryForm>;

export const FilledForm = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nameInput = canvas.getByPlaceholderText('Name');
    await userEvent.type(nameInput, 'John doe', {
      delay: 5,
    });
    const emailInput = canvas.getByPlaceholderText('Email');
    await userEvent.type(emailInput, 'john@doe.com', {
      delay: 5,
    });
    const subjectInput = canvas.getByPlaceholderText('Subject');
    await userEvent.type(subjectInput, 'Lorem ipsum', {
      delay: 5,
    });
    const questionInput = canvas.getByPlaceholderText('Question');
    await userEvent.type(
      questionInput,
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit?',
      {
        delay: 5,
      },
    );
  },
} satisfies StoryObj<typeof InquiryForm>;

export const WithValidationErrors = {
  parameters: {
    executors: {
      [CreateSubmissionMutation]: async () => {
        return {
          createWebformSubmission: {
            errors: [
              {
                key: 'invalid_field_email',
                field: 'email',
                message:
                  'The email address <em class="placeholder">invalid_mail</em> is not valid. Use the format user@example.com.',
              },
            ],
          },
        };
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nameInput = canvas.getByPlaceholderText('Name');
    await userEvent.type(nameInput, 'John doe', {
      delay: 5,
    });
    const emailInput = canvas.getByPlaceholderText('Email');
    await userEvent.type(emailInput, 'invalid_mail', {
      delay: 5,
    });
    const subjectInput = canvas.getByPlaceholderText('Subject');
    await userEvent.type(subjectInput, 'Lorem ipsum', {
      delay: 5,
    });
    const questionInput = canvas.getByPlaceholderText('Question');
    await userEvent.type(
      questionInput,
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit?',
      {
        delay: 5,
      },
    );
    const submitButton = canvas.getByRole('button');
    await userEvent.click(submitButton);
  },
} satisfies StoryObj<typeof InquiryForm>;

export const WithSuccessfulSubmission = {
  parameters: {
    executors: {
      [CreateSubmissionMutation]: async () => {
        return {
          createWebformSubmission: {
            error: null,
            submission: '{"submissionId": "1"}',
          },
        };
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nameInput = canvas.getByPlaceholderText('Name');
    await userEvent.type(nameInput, 'John doe', {
      delay: 5,
    });
    const emailInput = canvas.getByPlaceholderText('Email');
    await userEvent.type(emailInput, 'john@mail.com', {
      delay: 5,
    });
    const subjectInput = canvas.getByPlaceholderText('Subject');
    await userEvent.type(subjectInput, 'Lorem ipsum', {
      delay: 5,
    });
    const questionInput = canvas.getByPlaceholderText('Question');
    await userEvent.type(
      questionInput,
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit?',
      {
        delay: 5,
      },
    );
    const submitButton = canvas.getByRole('button');
    await userEvent.click(submitButton);
  },
} satisfies StoryObj<typeof InquiryForm>;
