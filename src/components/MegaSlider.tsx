"use client";

import { useEffect, useState } from "react";
import type { MegaSlide } from "@/lib/contentstack";
import { withBase } from "@/lib/paths";

type Props = {
  slides: MegaSlide[];
  label: string;
};

export default function MegaSlider({ slides, label }: Props) {
  const items = slides.filter((slide) => slide.title || slide.link?.href);
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hovered, setHovered] = useState(false);
  const count = items.length;
  const current = count ? index % count : 0;
  const paused = reducedMotion || hovered;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (paused || count < 2) return;
    const id = window.setInterval(() => {
      setIndex((value) => (value + 1) % count);
    }, 6000);
    return () => window.clearInterval(id);
  }, [paused, count, index]);

  if (!count) return null;

  const go = (next: number) => setIndex((next + count) % count);

  return (
    <section
      className="mega__slider"
      aria-roledescription="carousel"
      aria-label={`${label} featured`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHovered(false);
      }}
    >
      <div className="mega__viewport">
        <div className="mega__track" style={{ transform: `translateX(-${current * 100}%)` }}>
          {items.map((slide, slideIndex) => {
            const href = slide.link?.href ? withBase(slide.link.href) : undefined;
            const slideClass = `mega__slide${slide.image?.url ? "" : " mega__slide--text"}`;
            const body = (
              <>
                {slide.image?.url && (
                  <img src={slide.image.url} alt="" />
                )}
                <span>
                  {slide.title && <strong>{slide.title}</strong>}
                  {slide.description && <small>{slide.description}</small>}
                </span>
              </>
            );
            return href ? (
              <a
                key={`${slide.title}-${slideIndex}`}
                className={slideClass}
                href={href}
                aria-hidden={slideIndex !== current}
                tabIndex={slideIndex === current ? undefined : -1}
              >
                {body}
              </a>
            ) : (
              <div key={`${slide.title}-${slideIndex}`} className={slideClass} aria-hidden={slideIndex !== current}>
                {body}
              </div>
            );
          })}
        </div>
      </div>
      {count > 1 && (
        <div className="mega__slider-controls">
          <button type="button" className="mega__slider-btn" aria-label="Previous slide" onClick={() => go(current - 1)}>
            ‹
          </button>
          <div className="mega__dots" role="tablist" aria-label="Slides">
            {items.map((slide, slideIndex) => (
              <button
                key={`${slide.title}-dot-${slideIndex}`}
                type="button"
                role="tab"
                className="mega__dot"
                aria-label={slide.title || `Slide ${slideIndex + 1}`}
                aria-selected={slideIndex === current}
                onClick={() => go(slideIndex)}
              />
            ))}
          </div>
          <button type="button" className="mega__slider-btn" aria-label="Next slide" onClick={() => go(current + 1)}>
            ›
          </button>
        </div>
      )}
    </section>
  );
}
