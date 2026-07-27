# Deploy to GitHub Pages

This site is plain HTML, CSS, and JavaScript. It has no build step. Hash routes such as `#coding` stay in the browser, so GitHub Pages can serve it directly from the repository root.

## 1. Create an empty GitHub repository

1. Sign in at [github.com](https://github.com/).
2. Open **New repository** from the `+` menu.
3. Choose a name, for example `ml-cv-interview-prep`.
4. Set visibility to **Public**. GitHub Pages is free for public repositories.
5. Leave **Add a README**, `.gitignore`, and license unchecked. This local repository already has its own history.
6. Select **Create repository**.
7. Copy the repository's **HTTPS** URL. It looks like:

   ```text
   https://github.com/<github-user>/<repo>.git
   ```

Why empty? If GitHub creates a README first, the remote and local repositories start with unrelated commits and the first push needs an unnecessary merge.

## 2. Connect this local repository

Run these commands from the directory that contains `index.html`:

```bash
git branch --show-current
git remote add origin https://github.com/<github-user>/<repo>.git
git remote -v
```

The branch used for Pages should be `main`. If the first command prints another branch after local work is merged, rename it before the first push:

```bash
git branch -M main
```

`origin` is the conventional name for the hosted copy. The final command is a safety check: both fetch and push URLs should point at the new repository.

## 3. Authenticate and push over HTTPS

On macOS, store the credential in Keychain:

```bash
git config --global credential.helper osxkeychain
git push -u origin main
```

GitHub may open a browser sign-in flow. If Git asks in the terminal:

- **Username:** your GitHub username.
- **Password:** use a GitHub Personal Access Token, not your account password.

Create a token at **GitHub → Settings → Developer settings → Personal access tokens**. A fine-grained token only needs access to this repository and **Contents: Read and write**. Treat the token like a password. Do not paste it into a command, commit it, or save it in this project. The credential helper stores the successful credential in macOS Keychain.

The `-u` option records `origin/main` as the upstream. Future releases are then just:

```bash
git add <changed-files>
git commit -m "Describe the change"
git push
```

### Authentication alternatives

**GitHub CLI:** install `gh`, then run `gh auth login`. Choose GitHub.com, HTTPS, and browser authentication. Afterwards, normal `git push` works.

**SSH:** add an SSH key to GitHub, change the remote, and push:

```bash
git remote set-url origin git@github.com:<github-user>/<repo>.git
git push -u origin main
```

HTTPS is the shortest first-deploy path on this machine because it needs neither `gh` nor an existing SSH key.

## 4. Enable GitHub Pages

After the push:

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Select branch **main** and folder **/(root)**.
5. Select **Save**.
6. Wait for the Pages deployment to finish. GitHub shows the live URL on this screen; the Actions tab also shows the `pages build and deployment` run.

For a project repository, the URL is normally:

```text
https://<github-user>.github.io/<repo>/
```

Open the URL from the Pages settings rather than guessing it. Account capitalization and repository naming can differ from local assumptions.

## 5. Verify the live site

Check these paths and behaviors on the HTTPS Pages URL:

1. The landing page renders with no missing styles.
2. Navigate through every sidebar route, including `#coding`, `#system-design`, `#behavioral`, `#mocks`, and `#data`.
3. Reload while on a hash route. The same route should return because the part after `#` never reaches the server.
4. Change the theme, reload, and confirm it persists.
5. Add a small inventory record, reload, and confirm local progress persists.
6. Export a backup from **Data & settings**, then import it.
7. Test at a narrow/mobile width and open the navigation menu.
8. Open browser developer tools. The Console should have no errors and the Network panel should have no 404 responses.

All asset links are relative (`styles.css`, `app.js`, and the data scripts), so they work under the project subpath `/<repo>/`. If an asset ever 404s, look for a newly introduced URL beginning with `/`; change it to a relative path instead of adding a `<base>` tag.

Progress is stored in that browser's `localStorage`. A new device, private window, cleared site data, or a different origin starts with empty progress. Use export/import to move progress. Deploying new files does not erase existing progress as long as the Pages origin stays the same.

## Custom domain later

In **Settings → Pages → Custom domain**, enter the domain and follow GitHub's DNS instructions. Verify the domain before enabling **Enforce HTTPS**. Keep the GitHub Pages URL working until DNS has propagated. Changing the origin means browsers treat it as a different localStorage location, so export progress before moving and import it on the custom domain.

## Vercel alternative

Vercel can host the same repository without a build configuration.

### Dashboard

1. Sign in to Vercel with GitHub.
2. Select **Add New → Project** and import this repository.
3. Choose **Other** as the framework preset if prompted.
4. Leave the build command empty and publish/output directory as `.`.
5. Deploy and verify the generated HTTPS URL with the checklist above.

### CLI

```bash
npm install -g vercel
vercel
vercel --prod
```

Choose the current directory, no framework, no build command, and `.` as the output directory. Hash routing needs no rewrite rule on Vercel either.

GitHub Pages remains the default for this project: one existing account, no extra service, branch-based publishing, and a simple path to a custom domain.
