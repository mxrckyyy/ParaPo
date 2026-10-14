import { ReportForm } from "@/components/reports/ReportForm";
import { DemoNotice } from "@/components/ui/DemoNotice";

export const metadata = { title: "Submit a report — PARA PO" };

export default function ReportPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Report an issue</h1>
        <p className="text-sm text-asphalt-muted">
          Preview of the community reporting form. Real submissions with location
          and moderation launch in Phase 3.
        </p>
      </div>
      <DemoNotice />
      <ReportForm />
    </div>
  );
}
