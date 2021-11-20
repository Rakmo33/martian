import unified from 'unified';
import markdown from 'remark-parse';
import type * as notion from './notion';
import {parseBlocks, parseRichText} from './parser/internal';
import type * as md from './markdown';
import gfm from 'remark-gfm';

/**
 * Parses Markdown content into Notion Blocks.
 * - Supports all heading types (heading depths 4, 5, 6 are treated as 3 for Notion)
 * - Supports numbered lists, bulleted lists, to-do lists
 * - Supports italics, bold, strikethrough, inline code, hyperlinks
 *
 * Per Notion limitations, these markdown attributes are not supported:
 * - Tables (removed)
 * - HTML tags (removed)
 * - Thematic breaks (removed)
 * - Code blocks (treated as paragraph)
 * - Block quotes (treated as paragraph)
 *
 * Supports GitHub-flavoured Markdown.
 *
 * @param body any Markdown or GFM content
 */
export function markdownToBlocks(
  body: string,
  allowUnsupportedObjectType = false
): notion.Block[] {
  const root = unified().use(markdown).use(gfm).parse(body);
  return parseBlocks(root as unknown as md.Root, allowUnsupportedObjectType);
}

/**
 * Parses inline Markdown content into Notion RichText objects.
 * Only supports plain text, italics, bold, strikethrough, inline code, and hyperlinks.
 *
 * @param text any inline Markdown or GFM content
 */
export function markdownToRichText(text: string): notion.RichText[] {
  const unifiedOp = unified();
  const useMdOp = unifiedOp.use(markdown);
  const useGfmOp = useMdOp.use(gfm);
  const root = useGfmOp.parse(text);

  const newLineArr: number[] = [];
  let count = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '\n') {
      count++;
    } else if (count) {
      newLineArr.push(count);
      count = 0;
    }
  }
  const parseRichTextOp = parseRichText(root as unknown as md.Root, newLineArr);
  return parseRichTextOp;
}

// const myStr = `**Hello**
// Bye`;

const myStr2 = `**Hello**


Bye

Go`;

// const output = markdownToRichText(myStr);
const output2 = markdownToRichText(myStr2);

// console.log(output);
// console.log(output2);
// console.log('THE END')
