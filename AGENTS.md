<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Water risk logic lives only in `src/lib/risk.ts` as a documented rule-based prototype (not ML); keep tests in `src/test/risk.test.ts` in sync — honesty about method is a product requirement.
- Readings/alerts are client-side (demo seed + localStorage via `src/lib/store.tsx`) so the demo works offline without a backend.
- All UI strings go through `src/lib/i18n.tsx` dictionaries; add languages there.
