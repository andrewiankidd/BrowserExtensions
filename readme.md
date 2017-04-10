# BrowserExtensions

Monorepo for andrewiankidd's browser extensions.

## Extensions

| Extension | Description | Status |
|---|---|---|
| [tfs2015-helper](tfs2015-helper) | Quality-of-life tweaks for the legacy TFS 2015 / VSTS UI. | [![tfs2015-helper](https://github.com/andrewiankidd/BrowserExtensions/actions/workflows/publish-tfs2015-helper.yml/badge.svg?branch=master)](https://github.com/andrewiankidd/BrowserExtensions/actions/workflows/publish-tfs2015-helper.yml) |

## Layout

```
BrowserExtensions/
├── .github/workflows/
│   ├── _publish-extension.yml          # reusable workflow_call pipeline
│   └── publish-tfs2015-helper.yml      # caller, path-filtered
└── tfs2015-helper/                     # ├── assets/ ├── readme.md └── src/
```

The build/release/publish pipeline lives once in [`_publish-extension.yml`](.github/workflows/_publish-extension.yml). Each extension has a small caller that path-filters its own subfolder and passes `name` plus its secrets through to the reusable workflow.
