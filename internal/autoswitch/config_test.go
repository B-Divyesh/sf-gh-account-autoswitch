package autoswitch

import (
	"strings"
	"testing"
)

func TestParseConfigDocumentedExample(t *testing.T) {
	config, err := ParseConfig(`
version = 1

[[rules]]
name = "Acme work"
account = "dev@acme.example"
host = "github.com"
owner = "^acme-corp$" # inline comments are accepted

[[rules]]
name = "Personal projects"
account = "octocat"
host = "github.com"
directory = "~/src/personal/**"
`)
	if err != nil {
		t.Fatal(err)
	}
	if len(config.Rules) != 2 || config.Rules[0].Account != "dev@acme.example" {
		t.Fatalf("unexpected config: %#v", config)
	}
}

func TestParseConfigFailsClosed(t *testing.T) {
	tests := []struct{ name, input, want string }{
		{"version", `version = 2`, "version must be 1"},
		{"empty", `version = 1`, "at least one"},
		{"unknown", "version = 1\n[[rules]]\naccount=\"me\"\ntoken=\"secret\"", "unknown rule key"},
		{"no account", "version = 1\n[[rules]]\nhost=\"github.com\"", "account is required"},
		{"no matcher", "version = 1\n[[rules]]\naccount=\"me\"", "at least one matcher"},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			_, err := ParseConfig(test.input)
			if err == nil || !strings.Contains(err.Error(), test.want) {
				t.Fatalf("got %v, want error containing %q", err, test.want)
			}
		})
	}
}
