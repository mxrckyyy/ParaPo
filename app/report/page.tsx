import Link from "next/link";
import { ReportForm } from "@/components/reports/ReportForm";
import { LoginWall } from "@/components/ui/LoginWall";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Submit a report — PARA PO" };

export default async function ReportPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="py-6">
        <LoginWall
          title="Report an issue"
          message="Log in to submit community reports. Every report starts pending and unverified until moderated."
        />
      </div>
    );
  }
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Report an issue</h1>
        <p className="text-sm text-asphalt-muted">
          Visible to the community after moderation. Please report what you actually observe — false reports harm fellow commuters.
        </p>
      </div>
      <ReportForm />
      <p className="text-xs text-asphalt-muted">
        <Link href="/reports" className="font-semibold text-primary-dark hover:underline">
          View the community reports board →
        </Link>{" "}
        Confirm what you observe, or flag inaccurate reports.
      </p>
    </div>
  );
}
