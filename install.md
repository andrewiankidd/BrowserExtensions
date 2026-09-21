# Installing an extension unpacked

Every extension here is also published to the browser stores, and that's the easy
route — the store links are at the top of each extension's readme.

Sometimes the store isn't an option. A listing might be waiting on review, it might
have been rejected or removed, Edge publishing is currently broken at Microsoft's
end, or you might simply want a change that hasn't reached the store yet. In those
cases you can load the extension straight from the source, which works in every
browser here and takes about a minute.

## 1. Download the source

You don't need git.

1. Go to <https://github.com/andrewiankidd/BrowserExtensions>.
2. Click the green **Code** button, then **Download ZIP**.
3. Extract the ZIP somewhere you're happy to leave it.

That last point matters more than it looks. The browser doesn't copy the files in —
it reads them from that folder every time it starts. If you extract to your Downloads
folder and later clear it out, the extension stops working. Somewhere like
`Documents\BrowserExtensions` is a better home.

Inside you'll find one folder per extension. The folder you'll point the browser at
is the `src` folder inside the one you want, for example:

```
BrowserExtensions-master\argocd-helper\src
```

That's the folder containing `manifest.json`. Pointing at anything higher up won't work.

> If you'd rather not download the whole repo, each extension's
> [releases](https://github.com/andrewiankidd/BrowserExtensions/releases) contain a
> zip of just that extension's `src`. Extract it and use that folder instead.

## 2. Load it

### Chrome

1. Open `chrome://extensions`.
2. Turn on **Developer mode** — the switch is in the top right.
3. Click **Load unpacked**.
4. Select the extension's `src` folder and click **Select Folder**.

It appears in the list straight away. To put its icon on the toolbar, click the
puzzle-piece icon and pin it.

### Edge

1. Open `edge://extensions`.
2. Turn on **Developer mode** — the switch is at the bottom of the left sidebar.
3. Click **Load unpacked**.
4. Select the extension's `src` folder and click **Select Folder**.

### Firefox

Firefox only allows this temporarily:

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…**.
3. Select the `manifest.json` file inside the extension's `src` folder — the file
   itself here, not the folder.

**It will be gone when you restart Firefox.** That's a deliberate Firefox restriction,
not a fault with the extension, and you'll need to load it again each time.

Release builds of Firefox refuse to install unsigned extensions permanently, so there's
no way around that. If you need one to stick, use Firefox Developer Edition, ESR or
Nightly, and set `xpinstall.signatures.required` to `false` in `about:config` — then a
signed or unsigned `.xpi` will install normally. For everyday use the store version is
the better answer.

## Updating

Unpacked extensions don't update themselves.

1. Download and extract the ZIP again, replacing the old folder.
2. In Chrome or Edge, go back to the extensions page and click the **reload** arrow on
   the extension's card.
3. In Firefox, load the temporary add-on again.

## Removing

Click **Remove** on the extension's card in `chrome://extensions` or `edge://extensions`,
or **Remove** in `about:debugging`. Deleting the folder on its own leaves a broken entry
behind, so remove it in the browser first.

## If something goes wrong

**"Manifest file is missing or unreadable"** — you've selected the wrong folder. It needs
to be the `src` folder, the one with `manifest.json` directly inside it.

**The extension vanished after a restart** — in Chrome or Edge, the folder has been moved,
renamed or deleted. In Firefox, this is just how temporary add-ons work.

**Chrome or Edge warns about developer-mode extensions on startup** — expected, and it's
the trade-off for running unpacked. Installing from the store instead makes it stop.

**A warning appears on the extension's card** — worth reading, but most are harmless notes
about manifest keys meant for a different browser. If the extension works, it can be ignored.
