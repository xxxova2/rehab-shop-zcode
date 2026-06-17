# Google Apps Script Backend

This directory contains the Apps Script source that powers the rehab-shop-zcode
storefront. The Web App is deployed at:

    https://script.google.com/macros/s/AKfycbzRslqyZ5_HCWIKKzOJ_Ioj_rqMieAQ30EOQHCGYZuad-8W1NiCGd6wFcytvn5w1gTu/exec

## First-time deploy (one-time per Google account)

1. The **clasp-push account** (the Google account used to authorise `clasp login`
   on this machine) must have the Apps Script API enabled. Visit
   <https://script.google.com/home/usersettings>, toggle **Apps Script API → ON**,
   wait a few minutes, then continue.

2. From the project root, run:

   ```bash
   clasp push               # uploads the .js / appsscript.json files
   clasp deploy             # publishes a new Web App version
   ```

3. In the Apps Script editor, open **Project Settings → Script properties** and
   add:

   | Property  | Value                                                                                                  |
   |-----------|--------------------------------------------------------------------------------------------------------|
   | ADMIN_KEY | `e46ae819d2b77d76b102a3f2d097f676f7b9f94d73a7ab46fa5a58c3e7181607` (must match the Vercel env var)      |
   | SHEET_ID  | The Google Sheet ID hosting the DB (read from the URL between `/d/` and `/edit`)                       |

4. The script auto-creates the required sheets on first call:
   `Users`, `Categories`, `Collections`, `Products`, `Orders`, `OrderItems`,
   `Settings`, `Backups`, `Carts`. No manual sheet setup needed.

5. Call `seedSampleData` once to populate 8 categories + 10 products + 2 users
   (admin@rehabshop.com / admin123, demo@rehabshop.com / demo123):

   ```bash
   clasp run seedSampleData
   # or via HTTP:
   curl -L -G \
     "https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec" \
     -d "action=seedSampleData" -d "admin_key=<ADMIN_KEY>"
   ```

## File map

- `Code.js` — Entry point (`doPost`/`doGet`), router, all 28 action handlers,
  sheet utilities, sample data seed.
- `Admin.js`, `Products.js`, `Orders.js` — legacy per-domain helpers from the
  ported clothing-store-backend.
- `Config.js` — Constants (Saudi cities, sizes, statuses, VAT, shipping).
- `Utilities.js` — Sheet CRUD, validation, ID generation, logging.
- `Images.js`, `Documents.js`, `WhatsApp.js` — Drive / WhatsApp / invoice
  integrations.
- `Test.js` — Manual test entry points.
- `appsscript.json` — Manifest (timezone, runtime, Web App access).

## Pushing changes

After editing any `.js` file:

```bash
cd gas              # the .clasp.json lives here
clasp push
clasp deploy        # only if you changed the entry point or manifest
```

A simple `clasp push` is enough for handler changes — the Web App reads from
`@HEAD` by default, so existing deployments pick up the new code on the next
request.
