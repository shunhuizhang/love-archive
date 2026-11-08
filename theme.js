/* =========================================================
   主题切换：默认跟随系统，手动切换后记住选择
   ---------------------------------------------------------
   在 <head> 里同步加载，避免首屏闪一下错误的颜色
   ========================================================= */

(function () {
  "use strict";

  var KEY = "love-theme";
  var root = document.documentElement;
  var media = window.matchMedia("(prefers-color-scheme: dark)");
  var meta = document.querySelector('meta[name="theme-color"]');

  function readPref() {
    try {
      var value = localStorage.getItem(KEY);
      return value === "light" || value === "dark" ? value : "system";
    } catch (e) {
      return "system";
    }
  }

  function resolve(pref) {
    if (pref === "light" || pref === "dark") return pref;
    return media.matches ? "dark" : "light";
  }

  function syncButton(pref, theme) {
    var btn = document.getElementById("themeBtn");
    if (!btn) return;
    var next = theme === "dark" ? "浅色" : "暗色";
    btn.setAttribute("aria-label", "切换到" + next + "主题");
    btn.setAttribute("title", "切换到" + next + "主题");
    btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  }

  function paint(pref) {
    var theme = resolve(pref);
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-theme-pref", pref);
    if (meta) meta.setAttribute("content", theme === "dark" ? "#131110" : "#f1ecdf");
    syncButton(pref, theme);
  }

  function save(pref) {
    try {
      if (pref === "system") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, pref);
    } catch (e) {
      /* 隐私模式下写不进去也不影响当前这次切换 */
    }
    paint(pref);
  }

  paint(readPref());

  function onSystemChange() {
    if (readPref() === "system") paint("system");
  }

  if (media.addEventListener) media.addEventListener("change", onSystemChange);
  else if (media.addListener) media.addListener(onSystemChange);

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("themeBtn");
    if (!btn) return;
    var pref = readPref();
    syncButton(pref, resolve(pref));
    btn.addEventListener("click", function () {
      save(resolve(readPref()) === "dark" ? "light" : "dark");
    });
  });
})();
