import { Suspense } from "react";
import { HousingDetailView } from "@/features/housing/views/housing-detail.view";

async function HousingDetailContent({
  params,
}: {
  readonly params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <HousingDetailView idOrSlug={slug} />;
}

export default function HousingDetailPage({
  params,
}: {
  readonly params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <HousingDetailContent params={params} />
    </Suspense>
  );
}
