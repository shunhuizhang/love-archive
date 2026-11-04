(function () {
  "use strict";

  const D = window.LOVE;
  if (!D) return;

  const CFG = window.LOVE_CONFIG || {};
  const SB_URL = String(CFG.supabaseUrl || "").trim();
  const SB_KEY = String(CFG.supabaseAnonKey || "").trim();
  const BUCKET = CFG.bucket || "photos";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const pad = (n) => String(n).padStart(2, "0");
  const esc = (s = "") =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const fmtDate = (iso) => String(iso || "").replace(/-/g, ".");

  const state = {
    sb: null,
    session: null,
    profile: null,
    isAdmin: false,
    online: false,
    remoteCount: 0,
    photos: [],
    photoEls: [],
    currentFilter: "all",
    lbList: [],
    lbPos: 0,
    lbToken: 0,
    lastTrigger: null,
  };

  /* ---------------- 基础数据 ---------------- */

  function samplePhotos() {
    return D.photos.map((p) => Object.assign({}, p));
  }

  function normalizeMotion(list) {
    return list.map((p) => Object.assign({}, p, {
      motion: !!p.motion || /\.gif(?:[?#].*)?$/i.test(p.src || ""),
    }));
  }

  function daysTogether() {
    const [y, m, d] = D.us.startDate.split("-").map(Number);
    const startUTC = Date.UTC(y, m - 1, d);
    const now = new Date();
    const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((todayUTC - startUTC) / 86400000) + 1;
  }

  function fmtTime(iso) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.getFullYear() + "." + pad(d.getMonth() + 1) + "." + pad(d.getDate()) +
      " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
  }

  /* ---------------- 静态信息 ---------------- */

  function updateCounts() {
    $$("[data-count]").forEach((el) => {
      const key = el.getAttribute("data-count");
      el.textContent = String({
        moments: D.timeline.length,
        places: D.places.length,
        photos: state.photos.length,
      }[key] ?? 0);
    });
  }

  function hydrateProfile() {
    const days = daysTogether();
    $$("[data-days]").forEach((el) => { el.textContent = days; });
    $$("[data-names]").forEach((el) => { el.textContent = D.us.him + " & " + D.us.her; });
    $$("[data-city]").forEach((el) => { el.textContent = D.us.city; });
    $$("[data-start-label]").forEach((el) => { el.textContent = fmtDate(D.us.startDate); });
    $$("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
    $$("[data-intro]").forEach((el) => { el.textContent = D.us.intro; });
    updateCounts();
    document.title = "双重曝光 · 在一起的第 " + days + " 天";

    setInterval(() => {
      const fresh = daysTogether();
      $$("[data-days]").forEach((el) => {
        if (el.textContent !== String(fresh)) el.textContent = fresh;
      });
    }, 60000);
  }

  /* ---------------- 图片兜底 ---------------- */

  function watchMedia(root) {
    $$(".media img", root).forEach((img) => {
      if (img.dataset.watched) return;
      img.dataset.watched = "1";
      const mark = () => img.closest(".media")?.classList.add("is-missing");
      img.addEventListener("error", mark);
      if (img.complete && img.naturalWidth === 0) mark();
    });
  }

  function fillHero() {
    $$("[data-photo]").forEach((img) => {
      const item = D.hero[img.getAttribute("data-photo")];
      if (!item) return;
      if (item.alt) img.alt = item.alt;
      img.src = item.src;
    });
    watchMedia();
  }

  /* ---------------- 跑马灯 ---------------- */

  function buildTicker() {
    const track = $("#tickerTrack");
    if (!track) return;
    const items = D.places.map((p) => p.city).concat(["下一站 · 待定"]);
    const html = items
      .map((t) => '<span class="ticker__item">' + esc(t) + '<i aria-hidden="true">✳</i></span>')
      .join("");
    track.innerHTML = html + html;
    track.setAttribute("aria-hidden", "true");
  }

  /* ---------------- 共同事件 ---------------- */

  const logEls = [];

  function buildLog() {
    const log = $("#log");
    if (!log) return;

    log.innerHTML = D.timeline
      .map((item, i) => {
        const year = item.date.slice(0, 4);
        const alt = item.title + "，摄于" + item.place;
        return (
          '<li class="log__item reveal" data-year="' + year + '">' +
            '<span class="log__no">' + pad(i + 1) + "</span>" +
            '<time class="log__date" datetime="' + item.date + '">' + fmtDate(item.date) + "</time>" +
            '<div class="log__body">' +
              "<h3>" + esc(item.title) + (item.first ? '<span class="log__tag">FIRST</span>' : "") + "</h3>" +
              "<p>" + esc(item.note) + "</p>" +
              '<span class="log__place">' + esc(item.place) + "</span>" +
            "</div>" +
            '<figure class="log__thumb">' +
              '<div class="media">' +
                '<img src="' + esc(item.photo) + '" alt="' + esc(alt) + '" loading="lazy">' +
                '<div class="media__dots" aria-hidden="true"></div>' +
                '<div class="media__missing" aria-hidden="true"><span>FRAME ' + pad(i + 1) + "</span></div>" +
              "</div>" +
            "</figure>" +
          "</li>"
        );
      })
      .join("");

    $$(".log__item", log).forEach((el, i) => {
      logEls.push(el);
      el.style.transitionDelay = (i % 5) * 0.04 + "s";
    });
    watchMedia(log);

    const years = Array.from(new Set(D.timeline.map((t) => t.date.slice(0, 4))));
    const filters = $("#yearFilters");
    const counts = years.map((y) => [y, logEls.filter((el) => el.dataset.year === y).length]);

    filters.innerHTML =
      '<button class="filter is-on" type="button" data-year="all">全部 · ' + D.timeline.length + "</button>" +
      counts.map(([y, n]) => '<button class="filter" type="button" data-year="' + y + '">' + y + " · " + n + "</button>").join("");

    filters.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter");
      if (!btn) return;
      $$(".filter", filters).forEach((b) => b.classList.toggle("is-on", b === btn));
      const year = btn.dataset.year;
      let shown = 0;
      logEls.forEach((el) => {
        const ok = year === "all" || el.dataset.year === year;
        el.hidden = !ok;
        if (ok) shown += 1;
      });
      const empty = $("#logEmpty");
      if (empty) empty.hidden = shown > 0;
    });
  }

  /* ---------------- 地方明信片 ---------------- */

  function buildPlaces() {
    const posts = $("#postcards");
    if (!posts) return;

    posts.innerHTML = D.places
      .map((p) => {
        const alt = p.city + "，" + p.note;
        return (
          '<article class="postcard reveal">' +
            '<div class="media">' +
              '<img src="' + esc(p.photo) + '" alt="' + esc(alt) + '" loading="lazy">' +
              '<div class="media__dots" aria-hidden="true"></div>' +
              '<div class="media__missing" aria-hidden="true"><span>POSTCARD</span></div>' +
            "</div>" +
            '<span class="postcard__stamp" aria-hidden="true">POST<br>' + esc(p.date.slice(0, 4)) + "</span>" +
            '<div class="postcard__body">' +
              '<div class="postcard__row">' +
                '<h3 class="postcard__city">' + esc(p.city) + "</h3>" +
                '<span class="postcard__date">' + esc(p.date) + "</span>" +
              "</div>" +
              '<p class="postcard__note">' + esc(p.note) + "</p>" +
            "</div>" +
          "</article>"
        );
      })
      .join("");

    $$(".postcard", posts).forEach((el, i) => {
      el.style.transitionDelay = (i % 4) * 0.05 + "s";
    });
    watchMedia(posts);

    const wish = $("#wishlist");
    if (wish) {
      wish.innerHTML = D.wishlist
        .map((w) => "<li><b>" + esc(w.place) + "</b><span>" + esc(w.doing) + "</span></li>")
        .join("");
    }
  }

  /* ---------------- 照片墙 ---------------- */

  function photoMatches(p, filter) {
    if (filter === "all") return true;
    if (filter === "gif") return !!p.motion;
    return p.tag === filter;
  }

  function renderPhotoFilters() {
    const filters = $("#photoFilters");
    if (!filters) return;
    const counts = {
      all: state.photos.length,
      daily: state.photos.filter((p) => p.tag === "日常").length,
      travel: state.photos.filter((p) => p.tag === "旅行").length,
      gif: state.photos.filter((p) => p.motion).length,
    };
    const labels = [
      ["all", "全部"],
      ["daily", "日常"],
      ["travel", "旅行"],
      ["gif", "动图"],
    ];
    filters.innerHTML = labels
      .map(([key, label]) =>
        '<button class="filter' + (state.currentFilter === key ? " is-on" : "") + '" type="button" data-filter="' + key + '">' +
        label + " · " + counts[key] +
        "</button>"
      )
      .join("");
  }

  function renderGallery() {
    const gallery = $("#gallery");
    if (!gallery) return;

    gallery.innerHTML = state.photos
      .map((p, i) => {
        const alt = (p.caption || "照片") + "，摄于" + (p.place || "某处");
        return (
          '<figure class="shot reveal" data-tag="' + esc(p.tag) + '" data-motion="' + (p.motion ? "1" : "0") + '">' +
            '<div class="media">' +
              '<img src="' + esc(p.src) + '" alt="' + esc(alt) + '" loading="lazy">' +
              '<div class="media__dots" aria-hidden="true"></div>' +
              '<div class="media__missing" aria-hidden="true"><span>FRAME ' + pad(i + 1) + "</span></div>" +
            "</div>" +
            '<figcaption class="shot__cap"><b>' + esc(p.caption) + "</b><span>" + esc(p.date) + " · " + esc(p.place) + "</span></figcaption>" +
            (p.motion ? '<span class="shot__badge" aria-hidden="true">GIF · 动图</span>' : "") +
            '<button class="shot__open" type="button" data-index="' + i + '" aria-label="放大查看' + (p.motion ? "动图：" : "：") + esc(p.caption) + '"></button>' +
          "</figure>"
        );
      })
      .join("");

    state.photoEls = $$(".shot", gallery);
    state.photoEls.forEach((el, i) => {
      el.style.transitionDelay = (i % 4) * 0.04 + "s";
    });
    watchMedia(gallery);
    observeReveals(gallery);
    renderPhotoFilters();
    applyPhotoFilter();
  }

  function setupGalleryFilters() {
    const filters = $("#photoFilters");
    if (!filters) return;
    filters.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter");
      if (!btn) return;
      state.currentFilter = btn.dataset.filter;
      $$(".filter", filters).forEach((b) => b.classList.toggle("is-on", b === btn));
      applyPhotoFilter();
    });
  }

  function applyPhotoFilter() {
    let shown = 0;
    state.photos.forEach((p, i) => {
      const ok = photoMatches(p, state.currentFilter);
      const el = state.photoEls[i];
      if (el) el.hidden = !ok;
      if (ok) shown += 1;
    });
    const empty = $("#galleryEmpty");
    if (empty) empty.hidden = shown > 0;
  }

  function visiblePhotoIndices() {
    return state.photos.map((p, i) => i).filter((i) => state.photoEls[i] && !state.photoEls[i].hidden);
  }

  /* ---------------- 灯箱 ---------------- */

  function currentPhoto() {
    return state.photos[state.lbList[state.lbPos]] || null;
  }

  function setupLightbox() {
    const lb = $("#lightbox");
    if (!lb) return;
    const img = $("#lbImage");
    const caption = $("#lbCaption");
    const meta = $("#lbMeta");
    const frame = $("#lbFrame");
    const badge = $("#lbBadge");
    const stage = $(".lightbox__stage");

    const render = () => {
      const p = currentPhoto();
      if (!p) return;
      stage.classList.remove("is-missing");
      img.alt = (p.caption || "照片") + "，摄于" + (p.place || "某处");
      img.src = p.src;
      caption.textContent = p.caption;
      meta.textContent = p.date + " · " + p.place + " · " + p.tag;
      frame.textContent = "FRAME " + pad(state.lbPos + 1) + " / " + pad(state.lbList.length);
      badge.hidden = !p.motion;

      const del = $("#lbDelete");
      if (del) del.hidden = !(state.isAdmin && !!p.id);

      const next = state.photos[state.lbList[(state.lbPos + 1) % state.lbList.length]];
      if (next && next.src !== p.src) {
        const pre = new Image();
        pre.src = next.src;
      }

      loadComments(p);
    };

    const move = (step) => {
      if (!state.lbList.length) return;
      state.lbPos = (state.lbPos + step + state.lbList.length) % state.lbList.length;
      render();
    };

    const close = () => lb.close();

    function openLightbox(index, trigger) {
      state.lastTrigger = trigger || null;
      state.lbList = visiblePhotoIndices();
      if (!state.lbList.includes(index)) state.lbList = state.photos.map((p, i) => i);
      state.lbPos = Math.max(0, state.lbList.indexOf(index));
      render();
      if (!lb.open) {
        lb.showModal();
        document.documentElement.classList.add("no-scroll");
      }
      $("#lbClose").focus();
    }

    img.addEventListener("error", () => stage.classList.add("is-missing"));

    $("#lbPrev").addEventListener("click", () => move(-1));
    $("#lbNext").addEventListener("click", () => move(1));
    $("#lbClose").addEventListener("click", close);
    $("#lbDelete").addEventListener("click", deleteCurrentPhoto);

    lb.addEventListener("click", (e) => {
      if (e.target === lb) close();
    });

    lb.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); move(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); move(1); }
    });

    lb.addEventListener("close", () => {
      document.documentElement.classList.remove("no-scroll");
      if (state.lastTrigger) state.lastTrigger.focus();
    });

    $("#commentForm").addEventListener("submit", submitComment);
    $("#commentLogin").addEventListener("click", openLogin);
    $("#commentsList").addEventListener("click", onCommentDelete);

    window.__openLoveLightbox = openLightbox;
  }

  /* ---------------- 留言 ---------------- */

  function findBannedWord(text) {
    const list = (CFG.bannedWords || []).filter(Boolean);
    const low = text.toLowerCase();
    return list.find((w) => low.includes(String(w).toLowerCase())) || null;
  }

  function renderCommentForm(photo) {
    const form = $("#commentForm");
    if (!form) return;
    const loginBtn = $("#commentLogin");
    const hint = $("#commentHint");
    const input = $("#commentInput");
    const submit = $("#commentSubmit");

    const canWrite = state.online && !!photo && !!photo.id && !!state.session;
    form.hidden = !canWrite;
    loginBtn.hidden = !(state.online && (!photo || !photo.id || !state.session));

    if (!state.online) {
      hint.textContent = "留言功能还没连上数据库（当前是演示模式）";
    } else if (!photo || !photo.id) {
      hint.textContent = "这张是示例照片，导入数据库后就可以留言了";
    } else if (!state.session) {
      hint.textContent = "登录后可以留言";
    } else {
      hint.textContent = "以 " + (state.profile?.display_name || "访客") + " 的身份留言 · 最多 300 字";
    }

    if (!canWrite) {
      input.value = "";
      submit.disabled = false;
      submit.textContent = "发送留言";
    }
  }

  function commentHTML(c) {
    const name = (c.profiles && c.profiles.display_name) || "访客";
    const mine = state.session && (c.user_id === state.session.user.id || state.isAdmin);
    return (
      '<li class="comment" data-id="' + esc(c.id) + '">' +
        '<div class="comment__meta">' +
          "<b>" + esc(name) + "</b>" +
          '<time datetime="' + esc(c.created_at) + '">' + esc(fmtTime(c.created_at)) + "</time>" +
          (mine ? '<button class="comment__del" type="button" data-del="' + esc(c.id) + '">删除</button>' : "") +
        "</div>" +
        '<p class="comment__text">' + esc(c.content) + "</p>" +
      "</li>"
    );
  }

  async function loadComments(photo) {
    const list = $("#commentsList");
    if (!list) return;
    const empty = $("#commentsEmpty");
    const count = $("#commentCount");

    const token = ++state.lbToken;
    renderCommentForm(photo);

    if (!state.online || !photo || !photo.id) {
      list.innerHTML = "";
      count.textContent = "";
      empty.hidden = false;
      empty.textContent = !state.online
        ? "留言功能还没连上数据库（当前是演示模式）。"
        : "这张是示例照片，导入数据库后就可以留言了。";
      return;
    }

    empty.hidden = false;
    empty.textContent = "正在取回留言…";

    const { data, error } = await state.sb
      .from("comments")
      .select("id, content, created_at, user_id, profiles(display_name)")
      .eq("photo_id", photo.id)
      .order("created_at", { ascending: true });

    if (token !== state.lbToken) return;

    if (error) {
      empty.textContent = "留言加载失败：" + error.message;
      return;
    }

    const rows = data || [];
    list.innerHTML = rows.map(commentHTML).join("");
    count.textContent = rows.length ? rows.length + " 条留言" : "";
    empty.hidden = rows.length > 0;
    empty.textContent = "还没有留言，说句好话吧。";
  }

  async function submitComment(e) {
    e.preventDefault();
    const photo = currentPhoto();
    if (!state.session || !photo || !photo.id) return;

    const input = $("#commentInput");
    const hint = $("#commentHint");
    const submit = $("#commentSubmit");
    const text = input.value.trim();

    if (!text) {
      hint.textContent = "写点什么再发送吧。";
      return;
    }
    if (text.length > 300) {
      hint.textContent = "留言最多 300 字。";
      return;
    }
    if (findBannedWord(text)) {
      hint.textContent = "这句话里包含不合适的词语，换一种说法吧。";
      return;
    }

    submit.disabled = true;
    submit.textContent = "发送中…";

    const { error } = await state.sb.from("comments").insert({
      photo_id: photo.id,
      user_id: state.session.user.id,
      content: text,
    });

    submit.disabled = false;
    submit.textContent = "发送留言";

    if (error) {
      hint.textContent = "发送失败：" + error.message;
      return;
    }

    input.value = "";
    hint.textContent = "已经贴在这张照片下面了。";
    loadComments(photo);
  }

  async function onCommentDelete(e) {
    const btn = e.target.closest("[data-del]");
    if (!btn || !state.sb) return;
    if (!window.confirm("删除这条留言？")) return;

    const { error } = await state.sb.from("comments").delete().eq("id", btn.dataset.del);
    const photo = currentPhoto();

    if (error) {
      const hint = $("#commentHint");
      if (hint) hint.textContent = "删除失败：" + error.message;
      return;
    }
    if (photo) loadComments(photo);
  }

  /* ---------------- 登录 ---------------- */

  function setAuthMsg(msg) {
    const el = $("#authMsg");
    if (el) el.textContent = msg || "";
  }

  function setPasswordMsg(msg) {
    const el = $("#passwordMsg");
    if (el) el.textContent = msg || "";
  }

  function switchAuthTab(name) {
    $$("[data-auth-tab]").forEach((btn) => {
      const on = btn.dataset.authTab === name;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    $$("[data-auth-pane]").forEach((pane) => {
      pane.hidden = pane.dataset.authPane !== name;
    });
    const target = name === "email" ? "#loginEmail" : "#loginUsername";
    setTimeout(() => {
      const el = $(target);
      if (el && !el.disabled) el.focus();
    }, 40);
  }

  function openLogin() {
    const dlg = $("#loginDialog");
    if (!dlg) return;
    if (!dlg.open) dlg.showModal();
    if (!state.online) {
      setPasswordMsg("还没有连接 Supabase：先在 config.js 里填项目地址和 anon key。");
    }
    setTimeout(() => {
      const el = $("#loginUsername");
      if (el && !el.disabled) el.focus();
    }, 60);
  }

  function resetLoginForm() {
    const email = $("#loginEmail");
    const submit = $("#emailSubmit");
    if (email) email.value = "";
    if (submit) {
      submit.disabled = false;
      submit.textContent = "发送登录链接";
    }
    $("#loginUsername").value = "";
    $("#loginPassword").value = "";
    setAuthMsg(state.online ? "" : "还没有连接 Supabase：先在 config.js 里填项目地址和 anon key。");
    setPasswordMsg(state.online ? "" : "还没有连接 Supabase：先在 config.js 里填项目地址和 anon key。");
    switchAuthTab("password");
  }

  async function handleEmailLogin(e) {
    e.preventDefault();
    if (!state.online) {
      setAuthMsg("还没有连接 Supabase：先在 config.js 里填项目地址和 anon key。");
      return;
    }

    const email = $("#loginEmail").value.trim();
    if (!email) {
      setAuthMsg("先填一个邮箱。");
      return;
    }

    const submit = $("#emailSubmit");
    submit.disabled = true;
    submit.textContent = "发送中…";
    setAuthMsg("正在发送登录链接…");

    const { error } = await state.sb.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        // 邮件里点 Sign in 后回到当前页面；这个地址要在 Supabase 的 Redirect URLs 里
        emailRedirectTo: location.origin + location.pathname,
      },
    });

    submit.disabled = false;
    submit.textContent = "重新发送链接";

    if (error) {
      setAuthMsg("发送失败：" + error.message);
      return;
    }
    setAuthMsg("链接已发到 " + email + "。去邮箱点「Sign in」就会自动回来登录。");
  }

  async function handlePasswordLogin(e) {
    e.preventDefault();
    if (!state.online) {
      setPasswordMsg("还没有连接 Supabase：先在 config.js 里填项目地址和 anon key。");
      return;
    }

    const username = $("#loginUsername").value.trim();
    const password = $("#loginPassword").value;
    if (!username || !password) {
      setPasswordMsg("账号和密码都要填。");
      return;
    }

    const submit = $("#passwordSubmit");
    submit.disabled = true;
    submit.textContent = "登录中…";
    setPasswordMsg("正在登录…");

    try {
      const { data, error } = await state.sb.rpc("login_email_for", { p_username: username });
      if (error) throw error;
      if (!data) throw new Error("账号或密码不对。");

      const { error: signError } = await state.sb.auth.signInWithPassword({ email: data, password });
      if (signError) throw new Error("账号或密码不对。");

      setPasswordMsg("登录成功。");
      $("#loginDialog").close();
    } catch (err) {
      setPasswordMsg(err && err.message ? err.message : "登录失败。");
    } finally {
      submit.disabled = false;
      submit.textContent = "密码登录";
    }
  }

  function renderAuth() {
    const authBtn = $("#authBtn");
    const chip = $("#userChip");
    const logout = $("#logoutBtn");
    const tools = $("#adminTools");
    const importBtn = $("#importBtn");

    if (state.session) {
      authBtn.hidden = true;
      chip.hidden = false;
      logout.hidden = false;
      $("[data-user]", chip).textContent = (state.profile && state.profile.display_name) || "已登录";
      $("[data-role]", chip).textContent = state.isAdmin ? "ADMIN · 管理员" : "GUEST · 访客";
    } else {
      authBtn.hidden = false;
      chip.hidden = true;
      logout.hidden = true;
      authBtn.textContent = state.online ? "登录 / 留言" : "登录（未连接）";
    }

    if (tools) tools.hidden = !state.isAdmin;
    if (importBtn) importBtn.hidden = !(state.isAdmin && state.online && state.remoteCount === 0);

    const del = $("#lbDelete");
    if (del) {
      const p = currentPhoto();
      del.hidden = !(state.isAdmin && p && p.id);
    }

    renderCommentForm(currentPhoto());
  }

  async function applySession(session) {
    state.session = session || null;

    if (!session) {
      state.profile = null;
      state.isAdmin = false;
      renderAuth();
      return;
    }

    let profile = null;
    try {
      const res = await state.sb
        .from("profiles")
        .select("display_name, role")
        .eq("id", session.user.id)
        .maybeSingle();
      profile = res.data;
    } catch (err) {
      console.warn("[love-archive] 读取用户资料失败", err);
    }

    state.profile = profile || {
      display_name: (session.user.email || "已登录").split("@")[0],
      role: "guest",
    };
    state.isAdmin = state.profile.role === "admin";
    renderAuth();
  }

  /* ---------------- 删除照片 ---------------- */

  function storagePathFromUrl(url) {
    const marker = "/storage/v1/object/public/" + BUCKET + "/";
    const text = String(url || "");
    const i = text.indexOf(marker);
    if (i < 0) return "";
    return decodeURIComponent(text.slice(i + marker.length).split("?")[0]);
  }

  async function deleteCurrentPhoto() {
    const photo = currentPhoto();
    if (!photo || !photo.id || !state.isAdmin) return;

    const btn = $("#lbDelete");
    btn.disabled = true;

    try {
      const path = storagePathFromUrl(photo.src);
      if (path) {
        const removed = await state.sb.storage.from(BUCKET).remove([path]);
        if (removed.error) console.warn("[love-archive] 删除存储文件失败", removed.error);
      }

      const { error } = await state.sb.from("photos").delete().eq("id", photo.id);
      if (error) throw error;

      $("#lightbox").close();
      await loadRemotePhotos();
    } catch (err) {
      console.warn("[love-archive] 删除照片失败", err);
    } finally {
      btn.disabled = false;
    }
  }

  /* ---------------- 上传 ---------------- */

  async function prepareImage(file) {
    if (file.type === "image/gif") return file;
    if (file.size <= 1.5 * 1024 * 1024) return file;
    if (typeof createImageBitmap !== "function") return file;

    try {
      const bitmap = await createImageBitmap(file);
      const max = 1600;
      const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));

      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#f1ecdf";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
      if (!blob) return file;

      return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
    } catch (err) {
      console.warn("[love-archive] 压缩失败，按原图上传", err);
      return file;
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!state.online || !state.isAdmin || !state.session) return;

    const fileInput = $("#uploadFile");
    const msg = $("#uploadMsg");
    const submit = $("#uploadSubmit");
    const file = fileInput.files[0];

    if (!file) {
      msg.textContent = "先选一张照片。";
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      msg.textContent = "照片超过 25MB，先压缩一下再传。";
      return;
    }

    const caption = $("#uploadCaption").value.trim();
    const dateVal = $("#uploadDate").value;
    if (!caption || !dateVal) {
      msg.textContent = "说明和月份都要填。";
      return;
    }

    submit.disabled = true;

    try {
      msg.textContent = "正在处理照片…";
      const prepared = await prepareImage(file);

      msg.textContent = "正在上传…";
      const ext = (prepared.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = state.session.user.id + "/" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + "." + ext;

      const up = await state.sb.storage.from(BUCKET).upload(path, prepared, {
        contentType: prepared.type || "image/jpeg",
        upsert: false,
      });
      if (up.error) throw up.error;

      const pub = state.sb.storage.from(BUCKET).getPublicUrl(path);
      const order = state.photos.reduce((m, p) => Math.max(m, Number(p.sort_order) || 0), 0) + 1;

      const ins = await state.sb.from("photos").insert({
        src: pub.data.publicUrl,
        caption,
        date: dateVal.replace("-", "."),
        place: $("#uploadPlace").value.trim() || "未标注",
        tag: $("#uploadTag").value,
        motion: prepared.type === "image/gif" || /\.gif$/i.test(prepared.name),
        sort_order: order,
        author: state.session.user.id,
      });
      if (ins.error) throw ins.error;

      msg.textContent = "上传成功，已经放进照片墙。";
      $("#uploadDialog").close();
      await loadRemotePhotos();
    } catch (err) {
      console.warn("[love-archive] 上传失败", err);
      msg.textContent = "上传失败：" + (err && err.message ? err.message : err);
    } finally {
      submit.disabled = false;
    }
  }

  function setupUpload() {
    const btn = $("#uploadBtn");
    const form = $("#uploadForm");
    if (!btn || !form) return;

    btn.addEventListener("click", () => {
      if (!state.isAdmin) return;
      const dlg = $("#uploadDialog");
      $("#uploadMsg").textContent = "";
      form.reset();
      const now = new Date();
      $("#uploadDate").value = now.getFullYear() + "-" + pad(now.getMonth() + 1);
      if (!dlg.open) dlg.showModal();
    });

    $("#uploadFile").addEventListener("change", () => {
      const file = $("#uploadFile").files[0];
      if (!file) return;
      $("#uploadMsg").textContent =
        file.name + " · " + (file.size / 1024 / 1024).toFixed(2) + " MB" +
        (file.type === "image/gif" ? " · 动图将原样保留" : "");
    });

    form.addEventListener("submit", handleUpload);
  }

  /* ---------------- 后端数据 ---------------- */

  async function loadRemotePhotos() {
    const { data, error } = await state.sb
      .from("photos")
      .select("id, src, caption, date, place, tag, motion, sort_order, created_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("[love-archive] 读取照片失败", error);
      return;
    }

    const rows = data || [];
    state.remoteCount = rows.length;

    if (rows.length) {
      state.photos = rows.map((r) => ({
        id: r.id,
        src: r.src,
        caption: r.caption || "",
        date: r.date || "",
        place: r.place || "",
        tag: r.tag || "日常",
        motion: !!r.motion || /\.gif(?:[?#].*)?$/i.test(r.src || ""),
        sort_order: r.sort_order || 0,
      }));
    } else {
      state.photos = normalizeMotion(samplePhotos());
    }

    const lb = $("#lightbox");
    if (lb && lb.open) lb.close();

    renderGallery();
    updateCounts();
    renderAuth();
  }

  async function importSamples() {
    if (!state.online || !state.isAdmin || !state.session) return;
    const btn = $("#importBtn");
    btn.disabled = true;
    btn.textContent = "导入中…";

    const rows = normalizeMotion(samplePhotos()).map((p, i) => ({
      src: p.src,
      caption: p.caption,
      date: p.date,
      place: p.place,
      tag: p.tag,
      motion: !!p.motion,
      sort_order: i + 1,
      author: state.session.user.id,
    }));

    const { error } = await state.sb.from("photos").insert(rows);

    btn.disabled = false;
    btn.textContent = "导入示例数据";

    if (error) {
      window.alert("导入失败：" + error.message);
      return;
    }
    await loadRemotePhotos();
  }

  async function initBackend() {
    if (!SB_URL || !SB_KEY || !window.supabase) {
      state.online = false;
      renderAuth();
      return;
    }

    try {
      state.sb = window.supabase.createClient(SB_URL, SB_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      });
      state.online = true;

      const { data } = await state.sb.auth.getSession();
      await applySession(data.session);

      state.sb.auth.onAuthStateChange((event, session) => {
        if (event === "INITIAL_SESSION") return;
        setTimeout(() => { applySession(session); }, 0);
      });

      await loadRemotePhotos();
    } catch (err) {
      console.error("[love-archive] Supabase 初始化失败", err);
      state.online = false;
      renderAuth();
    }
  }

  /* ---------------- 交互绑定 ---------------- */

  function setupAuthUI() {
    $("#authBtn").addEventListener("click", openLogin);
    $("#logoutBtn").addEventListener("click", async () => {
      if (state.sb) await state.sb.auth.signOut();
    });

    $("#passwordForm").addEventListener("submit", handlePasswordLogin);
    $("#emailForm").addEventListener("submit", handleEmailLogin);
    $$("[data-auth-tab]").forEach((btn) => {
      btn.addEventListener("click", () => switchAuthTab(btn.dataset.authTab));
    });
    $("#loginDialog").addEventListener("close", resetLoginForm);

    $("#importBtn").addEventListener("click", importSamples);

    $$("[data-close-dialog]").forEach((btn) => {
      btn.addEventListener("click", () => btn.closest("dialog")?.close());
    });

    $$("dialog.sheet").forEach((dlg) => {
      dlg.addEventListener("click", (e) => {
        if (e.target === dlg) dlg.close();
      });
    });

    setupUpload();
  }

  /* ---------------- 进入视口 ---------------- */

  let revealIO = null;

  function observeReveals(root) {
    if (!revealIO) {
      $$(".reveal", root).forEach((el) => el.classList.add("is-in"));
      return;
    }
    $$(".reveal", root).forEach((el) => {
      if (el.dataset.revealBound) return;
      el.dataset.revealBound = "1";
      revealIO.observe(el);
    });
  }

  function setupMusic() {
    const btn = $("#musicBtn");
    const audio = $("#bgm");
    const label = $("#musicLabel");
    if (!btn || !audio) return;

    audio.volume = 0.55;

    const setState = (playing) => {
      btn.classList.toggle("is-playing", playing);
      btn.setAttribute("aria-pressed", String(playing));
      if (label) label.textContent = playing ? "暂停" : "播放";
    };

    btn.addEventListener("click", () => {
      if (audio.paused) {
        audio.play().then(() => setState(true)).catch((err) => {
          console.warn("[love-archive] 音乐播放失败", err);
          if (label) label.textContent = "无法播放";
          setTimeout(() => setState(false), 1600);
        });
      } else {
        audio.pause();
        setState(false);
      }
    });

    audio.addEventListener("play", () => setState(true));
    audio.addEventListener("pause", () => setState(false));
    audio.addEventListener("error", () => {
      console.warn("[love-archive] 音频文件加载失败");
      if (label) label.textContent = "音频缺失";
      btn.disabled = true;
    });
  }

  function setupReveal() {
    if (!("IntersectionObserver" in window)) {
      $$(".reveal").forEach((el) => el.classList.add("is-in"));
      return;
    }
    revealIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        revealIO.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    observeReveals(document);
  }

  function setupNavState() {
    const links = $$(".nav a");
    const sections = links
      .map((a) => document.querySelector(a.getAttribute("href")))
      .filter(Boolean);
    if (!links.length || !sections.length || !("IntersectionObserver" in window)) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id));
      });
    }, { rootMargin: "-42% 0px -52% 0px", threshold: 0 });

    sections.forEach((s) => io.observe(s));
  }

  /* ---------------- 启动 ---------------- */

  state.photos = normalizeMotion(samplePhotos());

  hydrateProfile();
  fillHero();
  buildTicker();
  buildLog();
  buildPlaces();
  setupReveal();
  renderGallery();
  setupGalleryFilters();
  setupLightbox();
  setupAuthUI();
  setupMusic();
  setupNavState();
  initBackend();

  // 照片墙的点击统一走灯箱
  const gallery = $("#gallery");
  if (gallery) {
    gallery.addEventListener("click", (e) => {
      const btn = e.target.closest(".shot__open");
      if (!btn || !window.__openLoveLightbox) return;
      window.__openLoveLightbox(Number(btn.dataset.index), btn);
    });
  }
})();
