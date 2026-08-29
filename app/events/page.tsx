import { EventListPage } from "@/features/events/components/event-list-page";

export const dynamic = "force-dynamic";

type EventsPageProps = {
  searchParams: Promise<{
    notice?: string | string[];
  }>;
};

const validNotices = ["created", "updated", "deleted"] as const;

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const { notice } = await searchParams;
  const normalizedNotice =
    typeof notice === "string" &&
    validNotices.includes(notice as (typeof validNotices)[number])
      ? (notice as (typeof validNotices)[number])
      : undefined;

  return <EventListPage notice={normalizedNotice} />;
}
