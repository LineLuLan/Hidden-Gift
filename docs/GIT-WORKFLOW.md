# Git Workflow — Hidden Gift

> Branch rules, commit conventions, PR flow. **DEVIATES** từ CLAUDE.md §6 — xem ADR-001 trong `docs/DECISIONS.md`.

**Last updated**: 2026-05-18

---

## Branch Model

```
main         <-- LOCKED. Chỉ scaffold push lần đầu. Vĩnh viễn không touch nữa.
  |
  v
dev          <-- Integration branch. Default working branch.
  /  \
 be    fe    <-- Feature branches per role.
```

### Rules

| Branch | Push direct | Merge target | Owner |
|--------|-------------|--------------|-------|
| `main` | NO (locked) | (none) | (frozen) |
| `dev`  | NO (PR only) | `main` (manual release tag only, hiếm) | All |
| `be`   | YES from BE Lead | `dev` (PR) | BE Lead |
| `fe`   | YES from FE Dev | `dev` (PR) | FE Dev |

### Allowed merges
- `be -> dev` (PR + CI pass)
- `fe -> dev` (PR + CI pass)
- `dev -> be` (sync, để tránh drift)
- `dev -> fe` (sync, để tránh drift)

### FORBIDDEN
- `be -> main` (NEVER)
- `fe -> main` (NEVER)
- `dev -> main` (chỉ release tag, không phải workflow thường)
- Direct push `main` (NEVER, branch protection enforce)

---

## PR Flow

### 1. Start work

```bash
# BE Lead
git checkout be
git pull origin be
git pull origin dev  # rebase với dev nếu lâu không sync
# work, commit, push
git push origin be
```

```bash
# FE Dev
git checkout fe
git pull origin fe
git pull origin dev
# work, commit, push
git push origin fe
```

### 2. Open PR

- Title: `<type>(<scope>): <subject>` (Conventional Commits, xem dưới)
- Base: `dev`. Compare: `be` hoặc `fe`.
- Fill PR template (auto-loaded từ `.github/PULL_REQUEST_TEMPLATE/`)
- Request review từ reviewer (default: BE Lead review fe, FE Dev review be)

### 3. CI runs

- `.github/workflows/ci.yml` chạy: typecheck + lint + vitest
- Block merge nếu fail

### 4. Merge

- Squash merge (preferred) — commit message format: Conventional Commits
- Delete branch sau khi merge? NO — `be` và `fe` là long-lived feature branches, KHÔNG delete.
- Sau merge, sync về `be`/`fe` từ `dev`:
  ```bash
  git checkout be
  git merge dev
  git push origin be
  ```

---

## Commit Convention

Theo Conventional Commits (CLAUDE.md §6). Format:

```
<type>(<optional scope>): <subject>

<optional body>

<optional footer>
```

### Types

| Type | Khi dùng | Ví dụ |
|------|----------|-------|
| `feat` | New feature | `feat(wishes): add createWish server action` |
| `fix` | Bug fix | `fix(rls): wrap auth.uid() in SELECT for cache` |
| `refactor` | Code change không change behavior | `refactor(lib/supabase): split client/server` |
| `chore` | Tooling, deps, configs | `chore: update Next.js to 16.2.6` |
| `docs` | Docs only | `docs(setup): add Cloudflare R2 steps` |
| `test` | Test only | `test(secrets): add RLS visibility test` |
| `style` | Format/style (no logic) | `style: prettier auto-fix` |
| `perf` | Performance improvement | `perf(memories): lazy load gallery images` |
| `build` | Build system | `build: enable React Compiler` |
| `ci` | CI config | `ci: add typecheck step` |

### Scope (optional)

- Feature area: `wishes`, `secrets`, `letters`, `memories`, `auth`, `payments`
- Layer: `db`, `rls`, `ui`, `api`
- File: `lib/supabase`, `app/(auth)`

### Examples

Good:
```
feat(secrets): asymmetric RLS policy for prepared_by
fix(auth): redirect loop on google oauth callback
docs(roadmap): mark phase 0 scaffold done
chore(deps): pin trigger.dev to v3.3.x
```

Bad:
```
update stuff           <-- no type
feat: stuff            <-- no subject detail
WIP                    <-- not a real commit
```

### Commitlint enforce

`commitlint.config.mjs` enforce qua Husky `commit-msg` hook. Commit không đúng format sẽ reject local.

---

## Branch Protection (manual setup, GitHub UI)

User cần set sau khi push branches lần đầu:

### `main`
- Require pull request before merging: YES
- Require approvals: 1
- Dismiss stale approvals: YES
- Require status checks: typecheck, lint, vitest
- Require linear history: YES
- Allow force pushes: NO
- Allow deletions: NO

### `dev`
- Require pull request before merging: YES
- Require approvals: 1
- Require status checks: typecheck, lint, vitest
- Allow force pushes: NO
- Allow deletions: NO

### `be`, `fe`
- (Không cần protection — long-lived branches của individual owners)

---

## CODEOWNERS

`.github/CODEOWNERS` map:

```
# Backend & infrastructure -> BE Lead
/lib/                  @LineLuLan
/supabase/             @LineLuLan
/trigger/              @LineLuLan
/app/api/              @LineLuLan
/.github/              @LineLuLan
/docs/                 @LineLuLan

# Frontend -> FE Dev (placeholder username -- fill khi onboard)
/app/(auth)/           @FE-Dev
/app/(app)/            @FE-Dev
/app/(marketing)/      @FE-Dev
/components/           @FE-Dev
/public/               @FE-Dev
/styles/               @FE-Dev

# Shared (any approve OK)
/*.md                  @LineLuLan @FE-Dev
/package.json          @LineLuLan @FE-Dev
```

**Action item**: BE Lead update `@FE-Dev` thành real GitHub username sau khi onboard.

---

## Common Scenarios

### Scenario A: BE và FE đụng cùng file (e.g., `lib/types.ts`)

1. Người commit trước merge vào `dev` xong.
2. Người commit sau pull `dev`, resolve conflict, push.
3. Không có conflict prevention — chỉ communication.

### Scenario B: Khẩn cấp fix bug production

1. KHÔNG hotfix trực tiếp `main` (vẫn frozen).
2. Fix trên `be` hoặc `fe`.
3. Fast-track PR vào `dev` (BE Lead approve trong 1h).
4. `dev -> main` PR tagged `release/hotfix-vX.Y.Z` (đây là exception, không phải workflow thường).
5. Vercel auto-deploy.

### Scenario C: Spec mới conflict với code đã có

1. Stop coding, open GitHub issue.
2. PM/BE Lead resolve trong `docs/DECISIONS.md` (ADR mới).
3. Update `CLAUDE.md` nếu là decision lock.
4. Resume coding.

---

## Release Process (Phase 3+)

Phase 0-2 KHÔNG có formal release. `main` chỉ touch lúc scaffold.

Phase 3+ khi có Pro tier launch:
1. `dev -> main` PR với tag `v1.0.0` (Semantic Versioning)
2. Vercel auto-deploy production
3. Tag annotated: `git tag -a v1.0.0 -m "Pro launch"`
4. Push tag: `git push origin v1.0.0`
5. GitHub Release notes auto-generate từ Conventional Commits

---

## FAQ

**Q: Tại sao không dùng `develop` như CLAUDE.md §6 gốc nói?**
A: Team đổi sang model 2-branch-per-role (`be` + `fe`) để giảm merge overhead, vì team chỉ 2 dev (1 BE + 1 FE). `dev` đóng vai trò integration tương đương `develop`. Xem ADR-001 trong `docs/DECISIONS.md`.

**Q: Sao không `git flow` chuẩn?**
A: Quá heavy cho team 2 dev. `release/*` và `hotfix/*` defer tới khi có >5 dev.

**Q: Khi nào cần update CLAUDE.md §6?**
A: Trong PR scaffold đầu tiên (Phase 0). Update inline để CLAUDE.md align với ADR-001.
