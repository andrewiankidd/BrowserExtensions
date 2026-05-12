<center>

# ArgoCD Helper

<img src="assets/logo.png" style="width: 150px;"/>

Browser Extension that smooths over some ArgoCD UI annoyances — autofill delete confirmations and a "Cancel & Sync" button.

[![Build and Deploy](https://github.com/andrewiankidd/BrowserExtensions/actions/workflows/publish-argocd-helper.yml/badge.svg?branch=master)](https://github.com/andrewiankidd/BrowserExtensions/actions/workflows/publish-argocd-helper.yml)

### Links!

[![Chrome Link](https://img.shields.io/badge/%f0%9f%8c%90%20Chrome%20Extension-3277BC.svg)](https://chrome.google.com/webstore/detail/defpfgoaakhmiebnimanendjembiabgi)

[![Edge Link](https://img.shields.io/badge/%f0%9f%8c%90%20Edge%20Extension-3277BC.svg)](https://github.com/microsoft/MicrosoftEdge-Extensions/issues/527)

[![Firefox Link](https://img.shields.io/badge/%f0%9f%8c%90%20Firefox%20Extension-3277BC.svg)](https://addons.mozilla.org/firefox/addon/argocd-helper/)

</center>

## Features

### Autofill delete confirmation

When you delete a resource, ArgoCD makes you type the resource name into a textbox to confirm (e.g. `nl-certified-weighings-db-jph6x`). This extension watches for the delete dialog and injects an **Autofill** button next to that textbox.

- Detects the dialog by matching the pattern `type '<name>' to confirm` in the surrounding text, then extracts `<name>`.
- Clicking **Autofill** writes the name into the input using the native value setter and fires `input`/`change` events so ArgoCD's React form state picks it up and enables the **OK** button.
- No copy/paste round-trip — one click and the dialog is ready to submit.

### Cancel & Sync

When a sync is already running, clicking **SYNCHRONIZE** silently no-ops with a "sync already running" status. This extension adds a **CANCEL & SYNC** button next to the existing SYNCHRONIZE button in the Synchronize slide-out panel.

- Calls `DELETE /api/v1/applications/<name>/operation` (with the session cookie) to terminate the in-flight operation.
- Waits ~750 ms for ArgoCD to clear the operation state.
- Clicks the original SYNCHRONIZE button, so whatever sync options you have selected in the panel (PRUNE, DRY RUN, FORCE, AUTO-CREATE NAMESPACE, etc.) are honoured.
- The app name (and namespace, if present) is extracted from the URL — supports both `/applications/<name>` and `/applications/<namespace>/<name>` URL layouts.

### Popup toggles

Both features are on by default. Open the extension popup to enable/disable either one. State is persisted via `chrome.storage.local` and changes take effect immediately for disable; re-enabling requires a tab reload for buttons to be injected back in.

## Install (unpacked)

1. Open `chrome://extensions` (or `edge://extensions`).
2. Enable Developer Mode.
3. Click "Load unpacked" and point at the [`src/`](src) folder.

## Notes

- Content script filtered to URLs containing "argocd" via `include_globs`; both features additionally self-gate by DOM selectors so the script is inert on non-ArgoCD pages.
- Tested against the ArgoCD UI as of mid-2026. If ArgoCD changes the dialog markup or API path, the selectors/endpoint in [`src/inject/inject.js`](src/inject/inject.js) are the spots to tweak.
