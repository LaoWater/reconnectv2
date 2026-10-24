# Deploying Re-Connect

Copy-paste guide for deploying the site to Google App Engine from the Mac.

| | |
|---|---|
| Google Cloud project | `reconnectv2` |
| Service | `default` (App Engine standard, `python312`, region `europe-west1`) |
| Live domain | https://reconnect-course.com |
| Version URLs | `https://VERSION_ID-dot-reconnectv2.ew.r.appspot.com` |

The flow is always: **build → deploy without traffic → test → switch traffic**. The previous
version keeps running until you switch, so a bad deploy never reaches visitors and rollback is one command.

---

## 0. Files git does not carry (check once per machine)

These live only on the deploying machine. They are git-ignored on purpose: never commit them.

| File (relative to repo root) | What it is |
|---|---|
| `app.yaml` | App Engine config, including the environment variables below |
| `.env` | Read by `settings.py` (`EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, …) |
| `static/other/reconnectv2-d46d6-firebase-adminsdk-lbxc6-6c57cc8259.json` | Firebase admin key (loaded by `firebase_config.py` at startup — the app crashes without it) |
| `static/other/reconnectv2-64cc06c747d9.json` | Google Cloud service-account key |

Environment variables the live version had in `app.yaml` (names only):
`DJANGO_SECRET_KEY`, `DJANGO_SETTINGS_MODULE`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
`OPENAI_API_KEY`, `SECRET_KEY_DB_EXPORT`.

Quick check that they are all present:

```bash
ls -la app.yaml .env static/other/
```

---

## 1. Get the code

```bash
cd ~/path/to/reconnectv2
git fetch origin
git checkout dawn-redesign      # or main, once the branch is merged
git pull
```

## 2. Python environment

```bash
python3 -m venv venv            # first time only
source venv/bin/activate
pip install -r requirements.txt
```

## 3. Build the static files (every deploy)

App Engine serves `/static/` from the `staticfiles/` folder (see the handler in `app.yaml`),
not from `landing_page/static/`. If you skip this, the new CSS/JS/images will not go live.

```bash
python manage.py collectstatic --noinput
```

## 4. Optional local check

```bash
python manage.py check
python manage.py runserver      # then open http://127.0.0.1:8000/ro/
```

## 5. Deploy a new version without traffic

```bash
gcloud auth login               # only if gcloud asks
VERSION=dawn-$(date +%Y%m%d-%H%M)
gcloud app deploy app.yaml --project reconnectv2 --version "$VERSION" --no-promote
```

## 6. Test the new version before anyone sees it

```bash
gcloud app versions list --project reconnectv2
open "https://$VERSION-dot-reconnectv2.ew.r.appspot.com/ro/"
```

Walk through: `/ro/`, `/en/`, `/ylf/`, `/bibliography/`, `/food-prophet/`, `/contact/`.

> The YLF chat will answer **403 on the version URL** — that is expected: Django only trusts
> the real domains (`CSRF_TRUSTED_ORIGINS` in `reconnect_v2/settings.py`). Test the chat in step 8.

## 7. Send all traffic to the new version

```bash
gcloud app services set-traffic default --splits "$VERSION"=1 --project reconnectv2
```

## 8. Check the live site

1. Open https://reconnect-course.com/ro/ and hard-reload (Cmd+Shift+R).
2. Open https://reconnect-course.com/ylf/, send a message, and confirm you get an answer (no 403).

## 9. Keep `main` matching production

After a good deploy, merge the deployed branch into `main` (pull request on GitHub, or):

```bash
git checkout main && git pull && git merge --no-ff dawn-redesign && git push
```

---

## Roll back

Send traffic back to the previous version (find its id with `gcloud app versions list`):

```bash
gcloud app versions list --project reconnectv2
gcloud app services set-traffic default --splits PREVIOUS_VERSION_ID=1 --project reconnectv2
```

Before the dawn redesign, the live version was `20260515t034443`.

## Tidy old versions (saves money)

The service uses automatic scaling with `minInstances: 1`, so **every serving version keeps one
instance running, even with no traffic**. A few days after a good deploy, stop (or delete) the old ones:

```bash
gcloud app versions list --project reconnectv2
gcloud app versions stop OLD_VERSION_ID --project reconnectv2
# or, to remove it entirely:
gcloud app versions delete OLD_VERSION_ID --project reconnectv2
```

---

## Notes

- **Moving to a new domain?** Add it (with `https://`) to `CSRF_TRUSTED_ORIGINS` in
  `reconnect_v2/settings.py`, or every chat / login / form POST fails with
  "Origin checking failed".
- **`DEBUG = True` in `settings.py` also runs in production.** It shows Django internals on any
  error page. Consider turning it off for production.
- Stylesheet links carry a `?v=…` stamp (e.g. `?v=20261024-dawn`). When you change a CSS file,
  bump its stamp in the template so returning visitors don't keep the old file from cache.
