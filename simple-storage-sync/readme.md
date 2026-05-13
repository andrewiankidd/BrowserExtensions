<center>

# Simple Storage Sync

<img src="assets/logo.png" style="width: 150px;"/>

Browser Extension for syncing select localStorage values between machines.

[![Build and Deploy](https://github.com/andrewiankidd/BrowserExtensions/actions/workflows/publish-simple-storage-sync.yml/badge.svg?branch=master)](https://github.com/andrewiankidd/BrowserExtensions/actions/workflows/publish-simple-storage-sync.yml)

### Links!

[![Chrome Link](https://img.shields.io/badge/%f0%9f%8c%90%20Chrome%20Extension-3277BC.svg)](https://chromewebstore.google.com/detail/simple-storage-sync/ajpgfnbllpolbcbepkmghabgpbccgfam)

[![Edge Link](https://img.shields.io/badge/%f0%9f%8c%90%20Edge%20Extension-3277BC.svg)](https://microsoftedge.microsoft.com/addons/detail/oeojiafighihlcgbalfdohlciecpbocd)

[![Firefox Link](https://img.shields.io/badge/%f0%9f%8c%90%20Firefox%20Extension-3277BC.svg)](https://addons.mozilla.org/firefox/addon/simple-storage-sync/)

</center>

## Features

- **Per-origin tracking** — open the popup on any site and click the track button to start syncing that site's localStorage.
- **Side-by-side comparison** — the popup lists every tracked key with a ✔️/❌ indicator showing whether local and remote values agree.
- **Manual resolution** — click any out-of-sync key to view local vs remote and pick which one wins.
- **Browser-native sync** — values transit via `chrome.storage.sync` (Chrome/Edge) or `browser.storage.sync` (Firefox), riding on your existing browser account sync. No third-party server.

## Notes

- Sync is per-browser-family. Chrome syncs through Google account; Edge through Microsoft account; Firefox through Mozilla account. Values do not cross between vendors.
- Subject to the platform's `storage.sync` quotas (~100 KB total per extension on Chrome, similar on others). Best suited to small values like auth tokens, preferences, or feature flags — not large blobs.
