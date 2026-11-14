import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { FaInfoCircle } from 'react-icons/fa';

// NOTE: keep exactly two styled() calls in this file, in this order.
// styled-components numbers components globally, and the Django page CSS
// (landing_page/static/css/food_prophet.css) targets the generated .sc-* ids
// of components defined after this one.

// Intro line + the "About this showcase" button
const Intro = styled.div`
  position: relative;
  max-width: 820px; /* sizes here are pre-zoom: #root is zoomed to 0.73 on desktop */
  margin: 1.25rem auto 1.25rem;
  padding: 0 16px;
  text-align: center;

  .intro-text {
    margin: 0 0 0.75rem;
    font-size: 1.4rem;
    line-height: 1.55;
    color: var(--ink-soft, #4a4237);
  }

  @media (max-width: 900px) {
    .intro-text { font-size: 1.05rem; }
    .info-button { font-size: 1rem; min-height: 44px; }
  }

  .info-anchor {
    position: relative;
    display: inline-block;
  }

  .info-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 58px;
    padding: 0.6rem 1.6rem;
    border: 1px solid var(--line, #ddd3c2);
    border-radius: 999px;
    background: var(--surface, #fffcf6);
    color: var(--river, #2f6f7e);
    font-size: 1.3rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease, border-color 0.2s ease;
  }

  .info-button svg {
    width: 1.7rem;
    height: 1.7rem;
  }

  .info-button:hover,
  .info-button:focus-visible,
  .info-button[aria-expanded='true'] {
    background: var(--river-soft, #e3eef0);
    border-color: var(--river, #2f6f7e);
    outline: none;
  }
`;

// The explainer panel. It sits flush under the button (padding bridges the
// gap) so the pointer can travel into it and click its links.
const Panel = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: min(600px, calc(100vw - 32px));
  padding-top: 10px;
  z-index: 50;
  text-align: left;
  display: ${({ $open }) => ($open ? 'block' : 'none')};

  .panel-body {
    padding: 1.25rem 1.5rem;
    background: var(--surface, #fffcf6);
    color: var(--ink-soft, #4a4237);
    border: 1px solid var(--line, #ddd3c2);
    border-radius: 12px;
    box-shadow: 0 12px 32px rgba(60, 48, 30, 0.16);
    font-size: 1.25rem;
    line-height: 1.55;
  }

  p {
    margin: 0 0 0.75rem;
  }

  @media (max-width: 900px) {
    .panel-body { font-size: 0.95rem; }
  }

  p:last-child {
    margin-bottom: 0;
  }

  strong {
    color: var(--ink, #2b251d);
  }

  a {
    color: var(--river, #2f6f7e);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  a:hover {
    color: var(--moss, #4f6b3a);
  }
`;

const InfoWithTooltip = () => {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);
  const wrapRef = useRef(null);

  const show = () => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hideSoon = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 250);
  };

  // Close on Escape or on a tap/click outside (touch screens have no hover)
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  return (
    <Intro>
      <p className="intro-text">
        Two eating archetypes, side by side: a modern routine and a Blue Zones
        centenarian. Each one simulates fullness hour by hour, day after day, for as
        long as you let it run. Speed time up, add a meal, or build your own.
      </p>

      {/* Hover is scoped to the button + its panel only, not the whole row */}
      <span className="info-anchor" ref={wrapRef} onMouseEnter={show} onMouseLeave={hideSoon}>
      <button
        type="button"
        className="info-button"
        aria-expanded={open}
        aria-controls="food-prophet-guide"
        onClick={show}
        onFocus={show}
      >
        <FaInfoCircle aria-hidden="true" />
        About this showcase
      </button>

      <Panel $open={open} id="food-prophet-guide" role="region" aria-label="About this showcase">
        <div className="panel-body">
          <p>
            The two default simulations are the <strong>Modern Man</strong> and the{' '}
            <strong>Centenarian</strong>. The Centenarian follows eating patterns seen in
            Earth&rsquo;s{' '}
            <a href="https://en.wikipedia.org/wiki/Blue_zone" target="_blank" rel="noopener noreferrer">
              Blue Zones
            </a>
            , the few places where many people live close to 100 years.
          </p>
          <p>
            Use <strong>Add Archetype</strong> to shape your own day, or{' '}
            <strong>Defaults</strong> to bring back the examples. For a fully manual
            run, name the archetype <strong>&ldquo;Manual&rdquo;</strong>: the simulation
            then waits for you to add each meal.
          </p>
          <p>
            A mirror for awareness, not a medical diagnosis. The sources behind it are in
            the <a href="/bibliography/">bibliography</a>.
          </p>
        </div>
      </Panel>
      </span>
    </Intro>
  );
};

export default InfoWithTooltip;
