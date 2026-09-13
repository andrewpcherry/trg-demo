# Texas Roof Guardians measurement setup — September 13, 2026

Status: code prepared; OpenAI measurement is disabled pending the actual Pixel ID. No production Pixel delivery, GHL contact, pipeline, notification or booking success is asserted.

## Source and deployment

The public website runs as static HTML inside the existing Lovable TanStack Start project `fa662d97-0468-45de-be98-2fce2ca554e2`. This patch uses published commit `526f42e35f2f5b574fbc8235764c05bff0d5c7c7` for the current shared script and privacy policy. GitHub stores static files at the root; Lovable stores them under `public/` and serves clean routes from a generated `src/lib/static-pages.ts` map. Refresh that map when changing HTML. Preserve the live commercial-care route and all current SEO canonicals, titles, descriptions, structured data, sitemap and main-domain DNS. This is a focused measurement patch, not a full reconciliation of the older GitHub and Lovable trees or the previous A2P PR.

`assets/site.js` loads `assets/measurement.js` for marketing pages. The standalone assessment loads it directly before intake. The helper guards duplicate loads. The form integration in `assets/intake.js` includes session first/last campaign context in the existing enquiry message. This does not establish native GHL custom-field mapping; check the received contact/enquiry after access is restored.

## Measurement mode and activation

Browser Pixel only. Set `OPENAI_ADS_PIXEL_ID` in `assets/measurement.js` to the actual Pixel ID created in this business's Ads Manager Conversions tab. It is public configuration, not an API key. The connected account currently exposes no conversion source; available connector actions do not create one. Do not use the ad account ID or GHL tracking ID as the Pixel ID.

Before activation, confirm automatic advanced matching is disabled in the Pixel configuration. The implementation deliberately does not pass a `user` object or any raw or hashed contact details. This preserves the site's mobile-information restrictions. No CAPI path, key, environment variable, server source URL or server attribution transport is added.

When configured, a separate optional advertising choice appears. The SDK is not requested before opt-in. It receives `consent(false)` before initialization and `consent(true)` only for a grant. Decline/withdrawal and browser GPC or Do Not Track block future events. Clearing the saved preference in another tab also withdraws consent in open tabs. Events use `opt_out: true` for future user-level personalization. SMS choices are independent. The helper does not manually parse or forward `oppref`; SDK attribution remains SDK-managed. Advertising links and page paths must never contain personal information.

First/last campaign labels are limited to utm_source, utm_medium, utm_campaign, utm_content and utm_id, restricted to short campaign-label characters, with long digit strings rejected. Campaign context survives same-origin navigation in session storage, expiring after 30 minutes without a page load. Unknown query parameters, fragments, form answers and contact details are not included in that stored context. Cross-domain attribution is not implemented. Blocked storage preserves current-page attribution in memory; optional measurement failures do not block enquiries.

## Event boundaries

| Event | Implemented boundary | Limit |
| --- | --- | --- |
| page_viewed | One page event after advertising consent | Disabled until real Pixel ID; SDK receipt unverified |
| lead_created | Matching GHL external-form submission returns HTTP success and JSON status `ok` | Means acknowledged enquiry submission; does not prove contact persistence, qualification or notification delivery |
| appointment_scheduled | Deferred | No verified booking-success callback or appointment record |

Each submitted enquiry has a random UUID unrelated to contact details. Repeated acknowledgements with the same ID are suppressed. The existing intake session guard prevents accidental repeat submissions. There is no browser/server duplication because CAPI is not present. Button clicks, validation failures, timeouts and non-success responses do not fire lead conversions. Events blocked before consent are not replayed later.

Other supported events are intentionally skipped: contents_viewed has no separately defined content conversion; cart, checkout, order, registration, subscription and trial events do not apply to this roofing enquiry flow; native app events do not apply. Legacy service-agreement or advertising walkthrough pages are not acquisition pages and are not newly instrumented.

## Verification and remaining gates

Run `node --test tests/measurement.test.cjs` and `git diff --check`. Tests cover attribution across navigation, first/last attribution, expiry, URL filtering, empty configuration, consent, withdrawal, duplicate events, GPC/Do Not Track, blocked storage and SDK failure. These are local simulated-browser checks, not live event delivery.

Before ads launch:

1. Create the account Pixel source, confirm automatic advanced matching is off, configure the real ID, and verify page/lead events in Ads Manager.
2. Restore HighLevel connector authorization. Current request fails with HTTP 401, authClass not allowed for scope. Verify one controlled lead through contact, consent, pipeline and owner notifications, then verify calendar availability and a booking record.
3. Verify SMS gates for all consent combinations, STOP suppression, email delivery and missed calls. Voice AI remains out of scope because the owners declined it.
4. Resolve exact service-area targeting with supported geo records; do not substitute all Texas or broad DMA coverage for the website's service areas without approval. ChatGPT budget is $75/day as instructed. Campaign not launched.
5. Recheck the GHL A2P form and genuine form-based opt-in URLs. Registration submission and carrier approval remain separate gates; a reachable website does not guarantee approval.

Before deployment/activation, review the implementation against the business's privacy, security, consent and data-handling requirements. This patch does not certify legal compliance or carrier approval.

Sources: https://developers.openai.com/ads/measurement-pixel and https://developers.openai.com/ads/supported-events (checked September 13, 2026).
