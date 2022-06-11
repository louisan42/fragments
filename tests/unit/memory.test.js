/**
 * Tests for src/model/data/memory/index.js
 */
const {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
} = require('../../src/model/data/memory/index');

describe('Memory functions test', () => {
  describe('writeFragment, readFragment', () => {
    test('should write a fragment to memory and read fragment', async () => {
      const fragment = {
        ownerId: '1234',
        id: '5678',
        size: 0,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        type: 'text/Plain',
      };
      await writeFragment(fragment);
      const result = await readFragment(fragment.ownerId, fragment.id);
      expect(result).toEqual(fragment);
    });
  });

  describe('writeFragmentData', () => {
    test('should write fragment data to memory and read data', async () => {
      const fragment = {
        ownerId: '1234',
        id: '5678',
        size: 0,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        type: 'text/Plain',
      };
      await writeFragment(fragment);
      const data = 'data';
      await writeFragmentData(fragment.ownerId, fragment.id, data);
      const result = await readFragmentData(fragment.ownerId, fragment.id);
      expect(result).toEqual(data);
    });
  });
});
