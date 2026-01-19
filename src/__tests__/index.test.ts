import { describe, expect, test } from 'bun:test';

import { parse } from '@formatjs/icu-messageformat-parser';
import IntlMessageFormat from 'intl-messageformat';

import { generateENXA, generateENXB, generateENXC, generateENXD, pseudoIntl } from '../index';

// ============================================================================
// Basic Functionality Tests
// ============================================================================

describe('generateENXA', () => {
	test('converts ASCII to accented characters', () => {
		const input = 'my name is {name}';
		const name = 'Minh';
		expect(new IntlMessageFormat(generateENXA(input)).format({ name })).toBe('ṁẏ ńâṁè íś Minh');
	});

	test('preserves non-ASCII characters', () => {
		const input = 'price: $100';
		expect(new IntlMessageFormat(generateENXA(input)).format()).toBe('ṗŕíćè: $100');
	});

	test('handles empty string', () => {
		expect(new IntlMessageFormat(generateENXA('')).format()).toBe('');
	});

	test('handles string with only numbers and symbols', () => {
		const input = '123 !@# 456';
		expect(new IntlMessageFormat(generateENXA(input)).format()).toBe('123 !@# 456');
	});

	test('handles uppercase characters', () => {
		const input = 'HELLO WORLD';
		expect(new IntlMessageFormat(generateENXA(input)).format()).toBe('ḢḔĻĻÕ ẄÕŔĻḊ');
	});

	test('handles mixed case', () => {
		const input = 'Hello World';
		expect(new IntlMessageFormat(generateENXA(input)).format()).toBe('Ḣèĺĺŏ Ẅŏŕĺḋ');
	});
});

describe('generateENXB', () => {
	test('adds brackets and repeats every 3rd character', () => {
		const input = 'my name is {name}';
		const name = 'Minh';
		expect(new IntlMessageFormat(generateENXB(input)).format({ name })).toBe('[!! ṁẏ ńâṁṁṁè íííś  !!]Minh');
	});

	test('handles empty string', () => {
		// Empty string produces empty output (no literal elements to wrap)
		expect(new IntlMessageFormat(generateENXB('')).format()).toBe('');
	});

	test('handles short string', () => {
		const input = 'hi';
		expect(new IntlMessageFormat(generateENXB(input)).format()).toBe('[!! ḫí !!]');
	});

	test('handles string with only spaces', () => {
		const input = '   ';
		expect(new IntlMessageFormat(generateENXB(input)).format()).toBe('[!!     !!]');
	});
});

describe('generateENXC', () => {
	test('adds RTL padding with accented characters', () => {
		const input = 'my name is {name}';
		const name = 'Minh';
		expect(new IntlMessageFormat(generateENXC(input)).format({ name })).toBe('မြ······ṁẏ ńâṁè íś Minh······မြ');
	});

	test('handles empty string', () => {
		const result = new IntlMessageFormat(generateENXC('')).format();
		// Should still have padding even for empty string
		expect(result).toContain('မြ');
	});

	test('handles very short string (< 11 chars) - expansion ratio 3.0', () => {
		const input = 'hi'; // 2 chars
		const result = new IntlMessageFormat(generateENXC(input)).format();
		expect(result).toContain('ḫí');
		expect((result as string).startsWith('မြ')).toBe(true);
		expect((result as string).endsWith('မြ')).toBe(true);
	});
});

describe('generateENXD', () => {
	test('only accents vowels (a, e, i, o, u, y)', () => {
		const input = 'my name is {name}';
		const name = 'Minh';
		expect(new IntlMessageFormat(generateENXD(input)).format({ name })).toBe('မြ······mẏ nâmè ís Minh······မြ');
	});

	test('consonants remain unchanged', () => {
		const input = 'bcdfghjklmnpqrstvwxz';
		const result = new IntlMessageFormat(generateENXD(input)).format();
		// Consonants should not be accented
		expect(result).toContain('bcdfghjklmnpqrstvwxz');
	});

	test('vowels are accented', () => {
		const input = 'aeiouAEIOU';
		const result = new IntlMessageFormat(generateENXD(input)).format();
		// Only lowercase vowels are accented in ENXD (regex /[aeiouy]/ is case-sensitive)
		expect(result).toContain('âèíŏůAEIOU');
	});

	test('handles empty string', () => {
		const result = new IntlMessageFormat(generateENXD('')).format();
		expect(result).toContain('မြ');
	});
});

// ============================================================================
// ICU Message Format Features
// ============================================================================

describe('ICU Plural Elements', () => {
	const pluralMessage = '{count, plural, one {# item} other {# items}}';

	test('generateENXA handles plural elements', () => {
		const result = new IntlMessageFormat(generateENXA(pluralMessage)).format({ count: 1 });
		expect(result).toBe('1 íṭèṁ');
	});

	test('generateENXA handles plural other branch', () => {
		const result = new IntlMessageFormat(generateENXA(pluralMessage)).format({ count: 5 });
		expect(result).toBe('5 íṭèṁś');
	});

	test('generateENXB handles plural elements', () => {
		const result = new IntlMessageFormat(generateENXB(pluralMessage)).format({ count: 1 });
		// Number placeholder stays outside the brackets
		expect(result).toBe('1[!!  íṭṭṭèṁ !!]');
	});

	test('generateENXC handles plural elements', () => {
		const result = new IntlMessageFormat(generateENXC(pluralMessage)).format({ count: 1 });
		expect(result).toContain('íṭèṁ');
		expect((result as string).startsWith('မြ')).toBe(true);
	});

	test('generateENXD handles plural elements', () => {
		const result = new IntlMessageFormat(generateENXD(pluralMessage)).format({ count: 1 });
		expect(result).toContain('ítèm');
		expect((result as string).startsWith('မြ')).toBe(true);
	});
});

describe('ICU Select Elements', () => {
	const selectMessage = '{gender, select, male {He is here} female {She is here} other {They are here}}';

	test('generateENXA handles select elements - male', () => {
		const result = new IntlMessageFormat(generateENXA(selectMessage)).format({ gender: 'male' });
		expect(result).toBe('Ḣè íś ḫèŕè');
	});

	test('generateENXA handles select elements - female', () => {
		const result = new IntlMessageFormat(generateENXA(selectMessage)).format({ gender: 'female' });
		expect(result).toBe('Ṡḫè íś ḫèŕè');
	});

	test('generateENXA handles select elements - other', () => {
		const result = new IntlMessageFormat(generateENXA(selectMessage)).format({ gender: 'unknown' });
		expect(result).toBe('Ṯḫèẏ âŕè ḫèŕè');
	});

	test('generateENXB handles select elements', () => {
		const result = new IntlMessageFormat(generateENXB(selectMessage)).format({ gender: 'male' });
		expect(result).toBe('[!! Ḣè íś ḫèŕŕŕè !!]');
	});
});

describe('ICU Tag Elements', () => {
	const tagMessage = 'Click <b>here</b> to continue';

	test('generateENXA handles tag elements', () => {
		const result = new IntlMessageFormat(generateENXA(tagMessage)).format({
			b: (chunks) => `<b>${chunks}</b>`,
		});
		expect(result).toBe('Ḉĺíćǩ <b>ḫèŕè</b> ṭŏ ćŏńṭíńůè');
	});

	test('generateENXB handles tag elements', () => {
		const result = new IntlMessageFormat(generateENXB(tagMessage)).format({
			b: (chunks) => `<b>${chunks}</b>`,
		});
		expect(result).toBe('[!! Ḉĺíííćǩ  !!]<b>[!! ḫèŕŕŕè !!]</b>[!!  ṭŏŏŏ ćŏŏŏńṭíííńůèèè !!]');
	});

	test('generateENXA handles nested tags', () => {
		const nestedTagMessage = 'Click <b>here <i>now</i></b>';
		const result = new IntlMessageFormat(generateENXA(nestedTagMessage)).format({
			b: (chunks) => `<b>${chunks}</b>`,
			i: (chunks) => `<i>${chunks}</i>`,
		});
		expect(result).toBe('Ḉĺíćǩ <b>ḫèŕè <i>ńŏẘ</i></b>');
	});
});

describe('Complex Nested ICU Messages', () => {
	test('generateENXA handles plural inside select', () => {
		const complexMessage =
			'{gender, select, male {{count, plural, one {He has # dog} other {He has # dogs}}} other {{count, plural, one {They have # dog} other {They have # dogs}}}}';
		const result = new IntlMessageFormat(generateENXA(complexMessage)).format({ gender: 'male', count: 2 });
		expect(result).toBe('Ḣè ḫâś 2 ḋŏĝś');
	});

	test('generateENXA handles message with multiple placeholders', () => {
		const multiPlaceholder = '{firstName} {lastName} is {age} years old';
		const result = new IntlMessageFormat(generateENXA(multiPlaceholder)).format({
			firstName: 'John',
			lastName: 'Doe',
			age: 30,
		});
		expect(result).toBe('John Doe íś 30 ẏèâŕś ŏĺḋ');
	});
});

// ============================================================================
// AST Input Tests
// ============================================================================

describe('AST Input', () => {
	test('generateENXA accepts pre-parsed AST', () => {
		const input = 'hello world';
		const ast = parse(input);
		const result = new IntlMessageFormat(generateENXA(ast)).format();
		expect(result).toBe('ḫèĺĺŏ ẘŏŕĺḋ');
	});

	test('generateENXB accepts pre-parsed AST', () => {
		const input = 'hello world';
		const ast = parse(input);
		const result = new IntlMessageFormat(generateENXB(ast)).format();
		expect(result).toBe('[!! ḫèĺĺĺĺŏ ẘŏŕŕŕĺḋ !!]');
	});

	test('generateENXC accepts pre-parsed AST', () => {
		const input = 'hello world';
		const ast = parse(input);
		const result = new IntlMessageFormat(generateENXC(ast)).format();
		expect(result).toContain('ḫèĺĺŏ ẘŏŕĺḋ');
	});

	test('generateENXD accepts pre-parsed AST', () => {
		const input = 'hello world';
		const ast = parse(input);
		const result = new IntlMessageFormat(generateENXD(ast)).format();
		expect(result).toContain('hèllŏ wŏrld');
	});
});

// ============================================================================
// Expansion Ratio Boundary Tests (for generateENXC and generateENXD)
// ============================================================================

describe('Expansion Ratio Boundaries', () => {
	// expandRatio returns:
	// < 11 chars: 3.0
	// < 21 chars: 2.0
	// < 31 chars: 1.8
	// < 51 chars: 1.6
	// < 71 chars: 1.7
	// >= 71 chars: 1.3

	test('very short string (< 11 chars) has highest expansion', () => {
		const short = 'abcdefghij'; // 10 chars
		const result = new IntlMessageFormat(generateENXC(short)).format() as string;
		// With ratio 3.0, padding should be substantial
		const paddingCount = (result.match(/·/g) || []).length;
		expect(paddingCount).toBeGreaterThan(10);
	});

	test('string at 11 chars uses different expansion ratio', () => {
		const str11 = 'abcdefghijk'; // 11 chars
		const str10 = 'abcdefghij'; // 10 chars
		const result11 = new IntlMessageFormat(generateENXC(str11)).format() as string;
		const result10 = new IntlMessageFormat(generateENXC(str10)).format() as string;
		// 10 chars gets 3.0 ratio, 11 chars gets 2.0 ratio
		// So 10 chars should have more relative padding
		const dots11 = (result11.match(/·/g) || []).length;
		const dots10 = (result10.match(/·/g) || []).length;
		// 10 * 3.0 = 30 vs 11 * 2.0 = 22
		expect(dots10).toBeGreaterThan(dots11);
	});

	test('long string (>= 71 chars) has lowest expansion ratio', () => {
		const longStr = 'a'.repeat(75);
		const result = new IntlMessageFormat(generateENXC(longStr)).format();
		// With ratio 1.3, padding should be moderate
		const paddingCount = ((result as string).match(/·/g) || []).length;
		// 75 * 1.3 = 97.5, so about 48-49 dots on each side
		expect(paddingCount).toBeLessThan(150);
		expect(paddingCount).toBeGreaterThanOrEqual(50);
	});

	test('boundary at 21 chars', () => {
		const str20 = 'a'.repeat(20); // ratio 2.0
		const str21 = 'a'.repeat(21); // ratio 1.8
		const result20 = new IntlMessageFormat(generateENXC(str20)).format();
		const result21 = new IntlMessageFormat(generateENXC(str21)).format();
		const dots20 = ((result20 as string).match(/·/g) || []).length;
		const dots21 = ((result21 as string).match(/·/g) || []).length;
		// 20 * 2.0 = 40 vs 21 * 1.8 = 37.8
		expect(dots20).toBeGreaterThanOrEqual(dots21);
	});

	test('boundary at 31 chars', () => {
		const str30 = 'a'.repeat(30); // ratio 1.8
		const str31 = 'a'.repeat(31); // ratio 1.6
		const result30 = new IntlMessageFormat(generateENXC(str30)).format() as string;
		const result31 = new IntlMessageFormat(generateENXC(str31)).format() as string;
		const dots30 = (result30.match(/·/g) || []).length;
		const dots31 = (result31.match(/·/g) || []).length;
		// 30 * 1.8 = 54 vs 31 * 1.6 = 49.6
		expect(dots30).toBeGreaterThan(dots31);
	});

	test('boundary at 51 chars', () => {
		const str50 = 'a'.repeat(50); // ratio 1.6
		const str51 = 'a'.repeat(51); // ratio 1.7
		const result50 = new IntlMessageFormat(generateENXC(str50)).format() as string;
		const result51 = new IntlMessageFormat(generateENXC(str51)).format() as string;
		const dots50 = (result50.match(/·/g) || []).length;
		const dots51 = (result51.match(/·/g) || []).length;
		// 50 * 1.6 = 80 vs 51 * 1.7 = 86.7
		expect(dots51).toBeGreaterThan(dots50);
	});

	test('boundary at 71 chars', () => {
		const str70 = 'a'.repeat(70); // ratio 1.7
		const str71 = 'a'.repeat(71); // ratio 1.3
		const result70 = new IntlMessageFormat(generateENXC(str70)).format() as string;
		const result71 = new IntlMessageFormat(generateENXC(str71)).format() as string;
		const dots70 = (result70.match(/·/g) || []).length;
		const dots71 = (result71.match(/·/g) || []).length;
		// 70 * 1.7 = 119 vs 71 * 1.3 = 92.3
		expect(dots70).toBeGreaterThan(dots71);
	});
});

// ============================================================================
// pseudoIntl Tests
// ============================================================================

describe('pseudoIntl', () => {
	const messages = {
		greeting: 'Hello, {name}!',
		farewell: 'Goodbye, {name}!',
	};

	test('creates intl object with formatMessage using en-XA style', () => {
		const intl = pseudoIntl(generateENXA, messages, 'en-XA');
		const result = intl.formatMessage({ id: 'greeting', defaultMessage: 'Hello, {name}!' }, { name: 'World' });
		expect(result).toBe('Ḣèĺĺŏ, World!');
	});

	test('creates intl object with formatMessage using en-XB style', () => {
		const intl = pseudoIntl(generateENXB, messages, 'en-XB');
		const result = intl.formatMessage({ id: 'greeting', defaultMessage: 'Hello, {name}!' }, { name: 'World' });
		expect(result).toBe('[!! Ḣèĺĺĺĺŏ,  !!]World[!! ! !!]');
	});

	test('returns empty string when defaultMessage is null', () => {
		const intl = pseudoIntl(generateENXA, messages, 'en-XA');
		const result = intl.formatMessage({ id: 'missing' });
		expect(result).toBe('');
	});

	test('returns empty string when defaultMessage is undefined', () => {
		const intl = pseudoIntl(generateENXA, messages, 'en-XA');
		const result = intl.formatMessage({ id: 'missing', defaultMessage: undefined });
		expect(result).toBe('');
	});

	test('works with custom cache', async () => {
		const { createIntlCache } = await import('@formatjs/intl');
		const cache = createIntlCache();
		const intl = pseudoIntl(generateENXA, messages, 'en-XA', cache);
		const result = intl.formatMessage({ id: 'greeting', defaultMessage: 'Hello, {name}!' }, { name: 'Test' });
		expect(result).toBe('Ḣèĺĺŏ, Test!');
	});

	test('handles complex ICU messages', () => {
		const intl = pseudoIntl(generateENXA, messages, 'en-XA');
		const result = intl.formatMessage({ id: 'count', defaultMessage: '{count, plural, one {# item} other {# items}}' }, { count: 5 });
		expect(result).toBe('5 íṭèṁś');
	});
});

// ============================================================================
// Edge Cases
// ============================================================================

describe('Edge Cases', () => {
	test('handles string with unicode characters', () => {
		const input = 'Hello 世界 🌍';
		const result = new IntlMessageFormat(generateENXA(input)).format();
		expect(result).toBe('Ḣèĺĺŏ 世界 🌍');
	});

	test('handles escaped braces', () => {
		const input = "Use '{'name'}' for variables";
		const result = new IntlMessageFormat(generateENXA(input)).format();
		// Escaped braces are preserved but the content inside is pseudolocalized
		expect(result).toContain('{ńâṁè}');
	});

	test('handles multiple consecutive spaces', () => {
		const input = 'hello    world';
		const result = new IntlMessageFormat(generateENXA(input)).format();
		expect(result).toBe('ḫèĺĺŏ    ẘŏŕĺḋ');
	});

	test('handles newlines in string', () => {
		const input = 'hello\nworld';
		const result = new IntlMessageFormat(generateENXA(input)).format();
		expect(result).toBe('ḫèĺĺŏ\nẘŏŕĺḋ');
	});

	test('handles tabs in string', () => {
		const input = 'hello\tworld';
		const result = new IntlMessageFormat(generateENXA(input)).format();
		expect(result).toBe('ḫèĺĺŏ\tẘŏŕĺḋ');
	});

	test('handles all alphabet characters', () => {
		const lowercase = 'abcdefghijklmnopqrstuvwxyz';
		const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		const resultLower = new IntlMessageFormat(generateENXA(lowercase)).format();
		const resultUpper = new IntlMessageFormat(generateENXA(uppercase)).format();
		expect(resultLower).toBe('âḃćḋèḟĝḫíĵǩĺṁńŏṗɋŕśṭůṿẘẋẏẓ');
		expect(resultUpper).toBe('ḀḂḈḊḔḞḠḢḬĴḴĻḾŊÕṔɊŔṠṮŨṼẄẌŸƵ');
	});

	test('handles placeholder at start of string', () => {
		const input = '{name} is here';
		const result = new IntlMessageFormat(generateENXA(input)).format({ name: 'John' });
		expect(result).toBe('John íś ḫèŕè');
	});

	test('handles placeholder at end of string', () => {
		const input = 'Hello {name}';
		const result = new IntlMessageFormat(generateENXA(input)).format({ name: 'John' });
		expect(result).toBe('Ḣèĺĺŏ John');
	});

	test('handles only placeholder', () => {
		const input = '{name}';
		const result = new IntlMessageFormat(generateENXA(input)).format({ name: 'John' });
		expect(result).toBe('John');
	});

	test('handles adjacent placeholders', () => {
		const input = '{first}{last}';
		const result = new IntlMessageFormat(generateENXA(input)).format({ first: 'John', last: 'Doe' });
		expect(result).toBe('JohnDoe');
	});
});
