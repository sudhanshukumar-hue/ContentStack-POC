"use client";

import { useEffect, useRef, useState } from "react";

type LogoAsset = { url?: string } | null;
type Logo = { name?: string; logo?: LogoAsset; industry?: string; description?: string };
type Props = { heading?: string; logos?: Logo[] };
type OpenCard = {
  name: string;
  industry?: string;
  description: string;
  logoUrl?: string;
  top: number;
  left: number;
};

const fallbackDetails: Record<string, { industry: string; description: string }> = {
  Northwind: { industry: "Product", description: "Three squads share one roadmap. A slipped date shows on the board before the Monday meeting." },
  Helio: { industry: "Marketing", description: "Campaign work sits on the same timeline as the launch it supports." },
  Brightline: { industry: "Engineering", description: "Sprint boards stay attached to the date the customer was promised." },
  "Kite & Co": { industry: "Operations", description: "Status comes from the work, so the Friday spreadsheet stayed closed." },
  Marlowe: { industry: "Product", description: "Goals stay tied to the tasks. Leadership opens the plan without a briefing." },
  Fieldnote: { industry: "Startup", description: "Started with boards and a timeline, then added reporting when a second squad joined." },
  Copperlane: { industry: "Mid-market", description: "Each squad has a workspace. Leadership has one view across them." },
  Lumenary: { industry: "Enterprise", description: "SSO and an audit trail for teams that have to show who moved a date." },
};

function detailsFor(logo: Logo) {
  const fallback = logo.name ? fallbackDetails[logo.name] : undefined;
  return {
    industry: logo.industry || fallback?.industry,
    description: logo.description || fallback?.description || "",
  };
}

function placeCard(rect: DOMRect) {
  const width = Math.min(280, window.innerWidth - 24);
  const left = Math.min(window.innerWidth - width - 12, Math.max(12, rect.left + rect.width / 2 - width / 2));
  const estimated = 168;
  const below = rect.bottom + 10;
  const top = below + estimated > window.innerHeight - 12 ? Math.max(12, rect.top - estimated - 10) : below;
  return { top, left };
}

export default function ClientLogos({ heading, logos = [] }: Props) {
  const items = logos.filter((logo) => logo.name || logo.logo?.url);
  const viewportRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLUListElement>(null);
  const closeTimer = useRef<number | null>(null);
  const anchorRef = useRef<HTMLElement | null>(null);
  const [copies, setCopies] = useState(2);
  const [open, setOpen] = useState<OpenCard | null>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    const set = setRef.current;
    if (!viewport || !set) return;

    const measure = () => {
      const setWidth = set.getBoundingClientRect().width;
      const viewWidth = viewport.getBoundingClientRect().width;
      if (setWidth < 1 || viewWidth < 1) return;
      const needed = Math.max(2, Math.ceil(viewWidth / setWidth) + 1);
      setCopies((current) => (current === needed ? current : needed));
      viewport.style.setProperty("--clients-shift", `${setWidth}px`);
      viewport.style.setProperty("--clients-duration", `${Math.max(16, setWidth / 40)}s`);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(set);
    return () => observer.disconnect();
  }, [items.length]);

  useEffect(() => () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  }, []);

  useEffect(() => {
    if (!open) return;
    const place = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const { top, left } = placeCard(anchor.getBoundingClientRect());
      setOpen((current) => (current ? { ...current, top, left } : current));
    };
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open != null]);

  function showCard(logo: Logo, element: HTMLElement) {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    const detail = detailsFor(logo);
    if (!logo.name && !detail.description) return;
    anchorRef.current = element;
    const { top, left } = placeCard(element.getBoundingClientRect());
    setOpen({
      name: logo.name || "Client",
      industry: detail.industry,
      description: detail.description,
      logoUrl: logo.logo?.url,
      top,
      left,
    });
  }

  function scheduleClose() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      anchorRef.current = null;
      setOpen(null);
    }, 120);
  }

  if (!items.length) return null;

  return (
    <section className={`clients${open ? " clients--open" : ""}`} aria-label={heading || "Our clients"}>
      {heading && <p className="clients__heading">{heading}</p>}
      <div className="clients__viewport" ref={viewportRef}>
        <div className="clients__track">
          {Array.from({ length: copies }, (_, copy) => (
            <ul
              key={copy}
              ref={copy === 0 ? setRef : undefined}
              className="clients__set"
              aria-hidden={copy > 0 || undefined}
            >
              {items.map((logo, index) => {
                const label = logo.name || "Client";
                return (
                  <li key={`${label}-${index}`} className="clients__item">
                    <button
                      type="button"
                      className="clients__hit"
                      aria-label={`${label} details`}
                      tabIndex={copy === 0 ? 0 : -1}
                      onMouseEnter={(event) => showCard(logo, event.currentTarget)}
                      onMouseLeave={scheduleClose}
                      onFocus={(event) => showCard(logo, event.currentTarget)}
                      onBlur={scheduleClose}
                    >
                      {logo.logo?.url ? <img src={logo.logo.url} alt="" /> : <span>{logo.name}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          ))}
        </div>
      </div>
      {open && (
        <article
          className="clients__card"
          role="dialog"
          aria-label={open.name}
          style={{ top: open.top, left: open.left }}
          onMouseEnter={() => {
            if (closeTimer.current) window.clearTimeout(closeTimer.current);
          }}
          onMouseLeave={scheduleClose}
        >
          {open.logoUrl && <img src={open.logoUrl} alt="" />}
          <strong>{open.name}</strong>
          {open.industry && <p className="clients__kicker">{open.industry}</p>}
          {open.description && <p>{open.description}</p>}
        </article>
      )}
    </section>
  );
}
