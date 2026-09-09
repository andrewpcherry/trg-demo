"""Isolated Chrome regression: intercepted vendor responses are TESTS, not delivery evidence."""
import json, os, threading, unittest
from urllib.parse import urlparse
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = Path('/root/projects/executive-assistant/runs/2026-09-07/trg-implementation')
SDK = (EVIDENCE / 'external-tracking.js').read_text()
FUNNEL = (EVIDENCE.parent / 'trg-setup/live-funnel-index.html').read_text()
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args): pass

class Intake(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT.parent)))
        threading.Thread(target=cls.server.serve_forever, daemon=True).start()
        cls.base = f'http://127.0.0.1:{cls.server.server_port}/trg-demo/'
        cls.pw = sync_playwright().start()
        cls.browser = cls.pw.chromium.launch(executable_path='/usr/local/bin/google-chrome', headless=True, args=['--no-sandbox'])
    @classmethod
    def tearDownClass(cls):
        cls.browser.close(); cls.pw.stop(); cls.server.shutdown(); cls.server.server_close()
    def setUp(self):
        self.context = self.browser.new_context()
        self.events=[]
        self.mode='ok'
        def route(r):
            u=r.request.url
            if urlparse(u).path.endswith('/trg-funnel/'):
                return r.fulfill(status=200, content_type='text/html', body=FUNNEL)
            if 'external-tracking.js' in u:
                if self.mode=='blocked': return r.abort()
                return r.fulfill(status=200, content_type='application/javascript', body=SDK)
            if '/external-tracking/events' in u:
                data=r.request.post_data_json
                if data.get('type')=='external_form_submission':
                    self.events.append(data)
                    if self.mode=='http': return r.fulfill(status=503, body='unavailable')
                    if self.mode=='app': return r.fulfill(status=200, content_type='application/json', body='{"status":"error"}')
                    if self.mode=='unknown': return r.fulfill(status=200, content_type='application/json', body='{}')
                return r.fulfill(status=200, content_type='application/json', body='{"status":"ok"}')
            if u.startswith(self.base.split('/trg-demo/')[0]): return r.continue_()
            return r.abort()
        self.context.route('**/*', route)
        self.page=self.context.new_page()
    def tearDown(self): self.context.close()
    def callback(self):
        self.page.goto(self.base+'contact.html?utm_source=qa&utm_campaign=roof')
        f=self.page.locator('#callbackForm')
        f.locator('[name=name]').fill('TRG QA Local')
        f.locator('[name=phone]').fill('2025550101')
        f.locator('[name=address]').fill('123 Synthetic Roof Lane')
        return f
    def wait_state(self,f,state):
        from playwright.sync_api import expect
        expect(f).to_have_attribute('data-delivery-state',state,timeout=20000)
    def test_callback_phone_only_optional_consent_is_acknowledged(self):
        f=self.callback()
        f.locator('button').click()
        self.wait_state(f,'confirmed')
        self.assertEqual(len(self.events),1)
        d=self.events[0]
        self.assertEqual(d['trackingId'],'tk_8f9dd5ab75ff4670812bf6dbb83cfb59')
        self.assertEqual(d['formData']['address'],'123 Synthetic Roof Lane')
        m=d['formData']['message']
        self.assertIn('Service SMS consent: false',m)
        self.assertIn('Marketing SMS consent: false',m)
        self.assertIn('Schedule a free inspection',m)
        self.assertIn('utm_source=qa',m)
        self.assertNotIn('booked',f.inner_text().lower())
        (EVIDENCE/'mock-callback-payload.json').write_text(json.dumps(d,indent=2))

    def test_pending_snapshot_is_immutable_and_double_submit_is_suppressed(self):
        f=self.callback()
        f.locator('[name=sms_marketing_consent]').check()
        f.locator('button').evaluate('(b)=>{b.click();b.click()}')
        self.assertTrue(f.locator('[name=sms_marketing_consent]').is_disabled())
        self.assertTrue(f.locator('[name=phone]').get_attribute('readonly') is not None)
        self.wait_state(f,'confirmed')
        self.assertEqual(len(self.events),1)
        d=self.events[0]['formData']
        self.assertEqual(d['service_sms_consent'],'No')
        self.assertEqual(d['marketing_sms_consent'],'Yes')
        self.assertEqual(d['website_entry_point'],'Website callback')
        self.assertEqual(d['roofing_enquiry_type'],'Schedule a free inspection')
        self.assertRegex(d['consent_captured_at'],r'^\d{4}-\d{2}-\d{2}T')
        self.assertIn('Disclosure version: trg-sms-2026-09-07',d['message'])

    def test_blocked_sdk_is_not_sent_and_retryable(self):
        self.mode='blocked'
        f=self.callback(); f.locator('button').click()
        self.wait_state(f,'not-sent')
        self.assertEqual(self.events,[])
        self.assertFalse(f.locator('[name=sms_service_consent]').is_disabled())
        self.assertIn('not sent',f.inner_text().lower())

    def test_unacknowledged_transport_stays_uncertain(self):
        for mode in ['http','app','unknown']:
            with self.subTest(mode=mode):
                self.mode=mode
                self.page.evaluate('sessionStorage.clear()') if self.page.url.startswith('http') else None
                f=self.callback(); f.locator('button').click()
                self.wait_state(f,'uncertain')
                self.assertTrue(f.locator('button').is_disabled())
                self.assertIn('could not confirm',f.inner_text().lower())

    def assessment(self, branch):
        self.page.goto(self.base+'roof-assessment.html?utm_source=qa-assessment')
        frame=self.page.frame_locator('#assessmentFrame')
        options=frame.locator('.q-opt')
        options.nth(['aging','solar','claim','storm','options'].index(branch)).press('Enter')
        for _ in range(4 if branch in ['aging','storm'] else 3):
            options.first.press('Enter')
        return frame.locator('form.lead-form')
    def test_all_five_child_forms_preserve_roofing_qualifications(self):
        for branch in ['aging','solar','claim','storm','options']:
            with self.subTest(branch=branch):
                f=self.assessment(branch)
                from playwright.sync_api import expect
                expect(f).to_have_attribute('data-delivery-state','idle')
                f.locator('[name=name]').fill('TRG QA '+branch)
                f.locator('[name=phone]').fill('2025550102')
                f.locator('[name=email]').fill(branch+'@example.invalid')
                f.locator('[name=zip]').fill('78213')
                f.locator('[name=address]').fill('456 Synthetic Roof Lane')
                f.locator('button').click()
                self.wait_state(f,'confirmed')
                d=self.events[-1]
                self.assertEqual(d['formId'],'trg-roof-assessment-enquiry')
                self.assertEqual(d['formData']['address'],'456 Synthetic Roof Lane')
                self.assertEqual(d['formData']['zip'],'78213')
                self.assertIn('Branch: '+branch,d['formData']['message'])
                self.assertIn('Do you own the property?',d['formData']['message'])
                self.assertIn('Where is the property?',d['formData']['message'])
                self.assertIn('utm_source=qa-assessment',d['formData']['message'])
                self.assertEqual(d['formData']['website_entry_point'],'Website roof assessment')
        self.assertEqual(len(self.events),5)
        (EVIDENCE/'mock-assessment-payloads.json').write_text(json.dumps(self.events,indent=2))

    def test_reload_duplicate_is_hash_only_and_not_resent(self):
        f=self.callback(); f.locator('button').click(); self.wait_state(f,'confirmed')
        f=self.callback(); f.locator('button').click(); self.wait_state(f,'duplicate')
        self.assertEqual(len(self.events),1)
        storage=self.page.evaluate('JSON.stringify(sessionStorage)')
        self.assertNotIn('2025550101',storage)
        self.assertNotIn('TRG QA Local',storage)
        self.assertNotIn('Synthetic Roof',storage)

    def test_invalid_phone_and_keyboard_validation_emit_no_lead(self):
        f=self.callback(); f.locator('[name=phone]').fill('abc')
        f.evaluate('(f)=>f.dispatchEvent(new Event("submit",{bubbles:true,cancelable:true}))')
        self.page.wait_for_timeout(1200)
        self.assertEqual(self.events,[])
        self.assertEqual(f.get_attribute('data-delivery-state'),'idle')
        f.locator('[name=phone]').fill('2025550101')
        f.locator('[name=phone]').press('Enter')
        self.wait_state(f,'confirmed')
        self.assertEqual(self.events[0]['formLabels']['address'],'Street Address')

    def test_assessment_forwards_landing_utm_to_the_embedded_funnel(self):
        self.page.goto(self.base+'roof-assessment.html?utm_source=qa-assessment&utm_campaign=roof-launch&utm_medium=chatgpt')
        src=self.page.locator('#assessmentFrame').get_attribute('src')
        self.assertIn('utm_source=qa-assessment', src)
        self.assertIn('utm_campaign=roof-launch', src)
        self.assertIn('utm_medium=chatgpt', src)

    def test_assessment_cannot_escape_pending_and_validates_zip(self):
        f=self.assessment('storm')
        for name,value in [('name','TRG QA Guard'),('phone','2025550103'),('email','guard@example.invalid'),('zip','abcde')]:
            f.locator('[name='+name+']').fill(value)
        f.locator('button').click()
        self.assertEqual(f.get_attribute('data-delivery-state'),'idle')
        f.locator('[name=zip]').fill('78213')
        f.locator('button').click()
        self.assertTrue(self.page.frame_locator('#assessmentFrame').locator('.q-back').is_disabled())
        self.wait_state(f,'confirmed')

    def test_missing_child_adapter_fails_closed_with_contact_handoff(self):
        self.context.route('**/assets/intake.js',lambda r:r.abort())
        self.page.goto(self.base+'roof-assessment.html')
        from playwright.sync_api import expect
        expect(self.page.locator('#assessmentFrame')).not_to_be_visible()
        expect(self.page.locator('.fallback a[href="contact.html"]')).to_be_visible()

if __name__=='__main__': unittest.main(verbosity=2)
