import {
  type LiteralElement,
  type MessageFormatElement,
  isLiteralElement,
  isPluralElement,
  isSelectElement,
  isTagElement,
  parse,
  TYPE
} from '@formatjs/icu-messageformat-parser'
import IntlMessageFormat, { type FormatXMLElementFn, type Options, type PrimitiveType } from 'intl-messageformat'
import { type IntlCache, type MessageDescriptor, createIntl, createIntlCache, IntlShape } from 'react-intl'

export type PseudoLocale = 'en-XA' | 'en-XB'
export type PseudoFunc = (msg: string | MessageFormatElement[]) => MessageFormatElement[]
export type MessageIds = FormatjsIntl.Message extends { ids: infer T }
  ? T extends string
    ? T
    : string
  : string

const ASCII = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const ACCENTED_ASCII = 'âḃćḋèḟĝḫíĵǩĺṁńŏṗɋŕśṭůṿẘẋẏẓḀḂḈḊḔḞḠḢḬĴḴĻḾŊÕṔɊŔṠṮŨṼẄẌŸƵ'

/**
 *
 * @param direction 'left' or 'right'
 * @param additionalLength Additional Length
 * @returns Literal MessageFormatElement with padding value
 */
function padding (direction: 'left' | 'right', additionalLength: number = 0): LiteralElement {
  const dots = '·'.repeat(Math.ceil(additionalLength / 2))
  const value = direction === 'left' ? 'မြ' + dots : dots + 'မြ'
  return {
    type: TYPE.literal,
    value
  }
}

/**
 * Get the expansion ratio based on IBM's guide
 * https://www.w3.org/International/articles/article-text-size/#predict
 * @param length Message Length
 * @returns Expansion Ratio
 */
function expandRatio (length: number): number {
  if (length < 11) return 3.0
  else if (length < 21) return 2.0
  else if (length < 31) return 1.8
  else if (length < 51) return 1.6
  else if (length < 71) return 1.7
  return 1.3
}

export function generateENXA (msg: string | MessageFormatElement[]): MessageFormatElement[] {
  const ast = typeof msg === 'string' ? parse(msg) : msg
  ast.forEach((el) => {
    if (isLiteralElement(el)) {
      el.value = el.value
        .split('')
        .map((c) => {
          const i = ASCII.indexOf(c)
          if (i < 0) {
            return c
          }
          return ACCENTED_ASCII[i]
        })
        .join('')
    } else if (isPluralElement(el) || isSelectElement(el)) {
      for (const opt of Object.values(el.options)) {
        generateENXA(opt.value)
      }
    } else if (isTagElement(el)) {
      generateENXA(el.children)
    }
  })
  return ast
}

export function generateENXB (msg: string | MessageFormatElement[]): MessageFormatElement[] {
  const ast = typeof msg === 'string' ? parse(msg) : msg
  ast.forEach((el) => {
    if (isLiteralElement(el)) {
      const pseudoString = el.value
        .split('')
        .map((c, index) => {
          const i = ASCII.indexOf(c)
          const canPad = (index + 1) % 3 === 0

          if (i < 0) {
            return c
          }

          return canPad ? ACCENTED_ASCII[i].repeat(3) : ACCENTED_ASCII[i]
        })
        .join('')

      el.value = `[!! ${pseudoString} !!]`
    } else if (isPluralElement(el) || isSelectElement(el)) {
      for (const opt of Object.values(el.options)) {
        generateENXB(opt.value)
      }
    } else if (isTagElement(el)) {
      generateENXB(el.children)
    }
  })
  return ast
}

export function generateENXC (msg: string | MessageFormatElement[]): MessageFormatElement[] {
  const ast = typeof msg === 'string' ? parse(msg) : msg
  let inputLength = 0

  ast.forEach((el) => {
    if (isLiteralElement(el)) {
      const pseudoString = el.value.split('').map((c) => {
        const i = ASCII.indexOf(c)
        if (i < 0) {
          return c
        }
        return ACCENTED_ASCII[i]
      })

      pseudoString.forEach((_) => inputLength++)

      el.value = `${pseudoString.join('')}`
    } else if (isPluralElement(el) || isSelectElement(el)) {
      for (const opt of Object.values(el.options)) {
        generateENXC(opt.value)
      }
    } else if (isTagElement(el)) {
      generateENXC(el.children)
    }
  })

  const additionalLength = Math.max(1, inputLength * expandRatio(inputLength))

  return [padding('left', additionalLength / 2), ...ast, padding('right', additionalLength / 2)]
}

export function generateENXD (msg: string | MessageFormatElement[]): MessageFormatElement[] {
  const ast = typeof msg === 'string' ? parse(msg) : msg
  let inputLength = 0

  ast.forEach((el) => {
    if (isLiteralElement(el)) {
      const pseudoString = el.value.split('').map((c) => {
        const i = ASCII.indexOf(c)
        if (i < 0 || !/[aeiouy]/.test(c)) {
          return c
        }
        return ACCENTED_ASCII[i]
      })

      pseudoString.forEach((_) => inputLength++)

      el.value = `${pseudoString.join('')}`
    } else if (isPluralElement(el) || isSelectElement(el)) {
      for (const opt of Object.values(el.options)) {
        generateENXD(opt.value)
      }
    } else if (isTagElement(el)) {
      generateENXD(el.children)
    }
  })

  const additionalLength = Math.max(1, inputLength * expandRatio(inputLength))

  return [padding('left', additionalLength / 2), ...ast, padding('right', additionalLength / 2)]
}

export const pseudoIntl = (
  pseudoFunc: PseudoFunc,
  messages: Record<MessageIds, string> | Record<MessageIds, MessageFormatElement[]>,
  locale: string,
  cache: IntlCache = createIntlCache()
): IntlShape => {
  const intl = createIntl(
    {
      locale,
      messages
    },
    cache
  )

  intl.formatMessage = (
    descriptor: MessageDescriptor,
    values?: Record<string, PrimitiveType | FormatXMLElementFn<string, string>>,
    opts?: Options
  ) => {
    if (descriptor.defaultMessage == null) return ''
    const message = new IntlMessageFormat(pseudoFunc(descriptor.defaultMessage), locale, undefined, opts).format(
      values
    )
    if (typeof message === 'string') return message
    else return ''
  }

  return intl
}
