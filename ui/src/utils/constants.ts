export const appName = "snipchat";

export const resourceName =
  typeof window !== "undefined" && typeof window.GetParentResourceName === "function"
    ? window.GetParentResourceName()
    : "lb-phone";

export const isBrowserDev = !window.GetParentResourceName;
