import { SharingQrKitView } from "@/features/listing-wizard/views/sharing-qr-kit.view";

export default async function ShareListingKitPage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SharingQrKitView listingId={id} />;
}
