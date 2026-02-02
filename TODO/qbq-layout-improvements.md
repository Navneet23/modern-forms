# TODO - Future Improvements

## Q-by-Q Layout (PR #10)

- [ ] **Handle short hex color codes in contrast detection**: The `getWelcomeTextColor` function parses `theme.colors.background` assuming 6-digit hex (`#RRGGBB`). Short hex like `#FFF` would produce incorrect luminance results. Add normalization to expand 3-digit hex to 6-digit before parsing.

- [ ] **Reduce form title size on question screens for long titles**: The form title uses `text-5xl sm:text-6xl` on both the welcome screen and question screens. For forms with long titles, this can push the question card below the fold on mobile. Consider using a smaller size (e.g. `text-3xl sm:text-4xl`) on the question screens while keeping the larger size on the welcome screen.

- [ ] **Improve Start button contrast on light backgrounds**: When the background is light, `welcomeTextColor` resolves to `theme.colors.primary`, which is the same color used for the Start button background. The button may not stand out as a distinct call-to-action. Consider using a different button style (e.g. outlined, or a darker shade) on light backgrounds.

- [ ] **Memoize contrast color calculation**: `getWelcomeTextColor` recalculates on every render. Wrap in `useMemo` with `[theme.colors.background, theme.colors.primary, hasBackgroundImage]` dependencies. Low priority since the computation is cheap.
