package autoswitch

import (
	"errors"
	"path/filepath"
	"testing"
)

func TestSelectUsesFirstCompleteMatch(t *testing.T) {
	repo := Repository{Directory: filepath.FromSlash("/src/acme/payments"), Host: "github.com", Owner: "acme-corp", Name: "payments", Canonical: "github.com/acme-corp/payments"}
	config := Config{Version: 1, Rules: []Rule{
		{Name: "other host", Account: "nope", Host: "github.example"},
		{Name: "work", Account: "dev@acme.example", Host: "GITHUB.COM", Owner: "^acme-corp$", Remote: `/payments$`},
		{Name: "fallback", Account: "personal", Host: "github.com"},
	}}
	selection, err := Select(config, repo)
	if err != nil {
		t.Fatal(err)
	}
	if selection.Account != "dev@acme.example" || selection.RuleIndex != 2 || selection.Host != "github.com" {
		t.Fatalf("unexpected selection: %#v", selection)
	}
}

func TestSelectDirectoryGlobWithoutRemote(t *testing.T) {
	repo := Repository{Directory: filepath.FromSlash("/src/personal/tools")}
	config := Config{Version: 1, Rules: []Rule{{Account: "personal", Directory: filepath.FromSlash("/src/personal/**")}}}
	selection, err := Select(config, repo)
	if err != nil {
		t.Fatal(err)
	}
	if selection.Account != "personal" || selection.Host != "github.com" {
		t.Fatalf("unexpected selection: %#v", selection)
	}
}

func TestSelectNoMatchHasExitCodeThree(t *testing.T) {
	_, err := Select(Config{Rules: []Rule{{Account: "work", Host: "github.com"}}}, Repository{Directory: "/tmp"})
	var exit *ExitError
	if !errors.As(err, &exit) || exit.Code != 3 {
		t.Fatalf("got %v, want exit code 3", err)
	}
}

func TestSelectRejectsBadRegex(t *testing.T) {
	_, err := Select(Config{Rules: []Rule{{Account: "work", Owner: "["}}}, Repository{})
	var exit *ExitError
	if !errors.As(err, &exit) || exit.Code != 2 {
		t.Fatalf("got %v, want exit code 2", err)
	}
}
