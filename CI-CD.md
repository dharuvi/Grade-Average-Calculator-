# CI/CD, Deployment and Monitoring

Covers the DevOps practice checklist for this project.

## 1. Basic CI workflow
`.github/workflows/ci.yml` runs on every push to `main`, every pull request, and manually (`workflow_dispatch`).

## 2. Automated build/setup steps
The pipeline checks out the code, sets up Node 20, then runs `npm run build` (`scripts/build.js`), which:
1. checks that all required files exist,
2. syntax-checks every `.js` file,
3. checks `index.html` references its CSS and JS,
4. assembles the deployable site in `dist/`.

No dependencies are installed (there are none), so setup is fast and reproducible.

## 3. Automated tests in the pipeline
`npm test` (`test.js`) runs before the build. It covers two grade examples, the weighted average, the empty list and the letter-grade boundaries.

## 4. Pipeline fails on a broken test
`test.js` exits with code 1 when an assertion fails, so the `build-and-test` job fails. The `deploy` job has `needs: build-and-test`, so a red run **never deploys**.

Demonstration (see `ci-demo-log.txt` in this folder): changing `avg >= 90` to `avg > 90` in `grades.js` made the test `Boundary 90: got B, want A` fail with exit code 1.

## 5. Fix and rerun
Restoring `>= 90` made `npm run ci` pass (exit code 0). In GitHub this appears as a red ✗ run followed by a green ✓ run on the Actions tab. To reproduce it on GitHub: push a commit with the bug, watch the run fail, push the fix, watch it pass.

> Note: the log in `docs/ci-demo-log.txt` was produced by running the same commands locally, not by a GitHub runner.

## 6. Deployment / infrastructure assumptions
- **Hosting:** GitHub Pages, static files only. Set *Settings → Pages → Source: GitHub Actions* so the `deploy` job publishes `dist/`.
- **No back end:** no server, database, accounts or secrets. All data lives in the visitor's browser (`localStorage`), so it is per-device and is lost if the visitor clears site data.
- **Runtime:** any modern browser with JavaScript and `localStorage`. If `localStorage` is blocked the app still works but does not remember courses.
- **CI runner:** GitHub-hosted `ubuntu-latest` with Node 20 (free for public repositories).
- **Network:** HTTPS and CDN are provided by GitHub Pages. No third-party scripts, fonts or APIs.
- **Rollback:** revert the bad commit on `main`; the pipeline re-tests and redeploys.
- **Cost:** free.

## 7. Basic monitoring / feedback signals
| Signal | What it tells us | Where to look |
|---|---|---|
| CI status (✓/✗) on each commit | Tests or build broke | GitHub Actions tab / README badge |
| Deploy job result | Release failed or succeeded | Actions tab, Deployments |
| Site up (HTTP 200) | App reachable | Free uptime checker (e.g. UptimeRobot) on the live URL |
| Browser console errors tagged `[grade-calc]` | Unexpected runtime errors | Browser dev tools |
| GitHub Issues | User feedback and bug reports | Repo → Issues |

There is no analytics or tracking, which keeps the app private and simple.
