# Mosaic

A drag-and-drop bento layout builder with responsive previews, a block inspector, undo and standalone HTML export. Built with plain HTML, CSS and JavaScript.

**Live demo:** https://ayo-2010.github.io/mosaic/

## Features

- Six block types: hero, text, stat, quote, image and chart
- Add blocks from the library and drag them to reorder the canvas
- Edit kicker, headline, body, button label, width, height and alignment in the inspector
- Three starter layouts: editorial grid, product dashboard and portfolio spread
- Desktop, tablet and mobile preview modes with responsive column counts
- Adjustable column count, gap, surface and grid guides
- Undo and redo history
- Copy the layout as JSON or export a standalone HTML page
- Layout saved in localStorage
- Responsive layout down to 390px, reduced motion support and a global `[hidden]` rule

## Running it

Open `index.html` in a browser. There is no build step and no dependencies to install.

## Files

```
index.html
styles.css
app.js
```

## Tech

Plain HTML, CSS and JavaScript with the HTML Drag and Drop API.
