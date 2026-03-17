import type { NUIMessage, NUIResponse } from "../types";
import { appName, resourceName } from "./constants";

export async function sendToLua<TPayload extends Record<string, unknown>>(
  action: string,
  payload?: TPayload
): Promise<NUIResponse> {
  const message: NUIMessage<TPayload> = {
    app: appName,
    action,
    payload
  };

  if (!window.GetParentResourceName) {
    console.info("[NUI DEV]", message);
    return { ok: true, data: null };
  }

  const response = await fetch(`https://${resourceName}/${action}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(message)
  });

  const json = (await response.json()) as NUIResponse;
  return json;
}
