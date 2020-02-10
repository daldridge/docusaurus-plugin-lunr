// tslint:disable:no-expression-statement
import test from 'ava';

test('placeholder just to get npm test working', async t => {
  t.deepEqual(await Promise.resolve(['a', 'b', 'c']), ['a', 'b', 'c']);
});
