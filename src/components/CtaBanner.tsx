import { withBase } from "@/lib/paths";

type Props = {
    heading: string;
    text?: string;
    cta?: { label: string; url?: { href: string }; style?: string; style_variant?: string };
    background?: "brand" | "neutral" | "gradient";
};

export default function CtaBanner({ heading, text, cta, background = "brand" }: Props) {
    return (
        <section className={`cta cta--${background.toLowerCase()}`}>
            <div className="container cta__inner">
                <h2>{heading}</h2>
                {text && <p>{text}</p>}
                {cta?.url?.href && (
                    <a href={withBase(cta.url.href)} className={`btn btn--${(cta.style ?? cta.style_variant ?? "primary").toLowerCase()}`}>
                        {cta.label}
                    </a>
                )}
            </div>
        </section>
    );
}