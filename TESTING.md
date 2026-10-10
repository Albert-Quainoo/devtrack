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
