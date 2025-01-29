import gql from 'noop-tag';
import { describe, expect, it } from 'vitest';

import { fetch } from '../lib.js';

describe('SSG pages', () => {
  it('returns limited results', async () => {
    const result = await fetch(gql`
      {
        ssgPages(args: "pageSize=2&type=page") {
          rows {
            path
          }
          total
        }
      }
    `);
    expect(result.data.ssgPages.total).toBeGreaterThan(2);
    expect(result.data.ssgPages.rows.length).toBe(2);
  });

  it('respects pagination', async () => {
    const resultA = await fetch(gql`
      {
        ssgPages(args: "pageSize=1&page=2&type=page") {
          rows {
            path
          }
        }
      }
    `);
    const resultB = await fetch(gql`
      {
        ssgPages(args: "pageSize=2&type=page") {
          rows {
            path
          }
        }
      }
    `);

    expect(resultA.data.ssgPages.rows.length).toBe(1);
    expect(resultB.data.ssgPages.rows.length).toBe(2);
    expect(resultA.data.ssgPages.rows[0].path).toBe(
      resultB.data.ssgPages.rows[1].path,
    );
  });
});
