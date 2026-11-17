import { Suspense } from "react";
import { QuickEditListingView } from "@/features/listing-wizard/views/quick-edit-listing.view";

async function QuickEditListingContent({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <QuickEditListingView listingId={id} />;
}

export default function QuickEditListingPage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <QuickEditListingContent params={params} />
    </Suspense>
  );
}
