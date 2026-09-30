# Text depth experiment

Stable branch: `main`
Stable commit: `6eb0ba6d3d3e138dc3447850d1af6cc3a8c412fb`
Annotated tag: `v0.5-homepage-stable`
Experiment branch: `experiment/text-depth`

The stable version already painted information (z=1) behind the curtain (2)
and both bead canvases (3, 4). The hero's isolated stacking context contains
these as positioned siblings. Each information block's opacity creates only a
nested context within the information layer; it cannot escape above the canvases.

The experiment preserves this real occlusion and all text geometry. The
`textDepth` export in `src/config/hero.ts` changes only optical contrast:
opacity 0.82 (stable 0.9), primary #344f58, secondary #567079, blur 0px.
Set `enabled: false` to restore stable text contrast. This switch does not undo
the scroll button's functional-layer correction; use the stable tag for an exact
comparison of the original version.

The scroll hint is now a sibling of the information container, at z=10 with
navigation. Previously it was trapped inside information's z=1 context.
Umbrella remains 5, cursor 9, transient navigation notice 11.

There is no text reveal animation, mask, panel, exclusion zone, or change to
curtain/bead physics, density, colours, sizes, speeds or collision behaviour.
Reveal comes only from the existing ropes moving away from the text.

Validation: TypeScript, all 14 existing tests, and production build pass.
Browser inspection confirmed identical before/after text contents, bounding
rectangles and fonts at the current viewport, and the expected computed stacking
contexts. Opening the umbrella produced strand contact and bead collisions while
text opacity stayed 0.82. Navigation hid the umbrella while retaining the cursor
and open state. Scroll hint reached #work (target top 0) without toggling the
umbrella. Browser error log was empty.

## Layered depth volume

The follow-up experiment keeps the same rope and bead update functions but draws
stable depth groups into separate canvases. Curtain groups are FAR/MID/FRONT at
25%/50%/25%; their z-indexes are 0/2/4 around information at 1. Beads are
FAR/MID/NEAR at 25%/62%/13%; their z-indexes are 0/3/4. Every strand and bead
still participates in the same umbrella collision simulation. Size, opacity and
speed scales are configured under `visual.depth` in `src/config/hero.ts`.

All environment layers now remain fixed in the viewport; only the existing rope,
falling-bead and umbrella collision motion changes their positions. Umbrella,
cursor, navigation and scroll hint remain unshifted by the depth experiment.
Blur is deliberately `0px` for this pass so the extra canvases remain smooth at
desktop sizes. The far/mid/front Curtain opacity and widths and bead scales are
all editable from the same config block.
