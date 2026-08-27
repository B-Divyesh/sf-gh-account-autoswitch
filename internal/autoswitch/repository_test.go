package autoswitch

import "testing"

func TestParseRemoteForms(t *testing.T) {
	tests := map[string]Repository{
		"git@github.com:acme/payments.git":                {Host: "github.com", Owner: "acme", Name: "payments"},
		"https://github.com/octocat/hello-world.git":      {Host: "github.com", Owner: "octocat", Name: "hello-world"},
		"ssh://git@github.corp.example:2222/team/app.git": {Host: "github.corp.example", Owner: "team", Name: "app"},
	}
	for input, want := range tests {
		host, owner, name, err := ParseRemote(input)
		if err != nil {
			t.Errorf("ParseRemote(%q): %v", input, err)
			continue
		}
		if host != want.Host || owner != want.Owner || name != want.Name {
			t.Errorf("ParseRemote(%q) = %s/%s/%s, want %s/%s/%s", input, host, owner, name, want.Host, want.Owner, want.Name)
		}
	}
}

func TestParseRemoteRejectsIncompleteURL(t *testing.T) {
	if _, _, _, err := ParseRemote("https://github.com/only-owner"); err == nil {
		t.Fatal("expected incomplete remote to fail")
	}
}
