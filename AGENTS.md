# Mirage Colored (幻影工厂+)

A browser-based "Mirage Tank" image generator. Takes two images (inner + cover) and composites them into a single PNG that appears differently on black vs white backgrounds. Supports both grayscale and full-color output modes with 5 adjustable parameters.

## Build & Run

```bash
npm run start   # dev server at localhost:9000
npm run build   # production build -> docs/index.html (single self-contained HTML)
```

Production build uses `HtmlInlineScriptPlugin` to inline all JS/CSS into one HTML file. The `docs/` directory is the deploy target (GitHub Pages).

## Project Structure

```
src/
  index.html                    # HTML template (webpack HtmlWebpackPlugin input)
  css/
    class.css                   # Utility-first CSS classes (layout, spacing, colors, theming)
    spec.css                    # Component-specific styles (dark mode toggle, display area, version table)
    switch.css                  # Toggle switch component styles
  res/
    NiceBow.ico                 # Favicon (loaded via url-loader, inlined as data URI)
  scripts/
    init.js                     # Entry point. Theme setup, version check, canvas init, wires everything together
    global.js                   # Shared mutable state: applicationState, errorHandling, processor
    defaultArgumentsConfig.json # Default parameter values (version, scales, weights, etc.)
    defaultArguments.js         # Reads config, populates DOM inputs on DOMContentLoaded
    process.js                  # Core algorithm: Mirage_Colored class
    listener.js                 # All event listeners: file input, sliders, buttons, drag/drop, paste, zoom
webpack.common.js               # Shared webpack config (entry, output, loaders, HtmlWebpackPlugin)
webpack.dev.js                  # Dev: source-map, devServer on port 9000
webpack.prod.js                 # Prod: TerserPlugin, HtmlInlineScriptPlugin
docs/
  index.html                    # Build output (DO NOT edit manually)
```

## Architecture: process.js

The `Mirage_Colored` class implements a cached pixel processing pipeline.

### Pipeline stages (top to bottom)

1. **Input** - Raw ImageData from canvas (`_innerImgData`, `_coverImgData`) + grayscale conversion (`_innerDataGray`, `_coverDataGray`)
2. **Scale + Desat** - Apply brightness scaling and desaturation. Cached in `_innerDataCache` / `_coverDataCache`
3. **Alpha** - Compute per-pixel alpha channel. Cached in `_alphaCache`, invalidated when either stage-2 cache is rebuilt
4. **Blend** - Final RGBA output using inner weight. Result stored in `_outputData`
5. **Display** - Draw to output/black/white canvases via `_showOutput()`
6. **File size** - Debounced (300ms) PNG encoding via `toBlob()` for size preview. Auto-shrinks if over size limit.

### Cache invalidation rules

| Parameter changed | Invalidates | Recalculates |
|---|---|---|
| `innerScale` / `innerDesat` | `_innerDataCache` | stages 2-6 (inner side only for stage 2) |
| `coverScale` / `coverDesat` | `_coverDataCache` | stages 2-6 (cover side only for stage 2) |
| `innerWeight` | nothing | stages 4-6 only (cheapest path) |
| `colorMode` | both caches | stages 2-6 (full reprocess) |
| `maxSize` | everything | re-runs `updateInnerImg` from scratch |

### Key design decisions

- All slider values in the UI are integers 0-100. Division by 100 happens at the listener layer before calling update methods. The `Mirage_Colored` class internally works with 0.0-1.0 floats.
- `coverScale` is inverted internally: `this._scale_c = 1 - scale_c`. Higher slider value = brighter cover.
- Grayscale mode (`!is_colored`) uses a simpler formula with no color channels, no weight parameter, no data caches.
- `toBlob()` for file size preview is the performance bottleneck, not pixel math. It's debounced to avoid encoding on every slider tick.

## Architecture: listener.js

- `eventListU` array defines all declarative event bindings (id + event + callback).
- `setupPlusMinusButton()` helper wires +/- buttons to slider+input pairs.
- `setupCanvasZoom()` implements click-to-zoom on output/black/white canvases using CSS class toggle + `location.hash` for back-button support (`#preview` hash + `popstate` listener).
- Desktop-only: drag-and-drop on canvases, paste (Ctrl+V) with left/right half detection via `mouseX`.
- Mobile: input hints are removed, drag/drop/paste not registered.
- `window.getMaxBytes()` global function reads the file size limit input, used by `process.js`.
- Inner image filename is captured on file select (`processor.mirage.innerFileName`) for naming saved output as `{name}_mirage.png`.

## Architecture: init.js

- Detects mobile/Tieba browser/download-unsupported via user agent.
- Theme: reads `prefers-color-scheme`, applies `data-theme` attribute on `<html>`, syncs with dark mode toggle.
- Version check: compares `defaultArgumentsConfig.app_version` with `localStorage.version`. On mismatch, clears localStorage and force-reloads.

## CSS Architecture

No preprocessor. Plain CSS with CSS custom properties for theming (`data-theme="light"` / `data-theme="dark"`).

- `class.css`: Utility classes. Naming convention is camelCase describing the property (e.g., `displayFlexRow`, `marginTopHigh`, `fontMedium`, `backgroundPrimary`).
- `spec.css`: ID-based and component-specific layout rules.
- `switch.css`: Self-contained toggle switch component.

## Common Modification Patterns

**Adding a new adjustable parameter:**
1. Add default value to `defaultArgumentsConfig.json`
2. Add DOM elements (slider + input + optional +/- buttons) to `src/index.html`
3. Add entries to `defaultArguments.js` list for initial DOM population
4. Add cache field + update method to `Mirage_Colored` class in `process.js`
5. Add range/input event listeners to `eventListU` in `listener.js` (remember: divide by 100)
6. Wire up +/- buttons via `setupPlusMinusButton()` in `setUpListeners()`

**Adding a new zoomable canvas:**
Add the canvas ID to the `zoomableCanvases` array in `setupCanvasZoom()`.
