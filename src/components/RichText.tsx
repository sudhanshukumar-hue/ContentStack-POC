import { slugify } from "@/lib/slug";

type Props = { heading?: string; body?: string };

export default function RichText({ heading, body }: Props) {
  const paragraphs = body?.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean) ?? [];
  return (
    <section className="section" id={slugify(heading)}>
      <div className="container prose">
        {heading && <h2>{heading}</h2>}
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}
