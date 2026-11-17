import { Suspense } from "react";
import { SharingQrKitView } from "@/features/listing-wizard/views/sharing-qr-kit.view";

async function ShareListingKitContent({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SharingQrKitView listingId={id} />;
}

export default function ShareListingKitPage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <ShareListingKitContent params={params} />
    </Suspense>
  );
}
