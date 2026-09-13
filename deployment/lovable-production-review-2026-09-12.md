# Public website verification — September 12, 2026

Production website: https://go.txroofguardians.com/

## Completed correction

- Restored /commercial/guardian-commercial-care and /commercial/guardian-commercial-care.html.
- Both URLs return HTTP 200 and preserve the canonical https://txroofguardians.com/commercial/guardian-commercial-care.
- Contact page and shared footer hours show 8am–6pm Central, with the unconfirmed Monday–Saturday range removed.
- The targeted correction changed only the existing route handler and the hours text in the existing contact page, shared script and generated page content.
- The source correction script is deployment/fix-lovable-import.py in this branch.

## Public verification

- Integrated homepage returns HTTP 200.
- Homepage assessment link opens /roof-assessment.html.
- Storm assessment path reaches its enquiry form with selected answers displayed.
- Service and marketing SMS choices are separate, optional and unchecked.
- The original audit checked 45 public URLs: 44 succeeded and the commercial-care route failed. The correction resolves that one failure; its clean and .html routes were verified after publication.
- All 15 project pages from the source sitemap return HTTP 200.
- Existing page titles, H1s, canonical tags, verification token and structured data were retained where the imported original route existed. Two descriptions replace 24/7 wording with after-hours wording.
- Sitemap and robots content preserved apart from trailing whitespace; main-domain canonical URLs remain in place.
- The existing intake JavaScript was preserved apart from trailing whitespace.
- Legacy agreement page and roof guide PDF are available.

## Public policy page checks after correction

| URL | HTTP result | Page title |
| --- | --- | --- |
| https://go.txroofguardians.com/contact.html | 200, no redirect | Schedule Inspection or Claim Review — Texas Roof Guardians |
| https://go.txroofguardians.com/privacy.html | 200, no redirect | Privacy Policy — Texas Roof Guardians |
| https://go.txroofguardians.com/terms.html | 200, no redirect | Terms & Conditions — Texas Roof Guardians |

These checks establish public website availability and the specific corrections above. They do not establish successful CRM delivery, appointment creation, messaging approval or end-to-end operational readiness.
