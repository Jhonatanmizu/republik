import { HousingDetailView } from "@/features/housing/views/housing-detail.view";

export default async function HousingDetailPage({
  params,
}: {
  readonly params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <HousingDetailView idOrSlug={slug} />;
}
