"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";

export function LogoutButton() {
  const [pending, setPending] = useState(false);
  return (
    <Button
      variant="secondary"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await signOut();
      }}
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      {pending ? "Logging out…" : "Log out"}
    </Button>
  );
}
