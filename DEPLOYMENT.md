# GitHub Pages deployment

This app needs static hosting only. All asset and page links are relative, so it works under a repository subpath. `.nojekyll` disables Jekyll processing.

## Publish with GitHub CLI

If the repository has not yet been created, run from this project folder:

```sh
gh auth login
git init -b main
git add .
git commit -m "Build DevTrack project planner"
gh repo create devtrack --public --source=. --remote=origin --push
gh api --method POST repos/Albert-Quainoo/devtrack/pages -f 'source[branch]=main' -f 'source[path]=/'
```

For later updates: `git add .`, `git commit -m "Describe your changes"`, and `git push`.

## Publish through the website

1. Create a public repository named `devtrack` and upload this folder's contents, with `index.html` at the repository root.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select **main** and **/(root)**, then save.
5. Wait for the Pages deployment to finish. Open the URL shown in Settings.
6. Test all five pages, create a project and task, and refresh to confirm persistence.

Expected URL for this account: https://Albert-Quainoo.github.io/devtrack/

GitHub Free supports Pages for public repositories. Creating a public repository makes source and submission materials visible. The user requested repository creation, pushing, and public hosting; account sign-in or a network permission prompt may still be required by the environment. No paid service is needed.

Official reference: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
