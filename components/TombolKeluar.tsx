"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

/** Sign out. Interim, same as FormLogin — see the note there. */
export default function TombolKeluar() {
  const router = useRouter();
  const [keluar, setKeluar] = useState(false);

  return (
    <button
      type="button"
      disabled={keluar}
      onClick={async () => {
        setKeluar(true);
        await createClient().auth.signOut();
        router.push("/login");
        router.refresh();
      }}
      className="text-meta text-text-muted transition-colors duration-120 ease-signal hover:text-text disabled:text-border-strong"
    >
      Keluar
    </button>
  );
}
