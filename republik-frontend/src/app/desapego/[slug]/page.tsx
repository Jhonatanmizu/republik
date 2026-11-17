import { MarketplaceDetailView } from "@/features/marketplace/views/marketplace-detail.view";

export default async function MarketplaceDetailPage({
  params,
}: {
  readonly params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <MarketplaceDetailView idOrSlug={slug} />;
}
