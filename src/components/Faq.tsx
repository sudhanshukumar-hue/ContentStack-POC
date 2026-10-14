import { slugify } from "@/lib/slug";

type Item = { question?: string; answer?: string };
type Props = { heading?: string; intro?: string; items?: Item[] };

export default function Faq({ heading, intro, items = [] }: Props) {
  return (
    <section className="section" id={slugify(heading)}>
      <div className="container faq">
        {heading && <h2 className="section__title">{heading}</h2>}
        {intro && <p className="section__lead">{intro}</p>}
        <div className="faq__list">
          {items.map((item) => (
            <details key={item.question} className="faq__item">
              <summary>{item.question}</summary>
              {item.answer && <p>{item.answer}</p>}
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
