#!/usr/bin/env python3
"""
NPB Guide — deploy the site to GitHub Pages.

Uploads every file under /Applications/baseball-site (excluding this scripts/
directory) to the repository as a SINGLE commit, using the Git Data API:

    ref -> commit -> base tree -> new tree -> new commit -> move branch

Files present in the repo but absent locally (notably CNAME, which pins the
custom domain) are left untouched, because the new tree is built on top of
the existing tree rather than replacing it.
"""
import base64
import json
import os
import sys
import urllib.error
import urllib.request

ROOT = "/Applications/baseball-site"
API = "https://api.github.com"
REPO = "ishikawaminami1113/npbguide"
BRANCH = "main"
TOKEN = ("github_pat_11A3QXDEA0xICIaWBW1jK6_DPgvNUirHCUHVeDwONG18pN2EagE6yk"
         "DIVtrsY9Poq66UPA2AM7H2WP9IKC")

HEADERS = {
    "Authorization": "Bearer " + TOKEN,
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "npbguide-deploy",
}

BINARY_EXT = {".jpg", ".jpeg", ".png", ".gif", ".ico", ".webp",
              ".woff", ".woff2", ".ttf", ".eot"}


def request(method, url, payload=None):
    body = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = urllib.request.Request(url, data=body, headers=HEADERS, method=method)
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.loads(resp.read().decode("utf-8") or "{}")
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", "replace")[:500]
        raise SystemExit("HTTP {} {} -> {}\n{}".format(exc.code, method, url, detail))


def local_files():
    """Yield (repo_path, absolute_path) for every file to publish.

    os.walk is used rather than glob because glob's wildcards skip
    dot-directories, and .well-hidden/security.txt must be published.
    """
    out = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in (".git",)]
        for name in sorted(filenames):
            if name == ".DS_Store":
                continue
            abspath = os.path.join(dirpath, name)
            rel = os.path.relpath(abspath, ROOT)
            out.append((rel.replace(os.sep, "/"), abspath))
    out.sort()
    return out


def is_binary(path):
    return os.path.splitext(path)[1].lower() in BINARY_EXT


def make_blob(abspath):
    with open(abspath, "rb") as fh:
        data = fh.read()
    payload = {
        "content": base64.b64encode(data).decode("ascii"),
        "encoding": "base64",
    }
    return request("POST", f"{API}/repos/{REPO}/git/blobs", payload)["sha"]


def main():
    files = local_files()
    print("local files:", len(files))

    # 1. Current branch tip
    ref = request("GET", f"{API}/repos/{REPO}/git/ref/heads/{BRANCH}")
    head_sha = ref["object"]["sha"]

    # 2. Commit -> base tree
    commit = request("GET", f"{API}/repos/{REPO}/git/commits/{head_sha}")
    base_tree_sha = commit["tree"]["sha"]
    print("base commit:", head_sha[:8], "tree:", base_tree_sha[:8])

    # 3. Preserve the remote CNAME (it pins the custom domain).
    cname = request("GET", f"{API}/repos/{REPO}/contents/CNAME?ref={BRANCH}")
    cname_sha = cname["sha"]
    cname_value = base64.b64decode(cname["content"]).decode().strip()
    if cname_value != "npbtourguide.com":
        raise SystemExit("remote CNAME is {!r}, expected npbtourguide.com".format(cname_value))
    print("remote CNAME: {!r} (sha {})".format(cname_value, cname_sha[:8]))

    # 4. Build the new tree entries.
    entries = []
    blobs = 0
    for rel, abspath in files:
        if rel == "CNAME":
            continue  # keep the remote one untouched
        if is_binary(abspath):
            sha = make_blob(abspath)
            blobs += 1
        else:
            with open(abspath, "rb") as fh:
                content = fh.read().decode("utf-8")
            entries.append({"path": rel, "mode": "100644",
                            "type": "blob", "content": content})
            continue
        entries.append({"path": rel, "mode": "100644", "type": "blob", "sha": sha})
    # Keep the existing CNAME entry.
    entries.append({"path": "CNAME", "mode": "100644", "type": "blob", "sha": cname_sha})
    entries.sort(key=lambda e: e["path"])
    print("binary blobs uploaded:", blobs)

    # 5. Create the new tree on top of the base tree.
    tree = request("POST", f"{API}/repos/{REPO}/git/trees",
                   {"base_tree": base_tree_sha, "tree": entries})
    new_tree_sha = tree["sha"]
    print("new tree:", new_tree_sha[:8], f"({len(entries)} entries)")

    # 6. Create the commit and move the branch.
    new_commit = request("POST", f"{API}/repos/{REPO}/git/commits", {
        "message": "Update site (deploy.py)",
        "tree": new_tree_sha,
        "parents": [head_sha],
    })
    new_commit_sha = new_commit["sha"]
    print("new commit:", new_commit_sha[:8])

    request("PATCH", f"{API}/repos/{REPO}/git/refs/heads/{BRANCH}",
            {"sha": new_commit_sha})
    print("branch {} -> {}".format(BRANCH, new_commit_sha[:8]))

    # 7. Sanity check: CNAME must still be on the branch.
    after = request("GET", f"{API}/repos/{REPO}/contents/CNAME?ref={BRANCH}")
    after_value = base64.b64decode(after["content"]).decode().strip()
    print("CNAME (still on branch):", after_value)


if __name__ == "__main__":
    main()
