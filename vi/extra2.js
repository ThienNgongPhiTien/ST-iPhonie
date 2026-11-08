// Lớp bổ sung cho v0.9.8: ghép các phần A–D và biên dịch mẫu có biến.
import {EXACT3_A, SUBS_A} from './extra2_a.js';
import {EXACT3_B, SUBS_B} from './extra2_b.js';
import {EXACT3_C, SUBS_C} from './extra2_c.js';
import {EXACT3_D, SUBS_D} from './extra2_d.js';
import {TPL} from './extra2_t.js';
import {EXACT4, SUBS4, TPL4} from './extra2_e.js';
export const EXACT3 = Object.assign({}, EXACT3_A, EXACT3_B, EXACT3_C, EXACT3_D, EXACT4);
export const SUBS3 = [...SUBS_A, ...SUBS_B, ...SUBS_C, ...SUBS_D, ...SUBS4];
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function compile([zh, vi]) {
  const parts = zh.split('5');
  if (parts.length < 2) return null;
  let src = parts.map(esc).join('\u0000').replace(/\u0000/g, '([^「」\\n]{0,60}?)');
  if (zh.startsWith('5')) src = '^' + src;
  if (zh.endsWith('5')) src += '$';
  let n = 0;
  const rep = vi.replace(/\{(\d*)\}/g, (m, d) => '$' + (d || ++n));
  return [new RegExp(src, 'g'), rep];
}
export const SUBR3 = [...TPL, ...TPL4].map(compile).filter(Boolean)
  .sort((a, b) => b[0].source.length - a[0].source.length);
