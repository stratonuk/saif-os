"use client";

import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";

type ActionResult = { error?: unknown; success?: boolean } | void;

export function useRefreshAction() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const run = useCallback(
    async (action: () => Promise<ActionResult>): Promise<ActionResult> => {
      const result = await action();
      if (result && "error" in result && result.error) return result;
      startTransition(() => router.refresh());
      return result;
    },
    [router]
  );

  return { run, isPending };
}
