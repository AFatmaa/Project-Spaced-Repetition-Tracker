import { getUserIds } from './common.mjs';

describe('Common utility functions', () => {
  test('getUserIds should return an array with 5 user IDs', () => {
    const users = getUserIds();
    expect(users).toHaveLength(5);
  });
});