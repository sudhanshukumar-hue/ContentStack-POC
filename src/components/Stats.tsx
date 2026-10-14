import { slugify } from "@/lib/slug";

type Stat = { value?: string; label?: string };
type Props = { heading?: string; items?: Stat[] };

export default function Stats({ heading, items = [] }: Props) {
  return (
    <section className="stats" id={slugify(heading)}>
      <div className="container">
        {heading && <h2 className="stats__title">{heading}</h2>}
        <div className="stats__grid">
          {items.map((item) => (
            <p key={`${item.value}-${item.label}`} className="stat">
              <strong>{item.value}</strong>
              {item.label && <span>{item.label}</span>}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
