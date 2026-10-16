"use client";

import { useEffect, useState } from "react";

type Avatar = { url?: string; alt?: string; image?: { url?: string } | null };
type Testimonial = {
    uid: string;
    quote: string;
    author_name: string;
    role?: string;
    avatar?: Avatar | null;
};
type Props = { heading?: string; testimonials?: Testimonial[]; reference?: Testimonial[] };

function avatarUrl(avatar?: Avatar | null) {
    if (!avatar) return undefined;
    if (avatar.url) return avatar.url;
    if (avatar.image && typeof avatar.image === "object") return avatar.image.url;
    return undefined;
}

function cardsPerView(width: number) {
    if (width < 720) return 1;
    if (width < 1100) return 2;
    return 3;
}

export default function Testimonials({ heading, testimonials, reference }: Props) {
    const items = testimonials?.length ? testimonials : reference ?? [];
    const [perView, setPerView] = useState(3);
    const [page, setPage] = useState(0);
    const [paused, setPaused] = useState(false);
    const pageCount = Math.max(1, Math.ceil(items.length / perView));
    const current = Math.min(page, pageCount - 1);

    useEffect(() => {
        const apply = () => setPerView(cardsPerView(window.innerWidth));
        apply();
        window.addEventListener("resize", apply);
        return () => window.removeEventListener("resize", apply);
    }, []);

    useEffect(() => {
        const media = window.matchMedia("(prefers-reduced-motion: reduce)");
        const apply = () => setPaused(media.matches);
        apply();
        media.addEventListener("change", apply);
        return () => media.removeEventListener("change", apply);
    }, []);

    useEffect(() => {
        setPage((value) => Math.min(value, pageCount - 1));
    }, [pageCount]);

    useEffect(() => {
        if (paused || pageCount < 2) return;
        const id = window.setInterval(() => {
            setPage((value) => (value + 1) % pageCount);
        }, 7000);
        return () => window.clearInterval(id);
    }, [paused, pageCount, current]);

    if (!items.length) return null;

    const pages: Testimonial[][] = [];
    for (let index = 0; index < items.length; index += perView) {
        pages.push(items.slice(index, index + perView));
    }

    return (
        <section
            className="section section--muted"
            aria-roledescription="carousel"
            aria-label={heading || "Testimonials"}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(window.matchMedia("(prefers-reduced-motion: reduce)").matches)}
            onFocus={() => setPaused(true)}
            onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                    setPaused(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
                }
            }}
        >
            <div className="container">
                {heading && <h2 className="section__title">{heading}</h2>}
                <div className="quotes__viewport">
                    <div className="quotes__track" style={{ transform: `translateX(-${current * 100}%)` }}>
                        {pages.map((group, groupIndex) => (
                            <div
                                key={group.map((item) => item.uid).join("-")}
                                className="quotes__page"
                                style={{ gridTemplateColumns: `repeat(${perView}, minmax(0, 1fr))` }}
                                aria-hidden={groupIndex !== current || undefined}
                            >
                                {group.map((item) => {
                                    const src = avatarUrl(item.avatar);
                                    return (
                                        <figure key={item.uid} className="card">
                                            <blockquote>{item.quote}</blockquote>
                                            <figcaption className="author">
                                                {src && <img src={src} alt={item.avatar?.alt ?? ""} className="author__img" />}
                                                <div>
                                                    <strong>{item.author_name}</strong>
                                                    {item.role && <span>{item.role}</span>}
                                                </div>
                                            </figcaption>
                                        </figure>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
                {pages.length > 1 && (
                    <div className="quotes__dots" role="tablist" aria-label="Testimonial slides">
                        {pages.map((group, groupIndex) => (
                            <button
                                key={group.map((item) => item.uid).join("-")}
                                type="button"
                                role="tab"
                                className="quotes__dot"
                                aria-label={`Slide ${groupIndex + 1} of ${pages.length}`}
                                aria-selected={groupIndex === current}
                                onClick={() => setPage(groupIndex)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
