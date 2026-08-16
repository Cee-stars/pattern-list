/* ===========================================================
   構文辞書 - アプリ本体
   ・検索欄は最上部に固定。入力するそばから候補を絞り込む
   ・一致箇所はハイライトし、関連度の高い順に並べる
   =========================================================== */

(function () {
  "use strict";

  /* ---------- 要素 ---------- */
  const $q       = document.getElementById("q");
  const $clear   = document.getElementById("clear");
  const $filters = document.getElementById("filters");
  const $list    = document.getElementById("list");
  const $hits    = document.getElementById("hits");
  const $empty   = document.getElementById("empty");
  const $detail  = document.getElementById("detail");
  const $total   = document.getElementById("total");
  const $mineNum = document.getElementById("mineCount");
  const $add     = document.getElementById("add");
  const $mytools = document.getElementById("mytools");
  const $file    = document.getElementById("importFile");
  const $editor  = document.getElementById("editor");
  const $form    = document.getElementById("editorForm");
  const $err     = document.getElementById("editorErr");
  const $del     = document.getElementById("editorDelete");
  const $exList  = document.getElementById("f-ex");
  const $catList = document.getElementById("catlist");

  /* ---------- 状態 ---------- */
  const LEVEL_ORDER = { "基本": 0, "標準": 1, "発展": 2 };
  const FAV_CAT  = "@fav";   // 絞り込みの特別枠
  const HIST_CAT = "@hist";
  const MINE_CAT = "@mine";
  const HIST_MAX = 40;
  const MINE_FALLBACK_CAT = "自作";   // カテゴリ未入力のときの受け皿
  const EX_MAX = 8;                   // 1項目に足せる例文の数

  let currentCat = "*";     // 絞り込み中のカテゴリ
  let results = [];         // 表示中の項目（描画順）
  let activeIndex = -1;     // キーボードで選択中の位置
  let selectedId = null;    // 語釈を表示中の項目
  let editingId = null;     // フォームで編集中の項目（新規のときは null）

  /* ---------- お気に入り・履歴（端末に保存） ---------- */

  function load(key) {
    try {
      const v = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(v) ? v.filter(x => typeof x === "string") : [];
    } catch (e) {
      return [];
    }
  }

  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* 保存できなくても動く */ }
  }

  let favs = load("kobun.fav");
  let hist = load("kobun.hist");

  function isFav(id) { return favs.indexOf(id) !== -1; }

  function toggleFav(id) {
    const i = favs.indexOf(id);
    if (i === -1) favs.unshift(id); else favs.splice(i, 1);
    save("kobun.fav", favs);
    updateChipCounts();
  }

  function pushHist(id) {
    const i = hist.indexOf(id);
    if (i !== -1) hist.splice(i, 1);
    hist.unshift(id);
    if (hist.length > HIST_MAX) hist.length = HIST_MAX;
    save("kobun.hist", hist);
    updateChipCounts();
  }

  /* ===========================================================
     0. 自作の項目（マイ構文）
     data.js に手を入れなくても、この場で項目を作れるようにする。
     保存先はお気に入りと同じ localStorage。
     読み込むデータは外から来ることもある（書き出したファイルの読み込み）ので、
     使う前に必ず形を整えてから ENTRIES と同じ土俵に乗せる。
     =========================================================== */

  const USER_KEY = "kobun.mine";

  function text(v, max, multiline) {
    if (typeof v !== "string") return "";
    const s = multiline ? v.replace(/\r\n?/g, "\n") : v.replace(/\s+/g, " ");
    return s.trim().slice(0, max);
  }

  function newId() {
    return "my-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);
  }

  /* 欠けている項目は補い、余計な項目は落とす。見出しか意味が空なら項目として認めない */
  function sanitize(o) {
    if (!o || typeof o !== "object") return null;
    const pattern = text(o.pattern, 120);
    const jp      = text(o.jp, 120);
    if (!pattern || !jp) return null;

    const ex = (Array.isArray(o.ex) ? o.ex : [])
      .map(x => ({ en: text(x && x.en, 300), ja: text(x && x.ja, 300) }))
      .filter(x => x.en || x.ja)
      .slice(0, EX_MAX);

    return {
      id:      typeof o.id === "string" && /^[A-Za-z0-9_-]{1,40}$/.test(o.id) ? o.id : newId(),
      pattern: pattern,
      jp:      jp,
      cat:     text(o.cat, 30) || MINE_FALLBACK_CAT,
      level:   Object.prototype.hasOwnProperty.call(LEVEL_ORDER, o.level) ? o.level : "標準",
      ex:      ex,
      note:    text(o.note, 400, true),
      keys:    (Array.isArray(o.keys) ? o.keys : []).map(k => text(k, 40)).filter(Boolean).slice(0, 12),
      mine:    true
    };
  }

  function loadMine() {
    try {
      const v = JSON.parse(localStorage.getItem(USER_KEY) || "[]");
      if (!Array.isArray(v)) return [];
      const seen = new Set(ENTRIES.map(e => e.id));
      const out = [];
      for (const raw of v) {
        const e = sanitize(raw);
        if (!e) continue;
        if (seen.has(e.id)) e.id = newId();
        seen.add(e.id);
        out.push(e);
      }
      return out;
    } catch (err) {
      return [];
    }
  }

  let mine = loadMine();   // 新しく作ったものが先頭

  function saveMine() {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(mine));
      return true;
    } catch (err) {
      // 容量オーバーなど。黙って消えると困るので呼び出し側に伝える
      return false;
    }
  }

  function isMine(id) { return mine.some(e => e.id === id); }

  /* ===========================================================
     1. 文字の正規化
     全角→半角・カタカナ→ひらがな・大文字→小文字を
     「1文字は1文字のまま」変換する。長さが変わらないので、
     正規化した文字列で見つけた位置を元の文字列にそのまま使える。
     =========================================================== */

  function norm(str) {
    let out = "";
    for (const ch of str) {
      const c = ch.codePointAt(0);
      let m = ch;

      if (c >= 0xff01 && c <= 0xff5e) {        // 全角英数記号 → 半角
        m = String.fromCharCode(c - 0xfee0);
      } else if (c === 0x3000) {                // 全角スペース
        m = " ";
      } else if (c >= 0x30a1 && c <= 0x30f6) {  // カタカナ → ひらがな
        m = String.fromCharCode(c - 0x60);
      } else if (c === 0x301c || c === 0x223c) { // 〜 ∼ → ~
        m = "~";
      } else if (c === 0xff65) {                 // 半角中点
        m = "・";
      }

      out += m.toLowerCase();
    }
    return out;
  }

  /* 検索対象の文字列を項目ごとに前もって作っておく（毎回作ると重いので）。
     自作の項目が増減したら作り直す。 */

  let ALL = [];      // 収録データ ＋ 自作
  let INDEX = [];    // 検索用。カテゴリ順に並べてある
  let CATS = [];     // 表示するカテゴリ（data.js の順 → 自作で増えたぶん）

  function buildCats() {
    const out = CATEGORIES.slice();
    for (const e of mine) if (out.indexOf(e.cat) === -1) out.push(e.cat);
    return out;
  }

  function rebuild() {
    ALL  = ENTRIES.concat(mine);
    CATS = buildCats();

    INDEX = ALL.map((e, i) => {
      const exText = (e.ex || []).map(x => x.en + " " + x.ja).join(" ");
      return {
        entry: e,
        order: i,
        rank:  CATS.indexOf(e.cat),
        nPattern: norm(e.pattern),
        nJp:      norm(e.jp),
        nKeys:    norm((e.keys || []).join(" ")),
        nCat:     norm(e.cat),
        nEx:      norm(exText),
        nNote:    norm(e.note || "")
      };
    });

    // 未入力時はカテゴリ順に読めるように。自作は同じカテゴリの末尾へ回す
    INDEX.sort((a, b) =>
      (a.rank - b.rank) ||
      ((a.entry.mine ? 1 : 0) - (b.entry.mine ? 1 : 0)) ||
      (a.order - b.order)
    );
    INDEX.forEach((r, i) => { r.order = i; });
  }

  rebuild();

  function findEntry(id) { return ALL.find(e => e.id === id) || null; }

  /* ===========================================================
     2. 検索
     空白区切りは AND 検索。語ごとに一致した場所で点数をつけ、
     見出しに近い一致ほど高い点にする（辞書の引き心地に寄せる）。
     =========================================================== */

  function tokenize(raw) {
    return norm(raw).split(/[\s　]+/).filter(Boolean);
  }

  function scoreToken(rec, t) {
    let s = 0;
    if (rec.nPattern === t)                 s += 240;
    else if (rec.nPattern.startsWith(t))    s += 140;
    else if (rec.nPattern.includes(t))      s += 90;

    if (rec.nJp.startsWith(t))              s += 70;
    else if (rec.nJp.includes(t))           s += 55;

    if (rec.nKeys.includes(t))              s += 34;
    if (rec.nCat.includes(t))               s += 26;
    if (rec.nEx.includes(t))                s += 14;
    if (rec.nNote.includes(t))              s += 8;
    return s;
  }

  /* 絞り込み中の枠に入っている項目だけを、その枠の並び順で取り出す */
  function pickPool() {
    if (currentCat === FAV_CAT || currentCat === HIST_CAT || currentCat === MINE_CAT) {
      // どれも「登録した順（新しいものが先頭）」に並べたい枠
      const ids = currentCat === FAV_CAT ? favs
                : currentCat === HIST_CAT ? hist
                : mine.map(e => e.id);
      const byId = new Map(INDEX.map(r => [r.entry.id, r]));
      return ids.map(id => byId.get(id)).filter(Boolean);
    }
    return INDEX.filter(r => currentCat === "*" || r.entry.cat === currentCat);
  }

  function search(raw) {
    const tokens = tokenize(raw);
    const pool = pickPool();

    if (!tokens.length) {
      // 無入力のときは辞書の本文と同じ並び（カテゴリ順 → 収録順）
      return pool.map(r => ({ rec: r, score: 0, tokens: [] }));
    }

    const hit = [];
    for (const rec of pool) {
      let total = 0;
      let ok = true;
      for (const t of tokens) {
        const s = scoreToken(rec, t);
        if (s === 0) { ok = false; break; }   // AND 条件
        total += s;
      }
      if (ok) hit.push({ rec, score: total, tokens });
    }

    hit.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      // 同点なら見出しが短いもの、次に基本→標準→発展、最後に収録順
      const la = a.rec.nPattern.length, lb = b.rec.nPattern.length;
      if (la !== lb) return la - lb;
      const va = LEVEL_ORDER[a.rec.entry.level], vb = LEVEL_ORDER[b.rec.entry.level];
      if (va !== vb) return va - vb;
      return a.rec.order - b.rec.order;
    });
    return hit;
  }

  /* ===========================================================
     3. ハイライト
     =========================================================== */

  function esc(s) {
    return s.replace(/[&<>"']/g, c => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    ));
  }

  function ranges(text, tokens) {
    const n = norm(text);
    const found = [];
    for (const t of tokens) {
      if (!t) continue;
      let from = 0;
      for (;;) {
        const i = n.indexOf(t, from);
        if (i === -1) break;
        found.push([i, i + t.length]);
        from = i + 1;                       // 重なりも拾う
      }
    }
    if (!found.length) return [];
    found.sort((a, b) => a[0] - b[0]);
    const merged = [found[0]];
    for (let i = 1; i < found.length; i++) {
      const last = merged[merged.length - 1];
      if (found[i][0] <= last[1]) last[1] = Math.max(last[1], found[i][1]);
      else merged.push(found[i]);
    }
    return merged;
  }

  function hl(text, tokens) {
    if (!text) return "";
    if (!tokens || !tokens.length) return esc(text);
    const rs = ranges(text, tokens);
    if (!rs.length) return esc(text);

    let out = "", pos = 0;
    for (const [a, b] of rs) {
      out += esc(text.slice(pos, a)) + "<mark>" + esc(text.slice(a, b)) + "</mark>";
      pos = b;
    }
    return out + esc(text.slice(pos));
  }

  /* 例文のうち、一致した1文だけを抜き出して一覧に添える */
  function snippet(entry, tokens) {
    if (!tokens.length) return "";
    for (const x of entry.ex) {
      if (ranges(x.en, tokens).length) return hl(x.en, tokens);
    }
    for (const x of entry.ex) {
      if (ranges(x.ja, tokens).length) return hl(x.ja, tokens);
    }
    if (entry.note && ranges(entry.note, tokens).length) return hl(entry.note, tokens);
    return "";
  }

  /* ===========================================================
     4. 一覧の描画
     =========================================================== */

  function render(raw) {
    results = search(raw);
    const tokens = results.length ? results[0].tokens : tokenize(raw);
    // 無入力かつ全件表示のときだけカテゴリ見出しを挟む
    // （お気に入り・履歴は登録順に並べたいので挟まない）
    const grouped = tokens.length === 0 && currentCat === "*";

    let html = "";
    let lastCat = null;

    results.forEach((r, i) => {
      const e = r.rec.entry;

      if (grouped && e.cat !== lastCat) {
        html += '<div class="group">' + esc(e.cat) + "</div>";
        lastCat = e.cat;
      }

      const snip = snippet(e, tokens);
      html +=
        '<button type="button" class="item" role="option" aria-selected="false" data-i="' + i + '" data-id="' + e.id + '">' +
          '<div class="item__pattern">' + hl(e.pattern, tokens) + "</div>" +
          '<div class="item__jp">' + hl(e.jp, tokens) + "</div>" +
          '<div class="item__meta">' +
            '<span class="tag">' + esc(e.cat) + "</span>" +
            '<span class="tag lv--' + e.level + '">' + e.level + "</span>" +
            (e.mine ? '<span class="tag tag--mine">自作</span>' : "") +
          "</div>" +
          (snip ? '<div class="item__snip">' + snip + "</div>" : "") +
        "</button>";
    });

    $list.innerHTML = html;
    $empty.hidden = results.length > 0;
    $empty.innerHTML = emptyMessage();
    $mytools.hidden = currentCat !== MINE_CAT;

    const q = raw.trim();
    if (!q) {
      $hits.innerHTML = "全 <b>" + results.length + "</b> 項目" +
        (currentCat === "*" ? "" : "（" + esc(catLabel(currentCat)) + "）");
    } else {
      $hits.innerHTML = "<b>" + results.length + "</b> 件ヒット　" +
        '<span style="opacity:.75">' + esc(q) + "</span>";
    }

    // 検索中は先頭を自動で選び、辞書のように語釈をすぐ見せる
    if (q && results.length) {
      setActive(0, false);
      showDetail(results[0].rec.entry, tokens, false);
    } else if (q) {
      // ヒット0件のときは前の語釈を残さない
      activeIndex = -1;
      selectedId = null;
      showPlaceholder();
    } else {
      activeIndex = -1;
      markActive();
      if (!q && !selectedId) showPlaceholder();
    }
  }

  function catLabel(c) {
    if (c === FAV_CAT) return "お気に入り";
    if (c === HIST_CAT) return "履歴";
    if (c === MINE_CAT) return "マイ構文";
    return c;
  }

  /* ヒット0件のときの案内は、絞り込み中の枠によって出し分ける */
  function emptyMessage() {
    const typing = $q.value.trim() !== "";

    if (!typing && currentCat === FAV_CAT) {
      return '<span class="empty__big">お気に入りはまだありません</span>' +
             '<span class="empty__sub">語釈の右上の ☆ を押すと、ここにたまっていきます。</span>';
    }
    if (!typing && currentCat === HIST_CAT) {
      return '<span class="empty__big">履歴はまだありません</span>' +
             '<span class="empty__sub">一度引いた構文が新しい順に並びます。</span>';
    }
    if (!typing && currentCat === MINE_CAT) {
      return '<span class="empty__big">自作の構文はまだありません</span>' +
             '<span class="empty__sub">上の <em>＋ 新しく作る</em> から、覚えたい構文を自分で足せます。<br>' +
             "収録ぶんと同じように検索・お気に入り・関連表示の対象になります。</span>";
    }
    return '<span class="empty__big">見つかりませんでした</span>' +
           '<span class="empty__sub">別のことば、または一部だけで検索してみてください。<br>' +
           "例: <em>as if</em> ／ <em>倒置</em> ／ <em>しても無駄</em></span>";
  }

  /* ---------- キーボード選択 ---------- */

  function markActive() {
    const nodes = $list.querySelectorAll(".item");
    nodes.forEach((n, i) => {
      const on = i === activeIndex;
      n.classList.toggle("is-active", on);
      n.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  function setActive(i, scroll) {
    if (!results.length) return;
    activeIndex = Math.max(0, Math.min(results.length - 1, i));
    markActive();
    if (scroll !== false) {
      const node = $list.querySelector('.item[data-i="' + activeIndex + '"]');
      if (node) node.scrollIntoView({ block: "nearest" });
    }
  }

  /* ===========================================================
     5. 語釈の描画
     =========================================================== */

  function showPlaceholder() {
    $detail.innerHTML =
      '<div class="placeholder">' +
        '<span class="placeholder__mark">📖</span>' +
        "調べたい構文を上の検索欄に入力するか、<br>左の一覧から選んでください。<br><br>" +
        "英語でも日本語でも引けます。<br>" +
        '<em style="font-style:normal;color:var(--accent-sub)">as if</em> ／ ' +
        '<em style="font-style:normal;color:var(--accent-sub)">せずにはいられない</em> ／ ' +
        '<em style="font-style:normal;color:var(--accent-sub)">倒置</em>' +
      "</div>";
  }

  function related(entry) {
    const keys = new Set((entry.keys || []).map(norm));
    const scored = ALL
      .filter(e => e.id !== entry.id)
      .map((e, i) => {
        // 同じ文法分野を優先し、共有キーワードの数で細かく順位をつける
        let s = 0;
        if (e.cat === entry.cat) s += 3;
        for (const k of (e.keys || [])) if (keys.has(norm(k))) s += 2;
        if (norm(e.note || "").includes(norm(entry.pattern.split(" ")[0]))) s += 1;
        return { e, s, i };
      })
      .filter(x => x.s > 0)
      .sort((a, b) => (b.s - a.s) || (a.i - b.i))
      .slice(0, 4);
    return scored.map(x => x.e);
  }

  function showDetail(entry, tokens, focusSheet) {
    selectedId = entry.id;
    const t = tokens || [];

    let html = '<button type="button" class="detail__close" id="sheetClose">閉じる</button>';

    const on = isFav(entry.id);
    html +=
      '<div class="detail__head">' +
        '<button type="button" class="star' + (on ? " is-on" : "") + '" id="star"' +
          ' aria-pressed="' + on + '"' +
          ' title="' + (on ? "お気に入りから外す" : "お気に入りに入れる") + '">' +
          (on ? "★" : "☆") +
        "</button>" +
        '<div class="detail__cat">' + esc(entry.cat) + "</div>" +
        '<h2 class="detail__pattern">' + hl(entry.pattern, t) + "</h2>" +
        '<p class="detail__jp">' + hl(entry.jp, t) + "</p>" +
        '<div class="detail__meta">' +
          '<span class="tag lv--' + entry.level + '">' + entry.level + "</span>" +
          '<span class="tag">' + esc(entry.id) + "</span>" +
          (entry.mine ? '<span class="tag tag--mine">自作</span>' : "") +
        "</div>" +
        (entry.mine
          ? '<div class="detail__own">' +
              '<button type="button" class="mini" id="editThis">編集</button>' +
              '<button type="button" class="mini mini--danger" id="delThis">削除</button>' +
            "</div>"
          : "") +
      "</div>";

    if (entry.ex && entry.ex.length) {
      html += '<div class="sec"><h3 class="sec__title">例文</h3>';
      for (const x of entry.ex) {
        html +=
          '<div class="ex">' +
            '<div class="ex__en">' + hl(x.en, t) + "</div>" +
            '<div class="ex__ja">' + hl(x.ja, t) + "</div>" +
          "</div>";
      }
      html += "</div>";
    }

    if (entry.note) {
      html += '<div class="sec"><h3 class="sec__title">ポイント</h3>' +
              '<div class="note">' + hl(entry.note, t) + "</div></div>";
    }

    if (entry.keys && entry.keys.length) {
      html += '<div class="sec"><h3 class="sec__title">関連キーワード</h3><div class="keys">';
      for (const k of entry.keys) {
        html += '<button type="button" class="key" data-key="' + esc(k) + '">' + esc(k) + "</button>";
      }
      html += "</div></div>";
    }

    const rel = related(entry);
    if (rel.length) {
      html += '<div class="sec"><h3 class="sec__title">あわせて引く</h3><div class="related">';
      for (const r of rel) {
        html += '<button type="button" class="rel" data-goto="' + r.id + '">' +
                  "<b>" + esc(r.pattern) + "</b><span>" + esc(r.jp) + "</span>" +
                "</button>";
      }
      html += "</div></div>";
    }

    $detail.innerHTML = html;
    $detail.scrollTop = 0;

    if (focusSheet) $detail.classList.add("is-open");
    if (history.replaceState) history.replaceState(null, "", "#" + entry.id);
  }

  /* 明示的に開いたときだけ履歴に残す（入力中の自動プレビューは残さない） */
  function openById(id, tokens) {
    const e = findEntry(id);
    if (!e) return;
    showDetail(e, tokens || [], true);
    pushHist(id);
  }

  /* ===========================================================
     6. 自作の項目をつくる・直す・消す
     =========================================================== */

  const $exAdd = document.getElementById("exAdd");

  function fld(id) { return document.getElementById(id); }

  /* 例文1組ぶんの入力欄。DOM を組み立てて作るので、入れた文字がそのまま値になる */
  function exRow(en, ja) {
    const row = document.createElement("div");
    row.className = "exrow";

    const a = document.createElement("input");
    a.type = "text";
    a.className = "field__input field__input--en";
    a.dataset.ex = "en";
    a.placeholder = "英文";
    a.maxLength = 300;
    a.autocomplete = "off";
    a.spellcheck = false;
    a.value = en || "";

    const b = document.createElement("input");
    b.type = "text";
    b.className = "field__input";
    b.dataset.ex = "ja";
    b.placeholder = "訳";
    b.maxLength = 300;
    b.autocomplete = "off";
    b.value = ja || "";

    const x = document.createElement("button");
    x.type = "button";
    x.className = "exrow__x";
    x.textContent = "×";
    x.setAttribute("aria-label", "この例文を消す");

    row.appendChild(a);
    row.appendChild(b);
    row.appendChild(x);
    return row;
  }

  function addExRow(en, ja) {
    if ($exList.children.length >= EX_MAX) return;
    $exList.appendChild(exRow(en, ja));
    syncExAdd();
  }

  function syncExAdd() {
    $exAdd.disabled = $exList.children.length >= EX_MAX;
  }

  function showErr(msg) {
    $err.textContent = msg;
    $err.hidden = false;
  }

  function openEditor(id) {
    const e = id ? findEntry(id) : null;
    editingId = (e && e.mine) ? e.id : null;

    document.getElementById("editorTitle").textContent = editingId ? "構文を直す" : "構文をつくる";
    $del.hidden = !editingId;
    $err.hidden = true;

    fld("f-pattern").value = e ? e.pattern : "";
    fld("f-jp").value      = e ? e.jp : "";
    fld("f-cat").value     = e ? e.cat : (CATEGORIES.indexOf(currentCat) !== -1 ? currentCat : "");
    fld("f-level").value   = e ? e.level : "標準";
    fld("f-note").value    = e ? (e.note || "") : "";
    fld("f-keys").value    = e ? (e.keys || []).join(", ") : "";

    $exList.innerHTML = "";
    const ex = (e && e.ex && e.ex.length) ? e.ex : [{ en: "", ja: "" }];
    ex.forEach(x => addExRow(x.en, x.ja));

    // カテゴリは選んでも打ってもよい。候補は今あるものを並べる
    $catList.innerHTML = "";
    CATS.forEach(c => {
      const o = document.createElement("option");
      o.value = c;
      $catList.appendChild(o);
    });

    if (typeof $editor.showModal === "function") $editor.showModal();
    else $editor.setAttribute("open", "");     // dialog 非対応ブラウザ向け
    fld("f-pattern").focus();
  }

  function closeEditor() {
    if (typeof $editor.close === "function" && $editor.open) $editor.close();
    else $editor.removeAttribute("open");
    editingId = null;
  }

  function readForm() {
    const ex = [];
    $exList.querySelectorAll(".exrow").forEach(r => {
      ex.push({
        en: r.querySelector('[data-ex="en"]').value,
        ja: r.querySelector('[data-ex="ja"]').value
      });
    });
    return {
      id:      editingId || undefined,
      pattern: fld("f-pattern").value,
      jp:      fld("f-jp").value,
      cat:     fld("f-cat").value,
      level:   fld("f-level").value,
      ex:      ex,
      note:    fld("f-note").value,
      keys:    fld("f-keys").value.split(/[,、]/).map(s => s.trim()).filter(Boolean)
    };
  }

  /* 中身が変わったら索引・チップ・一覧をまとめて作り直す */
  function afterChange() {
    rebuild();
    renderChips();
    render($q.value);
  }

  function setActiveById(id) {
    const i = results.findIndex(r => r.rec.entry.id === id);
    if (i >= 0) setActive(i);
  }

  function saveFromForm() {
    const draft = readForm();
    const e = sanitize(draft);
    if (!e) { showErr("「構文（英語）」と「意味（日本語）」は必ず入れてください。"); return; }

    const backup = mine.slice();
    if (editingId) {
      const i = mine.findIndex(x => x.id === editingId);
      if (i === -1) { closeEditor(); afterChange(); return; }   // 別のタブで消された等
      e.id = editingId;
      mine[i] = e;
    } else {
      mine.unshift(e);
    }

    if (!saveMine()) {
      mine = backup;
      showErr("端末に保存できませんでした。ブラウザの保存容量がいっぱいかもしれません。");
      return;
    }

    const savedId = e.id;
    closeEditor();
    afterChange();
    const saved = findEntry(savedId);
    if (saved) {
      showDetail(saved, [], true);
      setActiveById(savedId);
    }
  }

  function removeMine(id) {
    const e = findEntry(id);
    if (!e || !e.mine) return;
    if (!window.confirm("「" + e.pattern + "」を削除します。元に戻せません。よろしいですか。")) return;

    const backup = mine.slice();
    mine = mine.filter(x => x.id !== id);
    if (!saveMine()) { mine = backup; window.alert("削除を保存できませんでした。"); return; }

    // 消えた項目がお気に入りや履歴に残ると空振りするので、そちらからも外す
    favs = favs.filter(x => x !== id); save("kobun.fav", favs);
    hist = hist.filter(x => x !== id); save("kobun.hist", hist);

    closeEditor();
    if (selectedId === id) {
      selectedId = null;
      if (history.replaceState) history.replaceState(null, "", location.pathname + location.search);
    }
    afterChange();
    if (!selectedId) showPlaceholder();
  }

  /* ---------- 書き出し・読み込み（端末を移るとき用） ---------- */

  function exportMine() {
    if (!mine.length) { window.alert("書き出せる自作の構文がまだありません。"); return; }
    const body = JSON.stringify({
      app: "構文辞書",
      version: 1,
      savedAt: new Date().toISOString(),
      entries: mine
    }, null, 2);

    const url = URL.createObjectURL(new Blob([body], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "kobun-mine-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function importMine(file) {
    const reader = new FileReader();
    reader.onload = () => {
      let data;
      try { data = JSON.parse(String(reader.result)); }
      catch (err) { window.alert("読み込めませんでした。書き出したJSONファイルを選んでください。"); return; }

      const list = Array.isArray(data) ? data
                 : (data && Array.isArray(data.entries) ? data.entries : null);
      if (!list) { window.alert("この形式のファイルは読み込めません。"); return; }

      const baseIds = new Set(ENTRIES.map(e => e.id));
      const kept = mine.slice();     // すでにあるぶん（同じIDなら上書きする）
      const fresh = [];              // 新しく増えるぶん。ファイルの並びのまま先頭へ
      let updated = 0;

      for (const raw of list) {
        const e = sanitize(raw);
        if (!e) continue;
        if (baseIds.has(e.id)) e.id = newId();          // 収録ぶんとIDがぶつからないように
        const i = kept.findIndex(x => x.id === e.id);
        if (i !== -1) { kept[i] = e; updated++; }        // 同じIDは新しい内容で上書き
        else fresh.push(e);
      }

      const added = fresh.length;
      if (!added && !updated) { window.alert("追加できる項目が見つかりませんでした。"); return; }
      if (!window.confirm("新しく " + added + " 項目、上書き " + updated + " 項目を読み込みます。よろしいですか。")) return;

      const backup = mine.slice();
      mine = fresh.concat(kept);
      if (!saveMine()) { mine = backup; window.alert("保存できませんでした。容量がいっぱいかもしれません。"); return; }

      currentCat = MINE_CAT;
      afterChange();
    };
    reader.onerror = () => window.alert("ファイルを読めませんでした。");
    reader.readAsText(file);
  }

  /* ===========================================================
     7. イベント
     =========================================================== */

  // 入力するたびに引き直す（辞書アプリのインクリメンタル検索）
  $q.addEventListener("input", () => {
    $clear.hidden = $q.value === "";
    render($q.value);
  });

  $clear.addEventListener("click", () => {
    $q.value = "";
    $clear.hidden = true;
    render("");
    $q.focus();
  });

  // 絞り込みチップ（お気に入り・履歴 → カテゴリ）
  function addChip(cat, label, cls) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip" + (cls ? " " + cls : "");
    b.dataset.cat = cat;
    b.textContent = label;
    $filters.appendChild(b);
    return b;
  }

  let $favChip = null, $histChip = null, $mineChip = null;

  /* 自作の項目でカテゴリが増減するので、チップは丸ごと作り直せるようにする */
  function renderChips() {
    const all = $filters.querySelector('.chip[data-cat="*"]');
    $filters.innerHTML = "";
    $filters.appendChild(all);

    $favChip  = addChip(FAV_CAT,  "★ お気に入り", "chip--special");
    $histChip = addChip(HIST_CAT, "履歴",        "chip--special");
    $mineChip = addChip(MINE_CAT, "✎ マイ構文",  "chip--special");
    CATS.forEach(c => addChip(c, c));

    // 自作を消してカテゴリごと無くなることがあるので、選択中の枠が残っているか確かめる
    let found = false;
    $filters.querySelectorAll(".chip").forEach(c => {
      const on = c.dataset.cat === currentCat;
      if (on) found = true;
      c.classList.toggle("is-on", on);
    });
    if (!found) { currentCat = "*"; all.classList.add("is-on"); }

    updateChipCounts();
  }

  function updateChipCounts() {
    if (!$favChip) return;
    $favChip.textContent  = favs.length ? "★ お気に入り " + favs.length : "★ お気に入り";
    $histChip.textContent = hist.length ? "履歴 " + hist.length : "履歴";
    $mineChip.textContent = mine.length ? "✎ マイ構文 " + mine.length : "✎ マイ構文";
    $total.textContent    = ALL.length;
    $mineNum.textContent  = mine.length ? "（うち自作 " + mine.length + "）" : "";
  }

  renderChips();

  $filters.addEventListener("click", e => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    currentCat = chip.dataset.cat;
    $filters.querySelectorAll(".chip").forEach(c => c.classList.toggle("is-on", c === chip));
    render($q.value);
  });

  // 一覧のクリック
  $list.addEventListener("click", e => {
    const item = e.target.closest(".item");
    if (!item) return;
    const i = Number(item.dataset.i);
    setActive(i);
    openById(item.dataset.id, results[i] ? results[i].tokens : []);
  });

  // 語釈内のボタン
  $detail.addEventListener("click", e => {
    const close = e.target.closest("#sheetClose");
    if (close) { $detail.classList.remove("is-open"); return; }

    const star = e.target.closest("#star");
    if (star) {
      toggleFav(selectedId);
      const on = isFav(selectedId);
      star.classList.toggle("is-on", on);
      star.textContent = on ? "★" : "☆";
      star.setAttribute("aria-pressed", String(on));
      star.title = on ? "お気に入りから外す" : "お気に入りに入れる";
      // お気に入り一覧を見ている最中なら、その場で並びを更新する
      if (currentCat === FAV_CAT) render($q.value);
      return;
    }

    if (e.target.closest("#editThis")) { openEditor(selectedId); return; }
    if (e.target.closest("#delThis"))  { removeMine(selectedId); return; }

    const key = e.target.closest(".key");
    if (key) {
      $q.value = key.dataset.key;
      $clear.hidden = false;
      render($q.value);
      $detail.classList.remove("is-open");
      $q.focus();
      return;
    }

    const go = e.target.closest(".rel");
    if (go) openById(go.dataset.goto, []);
  });

  // 検索欄でのキー操作
  $q.addEventListener("keydown", e => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(activeIndex + 1); preview(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(activeIndex - 1); preview(); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex < 0) setActive(0);
      const r = results[activeIndex];
      if (r) { openById(r.rec.entry.id, r.tokens); $q.blur(); }
    } else if (e.key === "Escape") {
      if ($q.value) { $q.value = ""; $clear.hidden = true; render(""); }
      else $q.blur();
    }
  });

  function preview() {
    const r = results[activeIndex];
    if (r) showDetail(r.rec.entry, r.tokens, false);
  }

  // ---- 自作の項目まわり ----

  $add.addEventListener("click", () => openEditor(null));

  $mytools.addEventListener("click", e => {
    const b = e.target.closest("[data-act]");
    if (!b) return;
    if (b.dataset.act === "new")         openEditor(null);
    else if (b.dataset.act === "export") exportMine();
    else if (b.dataset.act === "import") $file.click();
  });

  $file.addEventListener("change", () => {
    const f = $file.files && $file.files[0];
    if (f) importMine(f);
    $file.value = "";     // 同じファイルをもう一度選べるように
  });

  $editor.addEventListener("click", e => {
    if (e.target === $editor) { closeEditor(); return; }          // 背景をクリック
    if (e.target.closest("[data-close]")) { closeEditor(); return; }
    if (e.target.closest("#exAdd")) { addExRow("", ""); return; }

    const x = e.target.closest(".exrow__x");
    if (x) {
      x.closest(".exrow").remove();
      if (!$exList.children.length) addExRow("", "");   // 1組は必ず残す
      syncExAdd();
    }
  });

  $editor.addEventListener("close", () => { editingId = null; });

  $del.addEventListener("click", () => { if (editingId) removeMine(editingId); });

  $form.addEventListener("submit", e => { e.preventDefault(); saveFromForm(); });

  // 入力欄で Enter を押したら保存（textarea は改行のまま）
  $form.addEventListener("keydown", e => {
    if (e.key === "Enter" && e.target.tagName === "INPUT") { e.preventDefault(); saveFromForm(); }
  });

  // どこからでも検索欄へ
  document.addEventListener("keydown", e => {
    if ($editor.open) return;          // フォームを開けている間は邪魔しない
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    if ((e.key === "/" && !typing) || ((e.metaKey || e.ctrlKey) && e.key === "k")) {
      e.preventDefault();
      $q.focus();
      $q.select();
    }
    if (e.key === "n" && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      openEditor(null);
      return;
    }
    if (e.key === "Escape") $detail.classList.remove("is-open");
  });

  /* ===========================================================
     8. 起動
     =========================================================== */

  render("");

  const hash = decodeURIComponent(location.hash.replace(/^#/, ""));
  if (hash && findEntry(hash)) {
    openById(hash, []);
    const idx = results.findIndex(r => r.rec.entry.id === hash);
    if (idx >= 0) setActive(idx);
  } else {
    showPlaceholder();
  }

  if (!/Mobi|Android/i.test(navigator.userAgent)) $q.focus();
})();
