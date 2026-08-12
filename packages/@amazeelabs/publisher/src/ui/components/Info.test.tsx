import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';

import Info from './Info';

vi.mock('rxjs/webSocket', () => ({
  webSocket: () => ({ pipe: () => ({ subscribe: () => ({}) }) }),
}));

const historyItems = [
  {
    id: 73,
    type: 'incremental',
    startedAt: 1330211842010,
    finishedAt: 1330297200000,
    success: true,
  },
];

const stubNavigatorLanguage = (language: string) => {
  vi.spyOn(window.navigator, 'language', 'get').mockReturnValue(language);
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// Headless browsers report an empty or non-standard navigator.language, which
// Intl rejects with "Incorrect locale information provided".
test.each(['', 'C', 'en-US'])(
  'build history renders when navigator.language is %j',
  (language) => {
    stubNavigatorLanguage(language);

    render(<Info historyItems={historyItems} isStorybook={true} />);

    expect(screen.getByText('73')).toBeDefined();
  },
);
