# BrowserExtensions

Monorepo for andrewiankidd's Chrome/Edge extensions. Each extension lives in its own subfolder and has its own publish workflow under [`.github/workflows/`](.github/workflows).

## Extensions

| Extension | Description | Status |
|---|---|---|
| [simple-storage-sync](simple-storage-sync) | Sync select localStorage values between machines. | [![simple-storage-sync](https://github.com/andrewiankidd/BrowserExtensions/actions/workflows/publish-simple-storage-sync.yml/badge.svg?branch=master)](https://github.com/andrewiankidd/BrowserExtensions/actions/workflows/publish-simple-storage-sync.yml) |
| [argocd-helper](argocd-helper) | Quality-of-life tweaks for the ArgoCD UI (delete-confirmation autofill, Cancel & Sync button). | [![argocd-helper](https://github.com/andrewiankidd/BrowserExtensions/actions/workflows/publish-argocd-helper.yml/badge.svg?branch=master)](https://github.com/andrewiankidd/BrowserExtensions/actions/workflows/publish-argocd-helper.yml) |
| [az-insights-heatmap](az-insights-heatmap) | Colours Application Insights tiles in the Azure portal by health percentage. | [![az-insights-heatmap](https://github.com/andrewiankidd/BrowserExtensions/actions/workflows/publish-az-insights-heatmap.yml/badge.svg?branch=master)](https://github.com/andrewiankidd/BrowserExtensions/actions/workflows/publish-az-insights-heatmap.yml) |
| [tfs2015-helper](tfs2015-helper) | Quality-of-life tweaks for the legacy TFS 2015 / VSTS UI. | [![tfs2015-helper](https://github.com/andrewiankidd/BrowserExtensions/actions/workflows/publish-tfs2015-helper.yml/badge.svg?branch=master)](https://github.com/andrewiankidd/BrowserExtensions/actions/workflows/publish-tfs2015-helper.yml) |

## Install (unpacked)

To load any of these from source instead of via a store:

### Chrome / Edge

1. Open `chrome://extensions` (or `edge://extensions`).
2. Enable Developer Mode.
3. Click "Load unpacked" and point at the `<extension>/src/` folder.

### Firefox

1. Open `about:debugging#/runtime/this-firefox`.
2. Click "Load Temporary Add-on…".
3. Pick `<extension>/src/manifest.json`.

Firefox temporary add-ons are wiped on browser restart; for a persistent install use the AMO link in each extension's readme.

## Layout

```
BrowserExtensions/
├── .github/workflows/
│   ├── _publish-extension.yml             # reusable workflow_call pipeline
│   ├── publish-simple-storage-sync.yml    # caller, path-filtered
│   ├── publish-argocd-helper.yml          # ditto
│   ├── publish-az-insights-heatmap.yml    # ditto
│   └── publish-tfs2015-helper.yml         # ditto
├── simple-storage-sync/    ├── assets/ ├── readme.md └── src/
├── argocd-helper/          ├── assets/ ├── readme.md └── src/
├── az-insights-heatmap/    ├── assets/ ├── readme.md └── src/
└── tfs2015-helper/         ├── assets/ ├── readme.md └── src/
```

The build/release/publish pipeline lives once in [`_publish-extension.yml`](.github/workflows/_publish-extension.yml). Each extension has a small caller that path-filters its own subfolder and passes `name` plus its secrets through to the reusable workflow.

## Secrets

Three secrets are shared across all extensions (set once per account):

- `CHROME_CLIENT_ID`, `CHROME_CLIENT_SECRET`, `CHROME_REFRESH_TOKEN` — Google Cloud OAuth credentials for the Chrome Web Store API.

> [!NOTE]
> Edge publish is currently disabled. Microsoft broke Partner Center and locked publishers out of their own extension listings ([microsoft/MicrosoftEdge-Extensions#527](https://github.com/microsoft/MicrosoftEdge-Extensions/issues/527)). Until that's resolved, only Chrome publish runs. The Edge job is commented out in [`_publish-extension.yml`](.github/workflows/_publish-extension.yml) and easy to re-enable.

One secret per extension (the store-issued product/extension ID):

- `CHROME_PRODUCT_ID_<NAME>` (e.g. `CHROME_PRODUCT_ID_SIMPLE_STORAGE_SYNC`, `CHROME_PRODUCT_ID_ARGOCD_HELPER`, `CHROME_PRODUCT_ID_AZ_INSIGHTS_HEATMAP`, `CHROME_PRODUCT_ID_TFS2015_HELPER`).

(If/when Edge publish is re-enabled, add `EDGE_PRODUCT_ID_<NAME>` per extension as well.)

## Adding a new extension

1. Create `<name>/src/` and `<name>/assets/` matching the layout above.
2. Manually submit v0.0.0.1 to the Chrome Web Store (the publish action updates an existing listing — it can't create one).
3. Set `CHROME_PRODUCT_ID_<NAME>` repo secret (uppercase, underscores).
4. Copy [`.github/workflows/publish-argocd-helper.yml`](.github/workflows/publish-argocd-helper.yml) to `publish-<name>.yml` and replace `argocd-helper` / `ARGOCD_HELPER` throughout — that's the only file you need to touch. The reusable pipeline in `_publish-extension.yml` does the rest.
5. Manifest version is auto-stamped — the workflow rewrites the fourth segment of `version` in `<name>/src/manifest.json` to `github.run_number` on each build, so the store always sees a unique version. The first three segments are yours to bump semantically.
