# Privacy Policy — JetKVM Helper

Last updated: 21 September 2026

## The short version

JetKVM Helper does not collect, store or transmit any personal data. There is no
server, no analytics, no tracking, and no third party involved.

## What the extension stores

Three on/off settings — whether the Screenshot button is shown, whether the Record
button is shown, and whether scripted input is enabled. These are kept on your own
machine with `chrome.storage.local`. They are not synced and never leave your browser.

## What the extension accesses

It runs only on pages it recognises as a JetKVM device's web interface. On every
other page it stops immediately and does nothing.

A JetKVM is hardware on your own network, reached at whatever address your router
gave it, so the extension cannot ask for one fixed website address in advance. That
is the only reason it requests access to all sites.

When scripted input is enabled, the extension looks through your open tabs to find
the JetKVM you asked for. Tab addresses are used at that moment and nothing more —
they are not recorded, stored or sent anywhere.

## Screenshots and recordings

Screenshots and recordings are produced inside your browser from the video already
on screen, and are saved straight to your downloads folder. They are not uploaded
anywhere and the extension never sees them again.

## Keystrokes

Keystrokes you trigger are sent to the machine your JetKVM controls, through the
JetKVM interface already open in your browser. Nothing is logged and nothing is sent
anywhere else. The extension does not read or record anything you type elsewhere.

## Network

The extension makes no network requests of its own, to anywhere, for any reason.

## Changes

Any change to this policy will appear in this file, and its history is public in
the repository.

## Contact

Questions or problems: https://github.com/andrewiankidd/BrowserExtensions/issues
