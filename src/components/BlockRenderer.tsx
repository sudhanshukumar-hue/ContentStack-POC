import Hero from "./Hero";
import FeatureGrid from "./FeatureGrid";
import Testimonials from "./Testimonials";
import CtaBanner from "./CtaBanner";

const registry: Record<string, React.ComponentType<any>> = {
  hero: Hero,
  feature_grid: FeatureGrid,
  testimonials: Testimonials,
  cta_banner: CtaBanner,
};

export default function BlockRenderer({ blocks = [] }: { blocks: any[] }) {
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