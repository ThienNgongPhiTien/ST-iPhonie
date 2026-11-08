/* ST-iPhonie · Lớp phủ đa ngôn ngữ (Tiếng Việt <-> Tiếng Trung)
 * - Chỉ đổi chữ hiển thị (text node và thuộc tính title / placeholder / aria-label / alt / label).
 * - Không đụng tới giá trị, định danh, prompt gửi cho mô hình hay giao thức tin nhắn.
 * - Ở cửa sổ chính SillyTavern: chỉ dịch các phần tử thuộc ST-iPhonie, không quét DOM của SillyTavern.
 * - Hỗ trợ nút bấm chuyển đổi trực tiếp giữa Tiếng Việt (VI) và Tiếng Trung (中) không cần tải lại trang.
 */
import {EXACT, PATTERNS} from './dict.js';
import {EXACT2, SUBS, SUBR, PRE} from './extra.js';
import {EXACT3, SUBS3, SUBR3} from './extra2.js';

const STORAGE_KEY = 'sttts-vi';
const CJK = /[㐀-鿿]/;
const SKIP = 'script,style,textarea,code,pre,[contenteditable="true"],[contenteditable=""],.mes_text,[data-no-vi]';
const HOST_OWNED = '#sttts-extension-entry,#sttts-wand-entry,#sttts-floating,[class*="sttts-"],[data-sttts-owned],[data-sttts-pic],[data-sttts-line]';
const ATTRS = ['title', 'placeholder', 'aria-label', 'alt', 'label'];

// Bổ sung từ điển cho các tính năng mới từ bản 0.9.9 -> 0.9.41 (Tủ đồ, Trình tạo, v.v.)
const NEW_EXACT = {
  '衣柜': 'Tủ đồ',
  '生成器': 'Trình tạo',
  '未分类': 'Chưa phân loại',
  '有要穿上的': 'Có đồ sắp mặc',
  '找人': 'Tìm người',
  '谁的衣柜': 'Tủ đồ của ai',
  '下一次正文会写进去': 'Sẽ đưa vào phản hồi chính văn tiếp theo',
  '正文里换的': 'Đổi trong chính văn',
  '已经写进正文': 'Đã đưa vào chính văn',
  '脱下': 'Cởi ra',
  '正在识别…': 'Đang nhận diện…',
  '衣柜还是空的': 'Tủ đồ vẫn còn trống',
  '点右上角的 ＋ 放进第一件衣服': 'Bấm dấu ＋ ở góc trên bên phải để thêm món đồ đầu tiên',
  '按分类看': 'Xem theo phân loại',
  '选中的衣服': 'Trang phục đã chọn',
  '穿上': 'Mặc vào',
  '去搭配': 'Đi phối đồ',
  '拿出衣柜': 'Lấy khỏi tủ đồ',
  '衣柜里还没有写了描述的衣服': 'Trong tủ chưa có trang phục nào có mô tả',
  '看试穿图': 'Xem ảnh mặc thử',
  '怎么搭': 'Cách phối',
  '从衣柜选': 'Chọn từ tủ đồ',
  '自由设计': 'Tự do thiết kế',
  '想要什么样的': 'Muốn kiểu như thế nào',
  '想要的风格（选填）': 'Phong cách mong muốn (tùy chọn)',
  '例如：入秋的日常装，温柔、轻便': 'VD: Đồ thường ngày đầu thu, dịu dàng, nhẹ nhàng',
  '搭配中…': 'Đang phối đồ…',
  '搭一套': 'Phối một bộ',
  '搭好的在这里，也可以自己写': 'Bộ đã phối ở đây, bạn cũng có thể tự viết',
  '穿上这套': 'Mặc bộ này',
  '存进衣柜…': 'Đang lưu vào tủ đồ…',
  '存成一套': 'Lưu thành một bộ',
  '在画…': 'Đang vẽ…',
  '试穿图': 'Ảnh mặc thử',
  '存过的搭配': 'Các bộ đã lưu',
  '衣柜或搭配': 'Tủ đồ hoặc phối đồ',
  '搭配': 'Phối đồ',
  '拍照或选图片': 'Chụp ảnh hoặc chọn ảnh',
  '相册里没有能放进来的照片': 'Trong album không có ảnh nào đưa vào được',
  '从相册选': 'Chọn từ album',
  '认好了': 'Đã nhận diện xong',
  '写一件衣服': 'Viết mô tả trang phục',
  '比如：白色亚麻衬衫': 'VD: Áo sơ mi vải lanh trắng',
  '颜色、款式、材质、图案……': 'Màu sắc, kiểu dáng, chất liệu, họa tiết…',
  '重新识别': 'Nhận diện lại',
  '照片还留在相册里。': 'Ảnh vẫn được giữ trong album.',
  '还在认这件衣服，等一下': 'Vẫn đang nhận diện trang phục này, vui lòng đợi',
  '先给选中的衣服写上描述': 'Hãy viết mô tả cho trang phục đã chọn trước',
  '还没有设置绘图引擎': 'Chưa thiết lập engine vẽ ảnh',
  '试穿图画好了，相册的「衣柜试穿」里也有': 'Đã vẽ xong ảnh mặc thử, cũng có trong mục "Mặc thử tủ đồ" của Album',
  '这套存过了，在下面「存过的搭配」里': 'Bộ này đã lưu rồi, ở mục "Các bộ đã lưu" bên dưới',
  '存好了，在下面「存过的搭配」里': 'Đã lưu, ở mục "Các bộ đã lưu" bên dưới',
  '发给…': 'Gửi cho…',
  '这身': 'Bộ này',
  '脱下了': 'Đã cởi ra',
  '开场白': 'Lời mở đầu',
  '走向': 'Hướng đi cốt truyện',
  '群聊没有单独的角色卡：打开一张角色卡再写': 'Nhóm chat không có thẻ nhân vật riêng: hãy mở một thẻ nhân vật rồi viết',
  '先在酒馆里打开一张角色卡': 'Hãy mở một thẻ nhân vật trong quán rượu trước',
  '指定情境': 'Chỉ định tình huống',
  '开场方式': 'Cách mở đầu',
  '情境': 'Tình huống',
  '出场人物（选填）': 'Nhân vật xuất hiện (tùy chọn)',
  '再写一版': 'Viết thêm bản nữa',
  '上一版': 'Bản trước',
  '下一版': 'Bản sau',
  '在改…': 'Đang sửa…',
  '改一改': 'Sửa lại',
  '写入聊天': 'Ghi vào cuộc trò chuyện',
  '会加成开场白的新一版，左右滑能换回原来的': 'Sẽ thêm thành một bản mở đầu mới, vuốt trái/phải để đổi về bản cũ',
  '会成为这段聊天的第一条消息': 'Sẽ trở thành tin nhắn đầu tiên của cuộc trò chuyện này',
  '想要什么样的（选填）': 'Muốn kiểu như thế nào (tùy chọn)',
  '换上这个人设': 'Đổi sang thiết lập nhân vật (Persona) này',
  '存成酒馆人设': 'Lưu thành Persona của quán rượu',
  '想要（选填）': 'Mong muốn (tùy chọn)',
  '换一批': 'Đổi loạt khác',
  '想想接下来': 'Nghĩ diễn biến tiếp theo',
  '自己写一个': 'Tự viết một cái',
  '念出来': 'Đọc thành tiếng',
  '念出来的剧本': 'Kịch bản đọc thành tiếng',
  '做成卡片': 'Tạo thành thẻ',
  '形式': 'Hình thức',
  '接着剧情': 'Tiếp nối cốt truyện',
  '只用设定': 'Chỉ dùng thiết lập',
  '从哪来': 'Lấy từ đâu',
  '想看什么（选填）': 'Muốn xem gì (tùy chọn)',
  '写一段': 'Viết một đoạn',
  '写过的小剧场': 'Tiểu kịch trường đã viết',
  '剧本': 'Kịch bản',
  '写什么': 'Viết gì',
  '加到聊天最后？': 'Thêm vào cuối cuộc trò chuyện?'
};

const exact = new Map(Object.entries(EXACT));
for (const [k, v] of Object.entries(EXACT2)) exact.set(k, v);
for (const [k, v] of Object.entries(EXACT3)) exact.set(k, v);
for (const [k, v] of Object.entries(NEW_EXACT)) exact.set(k, v);

const subs = [...SUBS, ...SUBS3].sort((a, b) => b[0].length - a[0].length);
const norm = s => s.replace(/\s+/g, ' ');
const exactN = new Map();
for (const [k, v] of exact) { const n = norm(k); if (n !== k && !exactN.has(n)) exactN.set(n, v); }
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const pats = PATTERNS.map(([zh, vi]) => {
  const parts = zh.split('⟦⟧');
  const lit = parts.reduce((a, b) => (b.length > a.length ? b : a), '');
  const cjkN = (zh.match(/[㐀-鿿]/g) || []).length;
  const grp = cjkN < 3 ? '([^\\n]{0,40}?)' : '([\\s\\S]*?)';
  return {re: new RegExp('^' + parts.map(esc).join(grp) + '$'), lit, vi: vi.split('⟦⟧')};
});
const cache = new Map();
const WD = {日: 'Chủ Nhật', 一: 'Thứ Hai', 二: 'Thứ Ba', 三: 'Thứ Tư', 四: 'Thứ Năm', 五: 'Thứ Sáu', 六: 'Thứ Bảy'};

export function isViEnabled(win = window) {
  try { return win.localStorage.getItem(STORAGE_KEY) !== 'off'; } catch { return true; }
}

function fill(p, m) {
  let out = p.vi[0];
  for (let i = 1; i < p.vi.length; i++) {
    let g = m[i] ?? '';
    if (CJK.test(g)) { const t = lookup(g.trim()); if (t != null) g = g.replace(g.trim(), t); }
    if (WD[g] && out.endsWith('Thứ ')) { out = out.slice(0, -4) + WD[g]; g = ''; }
    out += g + p.vi[i];
  }
  return out;
}

function lookup(t) {
  if (!t || !CJK.test(t)) return null;
  for (const [re, vi] of PRE) { if (re.test(t)) return t.replace(re, vi); }
  const hit = exact.get(t);
  if (hit != null) return hit;
  const n = norm(t);
  const h2 = exactN.get(n) ?? exact.get(n);
  if (h2 != null) return h2;
  if (n.length > 600) return null;
  for (const p of pats) {
    if (!n.includes(p.lit)) continue;
    const m = p.re.exec(n);
    if (m) return fill(p, m);
  }
  return null;
}

const cjkCount = s => (s.match(/[㐀-鿿]/g) || []).length;

function subst(text) {
  if (text.length > 600) return text;
  let o = text;
  for (const [re, vi] of SUBR3) {
    re.lastIndex = 0;
    o = o.replace(re, (...a) => {
      const g = a.slice(1, -2);
      return vi.replace(/\$(\d)/g, (m, d) => {
        const x = g[d - 1];
        return x == null ? '' : (exact.get(x.trim()) ?? x);
      });
    });
  }
  for (const [zh, vi] of subs) if (o.includes(zh)) o = o.split(zh).join(vi);
  for (const [re, vi] of SUBR) { re.lastIndex = 0; o = o.replace(re, vi); }
  if (o === text) return text;
  return o.replace(/。(?=\S)/g, '. ').replace(/。/g, '.');
}

export function translate(text) {
  if (typeof text !== 'string' || text.length > 1500 || !CJK.test(text)) return text;
  if (cache.has(text)) return cache.get(text);
  const t = text.trim();
  const r = lookup(t);
  let out = text;
  if (r != null) {
    const i = text.indexOf(t);
    out = text.slice(0, i) + r + text.slice(i + t.length);
  }
  if (r == null || cjkCount(out) > 0) {
    const b = subst(text);
    if (b !== text && (r == null || cjkCount(b) < cjkCount(out))) out = b;
  }
  if (cache.size > 4000) cache.clear();
  cache.set(text, out);
  return out;
}

const skipped = (n, isMainHost) => {
  const el = n.nodeType === 1 ? n : n.parentElement;
  if (!el || el.closest?.(SKIP)) return true;
  if (isMainHost && !el.closest?.(HOST_OWNED)) return true;
  return false;
};

const trackedText = new Set();
const trackedEls = new Set();

function doText(n, viOn, isMainHost) {
  if (skipped(n, isMainHost)) return;
  const v = n.nodeValue;
  if (!viOn) {
    if (n.__viOrig != null && v === n.__viOut) n.nodeValue = n.__viOrig;
    return;
  }
  if (!v || v === n.__viOut) return;
  const src = (n.__viOrig != null && v === n.__viOut) ? n.__viOrig : v;
  if (!CJK.test(src)) return;
  const o = translate(src);
  n.__viOrig = src;
  n.__viOut = o;
  trackedText.add(n);
  if (o !== v) n.nodeValue = o;
}

function doEl(el, viOn, isMainHost) {
  if (skipped(el, isMainHost)) return;
  for (const a of ATTRS) {
    const v = el.getAttribute?.(a);
    if (!viOn) {
      const orig = el.__viAttrOrig?.[a];
      if (orig != null && v === el.__viAttrOut?.[a]) el.setAttribute(a, orig);
      continue;
    }
    if (!v || v === el.__viAttrOut?.[a]) continue;
    if (!CJK.test(v)) continue;
    const o = translate(v);
    (el.__viAttrOrig ??= {})[a] = v;
    (el.__viAttrOut ??= {})[a] = o;
    trackedEls.add(el);
    if (o !== v) el.setAttribute(a, o);
  }
  if (el.tagName === 'INPUT' && /^(button|submit|reset)$/i.test(el.type)) {
    const v = el.value;
    if (!viOn) {
      if (el.__viValOrig != null && v === el.__viValOut) el.value = el.__viValOrig;
      return;
    }
    if (v && v !== el.__viValOut && CJK.test(v)) {
      const o = translate(v);
      el.__viValOrig = v;
      el.__viValOut = o;
      trackedEls.add(el);
      if (o !== v) el.value = o;
    }
  }
}

function walk(root, viOn, isMainHost) {
  if (!root) return;
  if (root.nodeType === 3) return doText(root, viOn, isMainHost);
  if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
  if (root.nodeType === 1) {
    if (root.matches?.(SKIP)) return;
    if (isMainHost && !root.closest?.(HOST_OWNED)) {
      root.querySelectorAll?.(HOST_OWNED).forEach(sub => walk(sub, viOn, false));
      return;
    }
    doEl(root, viOn, false);
  }
  const doc = root.ownerDocument || root;
  const tw = doc.createTreeWalker(root, 4 | 1, {
    acceptNode: n => (n.nodeType === 1 && n.matches?.(SKIP) ? 2 : 1)
  });
  let n;
  while ((n = tw.nextNode())) {
    if (n.nodeType === 3) doText(n, viOn, false);
    else doEl(n, viOn, false);
  }
}

function restoreAll() {
  for (const n of trackedText) {
    if (!n.isConnected) { trackedText.delete(n); continue; }
    if (n.__viOrig != null && n.nodeValue === n.__viOut) n.nodeValue = n.__viOrig;
  }
  for (const el of trackedEls) {
    if (!el.isConnected) { trackedEls.delete(el); continue; }
    if (el.__viAttrOrig) {
      for (const a of ATTRS) {
        if (el.__viAttrOrig[a] != null && el.getAttribute(a) === el.__viAttrOut?.[a]) {
          el.setAttribute(a, el.__viAttrOrig[a]);
        }
      }
    }
    if (el.__viValOrig != null && el.value === el.__viValOut) el.value = el.__viValOrig;
  }
}

function mountSwitchButtons(doc, viOn, toggle) {
  const label = viOn ? '🌐 VI' : '🌐 中';
  const tip = viOn ? 'Đang dùng Tiếng Việt (Bấm để đổi sang Tiếng Trung / 切换中文)' : '当前为中文界面（点击切换越南语 / Đổi sang Tiếng Việt）';

  // 1. Nút trên thanh tiêu đề của điện thoại (trong iframe ui/index.html)
  const stageActions = doc.querySelector('.stage-actions');
  if (stageActions && !stageActions.querySelector('[data-vi-toggle]')) {
    const btn = doc.createElement('button');
    btn.type = 'button';
    btn.dataset.viToggle = '1';
    btn.dataset.noVi = '1';
    btn.className = 'size-button';
    btn.style.cssText = 'padding:0 6px;font-size:11px;font-weight:600;cursor:pointer;min-width:38px;';
    stageActions.prepend(btn);
    btn.addEventListener('click', e => { e.stopPropagation(); toggle(); });
  }

  // 2. Nút trong bảng mở rộng ST-iPhonie của SillyTavern (cửa sổ chính)
  const drawer = doc.querySelector('#sttts-extension-entry .inline-drawer-content');
  if (drawer && !drawer.querySelector('[data-vi-toggle]')) {
    const btn = doc.createElement('button');
    btn.type = 'button';
    btn.dataset.viToggle = '1';
    btn.dataset.noVi = '1';
    btn.className = 'menu_button';
    btn.style.cssText = 'margin-left:6px;width:auto;padding:0 10px;';
    drawer.append(btn);
    btn.addEventListener('click', e => { e.stopPropagation(); toggle(); });
  }

  doc.querySelectorAll('[data-vi-toggle]').forEach(btn => {
    btn.textContent = label;
    btn.title = tip;
  });
}

export function install(win = window) {
  const doc = win.document;
  if (win.__sttsViInstalled) return;
  win.__sttsViInstalled = true;

  const isMainHost = win === win.top && !doc.getElementById('root');
  let viOn = isViEnabled(win);
  let flushing = false;
  const queue = new Set();
  let timer = 0;

  const flush = () => {
    timer = 0;
    if (flushing) return;
    flushing = true;
    try {
      const q = [...queue];
      queue.clear();
      if (viOn) {
        for (const n of q) { try { walk(n, true, isMainHost); } catch {} }
      }
      mountSwitchButtons(doc, viOn, toggleLanguage);
    } finally {
      flushing = false;
    }
  };

  const later = () => { if (!timer) timer = win.setTimeout(flush, 16); };

  function applyLanguage(nextVi) {
    viOn = nextVi;
    doc.documentElement.setAttribute('lang', viOn ? 'vi' : 'zh-CN');
    flushing = true;
    try {
      if (!viOn) restoreAll();
      else walk(doc.documentElement, true, isMainHost);
      mountSwitchButtons(doc, viOn, toggleLanguage);
    } finally {
      flushing = false;
    }
  }

  function toggleLanguage() {
    const nextVi = !viOn;
    try { win.localStorage.setItem(STORAGE_KEY, nextVi ? 'on' : 'off'); } catch {}
    applyLanguage(nextVi);
    try {
      if (win.parent && win.parent !== win) win.parent.__sttsViSync?.(nextVi);
      doc.querySelectorAll('iframe').forEach(f => f.contentWindow?.__sttsViSync?.(nextVi));
    } catch {}
  }

  win.__sttsViSync = nextVi => {
    if (nextVi !== viOn) applyLanguage(nextVi);
  };
  win.addEventListener('storage', e => {
    if (e.key === STORAGE_KEY) applyLanguage(e.newValue !== 'off');
  });

  const mo = new win.MutationObserver(list => {
    if (flushing) return;
    for (const m of list) {
      if (m.type === 'childList') {
        m.addedNodes.forEach(n => {
          if (n.nodeType !== 1 && n.nodeType !== 3) return;
          if (isMainHost) {
            const el = n.nodeType === 1 ? n : n.parentElement;
            if (!el || (!el.closest?.(HOST_OWNED) && !el.querySelector?.(HOST_OWNED))) return;
          }
          queue.add(n);
        });
      } else if (m.type === 'characterData' || m.type === 'attributes') {
        if (isMainHost && !m.target.parentElement?.closest?.(HOST_OWNED)) continue;
        queue.add(m.target);
      }
    }
    if (queue.size) later();
  });

  const start = () => {
    applyLanguage(isViEnabled(win));
    mo.observe(doc.documentElement, {
      childList: true, subtree: true, characterData: true,
      attributes: true, attributeFilter: ATTRS
    });
  };

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', start, {once: true});
  else start();

  for (const f of ['alert', 'confirm', 'prompt']) {
    const orig = win[f]?.bind(win);
    if (!orig) continue;
    win[f] = (msg, ...rest) => orig(viOn && typeof msg === 'string' ? translate(msg) : msg, ...rest);
  }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') install(window);
