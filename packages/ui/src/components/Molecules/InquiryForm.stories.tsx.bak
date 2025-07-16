import {
  CreateSubmissionMutation,
  OperationExecutorsProvider,
  OperationResult,
} from '@custom/schema';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';
import React from 'react';

import { InquiryForm } from './InquiryForm';

type InquiryFormExecutor = () => Promise<
  OperationResult<typeof CreateSubmissionMutation>
>;

export default {
  title: 'Components/Molecules/InquiryForm',
  render: (args) => {
    return (
      <OperationExecutorsProvider
        executors={[{ executor: args.exec, id: CreateSubmissionMutation }]}
      >
        <InquiryForm />
      </OperationExecutorsProvider>
    );
  },
} satisfies Meta<{ exec: InquiryFormExecutor }>;

export const Empty = {} satisfies StoryObj<typeof InquiryForm>;

export const FilledForm: StoryObj<typeof InquiryForm> = {
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
};

export const WithValidationErrors: StoryObj<{ exec: InquiryFormExecutor }> = {
  args: {
    exec: async () => {
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
};

export const WithSuccessfulSubmission: StoryObj<{ exec: InquiryFormExecutor }> =
  {
    args: {
      exec: async () => {
        return {
          createWebformSubmission: {
            error: null,
            submission: '{"submissionId": "1"}',
          },
        };
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
  };
