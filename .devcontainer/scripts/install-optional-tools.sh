#!/usr/bin/env bash
set -uo pipefail

# Optional supply-chain tools for the hardened devcontainer.
# Pinned versions + correct release asset names; sha256 verified against the
# checksums file published in each release (skipped with a warning if absent).
# Each tool step is isolated so a single failure never aborts the rest — this
# script must NOT block container startup.

BIN_DIR="${HOME}/.local/bin"
mkdir -p "${BIN_DIR}"

step() { printf '\n\033[1m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[33mwarning: %s\033[0m\n' "$*"; }

# Curated set; override via OPTIONAL_TOOLS (comma-separated) in devcontainer.json.
SELECTED="$(printf '%s' "${OPTIONAL_TOOLS:-gitleaks,syft,grype,osv-scanner,uv}" \
            | tr ',' '\n' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
want() { printf '%s\n' "${SELECTED}" | grep -qx "$1"; }

# sha256_verify <file> <asset-name>
sha256_verify() {
  local file="$1" asset="$2"
  local expected="" actual=""
  [ -f "${SUMS_FILE}" ] || { warn "no checksums file downloaded for ${asset}; skipping verification"; return 0; }
  expected="$(grep -w "${asset}" "${SUMS_FILE}" | awk '{print $1}')"
  [ -n "${expected}" ] || { warn "no checksums entry for ${asset}; skipping verification"; return 0; }
  actual="$(sha256sum "${file}" | awk '{print $1}')"
  if [ "${expected}" != "${actual}" ]; then
    echo "sha256 mismatch for ${asset}: expected ${expected}, got ${actual}" >&2
    return 1
  fi
  echo "sha256 verified: ${asset}"
}

# fetch_verify <tool> <url> <asset> <checksums-url> [strip-components]
fetch_verify() {
  local tool
  tool="$1"
  local url="$2" asset="$3" checksums_url="$4" strip="${5:-0}"
  local dest="${BIN_DIR}/${tool}" tmp="${BIN_DIR}/.tmp-${tool}"
  SUMS_FILE=""
  rm -rf "${tmp}"
  mkdir -p "${tmp}"
  curl -sSfL -o "${tmp}/${asset}" "${url}" || { warn "${tool}: download failed"; rm -rf "${tmp}"; return 1; }
  if curl -sSfL -o "${tmp}/SUMS" "${checksums_url}" 2>/dev/null; then
    SUMS_FILE="${tmp}/SUMS"
  fi
  sha256_verify "${tmp}/${asset}" "${asset}" || { rm -rf "${tmp}"; return 1; }
  if [[ "${asset}" == *.gz ]]; then
    tar -xzf "${tmp}/${asset}" -C "${tmp}" ${strip:+--strip-components=${strip}} \
      || { warn "${tool}: extract failed"; rm -rf "${tmp}"; return 1; }
    if [ ! -f "${tmp}/${tool}" ]; then
      warn "${tool}: binary not found after extraction"; rm -rf "${tmp}"; return 1
    fi
    mv "${tmp}/${tool}" "${dest}"
  else
    mv "${tmp}/${asset}" "${dest}"
  fi
  chmod +x "${dest}"
  rm -rf "${tmp}"
  echo "${tool}: installed -> ${dest}"
}

failures=0

if want gitleaks; then
  if command -v gitleaks >/dev/null 2>&1; then
    step "gitleaks: present"
  else
    step "gitleaks: installing (pinned v8.30.1, matches host scanner)"
    fetch_verify gitleaks \
      "https://github.com/gitleaks/gitleaks/releases/download/v8.30.1/gitleaks_8.30.1_linux_x64.tar.gz" \
      "gitleaks_8.30.1_linux_x64.tar.gz" \
      "https://github.com/gitleaks/gitleaks/releases/download/v8.30.1/gitleaks_8.30.1_checksums.txt" \
      || failures=$((failures + 1))
  fi
fi

if want syft; then
  if command -v syft >/dev/null 2>&1; then
    step "syft: present"
  else
    step "syft: installing (pinned v1.51.1)"
    fetch_verify syft \
      "https://github.com/anchore/syft/releases/download/v1.51.1/syft_1.51.1_linux_amd64.tar.gz" \
      "syft_1.51.1_linux_amd64.tar.gz" \
      "https://github.com/anchore/syft/releases/download/v1.51.1/syft_1.51.1_checksums.txt" \
      || failures=$((failures + 1))
  fi
fi

if want grype; then
  if command -v grype >/dev/null 2>&1; then
    step "grype: present"
  else
    step "grype: installing (pinned v0.118.0)"
    fetch_verify grype \
      "https://github.com/anchore/grype/releases/download/v0.118.0/grype_0.118.0_linux_amd64.tar.gz" \
      "grype_0.118.0_linux_amd64.tar.gz" \
      "https://github.com/anchore/grype/releases/download/v0.118.0/grype_0.118.0_checksums.txt" \
      || failures=$((failures + 1))
  fi
fi

if want osv-scanner; then
  if command -v osv-scanner >/dev/null 2>&1; then
    step "osv-scanner: present"
  else
    step "osv-scanner: installing (pinned v2.5.1, matches host scanner)"
    fetch_verify osv-scanner \
      "https://github.com/google/osv-scanner/releases/download/v2.5.1/osv-scanner_linux_amd64" \
      "osv-scanner_linux_amd64" \
      "https://github.com/google/osv-scanner/releases/download/v2.5.1/osv-scanner_SHA256SUMS" \
      || failures=$((failures + 1))
  fi
fi

if want uv; then
  if command -v uv >/dev/null 2>&1; then
    step "uv: present"
  else
    step "uv: installing (pinned 0.12.8, direct release — no pipe-to-shell)"
    fetch_verify uv \
      "https://github.com/astral-sh/uv/releases/download/0.12.8/uv-x86_64-unknown-linux-gnu.tar.gz" \
      "uv-x86_64-unknown-linux-gnu.tar.gz" \
      "https://github.com/astral-sh/uv/releases/download/0.12.8/uv-x86_64-unknown-linux-gnu.tar.gz.sha256" \
      1 \
      || failures=$((failures + 1))
    if command -v uv >/dev/null 2>&1; then
      ln -sf "${BIN_DIR}/uv" "${BIN_DIR}/uvx" 2>/dev/null || true
    fi
  fi
fi

if [ "${failures}" -gt 0 ]; then
  echo "" >&2
  echo "[install-optional-tools] ${failures} tool(s) failed to install (see warnings). Container start continues." >&2
fi

step "Done. Re-run (or docker rebuild) to re-attempt missing tools."
exit 0