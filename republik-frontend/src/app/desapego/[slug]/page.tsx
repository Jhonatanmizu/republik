import { Suspense } from "react";
import { MarketplaceDetailView } from "@/features/marketplace/views/marketplace-detail.view";

async function MarketplaceDetailContent({
  params,
}: {
  readonly params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <MarketplaceDetailView idOrSlug={slug} />;
}

export default function MarketplaceDetailPage({
  params,
}: {
  readonly params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <MarketplaceDetailContent params={params} />
    </Suspense>
  );
}
