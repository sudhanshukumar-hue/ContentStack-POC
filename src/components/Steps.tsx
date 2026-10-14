import { slugify } from "@/lib/slug";

type Step = { title?: string; description?: string };
type Props = { heading?: string; intro?: string; items?: Step[] };

export default function Steps({ heading, intro, items = [] }: Props) {
  return (
    <section className="section section--muted" id={slugify(heading)}>
      <div className="container">
        {heading && <h2 className="section__title">{heading}</h2>}
        {intro && <p className="section__lead">{intro}</p>}
        <ol className="steps">
          {items.map((item, index) => (
            <li key={item.title ?? index} id={slugify(item.title)}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {item.title && <h3>{item.title}</h3>}
              {item.description && <p>{item.description}</p>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
