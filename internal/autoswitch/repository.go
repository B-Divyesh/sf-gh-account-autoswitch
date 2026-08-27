package autoswitch

import (
	"fmt"
	"net/url"
	"os/exec"
	"path/filepath"
	"strings"
)

type CommandRunner interface {
	Output(name string, args ...string) ([]byte, error)
}

type ExecRunner struct{}

func (ExecRunner) Output(name string, args ...string) ([]byte, error) {
	return exec.Command(name, args...).Output()
}

func InspectRepository(cwd string, runner CommandRunner) (Repository, error) {
	abs, err := filepath.Abs(cwd)
	if err != nil {
		return Repository{}, fmt.Errorf("resolve working directory: %w", err)
	}
	repo := Repository{Directory: filepath.Clean(abs)}
	remote, err := gitRemote(abs, runner)
	if err != nil {
		return repo, nil // Directory-only rules intentionally work outside git repositories.
	}
	repo.RemoteURL = remote
	host, owner, name, err := ParseRemote(remote)
	if err != nil {
		return Repository{}, fmt.Errorf("parse git remote %q: %w", remote, err)
	}
	repo.Host, repo.Owner, repo.Name = host, owner, name
	repo.Canonical = strings.Join([]string{host, owner, name}, "/")
	return repo, nil
}

func gitRemote(cwd string, runner CommandRunner) (string, error) {
	if value, err := runner.Output("git", "-C", cwd, "remote", "get-url", "origin"); err == nil {
		return strings.TrimSpace(string(value)), nil
	}
	names, err := runner.Output("git", "-C", cwd, "remote")
	if err != nil {
		return "", err
	}
	fields := strings.Fields(string(names))
	if len(fields) == 0 {
		return "", fmt.Errorf("repository has no remotes")
	}
	value, err := runner.Output("git", "-C", cwd, "remote", "get-url", fields[0])
	if err != nil {
		return "", err
	}
	return strings.TrimSpace(string(value)), nil
}

func ParseRemote(raw string) (host, owner, name string, err error) {
	raw = strings.TrimSpace(raw)
	if !strings.Contains(raw, "://") && strings.Contains(raw, ":") {
		// SCP-style SSH syntax: git@host:owner/repo.git.
		at := strings.LastIndex(raw, "@")
		colon := strings.Index(raw, ":")
		if colon > at {
			host = raw[at+1 : colon]
			return remoteParts(host, raw[colon+1:])
		}
	}
	parsed, parseErr := url.Parse(raw)
	if parseErr != nil || parsed.Hostname() == "" {
		return "", "", "", fmt.Errorf("unsupported URL")
	}
	return remoteParts(parsed.Hostname(), strings.TrimPrefix(parsed.Path, "/"))
}

func remoteParts(host, path string) (string, string, string, error) {
	parts := strings.Split(strings.TrimSuffix(strings.Trim(path, "/"), ".git"), "/")
	if len(parts) < 2 || host == "" {
		return "", "", "", fmt.Errorf("expected host/owner/repository")
	}
	return strings.ToLower(host), parts[len(parts)-2], parts[len(parts)-1], nil
}
