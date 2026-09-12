# Lovable production verification — September 12, 2026

Status: Published by Andrew; not end-to-end launch verified.

## Sources
- Website source: andrewpcherry/trg-demo, commit 1191a9d5c258ed34b486d939521c2c17123f9450.
- Lovable project: fa662d97-0468-45de-be98-2fce2ca554e2.
- Verified imported Lovable revision: c70d0fcc607e25698a5bf7794cbd1cb61477f06d.
- Production: https://go.txroofguardians.com/
- Main-domain DNS was not changed.

## Verified
- Production homepage returns HTTP 200 and contains the integrated website.
- Homepage assessment CTA opens /roof-assessment.html.
- Live storm branch reaches the lead form with the selected qualification answers.
- Service and marketing SMS checkboxes are separate, unchecked and not required.
- Privacy, terms and SMS terms are public at clean and .html paths.
- Privacy includes the mobile-information non-sharing clause; policies identify Texas Roof Guardians and Dustin's business email.
- 45 requested production URLs checked: 44 HTTP 200; one HTTP 404 listed below.
- All 15 project pages from the source sitemap return HTTP 200.
- Source comparison covers 35 HTML/project source pages. Existing titles, H1s, canonical tags, verification token and structured data were retained where the original route exists. Two descriptions replace 24/7 wording with after-hours wording.
- Sitemap and robots content preserved apart from trailing whitespace. Main-domain canonical URLs remain the SEO authority.
- Existing GHL intake adapter preserved apart from trailing whitespace.
- Legacy agreement URL works; roof guide returns an actual PDF.

## Corrections prepared
1. /commercial/guardian-commercial-care returns HTTP 404 despite remaining in the sitemap. The imported page exists at /guardian-care and has the original canonical URL. Add the original clean and .html routes to the existing handler.
2. Imported shared/footer contact hours say Monday–Saturday. Andrew confirmed 8am–6pm, while the inspection calendar uses weekdays. Remove the unconfirmed day range from website hours; retain 8am–6pm Central.

The adjacent fix-lovable-import.py applies these exact changes to the existing Lovable runtime without redesigning pages or changing the main-domain DNS.

## GHL / A2P state
- Business identity and IRS address checked against the supplied letter; sensitive tax ID intentionally excluded from this report.
- Dustin's business email and mobile entered as registration contact.
- Manual website-form registration selected; no false widget-only attestation made.
- Low Volume Mixed selected; UI shows $22.50 one-time and $10 monthly.
- Roofing-specific use case and separate marketing/service samples entered.
- After publication, GHL still displays Invalid website for https://go.txroofguardians.com and disables Continue. No brand or campaign submission completed.
- The cause of GHL's website rejection is not established. Do not claim DNS failure solely from this UI message.
- The public website loading successfully does not prove carrier approval.

## Still unverified
- Actual website submission creating/updating the right GHL contact and independent consent fields.
- Pipeline, notifications, booking, follow-up suppression, delivery, STOP/HELP and missed-call handling.
- Sending number assignment and A2P approval.
- ChatGPT Ads pixel/conversion setup; no verified pixel configuration was present in imported source.
- Ongoing GitHub synchronization. Lovable explicitly reported a pinned import only; source and correction artifacts in GitHub are not proof of automatic synchronization.
- No voice AI was introduced.

Do not mark the full implementation complete until these remaining items have recorded live evidence.
