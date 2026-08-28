# Visual thesis: luminous glass data landscape

## Direction

`gh-account-autoswitch` lives between a repository and an identity. The site makes that invisible routing legible as a nocturnal data landscape: two account signals travel on separate luminous rails, pass through a transparent policy lens, and arrive at one repository without ever touching global state. Glass is used only for the policy layer—something inspectable rather than magical—while a dark mineral ground keeps terminal content dominant.

This is an explicitly dark, single-mode experience. A light treatment would weaken the terminal-native metaphor and the luminous path separation; the page paints every background and keeps all copy and controls at WCAG AA contrast or better.

## Palette

| Token | Value | Use |
| --- | --- | --- |
| `night-950` | `#07100F` | page ground |
| `night-900` | `#0B1715` | raised terminal / dense surfaces |
| `glass` | `rgba(21, 48, 43, .62)` | translucent policy planes |
| `mist-100` | `#E8F2EE` | primary text |
| `mist-300` | `#B7C9C3` | secondary text (7.8:1 on ground) |
| `lime-400` | `#A6F26B` | selected route and primary action |
| `cyan-300` | `#6CE9E2` | alternate route and code signals |
| `amber-300` | `#FFD27A` | cautions |
| `red-300` | `#FF9A9A` | errors |

The two route colors remain distinguishable by labels, line shapes, and status icons—never color alone. Fine grid lines use white at 8–12% opacity and are decorative.

## Type

- Interface and editorial: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`. The neutral grotesk keeps explanation direct and ships at zero font cost.
- Code and machine state: `ui-monospace, "SFMono-Regular", Consolas, "Liberation Mono", monospace`. Monospace is reserved for commands, paths, and resolved values.
- Scale: 14 / 16 / 20 / 28 / clamp(44, 7vw, 78) px. Body is 17px on narrow screens, 18px otherwise, with 1.55 leading and a 68-character reading measure.

## Spacing and shape

An 8px base rhythm with 4px for optical nudges: `4, 8, 16, 24, 32, 48, 64, 96`. Content caps at 1184px. Corners are 12px for controls, 20px for terminal/policy planes, and fully rounded only for compact status labels. The site uses open sections and divider rules; cards appear only for truly independent matching rules.

## Interaction grammar

- Primary controls fill lime and invert to the dark ground; secondary controls are transparent with a visible glass edge.
- Command snippets expose a labeled copy control with a textual copied/error result in an `aria-live` region.
- The rule explorer behaves like a terminal decision trace: changing a sample repository updates host, owner, directory, winning rule, and account together. Its initial state works with no JavaScript; enhancement never blocks the documentation.
- Every target is at least 44px. Focus is a 3px cyan outer ring plus a dark separation halo.

## Motion policy

On capable devices, the hero’s route pulse traverses each rail once on entrance (600–900ms), glass planes rise 8px while fading in (240ms), and state changes crossfade in 180ms. Nothing loops. Under `prefers-reduced-motion: reduce`, transforms and path drawing are removed and state changes are instant; hierarchy remains through opacity, borders, and scale.

## Original asset plan and provenance

- Hero: an original AI-generated, text-free wide illustration of two luminous data routes crossing a translucent policy prism toward a repository monolith. Generated for this project with `/opt/fleet/lib/gen-image.sh` (factory image deployment), then cropped/encoded locally to responsive WebP. Prompt is recorded below. Intended as explanatory atmosphere, with the exact routing logic expressed in adjacent semantic HTML.
- Product mark, rule arrows, terminal glyphs, and small icons: hand-authored inline SVG/CSS from geometric primitives by the builder. MIT-licensed as part of this repository.
- Social preview: a local 1200×630 crop of the original route landscape, created with ImageMagick. The 180×180 touch icon redraws the product mark with ImageMagick primitives. Both inherit the source asset provenance and ship with the repository.

Hero prompt:

> Use case: stylized-concept. Asset type: wide landing-page hero illustration. A nocturnal luminous glass data landscape for a developer command-line tool: two distinct streams of small cyan and acid-lime data particles travel on separate precise rails from two abstract identity nodes, pass through a transparent glass policy prism, and converge toward a single dark repository monolith without the streams mixing. Oblique isometric perspective, deep mineral black-green background, subtle etched grid, crisp glass refraction, restrained volumetric glow, editorial 3D render, premium technical atmosphere, ample quiet negative space, no people, no logos, no interface mockup, no readable text, no letters, no watermark, avoid generic gradient blobs.

## Responsive intent

At 390px, the navigation keeps only the mark, Demo, and Install so the try-first and real-start paths stay visible. The hero becomes one column, the artwork crops around the prism, rule comparisons stack, and terminal lines scroll horizontally without shrinking. Decorative grid density and glass blur reduce to protect legibility and GPU cost. No content or action is hidden behind fixed UI.
