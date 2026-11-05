import type { Metadata } from "next";
import { Suspense } from "react";
import { DuskBanner } from "@/components/ui";
import { BookingLoader, BookingSkeleton } from "@/features/booking";

export const metadata: Metadata = {
  title: "Book a prayer session",
  description:
    "Choose a free time for a quiet, one-on-one prayer session with our prayer team. See every upcoming session day and book in a minute.",
  alternates: { canonical: "/book" },
  openGraph: { url: "/book", title: "Book a prayer session · Healing Prayer North-West" },
};

export default function BookPage({ searchParams }: PageProps<"/book">) {
  return (
    <>
      <DuskBanner
        eyebrow="Book prayer"
        title="Choose a time to be prayed with"
        verse={{
          text: "The effectual fervent prayer of a righteous man availeth much.",
          reference: "James 5:16",
        }}
      />
      <Suspense fallback={<BookingSkeleton />}>
        <BookingLoader area="public" searchParams={searchParams} />
      </Suspense>
    </>
  );
}
