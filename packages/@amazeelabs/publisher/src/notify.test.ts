import { ApplicationState } from '@amazeelabs/publisher-shared';
import { IncomingWebhook } from '@slack/webhook';
import { beforeEach, expect, test, vi } from 'vitest';

import { defaultConfig } from './mode-local/tools/testing';
import { stateNotify } from './notify';
import { clearConfig, setConfig } from './tools/config';

const sendMock = vi.fn().mockResolvedValue({ text: 'ok' });

vi.mock('@slack/webhook', () => ({
  IncomingWebhook: vi.fn().mockImplementation(() => ({
    send: sendMock,
  })),
}));

vi.spyOn(console, 'log').mockImplementation(() => {});

const firstSentMessage = () => {
  const [message] = sendMock.mock.calls[0] ?? [];
  if (!message) {
    throw new Error('Expected a Slack message to be sent.');
  }
  return message;
};

const withSlackNotifications = (
  overrides: Partial<{
    publisherBaseUrl: string;
    projectName: string;
    environmentName: string;
  }> = {},
) =>
  setConfig({
    ...defaultConfig,
    slackNotifications: {
      webhookUrl: 'https://hooks.slack.com/services/test',
      channel: '#general',
      ...overrides,
    },
  });

beforeEach(() => {
  clearConfig();
  sendMock.mockClear();
  vi.mocked(IncomingWebhook).mockClear();
});

test('notifies on Error as the last state', () => {
  withSlackNotifications();

  stateNotify([ApplicationState.Error], 2);

  expect(sendMock).toHaveBeenCalledTimes(1);
  expect(firstSentMessage().text).toBe('🛑 Error');
});

test('notifies on Fatal as the last state', () => {
  withSlackNotifications();

  stateNotify([ApplicationState.Fatal], 2);

  expect(sendMock).toHaveBeenCalledTimes(1);
  expect(firstSentMessage().text).toBe('😱 Fatal error');
});

test('notifies success on the first build after a clean build or deploy', () => {
  withSlackNotifications();

  stateNotify([ApplicationState.Ready], 1);

  expect(sendMock).toHaveBeenCalledTimes(1);
  expect(firstSentMessage().text).toBe('✅ Success');
});

test('notifies success when recovering from an Error', () => {
  withSlackNotifications();

  stateNotify(
    [
      ApplicationState.Starting,
      ApplicationState.Error,
      ApplicationState.Updating,
      ApplicationState.Ready,
    ],
    5,
  );

  expect(sendMock).toHaveBeenCalledTimes(1);
  expect(firstSentMessage().text).toBe('✅ Success');
});

test('notifies success when recovering from a Fatal error', () => {
  withSlackNotifications();

  stateNotify(
    [ApplicationState.Fatal, ApplicationState.Updating, ApplicationState.Ready],
    5,
  );

  expect(sendMock).toHaveBeenCalledTimes(1);
  expect(firstSentMessage().text).toBe('✅ Success');
});

test('does not notify when the previous resolution was already Ready', () => {
  withSlackNotifications();

  stateNotify(
    [ApplicationState.Ready, ApplicationState.Updating, ApplicationState.Ready],
    5,
  );

  expect(sendMock).not.toHaveBeenCalled();
});

test('only the most recent resolution counts, not an older Error', () => {
  withSlackNotifications();

  stateNotify(
    [
      ApplicationState.Error,
      ApplicationState.Ready,
      ApplicationState.Updating,
      ApplicationState.Ready,
    ],
    3,
  );

  expect(sendMock).not.toHaveBeenCalled();
});

test('does not notify on intermediate Starting state', () => {
  withSlackNotifications();

  stateNotify([ApplicationState.Ready, ApplicationState.Starting], 2);

  expect(sendMock).not.toHaveBeenCalled();
});

test('does not notify on intermediate Updating state', () => {
  withSlackNotifications();

  stateNotify([ApplicationState.Ready, ApplicationState.Updating], 2);

  expect(sendMock).not.toHaveBeenCalled();
});

test('sends nothing when slackNotifications config is absent', () => {
  setConfig(defaultConfig);

  stateNotify([ApplicationState.Error], 1);

  expect(vi.mocked(IncomingWebhook)).not.toHaveBeenCalled();
  expect(sendMock).not.toHaveBeenCalled();
});

test('appends the status link when publisherBaseUrl is configured', () => {
  withSlackNotifications({ publisherBaseUrl: 'https://build.example.com' });

  stateNotify([ApplicationState.Error], 1);

  expect(firstSentMessage().text).toBe(
    '🛑 Error. <https://build.example.com/___status/|Status>',
  );
});

test('prefixes the environment name when configured', () => {
  withSlackNotifications({ environmentName: 'dev-cb' });

  stateNotify([ApplicationState.Error], 1);

  expect(firstSentMessage().text).toBe('`dev-cb` 🛑 Error');
});

test('prefixes the project name when configured', () => {
  withSlackNotifications({ projectName: 'myproject' });

  stateNotify([ApplicationState.Error], 1);

  expect(firstSentMessage().text).toBe('*[myproject]* 🛑 Error');
});

test('combines project, environment and status link in the correct order', () => {
  withSlackNotifications({
    publisherBaseUrl: 'https://build.example.com',
    environmentName: 'dev-cb',
    projectName: 'myproject',
  });

  stateNotify([ApplicationState.Error], 1);

  expect(firstSentMessage().text).toBe(
    '*[myproject]* `dev-cb` 🛑 Error. <https://build.example.com/___status/|Status>',
  );
});

test('sends username, channel and icon_emoji alongside the message', () => {
  withSlackNotifications({ projectName: 'myproject' });

  stateNotify([ApplicationState.Error], 1);

  expect(firstSentMessage()).toStrictEqual({
    username: 'Publisher Bot',
    text: '*[myproject]* 🛑 Error',
    channel: '#general',
    icon_emoji: ':robot_face:',
  });
});
