import { withBase } from "@/lib/paths";

type Props = {
    eyebrow?: string;
    heading: string;
    subheading?: string;
    image?: { image?: { url: string }; alt?: string };
    cta?: { label: string; url?: { href: string }; style?: string; style_variant?: string };
    theme?: "light" | "dark";
};

export default function Hero({ eyebrow, heading, subheading, image, cta, theme = "light" }: Props) {
    return (
        <section className="hero" data-theme={theme}>
            <div className="container hero__inner">
                <div className="hero__text">
                    {eyebrow && <p className="eyebrow">{eyebrow}</p>}
                    <h1>{heading}</h1>
                    {subheading && <p className="hero__sub">{subheading}</p>}
                    {cta?.url?.href && (
                        <a href={withBase(cta.url.href)} className={`btn btn--${(cta.style ?? cta.style_variant ?? "primary").toLowerCase()}`}>
                            {cta.label}
                        </a>
                    )}
                </div>
                {image?.image?.url && (
                    <img src={image.image.url} alt={image.alt ?? ""} className="hero__img" />
                )}
            </div>
        </section>
    );
}