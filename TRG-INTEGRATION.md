# Texas Roof Guardians — website intake to GoHighLevel

Native external-form capture. No private API credentials are ever published; only the
client's public external-tracking ID is present in frontend code.

## Scope

Texas Roof Guardians is a roofing contractor. This connects the public website
(`andrewpcherry.github.io/trg-demo`) callback form and the 60-Second Roof Assessment to
the TRG GoHighLevel subaccount. There is **no REsimpli integration** and no investor /
seller qualification — that is a different client.

## Architecture

- **Public tracking ID** `tk_8f9dd5ab75ff4670812bf6dbb83cfb59` (from TRG's public
  external-tracking snippet), SDK `https://link.msgsndr.com/js/external-tracking.js`.
- `assets/intake.js` is a native-capture adapter loaded by `contact.html` and injected
  into the assessment child document by `roof-assessment.html`.
- Delivery succeeds only on the vendor's transport acknowledgment: HTTP 200 with body
  `{"status":"ok"}` posted to `https://backend.leadconnectorhq.com/external-tracking/events`.
  A submitted request or SDK completion alone is **not** delivery. Unacknowledged
  transport shows "could not confirm", not a success page.
- The assessment (`roof-assessment.html`) wraps the separately hosted
  `https://andrewpcherry.github.io/trg-funnel/` in an iframe and injects the adapter into
  that child document. **Direct entry to `trg-funnel/` is a staging URL and is not
  connected** — it retains its original demo-only submit stub. Users reach the assessment
  through `trg-demo/roof-assessment.html`, which is the only linked entry point.

## Consent model

Service SMS and marketing SMS are **separate and optional, unchecked by default**. A valid
enquiry submits with neither checked. Consent states are recorded explicitly
(`Yes` / `No`) and timestamped; they are never inferred from a successful submission.
Messaging workflows must be gated on the recorded choice, not on enquiry submission.

## Field mapping (native `name` → GHL contact)

| Native field | GHL target |
|---|---|
| `name` | contact name |
| `phone` | contact phone |
| `email` (assessment only) | contact email |
| `address` (label "Street Address") | `address1` |
| `zip` (assessment only) | address postal code |
| `message` | custom field "Message" (full qualification trail + consent + attribution) |
| `roofing_enquiry_type` | "Roofing Enquiry Type" |
| `website_entry_point` | "Website Entry Point" |
| `service_sms_consent` | "Service SMS Consent" (`Yes`/`No`) |
| `marketing_sms_consent` | "Marketing SMS Consent" (`Yes`/`No`) |
| `consent_captured_at` | "Consent Captured At" (ISO timestamp) |

The custom fields are contact `TEXT` fields created and GET-verified under location
`5g5cwey4ORdiSlQFcgY9`. `name` attributes match the auto-generated `contact.*` field keys
(snake_case), and labels match the field display names.

## Behavior guarantees

- Immutable validated snapshot frozen during delivery; checkboxes are disabled (readonly
  does not freeze them) and free-text controls set readonly.
- Late SDK load after a pre-dispatch timeout cannot start a new submission.
- Single durable duplicate guard (hash of the canonical enquiry in sessionStorage); reload
  does not resend.
- Invalid phone or ZIP and unchecked-but-required validation emit no lead event.
- Assessment "Back"/"Start over" navigation is disabled while a submission is pending.
- If the adapter cannot load, `roof-assessment.html` fails closed: hides the assessment
  iframe and shows a direct contact handoff (call or `contact.html`).

## Tests

`tests/test_intake.py` — 9 Playwright regression tests run against an isolated Chrome with
the vendor SDK and transport **intercepted** (mocked responses are tests, not delivery
evidence). They cover phone-only optional consent, snapshot immutability, blocked SDK,
unacknowledged transport, all five assessment branches, reload dedupe, invalid input, and
the fail-closed fallback.

Deployed acceptance requires a real isolated-browser submission against the live GitHub
Pages site followed by an authenticated GHL contact read-back.
