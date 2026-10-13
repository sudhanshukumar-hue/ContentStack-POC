type Avatar = { url?: string; alt?: string; image?: { url?: string } | null };
type Testimonial = {
    uid: string;
    quote: string;
    author_name: string;
    role?: string;
    avatar?: Avatar | null;
};
type Props = { heading?: string; testimonials?: Testimonial[]; reference?: Testimonial[] };

function avatarUrl(avatar?: Avatar | null) {
    if (!avatar) return undefined;
    if (avatar.url) return avatar.url;
    if (avatar.image && typeof avatar.image === "object") return avatar.image.url;
    return undefined;
}

export default function Testimonials({ heading, testimonials, reference }: Props) {
    const items = testimonials?.length ? testimonials : reference ?? [];
    return (
        <section className="section section--muted">
            <div className="container">
                {heading && <h2 className="section__title">{heading}</h2>}
                <div className="grid grid--3">
                    {items.map((t) => {
                        const src = avatarUrl(t.avatar);
                        return (
                            <figure key={t.uid} className="card">
                                <blockquote>{t.quote}</blockquote>
                                <figcaption className="author">
                                    {src && <img src={src} alt={t.avatar?.alt ?? ""} className="author__img" />}
                                    <div>
                                        <strong>{t.author_name}</strong>
                                        {t.role && <span>{t.role}</span>}
                                    </div>
                                </figcaption>
                            </figure>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}