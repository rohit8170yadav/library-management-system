# LibraDesk — Library Membership & Fee Management

A responsive front-end website made with HTML, CSS, and vanilla JavaScript.

## Features
- Dashboard with registered members, total amount collected, current dues, and upcoming expiry count
- Add, edit, search, and delete members
- Store each member's phone number, monthly fee, current-cycle amount paid, and membership expiry date
- Record fee payments and maintain a payment history
- Calculate total collection and current-cycle dues
- Automatically identify expired memberships and memberships expiring within the next 30 days
- Open a pre-filled reminder in WhatsApp or the phone's SMS app
- Responsive layout for laptop and mobile
- Saves data in the current browser using `localStorage`

## Run locally
1. Extract `library-management-system.zip`.
2. Open the extracted folder.
3. Double-click `index.html` to open it in a browser.

No installation is required.

## Publish with GitHub Pages
1. Upload `index.html`, `style.css`, `app.js`, and this README to the root of a GitHub repository.
2. Open **Settings → Pages**.
3. Select **Deploy from a branch**, branch `main`, folder `/(root)`, then Save. Alternatively, configure GitHub Actions deployment.

## Important limitations
- This is a front-end demo. Data is stored only in the current browser on the current device; it is not shared between devices and is not backed up to a server.
- Expiry tracking is automatic when the website is opened, but GitHub Pages cannot automatically send unattended SMS or WhatsApp messages. The reminder buttons open a pre-filled message that the admin must send. Fully automated scheduled delivery requires a backend/scheduler and a messaging provider such as an approved SMS gateway or WhatsApp Business Platform, along with credentials and any applicable charges.
- Do not use real or sensitive member information in this demo without adding secure authentication, a backend, access controls, and backups.
