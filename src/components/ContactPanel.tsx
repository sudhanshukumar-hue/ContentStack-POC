import { slugify } from "@/lib/slug";

type Detail = { label?: string; value?: string };
type Props = { heading?: string; intro?: string; details?: Detail[] };

export default function ContactPanel({ heading, intro, details = [] }: Props) {
  return (
    <section className="section" id={slugify(heading) ?? "contact"}>
      <div className="container contact">
        <div>
          {heading && <h2>{heading}</h2>}
          {intro && <p className="split__body">{intro}</p>}
        </div>
        {!!details.length && (
          <dl className="contact__list">
            {details.map((detail) => (
              <div key={detail.label}>
                <dt>{detail.label}</dt>
                <dd>{detail.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
