import { ApplicationState } from '@amazeelabs/publisher-shared';
import { IncomingWebhook } from '@slack/webhook';
import { Context, Effect, Layer } from 'effect';

import { Config } from './Config';

export class Notifier extends Context.Tag('Notifier')<
  Notifier,
  {
    readonly stateNotify: (
      stateHistory: ApplicationState[],
      buildNumber: number,
    ) => Effect.Effect<void>;
  }
>() {}

const processMessage = (
  notificationText: string,
  slackConfig: NonNullable<
    import('./Config').PublisherConfig['slackNotifications']
  >,
): string => {
  let result: string = notificationText;
  if (slackConfig.publisherBaseUrl) {
    result = `${result}. <${slackConfig.publisherBaseUrl}/___status/|Status>`;
  }
  if (slackConfig.environmentName) {
    result = `\`${slackConfig.environmentName}\` ${result}`;
  }
  if (slackConfig.projectName) {
    result = `*[${slackConfig.projectName}]* ${result}`;
  }
  return result;
};

export const NotifierLive = Layer.effect(
  Notifier,
  Effect.gen(function* () {
    const { config } = yield* Config;

    const notify = (notificationText: string) =>
      Effect.gen(function* () {
        console.log('Slack notification:', notificationText);
        const slackConfig = config.slackNotifications;
        if (!slackConfig) {
          return;
        }
        const webhook = new IncomingWebhook(slackConfig.webhookUrl);
        yield* Effect.promise(() =>
          webhook.send({
            username: 'Publisher Bot',
            text: processMessage(notificationText, slackConfig),
            channel: slackConfig.channel,
            icon_emoji: ':robot_face:',
          }),
        );
      });

    const stateNotify = (
      stateHistory: ApplicationState[],
      buildNumber: number,
    ) =>
      Effect.gen(function* () {
        const state =
          stateHistory[stateHistory.length - 1] || ApplicationState.Starting;
        const previousStates = stateHistory.slice(0, -1);

        if (state === ApplicationState.Error) {
          yield* notify('Error');
          return;
        }
        if (state === ApplicationState.Fatal) {
          yield* notify('Fatal error');
          return;
        }
        if (buildNumber === 1 && state === ApplicationState.Ready) {
          yield* notify('Success');
          return;
        }
        const previousResolution = previousStates.findLast(
          (s) =>
            s === ApplicationState.Error ||
            s === ApplicationState.Fatal ||
            s === ApplicationState.Ready,
        );
        if (
          (previousResolution === ApplicationState.Error ||
            previousResolution === ApplicationState.Fatal) &&
          state === ApplicationState.Ready
        ) {
          yield* notify('Success');
        }
      });

    return { stateNotify };
  }),
);
