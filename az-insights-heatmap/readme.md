<center>

# AZ Insights Heatmap

<img src="assets/logo.png" style="width: 150px;"/>

Browser Extension that colours Application Insights tiles in the Azure portal by health percentage.

[![Build and Deploy](https://github.com/andrewiankidd/BrowserExtensions/actions/workflows/publish-az-insights-heatmap.yml/badge.svg?branch=master)](https://github.com/andrewiankidd/BrowserExtensions/actions/workflows/publish-az-insights-heatmap.yml)

### Links!

[![Chrome Link](https://img.shields.io/badge/%f0%9f%8c%90%20Chrome%20Extension-3277BC.svg)](TODO)

[![Edge Link](https://img.shields.io/badge/%f0%9f%8c%90%20Edge%20Extension-3277BC.svg)](https://github.com/microsoft/MicrosoftEdge-Extensions/issues/527)

[![Firefox Link](https://img.shields.io/badge/%f0%9f%8c%90%20Firefox%20Extension-3277BC.svg)](https://addons.mozilla.org/firefox/addon/az-insights-heatmap/)

</center>

## Features

- Reads the percentage inside each `.fxs-tile` and sets its background to a red→green gradient based on health.
- **Disable Gradient** toggle in the popup switches to flat red (<99%) / flat green (≥99%) instead.
