import Link from "next/link";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export const metadata = { title: "Offline — PARA PO" };

/** Served by the service worker when navigations fail with no cached page. */
export default function OfflinePage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 py-10">
      <Card className="flex flex-col items-center gap-3 py-10 text-center">
        <WifiOff className="h-8 w-8 text-asphalt-muted" aria-hidden="true" />
        <h1 className="text-lg font-bold text-asphalt">You&apos;re offline</h1>
        <p className="text-sm text-asphalt-muted">
          PARA PO needs a connection for fresh transport data. Cached map tiles
          still work — reconnect and try again.
        </p>
        <Link href="/">
          <Button>Retry home</Button>
        </Link>
      </Card>
    </div>
  );
}
