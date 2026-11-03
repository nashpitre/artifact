# Artifact

**Quiet surfaces. Brief disruptions.**

Artifact is a portable visual effects engine extracted from [nashp.com](https://nashp.com). Small jolts and brief SVG distortion give ordinary content the feeling of a signal passing through an imperfect machine.

Use it for a personal site, an exhibition, a game interface, a music project, or a new experiment. No framework, build step, canvas screenshot, or external dependency required.

## Try it

Serve this folder with `python3 -m http.server 8000`, then open `http://localhost:8000/examples/`.

## Add it to a project

Copy `src/` into your project and load the stylesheet and ES module:

```html
<link rel="stylesheet" href="./src/artifact.css">
<main id="signal">
  <h1>Your own signal.</h1>
  <p>Content that occasionally slips out of alignment.</p>
</main>
<script type="module">
  import { createArtifact } from './src/artifact.js';
  const effects = createArtifact(document.querySelector('#signal'));
</script>
```

Choose a connected content container. Artifact leaves your DOM structure in place. Avoid overlapping Artifact roots: each element should belong to one instance.

## Controls

```js
const effects = createArtifact(root, {
  minDelay: 25000, // milliseconds between automatic tears
  maxDelay: 35000
});
effects.pulse('tear'); // returns false if paused or no eligible content is ready
effects.pulse('jolt');
effects.pause();
effects.resume();
console.log(effects.coverage);
effects.destroy(); // releases listeners, observers, filters, and owned effects
```

IntersectionObserver needs time to report visible elements after initialization. A pulse immediately after creation may return false. Pulses also respect focus and interaction safeguards; a focused button or selected text can prevent one.

Mark any region `data-artifact-ignore` to exclude it. Add `data-artifact-paused` anywhere in the document to suspend effects (remove it to permit them again). Open native dialogs and `[aria-modal="true"]` also suspend effects. Modal/pause changes take effect at the next scheduled check or interaction; call `pause()` when opening an overlay for immediate cancellation, and `resume()` when closing it.

Listen for diagnostics with `window.addEventListener('artifact:coverage', event => console.log(event.detail))`. Diagnostics describe selected, excluded, and uncovered content; partial coverage is expected on complex pages.

## The effects

- **Tear:** a 220 ms turbulence/displacement filter across eligible visible text.
- **Jolt:** opposing horizontal steps across eligible visible content.
- **Automatic cadence:** one tear every 25–35 seconds by default.

The original site has disabled and historical behaviors. This release preserves the current active tear engine and exposes its existing jolt mode. It does not claim to bundle unrelated site features or every historical experiment.

## Built to stay out of the way

Reduced-motion preferences disable effects. Scrolling, typing, pointer interaction, text selection, hidden tabs, focus changes, and open dialogs pause or interrupt them. Interactive controls and navigation are excluded. Existing transforms, animation, filters, masks, and large raster costs can exclude content. Tears skip media and graphics; jolts can include eligible media.

Limits bound DOM scanning, target counts, style reads, and SVG raster area. Unsupported filter APIs fail closed. Validate on your target browsers and devices, especially Safari and high-density mobile displays; SVG rendering varies. No compatibility guarantee is implied by a successful import.

## A visual language

Artifact begins with a simple rhythm: a calm surface, a short interruption, then a return to clarity. Let the content lead. Keep disturbances rare. Use the same rhythm across typography, interfaces, video, and installations. Each project can bring its own colors and type.

See [the visual direction](BRAND.md) for a starting point. The code is reusable independently of the name and identity.

## Origin and reuse

Built through iterative, AI-assisted development for Nash Pitre's website. `provenance/artifact.original.html` preserves the source snapshot used for this extraction, with its site-specific integration intact; use `src/` for new projects.

MIT licensed. Personal and commercial reuse, modification, and redistribution are permitted under [LICENSE](LICENSE). The package is prepared for direct copying; it is not published to npm.
