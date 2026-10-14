import { withBase } from "@/lib/paths";
import { slugify } from "@/lib/slug";

type Props = {
  eyebrow?: string;
  heading?: string;
  body?: string;
  image?: { image?: { url?: string }; alt?: string };
  image_side?: string;
  cta?: { label?: string; url?: { href?: string }; style_variant?: string; style?: string };
};

export default function Split({ eyebrow, heading, body, image, image_side = "right", cta }: Props) {
  const src = image?.image?.url;
  const side = image_side?.toLowerCase() === "left" ? "left" : "right";
  const paragraphs = body?.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean) ?? [];
  const style = (cta?.style ?? cta?.style_variant ?? "primary").toLowerCase();

  return (
    <section className={`section split split--${side}`} id={slugify(heading)}>
      <div className={`container split__inner${src ? "" : " split__inner--text"}`}>
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          {heading && <h2>{heading}</h2>}
          {paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="split__body">
              {paragraph}
            </p>
          ))}
          {cta?.label && cta.url?.href && (
            <a className={`btn btn--${style}`} href={withBase(cta.url.href)}>
              {cta.label}
            </a>
          )}
        </div>
        {src && <img src={src} alt={image?.alt ?? ""} className="split__img" />}
      </div>
    </section>
  );
}
