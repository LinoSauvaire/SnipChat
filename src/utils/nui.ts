import { appName, resourceName } from "./constants";
import type { NUIMessage } from "../types";

export async function postToLua<TPayload extends Record<string, unknown>>(
  action: string,
  payload?: TPayload
): Promise<void> {
  const message: NUIMessage<TPayload> = {
    app: appName,
    action,
    payload
  };

  if (!window.GetParentResourceName) {
    console.info("[NUI:DEV]", message);
    return;
  }

  await fetch(`https://${resourceName}/${action}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(message)
  });
}
