import { withBase } from "@/lib/paths";
import { slugify } from "@/lib/slug";

type Tier = {
  name?: string;
  price?: string;
  cadence?: string;
  description?: string;
  featured?: boolean;
  features?: string[];
  cta?: { label?: string; url?: { href?: string }; style_variant?: string };
};

type Props = { heading?: string; intro?: string; tiers?: Tier[] };

export default function Pricing({ heading, intro, tiers = [] }: Props) {
  return (
    <section className="section" id={slugify(heading) ?? "plans"}>
      <div className="container">
        {heading && <h2 className="section__title">{heading}</h2>}
        {intro && <p className="section__lead">{intro}</p>}
        <div className="pricing__grid">
          {tiers.map((tier) => {
            const href = tier.cta?.url?.href;
            return (
              <article
                key={tier.name}
                id={slugify(tier.name)}
                className={`price${tier.featured ? " price--featured" : ""}`}
              >
                {tier.featured && <p className="price__badge">Most chosen</p>}
                {tier.name && <h3>{tier.name}</h3>}
                {tier.price && (
                  <p className="price__amount">
                    <strong>{tier.price}</strong>
                    {tier.cadence && <span>{tier.cadence}</span>}
                  </p>
                )}
                {tier.description && <p>{tier.description}</p>}
                {!!tier.features?.length && (
                  <ul>
                    {tier.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                )}
                {tier.cta?.label && href && (
                  <a className="btn btn--primary" href={withBase(href)}>
                    {tier.cta.label}
                  </a>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
