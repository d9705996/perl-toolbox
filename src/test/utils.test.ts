import * as assert from 'assert';
import { severityAsText, isValidViolation } from '../utils';

describe('Utils', () => {
  it('maps severity numbers to text', () => {
    assert.strictEqual(severityAsText(5), 'gentle');
    assert.strictEqual(severityAsText(4), 'stern');
    assert.strictEqual(severityAsText(3), 'harsh');
    assert.strictEqual(severityAsText(2), 'cruel');
    assert.strictEqual(severityAsText(1), 'brutal');
  });

  it('detects valid violations', () => {
    assert.ok(isValidViolation('5~|~1~|~2~|~message~|~E~|~policy'));
    assert.ok(!isValidViolation('invalid'));
  });
});
