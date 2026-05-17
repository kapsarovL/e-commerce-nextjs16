BASE_URL="${1:-https://yourapp.com}"
PASS=0
FAIL=0

check() {
  local desc="$1"
  local expected="$2"
  local actual="$3"

  if echo "$actual" | grep -qi "$expected"; then
    echo "  ✅ $desc"
    PASS=$((PASS + 1))
  else
    echo "  ❌ $desc (expected '$expected', got '$(echo $actual | tr -d '\n')')"
    FAIL=$((FAIL + 1))
  fi
}

echo "\n── Text compression ──────────────────────────────────"

JS_HEADERS=$(curl -sI -H "Accept-Encoding: br, gzip" \
  "$BASE_URL/_next/static/chunks/" 2>/dev/null || \
  curl -sI -H "Accept-Encoding: br, gzip" "$BASE_URL/" )

HTML_ENC=$(curl -sI -H "Accept-Encoding: br, gzip" "$BASE_URL/" | grep -i content-encoding)
check "HTML served with Brotli" "br" "$HTML_ENC"

echo "\n── Image format negotiation ──────────────────────────"

IMG_URL="$BASE_URL/_next/image?url=%2Fimages%2Fhero.jpg&w=1200&q=75"

AVIF_CT=$(curl -sI -H "Accept: image/avif,image/webp,*/*" "$IMG_URL" | grep -i content-type)
check "AVIF served when requested" "avif" "$AVIF_CT"

WEBP_CT=$(curl -sI -H "Accept: image/webp,*/*" "$IMG_URL" | grep -i content-type)
check "WebP served as fallback" "webp" "$WEBP_CT"

VARY=$(curl -sI -H "Accept: image/avif" "$IMG_URL" | grep -i "^vary")
check "Vary: Accept header present" "Accept" "$VARY"

echo "\n── Summary ───────────────────────────────────────────"
echo "  Passed: $PASS  Failed: $FAIL"
[ $FAIL -eq 0 ] && echo "  All checks passed." || echo "  Fix failures before shipping."