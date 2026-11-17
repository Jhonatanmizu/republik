import { QuickEditListingView } from "@/features/listing-wizard/views/quick-edit-listing.view";

export default async function QuickEditListingPage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <QuickEditListingView listingId={id} />;
}
