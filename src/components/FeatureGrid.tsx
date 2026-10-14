import { withBase } from "@/lib/paths";
import { slugify } from "@/lib/slug";

type ImageField = {
    image?: { url?: string } | string;
    alt?: string;
    url?: string;
};
type Feature = {
    icon?: string | ImageField;
    title: string;
    description?: string;
    link?: { href?: string; title?: string };
};
type Props = { heading?: string; columns?: string | number; features?: Feature[] };

function iconUrl(icon: Feature["icon"]) {
    if (!icon || typeof icon === "string") return undefined;
    if (typeof icon.image === "string") return icon.image;
    return icon.image?.url ?? icon.url;
}

export default function FeatureGrid({ heading, columns = 3, features = [] }: Props) {
    return (
        <section className="section" id={slugify(heading)}>
            <div className="container">
                {heading && <h2 className="section__title">{heading}</h2>}
                <div className={`grid grid--${columns}`}>
                    {features.map((f, i) => {
                        const url = iconUrl(f.icon);
                        const alt = typeof f.icon === "object" ? f.icon.alt ?? "" : "";
                        const content = (
                            <>
                                {typeof f.icon === "string" && <span className="card__icon">{f.icon}</span>}
                                {url && <img src={url} alt={alt} className="card__icon" />}
                                {!url && typeof f.icon === "object" && f.icon.alt && (
                                    <span className="card__icon">{f.icon.alt}</span>
                                )}
                                <h3>{f.title}</h3>
                                {f.description && <p>{f.description}</p>}
                            </>
                        );
                        if (f.link?.href) {
                            return (
                                <a key={i} id={slugify(f.title)} className="card card--link" href={withBase(f.link.href)}>
                                    {content}
                                </a>
                            );
                        }
                        return (
                            <article key={i} id={slugify(f.title)} className="card">
                                {content}
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}