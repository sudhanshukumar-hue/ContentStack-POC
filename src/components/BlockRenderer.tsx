import ContactPanel from "./ContactPanel";
import CtaBanner from "./CtaBanner";
import Faq from "./Faq";
import FeatureGrid from "./FeatureGrid";
import Hero from "./Hero";
import Pricing from "./Pricing";
import RichText from "./RichText";
import Split from "./Split";
import Stats from "./Stats";
import Steps from "./Steps";
import Testimonials from "./Testimonials";

const registry: Record<string, React.ComponentType<any>> = {
  hero: Hero,
  feature_grid: FeatureGrid,
  testimonials: Testimonials,
  cta_banner: CtaBanner,
  stats: Stats,
  faq: Faq,
  rich_text: RichText,
  pricing: Pricing,
  split: Split,
  steps: Steps,
  contact: ContactPanel,
};

export default function BlockRenderer({ blocks = [] }: { blocks?: any[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        const key = Object.keys(block).find((k) => registry[k]);
        if (!key) return null;
        const Component = registry[key];
        return <Component key={i} {...block[key]} />;
      })}
    </>
  );
}