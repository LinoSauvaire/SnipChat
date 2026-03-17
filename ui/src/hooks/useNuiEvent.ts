import { useEffect } from "react";
import type { NUIMessage } from "../types";
import { appName } from "../utils/constants";

export function useNuiEvent<TPayload>(
  action: string,
  handler: (payload: TPayload | undefined) => void
): void {
  useEffect(() => {
    const listener = (event: MessageEvent<NUIMessage<TPayload>>) => {
      const data = event.data;
      if (!data || data.app !== appName || data.action !== action) return;
      handler(data.payload);
    };

    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, [action, handler]);
}
