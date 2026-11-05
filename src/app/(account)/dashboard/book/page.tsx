import type { Metadata } from "next";
import { Suspense } from "react";
import { Eyebrow, Verse } from "@/components/ui";
import { BookingLoader, BookingSkeleton } from "@/features/booking";

export const metadata: Metadata = { title: "Book a prayer session" };

/** The booking flow inside the account sidebar, for logged-in members (UI.md section 6.3). */
export default function DashboardBookPage({ searchParams }: PageProps<"/dashboard/book">) {
  return (
    <>
      <div className="mx-auto flex max-w-content flex-col gap-1.5 pt-6 gutter md:gap-2 md:pt-10 lg:pt-12">
        <Eyebrow>Book prayer</Eyebrow>
        <h1 className="text-h1 text-plum">Book a prayer session</h1>
        <Verse reference="James 5:16" className="mt-1 max-w-[46ch] [&_blockquote]:text-muted">
          The effectual fervent prayer of a righteous man availeth much.
        </Verse>
      </div>
      <Suspense fallback={<BookingSkeleton />}>
        <BookingLoader area="account" searchParams={searchParams} />
      </Suspense>
    </>
  );
}
