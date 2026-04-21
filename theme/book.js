// The Rust Book — Simplified :: minimal theme JS
// Runs alongside mdBook's own book.js.

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
            var a = e.target.closest && e.target.closest("a[href^='#']");
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

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () {
            installProgressBar();
            installSmoothAnchors();
        });
    } else {
        installProgressBar();
        installSmoothAnchors();
    }
})();
