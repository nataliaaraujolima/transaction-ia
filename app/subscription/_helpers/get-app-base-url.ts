export function getAppBaseUrl() {
  const baseUrl =
    process.env.NODE_ENV === "development"
      ? process.env.APP_URL_LOCALHOST
      : process.env.APP_URL_PRODUCTION;

  if (!baseUrl) {
    throw new Error("App URL is not set");
  }

  return baseUrl.replace(/\/$/, "");
}

export function getSubscriptionUrl() {
  return `${getAppBaseUrl()}/subscription`;
}

export function getSubscriptionBillingReturnUrl() {
  return `${getSubscriptionUrl()}?billing=returned`;
}
