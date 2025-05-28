import { isAIMessage } from '@langchain/core/messages';
import { expect, it } from 'vitest';

import { graph } from '../../graph.js';

it('Simple runthrough', async () => {
  const res = await graph.invoke({
    messages: [
      {
        role: 'user',
        content: 'What is the current weather in SF?',
      },
    ],
  });
  expect(res.messages.filter(isAIMessage).length).toBeGreaterThan(0);
});
