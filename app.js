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

  /* ---------- 状態 ---------- */
  const LEVEL_ORDER = { "基本": 0, "標準": 1, "発展": 2 };
  const FAV_CAT = "@fav";   // 絞り込みの特別枠
  const HIST_CAT = "@hist";
  const HIST_MAX = 40;

  let currentCat = "*";     // 絞り込み中のカテゴリ
  let results = [];         // 表示中の項目（描画順）
  let activeIndex = -1;     // キーボードで選択中の位置
  let selectedId = null;    // 語釈を表示中の項目

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

  /* 検索対象の文字列を項目ごとに前もって作っておく（毎回作ると重いので） */
  const INDEX = ENTRIES.map((e, i) => {
    const exText = e.ex.map(x => x.en + " " + x.ja).join(" ");
    return {
      entry: e,
      order: i,
      nPattern: norm(e.pattern),
      nJp:      norm(e.jp),
      nKeys:    norm((e.keys || []).join(" ")),
      nCat:     norm(e.cat),
      nEx:      norm(exText),
      nNote:    norm(e.note || "")
    };
  });

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
    if (currentCat === FAV_CAT || currentCat === HIST_CAT) {
      const ids = currentCat === FAV_CAT ? favs : hist;   // 新しく登録したものが先頭
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
          "</div>" +
          (snip ? '<div class="item__snip">' + snip + "</div>" : "") +
        "</button>";
    });

    $list.innerHTML = html;
    $empty.hidden = results.length > 0;
    $empty.innerHTML = emptyMessage();

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
    const scored = ENTRIES
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
        "</div>" +
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
    const e = ENTRIES.find(x => x.id === id);
    if (!e) return;
    showDetail(e, tokens || [], true);
    pushHist(id);
  }

  /* ===========================================================
     6. イベント
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

  const $favChip  = addChip(FAV_CAT, "★ お気に入り", "chip--special");
  const $histChip = addChip(HIST_CAT, "履歴", "chip--special");
  CATEGORIES.forEach(c => addChip(c, c));

  function updateChipCounts() {
    $favChip.textContent  = favs.length ? "★ お気に入り " + favs.length : "★ お気に入り";
    $histChip.textContent = hist.length ? "履歴 " + hist.length : "履歴";
  }
  updateChipCounts();

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

  // どこからでも検索欄へ
  document.addEventListener("keydown", e => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    if ((e.key === "/" && !typing) || ((e.metaKey || e.ctrlKey) && e.key === "k")) {
      e.preventDefault();
      $q.focus();
      $q.select();
    }
    if (e.key === "Escape") $detail.classList.remove("is-open");
  });

  /* ===========================================================
     7. 起動
     =========================================================== */

  $total.textContent = ENTRIES.length;
  render("");

  const hash = decodeURIComponent(location.hash.replace(/^#/, ""));
  if (hash && ENTRIES.some(e => e.id === hash)) {
    openById(hash, []);
    const idx = results.findIndex(r => r.rec.entry.id === hash);
    if (idx >= 0) setActive(idx);
  } else {
    showPlaceholder();
  }

  if (!/Mobi|Android/i.test(navigator.userAgent)) $q.focus();
})();
