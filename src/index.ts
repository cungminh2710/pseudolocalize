import {
  parse,
  MessageFormatElement,
  isLiteralElement,
  isPluralElement,
  isSelectElement,
  isTagElement,
  TYPE,
  LiteralElement,
} from '@formatjs/icu-messageformat-parser';

export type PseudoLocale = 'en-XA' | 'en-XB';

const ASCII = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ACCENTED_ASCII = 'âḃćḋèḟĝḫíĵǩĺṁńŏṗɋŕśṭůṿẘẋẏẓḀḂḈḊḔḞḠḢḬĴḴĻḾŊÕṔɊŔṠṮŨṼẄẌŸƵ';

export function generateENXA(msg: string | MessageFormatElement[]): MessageFormatElement[] {
  const ast = typeof msg === 'string' ? parse(msg) : msg;
  ast.forEach((el) => {
    if (isLiteralElement(el)) {
      el.value = el.value
        .split('')
        .map((c) => {
          const i = ASCII.indexOf(c);
          if (i < 0) {
            return c;
          }
          return ACCENTED_ASCII[i];
        })
        .join('');
    } else if (isPluralElement(el) || isSelectElement(el)) {
      for (const opt of Object.values(el.options)) {
        generateENXA(opt.value);
      }
    } else if (isTagElement(el)) {
      generateENXA(el.children);
    }
  });
  return ast;
}

export function generateENXB(msg: string | MessageFormatElement[]): MessageFormatElement[] {
  const ast = typeof msg === 'string' ? parse(msg) : msg;
  ast.forEach((el) => {
    if (isLiteralElement(el)) {
      const pseudoString = el.value
        .split('')
        .map((c, index) => {
          const i = ASCII.indexOf(c);
          const canPad = (index + 1) % 3 === 0;

          if (i < 0) {
            return c;
          }

          return canPad ? ACCENTED_ASCII[i].repeat(3) : ACCENTED_ASCII[i];
        })
        .join('');

      el.value = `[!! ${pseudoString} !!]`;
    } else if (isPluralElement(el) || isSelectElement(el)) {
      for (const opt of Object.values(el.options)) {
        generateENXB(opt.value);
      }
    } else if (isTagElement(el)) {
      generateENXB(el.children);
    }
  });
  return ast;
}

export function generateENXC(msg: string | MessageFormatElement[]): MessageFormatElement[] {
  const ast = typeof msg === 'string' ? parse(msg) : msg;
  let inputLength = 0;

  ast.forEach((el) => {
    if (isLiteralElement(el)) {
      const pseudoString = el.value.split('').map((c) => {
        const i = ASCII.indexOf(c);
        if (i < 0) {
          return c;
        }
        return ACCENTED_ASCII[i];
      });

      pseudoString.forEach((_) => inputLength++);

      el.value = `${pseudoString.join('')}`;
    } else if (isPluralElement(el) || isSelectElement(el)) {
      for (const opt of Object.values(el.options)) {
        generateENXC(opt.value);
      }
    } else if (isTagElement(el)) {
      generateENXC(el.children);
    }
  });

  const additionalLength = Math.max(1, inputLength * 0.5);
  const padding: (direction: 'left' | 'right') => LiteralElement = (direction: 'left' | 'right' = 'left') => {
    const dots = '·'.repeat(Math.ceil(additionalLength / 2));
    const value = direction === 'left' ? 'မြ' + dots : dots + 'မြ';
    return {
      type: TYPE.literal,
      value,
    };
  };

  return [padding('left'), ...ast, padding('right')];
}
