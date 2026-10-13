// app/page.tsx
import { Suspense } from "react";
import { getHomePage } from "@/lib/contentstack";
import BlockRenderer from "@/src/components/BlockRenderer";

async function HomeContent() {
  const entry = await getHomePage();
  return <BlockRenderer blocks={entry?.sections} />;
}

export default function Home() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <HomeContent />
    </Suspense>
  );
}