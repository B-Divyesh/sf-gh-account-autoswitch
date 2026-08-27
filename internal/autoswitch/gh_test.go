package autoswitch

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestCleanTokenEnv(t *testing.T) {
	clean := cleanTokenEnv([]string{"PATH=/bin", "GH_TOKEN=one", "OTHER_GH_TOKEN=keep", "GH_ENTERPRISE_TOKEN=two"})
	if len(clean) != 2 || clean[0] != "PATH=/bin" || clean[1] != "OTHER_GH_TOKEN=keep" {
		t.Fatalf("unexpected environment: %#v", clean)
	}
}

func TestTokenAndRunUseOnlyChildEnvironment(t *testing.T) {
	dir := t.TempDir()
	output := filepath.Join(dir, "child-env")
	script := filepath.Join(dir, "gh")
	body := `#!/bin/sh
if [ "$1" = "auth" ]; then
  if [ -n "$GH_TOKEN" ] || [ -n "$GH_ENTERPRISE_TOKEN" ]; then exit 9; fi
  printf 'selected-secret\n'
  exit 0
fi
printf '%s|%s|%s' "$GH_TOKEN" "$GH_ENTERPRISE_TOKEN" "$*" > "$AUTOSWITCH_TEST_OUTPUT"
`
	if err := os.WriteFile(script, []byte(body), 0o700); err != nil {
		t.Fatal(err)
	}
	t.Setenv("GH_TOKEN", "inherited-secret")
	t.Setenv("GH_ENTERPRISE_TOKEN", "inherited-enterprise-secret")
	t.Setenv("AUTOSWITCH_TEST_OUTPUT", output)
	selection := Selection{Account: "work", Host: "github.com"}
	token, err := GetToken(script, selection)
	if err != nil {
		t.Fatal(err)
	}
	if token != "selected-secret" {
		t.Fatalf("unexpected token value %q", token)
	}
	if err := RunGH(script, selection, token, []string{"repo", "view"}); err != nil {
		t.Fatal(err)
	}
	data, err := os.ReadFile(output)
	if err != nil {
		t.Fatal(err)
	}
	if got := string(data); got != "selected-secret||repo view" || strings.Contains(got, "inherited") {
		t.Fatalf("unexpected child environment %q", got)
	}
}
