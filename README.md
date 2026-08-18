# CapRover Store

A small [CapRover](https://caprover.com) one-click app repository. App definitions live next to their logos in `templates/`. [Eleventy](https://www.11ty.dev/docs/) builds that folder into the static layout CapRover expects.

Live catalog: https://bestony.github.io/caprover-repository/

CapRover third-party repository URL:

```text
https://bestony.github.io/caprover-repository
```

## How CapRover uses this repo

CapRover does not read the YAML files in git. It fetches the published site:

| URL | Purpose |
| --- | --- |
| `/v4/list` | Catalog JSON (`name`, `displayName`, `description`, `isOfficial`, `logoUrl`) |
| `/v4/apps/<name>` | Full app definition as JSON, no file extension |
| `/v4/logos/<name>.png` | App logo. `logoUrl` in the catalog is always `<name>.png` |

`npm run build` writes those files to `dist/`. Pushing `main` publishes `dist/` to GitHub Pages.

## Repository layout

```text
templates/<app-name>/
  template.yaml          # or template.yml / template.toml
  logo.png               # or logo.jpg / logo.webp
src/                     # Eleventy templates for the catalog and v4 JSON
lib/                     # load, check, and publish helpers
scripts/check-templates.js
```

The directory name is the CapRover app name. Use lowercase letters, numbers, and hyphens only (`mysql`, `mysql-backup`).

## Create a new template

1. Copy the MySQL app:

   ```bash
   cp -r templates/mysql templates/my-app
   ```

2. Replace `templates/my-app/logo.png` with the app icon. PNG is preferred. JPEG and WEBP are converted to PNG at build time.

3. Edit `templates/my-app/template.yaml`. Keep `captainVersion: 4`. CapRover only reads these service fields: `image`, `environment`, `ports`, `volumes`, `depends_on`, `hostname`, `command`, `cap_add`, plus `caproverExtra`. Other Compose keys are ignored.

4. Check the template before you commit:

   ```bash
   npm run check
   npm run check -- my-app
   ```

5. Preview the store:

   ```bash
   npm start
   ```

6. In CapRover you can either:
   - paste the YAML into **Apps → One-Click Apps/Databases → TEMPLATE**, or
   - add `https://bestony.github.io/caprover-repository` as a third-party repository after the change is on `main`.

### Required fields

```yaml
captainVersion: 4
services:
    $$cap_appname:
        image: example/app:$$cap_app_version
        caproverExtra:
            notExposeAsWebApp: 'true'   # set this for databases and other non-HTTP services
caproverOneClickApp:
    variables:
        - id: $$cap_app_version
          label: App Version
          defaultValue: '1.0.0'
          description: Docker tag to deploy
          validRegex: /^([^\s^\/])+$/
    instructions:
        start: Shown before the user fills in the form.
        end: Shown after a successful deploy. $$cap_appname is allowed here.
    displayName: My App
    isOfficial: false
    description: At most 200 characters. Shown in the CapRover catalog.
    documentation: Where this compose file came from.
```

`caproverOneClickApp.description`, `instructions.start`, `instructions.end`, and at least one service are required. Each service must set `image` **or** `caproverExtra.dockerfileLines`, not both. Put `$$cap_appname` in every service name so two installs do not collide.

### Variables

Custom variables start with `$$cap` and need `id` plus `label`. `defaultValue`, `validRegex`, and `description` are optional. If `validRegex` is omitted, CapRover allows an empty value.

Built-in tokens, available in every app:

- `$$cap_appname`
- `$$cap_root_domain`
- `$$cap_gen_random_hex(10)`

This store also rewrites these placeholders when it publishes:

- `$$store_base_url` → the public site origin
- `$$store_logo_url` → `/v4/logos/<name>.png`
- `$$store_app_url` → `/v4/apps/<name>`

Do not put a `logoUrl` in the YAML. The build always publishes the colocated logo as `/v4/logos/<name>.png`.

## Local commands

```bash
npm install
npm run check          # validate templates and prove they merge into one catalog
npm run check -- mysql # check one app
npm run test:code      # syntax + unit tests, no Eleventy build
npm test               # code tests, check, Eleventy build, dist verify
npm start              # Eleventy dev server
npm run build          # write dist/
```

`npm run check -- --strict` fails on warnings as well as errors.

The checker reports:

- missing or extra `template.*` / `logo.*` files
- YAML/TOML parse errors
- required CapRover fields and service/variable rules
- undeclared `$$cap_*` tokens
- logo type and whether the image can be decoded
- whether every valid app can be merged into one `v4/list` and one `v4/logos/<name>.png` without collisions

## Git hooks

`npm install` installs [Lefthook](https://lefthook.dev/) hooks. Each pre-commit job runs only when its files are staged, so the same work is not repeated:

| Staged files | What runs |
| --- | --- |
| `templates/**` | `npm run check`, then `npm run build` and `npm run verify` |
| `src/**` or `eleventy.config.js` | `npm run build` and `npm run verify` (skipped if a templates change already does this) |
| `lib/`, `scripts/`, `tests/`, `config.js`, or `package.json` | `npm run test:code` |

A commit that touches templates and JavaScript runs the template build path and `test:code`, not `npm test` (which would run check and build twice). Docs-only commits skip the hook. Merge and rebase commits skip it too. To run it by hand:

```bash
npx lefthook run pre-commit
```

## CI

Pull requests and pushes to `main` run **Check templates**: `npm run check` then `npm test`. A failing template (missing fields, bad logo, undeclared `$$cap_*`, catalog merge conflict) blocks the check.

Pushes to `main` also run **Deploy to GitHub Pages**: install, `npm test`, upload `dist/`, deploy Pages. That workflow sets `SITE_URL=https://bestony.github.io/caprover-repository` and `PATH_PREFIX=/caprover-repository/` so catalog links work on a project Pages site.

For a custom domain, set repository Variables `SITE_URL` and optionally `PATH_PREFIX`.
