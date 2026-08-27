package autoswitch

import (
	"strings"
	"testing"
)

type staticRunner struct {
	value string
	err   error
}

func (runner staticRunner) Output(string, ...string) ([]byte, error) {
	return []byte(runner.value), runner.err
}

func TestDiscoverAccountsAndRenderParseableConfig(t *testing.T) {
	accounts, err := DiscoverAccounts("gh", staticRunner{value: `{"hosts":{"github.com":[{"login":"octo.cat"},{"login":"work"}],"github.corp.example":[{"login":"agent"}]}}`})
	if err != nil {
		t.Fatal(err)
	}
	if len(accounts) != 3 || accounts[0].Host != "github.com" || accounts[0].Login != "octo.cat" {
		t.Fatalf("unexpected accounts: %#v", accounts)
	}
	text := RenderConfig(accounts)
	if !strings.Contains(text, `owner = "^octo\\.cat$"`) {
		t.Fatalf("login was not regexp-escaped:\n%s", text)
	}
	if _, err := ParseConfig(text); err != nil {
		t.Fatalf("rendered config is invalid: %v\n%s", err, text)
	}
}
