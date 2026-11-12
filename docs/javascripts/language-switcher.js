/* SPDX-License-Identifier: Apache-2.0 */
/* MkDocs Material DE / EN segmented pill language switcher, overview block sync & search deduplicator */
(function () {
  "use strict";

  var STORAGE_KEY = "skillpilot-docs-lang";

  /* Set initial language attribute immediately to prevent flash of inactive overview blocks */
  (function applyEarlyLangAttr() {
    var early = null;
    try {
      var saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "de" || saved === "en") early = saved;
    } catch (_err) {
      /* ignore */
    }
    if (!early) {
      var navLang = (navigator.language || "").toLowerCase();
      early = navLang.indexOf("de") === 0 ? "de" : "en";
    }
    document.documentElement.setAttribute("data-sp-lang", early);
  })();

  function docPathToUrlKey(docRel) {
    if (!docRel) return "";
    var clean = String(docRel).replace(/^\/+/, "");
    if (clean === "index.md") return "";
    if (clean.endsWith("/index.md")) {
      return clean.slice(0, -"/index.md".length) + "/";
    }
    if (clean.endsWith(".md")) {
      return clean.slice(0, -3) + "/";
    }
    return clean;
  }

  function getSiteRootUrl() {
    var cfgEl = document.getElementById("__config");
    var base = ".";
    if (cfgEl && cfgEl.textContent) {
      try {
        var parsed = JSON.parse(cfgEl.textContent);
        if (parsed && typeof parsed.base === "string" && parsed.base.length > 0) {
          base = parsed.base;
        }
      } catch (_err) {
        base = ".";
      }
    }
    var baseWithSlash = base.endsWith("/") ? base : base + "/";
    return new URL(baseWithSlash, window.location.href);
  }

  function urlToKey(href, siteRootUrl) {
    try {
      var resolved = new URL(href, window.location.href);
      if (resolved.origin !== siteRootUrl.origin) return null;
      var rootPath = siteRootUrl.pathname;
      if (!resolved.pathname.startsWith(rootPath)) return null;
      var rel = resolved.pathname.slice(rootPath.length);
      if (rel === "index.html") return "";
      if (rel.endsWith("/index.html")) {
        return rel.slice(0, -"index.html".length);
      }
      if (rel.length > 0 && !rel.endsWith("/") && !/\.[a-z0-9]+$/i.test(rel)) {
        return rel + "/";
      }
      return rel;
    } catch (_err) {
      return null;
    }
  }

  function buildLookupTables() {
    var raw = window.SKILLPILOT_DOCS_I18N || { pairs: [], navLabels: {} };
    var keyLang = Object.create(null);
    var counterpart = Object.create(null);

    (raw.pairs || []).forEach(function (pair) {
      var deKey = docPathToUrlKey(pair.de);
      var enKey = docPathToUrlKey(pair.en);
      if (deKey === enKey) return;
      keyLang[deKey] = "de";
      keyLang[enKey] = "en";
      counterpart[deKey] = enKey;
      counterpart[enKey] = deKey;
    });

    return {
      keyLang: keyLang,
      counterpart: counterpart,
      navLabels: raw.navLabels || {},
    };
  }

  function detectPreferredLang(currentKey, tables) {
    var pageLang = currentKey !== null ? tables.keyLang[currentKey] : undefined;
    if (pageLang === "de" || pageLang === "en") {
      try {
        window.localStorage.setItem(STORAGE_KEY, pageLang);
      } catch (_err) {
        /* ignore storage restrictions */
      }
      return pageLang;
    }
    try {
      var saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "de" || saved === "en") return saved;
    } catch (_err) {
      /* ignore */
    }
    var navLang = (navigator.language || "").toLowerCase();
    return navLang.indexOf("de") === 0 ? "de" : "en";
  }

  function cleanNavLabelText(text) {
    return text
      .replace(/\s*\((?:DE|EN)\)\s*$/i, "")
      .replace(/\((?:DE|EN),\s*/i, "(")
      .replace(/,\s*(?:DE|EN)\)/i, ")")
      .replace(/^English$/i, "Document")
      .replace(/^Deutsch$/i, "Dokument");
  }

  function syncBilingualContentBlocks(activeLang) {
    var blocks = document.querySelectorAll(".md-content [data-sp-content-lang]");
    if (!blocks || blocks.length === 0) return false;

    /* Update document title to match the active language's H1 */
    var activeHeading = document.querySelector(
      '.md-content [data-sp-content-lang="' + activeLang + '"] h1'
    );
    if (activeHeading && activeHeading.textContent) {
      var cleanTitle = activeHeading.textContent.replace(/¶/g, "").trim();
      if (cleanTitle) {
        document.title = cleanTitle === "SkillPilot" ? "SkillPilot" : cleanTitle + " - SkillPilot";
      }
    }

    /* Filter secondary right-hand Table of Contents items by their target heading's language block */
    var tocLinks = document.querySelectorAll('.md-nav--secondary a.md-nav__link[href^="#"]');
    Array.prototype.forEach.call(tocLinks, function (link) {
      var navItem = link.closest(".md-nav__item");
      if (!navItem) return;
      var rawHash = link.getAttribute("href") || "";
      var id = decodeURIComponent(rawHash.slice(1));
      if (!id) return;
      var targetEl = document.getElementById(id);
      if (!targetEl) return;
      var langContainer = targetEl.closest("[data-sp-content-lang]");
      if (langContainer) {
        var blockLang = langContainer.getAttribute("data-sp-content-lang");
        if (blockLang === "de" || blockLang === "en") {
          navItem.setAttribute("data-sp-only-lang", blockLang);
        }
      }
    });

    return true;
  }

  function annotateNavTree(siteRootUrl, tables, activeLang) {
    var items = Array.prototype.slice.call(
      document.querySelectorAll(".md-nav--primary .md-nav__item, .md-sidebar--primary .md-nav__item")
    );

    items.forEach(function (item) {
      item.removeAttribute("data-sp-only-lang");
    });

    /* Leaf nav items first */
    items.forEach(function (item) {
      if (item.classList.contains("md-nav__item--nested")) return;
      var link = item.querySelector(":scope > a.md-nav__link");
      if (!link || !link.getAttribute("href")) return;
      var key = urlToKey(link.getAttribute("href"), siteRootUrl);
      var lang = key !== null ? tables.keyLang[key] : undefined;
      if (lang === "de" || lang === "en") {
        item.setAttribute("data-sp-only-lang", lang);
        var ellipsis = link.querySelector(".md-ellipsis") || link;
        if (!ellipsis.hasAttribute("data-sp-orig-text")) {
          ellipsis.setAttribute("data-sp-orig-text", (ellipsis.textContent || "").trim());
        }
        var orig = ellipsis.getAttribute("data-sp-orig-text") || "";
        if (/(?:\((?:DE|EN)\)\s*$|,\s*(?:DE|EN)\)|\((?:DE|EN),\s*)/i.test(orig)) {
          ellipsis.textContent = cleanNavLabelText(orig);
        }
      }
    });

    /* Propagate bottom-up to nested nav groups whose children all belong to a single language */
    for (var pass = 0; pass < 4; pass++) {
      items.forEach(function (item) {
        if (!item.classList.contains("md-nav__item--nested")) return;
        var childList = item.querySelector(":scope > nav.md-nav > ul.md-nav__list");
        if (!childList) return;
        var children = Array.prototype.slice.call(childList.children).filter(function (el) {
          return el.classList && el.classList.contains("md-nav__item");
        });
        if (children.length === 0) return;
        var langs = Object.create(null);
        var allTagged = true;
        children.forEach(function (ch) {
          var tag = ch.getAttribute("data-sp-only-lang");
          if (!tag) {
            allTagged = false;
          } else {
            langs[tag] = true;
          }
        });
        var distinct = Object.keys(langs);
        if (allTagged && distinct.length === 1) {
          item.setAttribute("data-sp-only-lang", distinct[0]);
          var labelNode = item.querySelector(
            ":scope > label.md-nav__link .md-ellipsis, :scope > .md-nav__container > a.md-nav__link .md-ellipsis, :scope > a.md-nav__link .md-ellipsis"
          );
          if (labelNode) {
            if (!labelNode.hasAttribute("data-sp-orig-text")) {
              labelNode.setAttribute("data-sp-orig-text", (labelNode.textContent || "").trim());
            }
            var origGroup = labelNode.getAttribute("data-sp-orig-text") || "";
            if (/\((?:DE|EN)\)\s*$/i.test(origGroup)) {
              labelNode.textContent = origGroup.replace(/\s*\((?:DE|EN)\)\s*$/i, "");
            }
          }
        }
      });
    }

    /* Translate shared section headings and TOC titles configured in navLabels */
    var navTexts = document.querySelectorAll(
      ".md-nav__link .md-ellipsis, .md-tabs__link, .md-nav--secondary > .md-nav__title"
    );
    Array.prototype.forEach.call(navTexts, function (el) {
      if (el.children && el.children.length > 0) return;
      if (!el.hasAttribute("data-sp-section-key")) {
        var rawTxt = (el.textContent || "").trim();
        if (tables.navLabels[rawTxt]) {
          el.setAttribute("data-sp-section-key", rawTxt);
        }
      }
      var secKey = el.getAttribute("data-sp-section-key");
      if (secKey && tables.navLabels[secKey] && tables.navLabels[secKey][activeLang]) {
        el.textContent = tables.navLabels[secKey][activeLang];
      }
    });

    /* Also check bare leaf a.md-nav__link nodes without inner .md-ellipsis */
    var bareLinks = document.querySelectorAll("a.md-nav__link");
    Array.prototype.forEach.call(bareLinks, function (el) {
      if (el.children && el.children.length > 0) return;
      if (!el.hasAttribute("data-sp-section-key")) {
        var rawTxt = (el.textContent || "").trim();
        if (tables.navLabels[rawTxt]) {
          el.setAttribute("data-sp-section-key", rawTxt);
        }
      }
      var secKey = el.getAttribute("data-sp-section-key");
      if (secKey && tables.navLabels[secKey] && tables.navLabels[secKey][activeLang]) {
        el.textContent = tables.navLabels[secKey][activeLang];
      }
    });
  }

  function annotateSearchResults(siteRootUrl, tables) {
    var listEl = document.querySelector(".md-search-result__list");
    if (!listEl) return;

    var applyTags = function () {
      var resultItems = listEl.querySelectorAll(".md-search-result__item");
      Array.prototype.forEach.call(resultItems, function (item) {
        var link = item.querySelector("a.md-search-result__link[href]");
        if (!link) return;
        var key = urlToKey(link.getAttribute("href"), siteRootUrl);
        var lang = key !== null ? tables.keyLang[key] : undefined;
        if (lang === "de" || lang === "en") {
          item.setAttribute("data-sp-only-lang", lang);
        } else {
          item.removeAttribute("data-sp-only-lang");
        }
      });
    };

    applyTags();

    if (!listEl.__spSearchObserved && typeof MutationObserver !== "undefined") {
      listEl.__spSearchObserved = true;
      var obs = new MutationObserver(function () {
        applyTags();
      });
      obs.observe(listEl, { childList: true, subtree: false });
    }
  }

  function fixFooterCrossLanguageLinks(siteRootUrl, tables, activeLang) {
    var footerLinks = document.querySelectorAll("a.md-footer__link");
    var currentKey = urlToKey(window.location.href, siteRootUrl);
    Array.prototype.forEach.call(footerLinks, function (link) {
      var href = link.getAttribute("href");
      if (!href) return;
      var targetKey = urlToKey(href, siteRootUrl);
      if (targetKey === null) return;
      var targetLang = tables.keyLang[targetKey];
      if (targetLang && targetLang !== activeLang) {
        var mappedKey = tables.counterpart[targetKey];
        if (mappedKey === currentKey) {
          link.style.display = "none";
        } else if (typeof mappedKey === "string") {
          link.setAttribute("href", new URL(mappedKey, siteRootUrl).href);
        }
      }
    });
  }

  function updatePillState(container, activeLang, isBilingualPage) {
    if (!container) return;
    var buttons = container.querySelectorAll(".sp-lang-switch__btn");
    Array.prototype.forEach.call(buttons, function (btn) {
      var code = btn.getAttribute("data-lang");
      var isActive = code === activeLang;
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
    container.title = isBilingualPage
      ? (activeLang === "de" ? "Sprache wechseln (DE / EN)" : "Switch language (DE / EN)")
      : (activeLang === "de"
          ? "Navigation auf Deutsch · Diese Einzelseite ist einsprachig"
          : "English navigation · This page is single-language");
  }

  function mountLanguageSwitcher() {
    var siteRootUrl = getSiteRootUrl();
    var tables = buildLookupTables();
    var currentKey = urlToKey(window.location.href, siteRootUrl);
    var activeLang = detectPreferredLang(currentKey, tables);
    var hasCounterpart = currentKey !== null && typeof tables.counterpart[currentKey] === "string";

    document.documentElement.setAttribute("data-sp-lang", activeLang);
    var hasInlineBilingual = syncBilingualContentBlocks(activeLang);
    annotateNavTree(siteRootUrl, tables, activeLang);
    annotateSearchResults(siteRootUrl, tables);
    fixFooterCrossLanguageLinks(siteRootUrl, tables, activeLang);

    var headerInner = document.querySelector(".md-header__inner");
    if (!headerInner) return;

    var existing = headerInner.querySelector(".sp-lang-switch");
    if (!existing) {
      existing = document.createElement("div");
      existing.className = "sp-lang-switch";
      existing.setAttribute("role", "group");
      existing.setAttribute("aria-label", "Sprache / Language");

      ["de", "en"].forEach(function (code) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "sp-lang-switch__btn";
        btn.setAttribute("data-lang", code);
        btn.textContent = code.toUpperCase();
        btn.addEventListener("click", function () {
          try {
            window.localStorage.setItem(STORAGE_KEY, code);
          } catch (_err) {
            /* ignore */
          }
          var nowSiteRoot = getSiteRootUrl();
          var nowKey = urlToKey(window.location.href, nowSiteRoot);
          var nowLang = nowKey !== null ? tables.keyLang[nowKey] : undefined;
          if (nowKey !== null && nowLang && nowLang !== code && typeof tables.counterpart[nowKey] === "string") {
            var destUrl = new URL(tables.counterpart[nowKey], nowSiteRoot);
            destUrl.search = window.location.search;
            destUrl.hash = window.location.hash;
            window.location.href = destUrl.href;
            return;
          }
          document.documentElement.setAttribute("data-sp-lang", code);
          var inlineBilingual = syncBilingualContentBlocks(code);
          annotateNavTree(nowSiteRoot, tables, code);
          annotateSearchResults(nowSiteRoot, tables);
          updatePillState(
            existing,
            code,
            inlineBilingual || (nowKey !== null && typeof tables.counterpart[nowKey] === "string")
          );
        });
        existing.appendChild(btn);
      });

      var anchor =
        headerInner.querySelector("form.md-header__option") ||
        headerInner.querySelector(".md-search") ||
        headerInner.querySelector(".md-header__source");
      if (anchor && anchor.parentNode === headerInner) {
        headerInner.insertBefore(existing, anchor);
      } else {
        headerInner.appendChild(existing);
      }
    }

    updatePillState(existing, activeLang, hasCounterpart || hasInlineBilingual);
  }

  if (typeof window.document$ !== "undefined" && window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(mountLanguageSwitcher);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountLanguageSwitcher);
  } else {
    mountLanguageSwitcher();
  }
})();
