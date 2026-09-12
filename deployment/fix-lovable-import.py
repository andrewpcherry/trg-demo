"""Run from the existing Lovable project root after reviewing the changes."""
from pathlib import Path

route = Path("src/routes/$.tsx")
source = route.read_text()
old = "const html = staticPages[pathname];"
new = """const pagePath = [
          "/commercial/guardian-commercial-care",
          "/commercial/guardian-commercial-care.html",
        ].includes(pathname) ? "/guardian-care" : pathname;
        const html = staticPages[pagePath];"""
if new not in source:
    if source.count(old) != 1:
        raise SystemExit("Unexpected route handler; inspect before editing.")
    route.write_text(source.replace(old, new))

old_hours = "Mon to Sat 8am to 6pm Central"
new_hours = "8am to 6pm Central"
for name in ("public/assets/site.js", "public/contact.html", "src/lib/static-pages.ts"):
    file = Path(name)
    content = file.read_text()
    if old_hours not in content and new_hours not in content:
        raise SystemExit("Expected business hours missing in " + name)
    file.write_text(content.replace(old_hours, new_hours))

print("Restored original commercial-care aliases and removed unconfirmed Saturday hours.")
print("Verify both original aliases return 200 with the original canonical; then publish and recheck production.")
