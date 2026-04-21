// The Rust Book - Simplified :: minimal theme JS
// Runs alongside mdBook's own runtime without overriding it.

(function () {
    "use strict";

    function installProgressBar() {
        if (document.getElementById("rs-progress")) return;
        var bar = document.createElement("div");
        bar.id = "rs-progress";
        document.body.appendChild(bar);

        function update() {
            var doc = document.documentElement;
            var scrollTop = window.scrollY || doc.scrollTop || 0;
            var height = (doc.scrollHeight - doc.clientHeight) || 1;
            var pct = Math.min(100, Math.max(0, (scrollTop / height) * 100));
            bar.style.width = pct + "%";
        }

        var ticking = false;
        window.addEventListener(
            "scroll",
            function () {
                if (!ticking) {
                    window.requestAnimationFrame(function () {
                        update();
                        ticking = false;
                    });
                    ticking = true;
                }
            },
            { passive: true }
        );
        window.addEventListener("resize", update, { passive: true });
        update();
    }

    function installSmoothAnchors() {
        document.addEventListener("click", function (e) {
            // e.target can be a Text node; normalize to the nearest Element so
            // .closest() is available across browsers.
            var el = e.target instanceof Element ? e.target : (e.target && e.target.parentElement);
            var a = el && el.closest && el.closest("a[href^='#']");
            if (!a) return;
            var href = a.getAttribute("href");
            if (!href || href === "#") return;
            var id = href.slice(1);
            var target = document.getElementById(id);
            if (!target) return;
            e.preventDefault();
            var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
            history.replaceState(null, "", href);
        });
    }

    function getActiveTheme() {
        var html = document.documentElement;
        var themes = ["light", "rust", "coal", "navy", "ayu"];
        for (var i = 0; i < themes.length; i += 1) {
            if (html.classList.contains(themes[i])) return themes[i];
        }
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
            return window.default_dark_theme || "ayu";
        }
        return window.default_light_theme || "light";
    }

    function syncLandingThemeButtons() {
        var activeTheme = getActiveTheme();
        var isDarkTheme = activeTheme !== "light";
        var buttons = document.querySelectorAll("[data-theme-target]");
        Array.prototype.forEach.call(buttons, function (button) {
            var target = button.getAttribute("data-theme-target");
            var pressed = target === "light" ? activeTheme === "light" : isDarkTheme;
            button.setAttribute("aria-pressed", pressed ? "true" : "false");
        });
    }

    function installThemeButtons() {
        var buttons = document.querySelectorAll("[data-theme-target]");
        if (!buttons.length) return;

        Array.prototype.forEach.call(buttons, function (button) {
            button.addEventListener("click", function () {
                var target = button.getAttribute("data-theme-target") === "light"
                    ? (window.default_light_theme || "light")
                    : (window.default_dark_theme || "ayu");
                var themeButton = document.getElementById(target);

                if (themeButton) {
                    themeButton.click();
                } else {
                    var html = document.documentElement;
                    html.classList.remove("light", "rust", "coal", "navy", "ayu");
                    html.classList.add(target);
                    try {
                        localStorage.setItem("mdbook-theme", target);
                    } catch (err) { }
                }

                window.requestAnimationFrame(syncLandingThemeButtons);
            });
        });

        Array.prototype.forEach.call(document.querySelectorAll("#theme-list .theme"), function (button) {
            button.addEventListener("click", function () {
                window.requestAnimationFrame(syncLandingThemeButtons);
            });
        });

        syncLandingThemeButtons();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () {
            installProgressBar();
            installSmoothAnchors();
            installThemeButtons();
        });
    } else {
        installProgressBar();
        installSmoothAnchors();
        installThemeButtons();
    }
})();
