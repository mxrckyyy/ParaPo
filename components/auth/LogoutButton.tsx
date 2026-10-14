"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return (
    <Button
      variant="secondary"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        try {
          // signOut returns its destination (never server-redirects — BUG-03).
          const result = await signOut();
          router.push(result?.redirectTo ?? "/login");
          router.refresh();
        } finally {
          setPending(false);
        }
      }}
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      {pending ? "Logging out…" : "Log out"}
    </Button>
  );
}
