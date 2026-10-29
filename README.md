# LibraDesk — Library Management System

A responsive library-management website made with HTML, CSS, and vanilla JavaScript.

## Features
- Dashboard with book, available-copy, active-loan, and member counts
- Add, edit, search, filter, and delete books
- Add, edit, search, and delete members
- Issue books to members and set due dates
- Return books and automatically update available copies
- Overdue loan status
- Responsive layout for laptop and mobile
- Saves changes in browser `localStorage`

## Run locally
1. Extract `library-management-system.zip`.
2. Open the extracted folder.
3. Double-click `index.html` to open it in a browser.

No installation is required.

## Publish for free with GitHub Pages
1. Sign in or create an account at https://github.com/
2. Create a public repository, e.g. `library-management-system`.
3. Upload `index.html`, `style.css`, `app.js`, and optionally this README.
4. Open **Settings → Pages**.
5. Under build/deployment, choose **Deploy from a branch**, select `main` and `/ (root)`, then Save.
6. Wait for deployment and open the URL GitHub Pages shows, typically `https://YOUR-USERNAME.github.io/library-management-system/`.

## Important limitation
This version is a front-end demo. Records are saved only in the current browser on the current device. It does not have a secure admin login, shared database, server-side validation, or multi-user access. For a real college/production deployment, add a backend (for example PHP + MySQL or Node.js + MySQL) and authentication. Do not store sensitive real member information in this demo.
