# BrowserExtensions

Monorepo for andrewiankidd's browser extensions.

## Extensions

| Extension | Description | Status |
|---|---|---|
| [az-insights-heatmap](az-insights-heatmap) | Colours Application Insights tiles in the Azure portal by health percentage. | [![az-insights-heatmap](https://github.com/andrewiankidd/BrowserExtensions/actions/workflows/publish-az-insights-heatmap.yml/badge.svg?branch=master)](https://github.com/andrewiankidd/BrowserExtensions/actions/workflows/publish-az-insights-heatmap.yml) |
| [simple-storage-sync](simple-storage-sync) | Sync select localStorage values between machines. | [![simple-storage-sync](https://github.com/andrewiankidd/BrowserExtensions/actions/workflows/publish-simple-storage-sync.yml/badge.svg?branch=master)](https://github.com/andrewiankidd/BrowserExtensions/actions/workflows/publish-simple-storage-sync.yml) |
| [tfs2015-helper](tfs2015-helper) | Quality-of-life tweaks for the legacy TFS 2015 / VSTS UI. | [![tfs2015-helper](https://github.com/andrewiankidd/BrowserExtensions/actions/workflows/publish-tfs2015-helper.yml/badge.svg?branch=master)](https://github.com/andrewiankidd/BrowserExtensions/actions/workflows/publish-tfs2015-helper.yml) |

## Layout

```
BrowserExtensions/
├── .github/workflows/
│   ├── _publish-extension.yml             # reusable workflow_call pipeline
│   ├── publish-az-insights-heatmap.yml    # caller, path-filtered
│   ├── publish-simple-storage-sync.yml    # ditto
│   └── publish-tfs2015-helper.yml         # ditto
├── az-insights-heatmap/    ├── assets/ ├── readme.md └── src/
├── simple-storage-sync/    ├── assets/ ├── readme.md └── src/
└── tfs2015-helper/         ├── assets/ ├── readme.md └── src/
```

The build/release/publish pipeline lives once in [`_publish-extension.yml`](.github/workflows/_publish-extension.yml). Each extension has a small caller that path-filters its own subfolder and passes `name` plus its secrets through to the reusable workflow.
