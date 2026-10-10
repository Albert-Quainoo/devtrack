# Verification

## Automated data tests

Run `npm test`. Five test groups verify:

1. Project creation/editing and combined case-insensitive search/status filters.
2. Rejection of blank/overlong names, invalid status/date and missing edit targets.
3. Task validation and completion percentage including zero tasks.
4. Project deletion removes only associated tasks.
5. Storage roundtrip and rejection of malformed saved data.

## Browser acceptance checklist

- Visit all five pages using navigation; active link follows the page.
- Create a project, edit details and status, and refresh to check persistence.
- Try an empty name and whitespace-only name; neither creates a project.
- Search by name and description; combine with status and clear filters.
- Add two tasks to a project; complete one and check dashboard progress is 50%.
- Reopen a completed task, filter by project/open/completed, and delete a task.
- Cancel project deletion first; then accept and verify associated tasks disappear.
- Enter `<img src=x onerror=alert(1)>` as a name; it must render as text.
- Check at 390px and 1440px widths for horizontal overflow and usable controls.
- Use keyboard to open/close the dialog and navigate controls.
- Check browser console for errors.
- Open a second tab, save in the first, and confirm the second refreshes.

Results will be recorded below after browser verification.

## Verification record — 10 October 2026

- **Pass:** all five automated data test groups; JavaScript syntax checks.
- **Pass in browser:** Home, Projects, Tasks and Dashboard navigation; project create/edit; refresh persistence; whitespace validation; case-insensitive description search combined with status filtering; no-results state; task creation; completion and reopening; completed-task filtering; correct 1/2 = 50% dashboard progress and counts.
- **Pass:** phone-width task DOM reported scroll width equal to viewport width; task controls remained usable. Desktop and phone screenshots were inspected, though the in-app screenshot capture cropped part of its viewport.
- **Pass:** no captured browser console warning/error entries during these workflows.
- **Limitation:** browser automation stalled while opening the native task deletion confirmation. Browser accept/cancel and cascading deletion remain on the manual checklist; cascade behavior passed the data test.
- **Not yet exercised in browser:** blocked/full storage, cross-tab refresh, malicious-looking input, and complete keyboard-only navigation. Escaped rendering and storage failure behavior were reviewed in the source; this is not a full accessibility audit.

- **Hosting verified:** GitHub Pages build succeeded. All five pages and three shared CSS/JS assets returned HTTP 200. Hosted Home/About/Projects navigation and project creation surviving refresh were checked in the browser.
