import { generateENXA, generateENXB, generateENXC } from '../index';
import IntlMessageFormat from 'intl-messageformat';

const input = 'my name is {name}';
const name = 'Minh';

test('en-XA', () => {
  expect(new IntlMessageFormat(generateENXA(input)).format({ name })).toBe('ṁẏ ńâṁè íś Minh');
});

test('en-XB', () => {
  expect(new IntlMessageFormat(generateENXB(input)).format({ name })).toBe('[!! ṁẏ ńâṁṁṁè íííś  !!]Minh');
});

test('en-XC', () => {
  expect(new IntlMessageFormat(generateENXC(input)).format({ name })).toBe('မြ···ṁẏ ńâṁè íś Minh···မြ');
});
