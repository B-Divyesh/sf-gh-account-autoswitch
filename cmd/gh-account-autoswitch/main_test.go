package main

import (
	"bytes"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestWhichDocumentedExample(t *testing.T) {
	dir := t.TempDir()
	repoDir := filepath.Join(dir, "payments")
	if err := os.Mkdir(repoDir, 0o700); err != nil {
		t.Fatal(err)
	}
	configPath := filepath.Join(dir, "accounts.toml")
	content := "version = 1\n[[rules]]\nname = \"Acme work\"\naccount = \"dev@acme.example\"\ndirectory = \"" + filepath.ToSlash(dir) + "/**\"\n"
	if err := os.WriteFile(configPath, []byte(content), 0o600); err != nil {
		t.Fatal(err)
	}
	var stdout, stderr bytes.Buffer
	err := execute([]string{"--config", configPath, "--cwd", repoDir, "which"}, &stdout, &stderr)
	if err != nil {
		t.Fatal(err)
	}
	for _, want := range []string{"Account:   dev@acme.example", "Rule:      Acme work (#1)", "Remote:    none (directory rule)"} {
		if !strings.Contains(stdout.String(), want) {
			t.Errorf("output missing %q:\n%s", want, stdout.String())
		}
	}
}

func TestWhichJSON(t *testing.T) {
	dir := t.TempDir()
	configPath := filepath.Join(dir, "accounts.toml")
	content := "version = 1\n[[rules]]\naccount = \"personal\"\ndirectory = \"**\"\n"
	if err := os.WriteFile(configPath, []byte(content), 0o600); err != nil {
		t.Fatal(err)
	}
	var stdout bytes.Buffer
	if err := execute([]string{"which", "--json", "--config", configPath, "--cwd", dir}, &stdout, &bytes.Buffer{}); err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(stdout.String(), `"account":"personal"`) || strings.Contains(stdout.String(), "token") {
		t.Fatalf("unexpected JSON: %s", stdout.String())
	}
}

func TestHelpIsDefault(t *testing.T) {
	var stdout bytes.Buffer
	if err := execute(nil, &stdout, &bytes.Buffer{}); err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(stdout.String(), "Exit codes:") {
		t.Fatalf("help is incomplete: %s", stdout.String())
	}
}
