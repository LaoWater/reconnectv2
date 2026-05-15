/* Partner Projects carousel — sibling-project surface placed between
   sections 1 and 2 of the Re-Connect landing.

   Loop is seamless: we clone the last 2 cards to the start and the first 2
   cards to the end, then snap the transform back to the matching real card
   when the animation reaches a clone. The visual effect is continuous in
   both directions; the snap is invisible.

   Motion is gated by the runtime capability layer (window.RC) defined in
   base.html. On lite-motion devices (mobile, prefers-reduced-motion, save-
   data, low-end) we still build the carousel — manual controls work — but
   we skip the auto-advance timer entirely.
*/

(function () {
    'use strict';

    var AUTO_ADVANCE_MS = 6000;
    var TRANSITION_MS = 600; // must match CSS .partner-carousel__track transition
    var CLONE_OFFSET = 2;    // number of head clones; real card 0 lives at trackIndex 2

    function init() {
        var root = document.querySelector('.partner-carousel');
        if (!root) return;

        var track = root.querySelector('.partner-carousel__track');
        var dotsContainer = root.querySelector('.partner-carousel__dots');
        var prevBtn = root.querySelector('.partner-carousel__arrow--prev');
        var nextBtn = root.querySelector('.partner-carousel__arrow--next');

        var originalCards = Array.prototype.slice.call(track.children);
        var numCards = originalCards.length;
        if (numCards === 0) return;

        // ---- Clone for seamless loop ----
        // Order becomes: [clone N-2, clone N-1, real 0..N-1, clone 0, clone 1]
        for (var h = CLONE_OFFSET; h > 0; h--) {
            var headIdx = (numCards - h + numCards) % numCards;
            var headClone = makeClone(originalCards[headIdx]);
            track.insertBefore(headClone, track.firstChild);
        }
        for (var t = 0; t < CLONE_OFFSET; t++) {
            var tailClone = makeClone(originalCards[t % numCards]);
            track.appendChild(tailClone);
        }

        function makeClone(el) {
            var clone = el.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            clone.classList.add('is-clone');
            var focusables = clone.querySelectorAll('a, button, [tabindex]');
            for (var i = 0; i < focusables.length; i++) {
                focusables[i].setAttribute('tabindex', '-1');
            }
            return clone;
        }

        // ---- State ----
        var logicalIndex = 0;
        var isAnimating = false;
        var autoTimer = null;
        var paused = false;

        // ---- Build dot indicators ----
        var dots = [];
        for (var d = 0; d < numCards; d++) {
            var dot = document.createElement('button');
            dot.className = 'partner-carousel__dot';
            dot.type = 'button';
            dot.setAttribute('aria-label', 'Go to project ' + (d + 1));
            (function (idx) {
                dot.addEventListener('click', function () { goTo(idx); });
            })(d);
            dotsContainer.appendChild(dot);
            dots.push(dot);
        }

        function cardsPerView() {
            return window.innerWidth >= 1280 ? 2 : 1;
        }

        function stride() {
            var firstCard = track.children[0];
            var rect = firstCard.getBoundingClientRect();
            var styles = window.getComputedStyle(track);
            var gap = parseFloat(styles.gap || styles.columnGap || 0) || 0;
            return rect.width + gap;
        }

        function setTranslate(trackIdx, animate) {
            var px = trackIdx * stride();
            if (!animate) {
                track.classList.add('is-snapping');
                track.style.transform = 'translateX(-' + px + 'px)';
                // force reflow so the snap class takes effect before we strip it
                void track.offsetWidth;
                track.classList.remove('is-snapping');
            } else {
                track.style.transform = 'translateX(-' + px + 'px)';
            }
        }

        function updateActive() {
            var all = track.children;
            var perView = cardsPerView();
            var trackIdx = logicalIndex + CLONE_OFFSET;
            for (var i = 0; i < all.length; i++) {
                var isActive = i >= trackIdx && i < trackIdx + perView;
                all[i].classList.toggle('is-active', isActive);
            }
        }

        function updateDots() {
            for (var i = 0; i < dots.length; i++) {
                var cur = i === logicalIndex;
                dots[i].classList.toggle('is-current', cur);
                if (cur) {
                    dots[i].setAttribute('aria-current', 'true');
                } else {
                    dots[i].removeAttribute('aria-current');
                }
            }
        }

        function goTo(target) {
            if (isAnimating) return;
            var normalized = ((target % numCards) + numCards) % numCards;
            if (normalized === logicalIndex) return;
            logicalIndex = normalized;
            setTranslate(logicalIndex + CLONE_OFFSET, true);
            updateDots();
            // Wait for transition before refreshing active classes so the dim/scale
            // crossfade reads as one motion with the slide.
            afterTransition(function () { updateActive(); });
            restartAuto();
        }

        function next() {
            if (isAnimating) return;
            var target = logicalIndex + 1;
            if (target < numCards) {
                logicalIndex = target;
                setTranslate(logicalIndex + CLONE_OFFSET, true);
                updateDots();
                afterTransition(function () { updateActive(); });
            } else {
                // wrap forward via tail clone, then snap back to real card 0
                isAnimating = true;
                setTranslate(numCards + CLONE_OFFSET, true);
                logicalIndex = 0;
                updateDots();
                afterTransition(function () {
                    setTranslate(CLONE_OFFSET, false);
                    updateActive();
                    isAnimating = false;
                });
            }
            restartAuto();
        }

        function prev() {
            if (isAnimating) return;
            var target = logicalIndex - 1;
            if (target >= 0) {
                logicalIndex = target;
                setTranslate(logicalIndex + CLONE_OFFSET, true);
                updateDots();
                afterTransition(function () { updateActive(); });
            } else {
                // wrap backward via head clone, then snap to real last card
                isAnimating = true;
                setTranslate(CLONE_OFFSET - 1, true);
                logicalIndex = numCards - 1;
                updateDots();
                afterTransition(function () {
                    setTranslate(logicalIndex + CLONE_OFFSET, false);
                    updateActive();
                    isAnimating = false;
                });
            }
            restartAuto();
        }

        function afterTransition(fn) {
            var ran = false;
            function handler() {
                if (ran) return;
                ran = true;
                track.removeEventListener('transitionend', handler);
                fn();
            }
            track.addEventListener('transitionend', handler);
            // Fallback if transitionend never fires (e.g., reduced-motion stripped it)
            setTimeout(handler, TRANSITION_MS + 80);
        }

        // ---- Auto-advance, paused under any of:
        //      window.RC says we're on a lite-motion device,
        //      user is hovering or focused inside the carousel,
        //      tab is hidden.
        function autoAllowed() {
            var heavyOk = !window.RC || window.RC.heavyOk;
            var reduced = window.RC && window.RC.reducedMotion;
            return heavyOk && !reduced;
        }

        function startAuto() {
            if (!autoAllowed()) return;
            stopAuto();
            autoTimer = setInterval(function () {
                if (!paused && document.visibilityState !== 'hidden') next();
            }, AUTO_ADVANCE_MS);
        }

        function stopAuto() {
            if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
        }

        function restartAuto() {
            if (autoTimer) { stopAuto(); startAuto(); }
        }

        // ---- Event wiring ----
        if (nextBtn) nextBtn.addEventListener('click', next);
        if (prevBtn) prevBtn.addEventListener('click', prev);

        root.addEventListener('mouseenter', function () { paused = true; });
        root.addEventListener('mouseleave', function () { paused = false; });
        root.addEventListener('focusin', function () { paused = true; });
        root.addEventListener('focusout', function (e) {
            if (!root.contains(e.relatedTarget)) paused = false;
        });

        // Keyboard: arrow keys when focus is anywhere inside the carousel
        root.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
            else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
        });

        // Copy-on-click for the CTA code
        var codeEl = root.querySelector('.partner-card__cta-code');
        if (codeEl) {
            codeEl.setAttribute('role', 'button');
            codeEl.setAttribute('tabindex', '0');
            codeEl.setAttribute('aria-label', 'Copy promo code ' + codeEl.textContent.trim());
            var copyCode = function () {
                var text = codeEl.textContent.trim();
                var done = function () {
                    codeEl.classList.add('is-copied');
                    setTimeout(function () { codeEl.classList.remove('is-copied'); }, 1400);
                };
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
                } else {
                    fallbackCopy(text, done);
                }
            };
            codeEl.addEventListener('click', function (e) {
                // Don't bubble into the card's link.
                e.preventDefault();
                e.stopPropagation();
                copyCode();
            });
            codeEl.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    copyCode();
                }
            });
        }

        function fallbackCopy(text, done) {
            try {
                var ta = document.createElement('textarea');
                ta.value = text;
                ta.setAttribute('readonly', '');
                ta.style.position = 'absolute';
                ta.style.left = '-9999px';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                done();
            } catch (err) { /* swallow — the code is still visible to copy by hand */ }
        }

        // Resize: recompute translate without animating (the px value depends on
        // current card width, which changes at breakpoints).
        var resizeRaf = null;
        window.addEventListener('resize', function () {
            if (resizeRaf) cancelAnimationFrame(resizeRaf);
            resizeRaf = requestAnimationFrame(function () {
                setTranslate(logicalIndex + CLONE_OFFSET, false);
                updateActive();
            });
        });

        // ---- First paint ----
        setTranslate(CLONE_OFFSET, false);
        updateActive();
        updateDots();
        startAuto();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
