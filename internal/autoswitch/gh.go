package autoswitch

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"
	"strings"
)

func FindGH() (string, error) {
	if path := os.Getenv("GH_AUTOSWITCH_GH"); path != "" {
		info, err := os.Stat(path)
		if err != nil || info.IsDir() {
			return "", usageError("GH_AUTOSWITCH_GH does not point to a gh binary: %s", path)
		}
		return path, nil
	}
	path, err := exec.LookPath("gh")
	if err != nil {
		return "", usageError("real gh binary not found in PATH; install GitHub CLI first")
	}
	return path, nil
}

func GetToken(ghPath string, selection Selection) (string, error) {
	command := exec.Command(ghPath, "auth", "token", "--hostname", selection.Host, "--user", selection.Account)
	command.Env = cleanTokenEnv(os.Environ())
	var stderr bytes.Buffer
	command.Stderr = &stderr
	value, err := command.Output()
	if err != nil {
		detail := strings.TrimSpace(stderr.String())
		if detail == "" {
			detail = err.Error()
		}
		return "", tokenError("could not get a token for %s on %s: %s; run `gh auth login --hostname %s`", selection.Account, selection.Host, detail, selection.Host)
	}
	token := strings.TrimSpace(string(value))
	if token == "" {
		return "", tokenError("gh returned an empty token for %s on %s", selection.Account, selection.Host)
	}
	return token, nil
}

func RunGH(ghPath string, selection Selection, token string, args []string) error {
	command := exec.Command(ghPath, args...)
	command.Stdin, command.Stdout, command.Stderr = os.Stdin, os.Stdout, os.Stderr
	env := cleanTokenEnv(os.Environ())
	key := "GH_ENTERPRISE_TOKEN"
	if strings.EqualFold(selection.Host, "github.com") {
		key = "GH_TOKEN"
	}
	command.Env = append(env, fmt.Sprintf("%s=%s", key, token))
	if err := command.Run(); err != nil {
		if exit, ok := err.(*exec.ExitError); ok {
			return &ExitError{Code: exit.ExitCode(), Err: fmt.Errorf("gh exited with status %d", exit.ExitCode())}
		}
		return usageError("run gh: %v", err)
	}
	return nil
}

func cleanTokenEnv(env []string) []string {
	clean := make([]string, 0, len(env))
	for _, entry := range env {
		key := strings.SplitN(entry, "=", 2)[0]
		if key != "GH_TOKEN" && key != "GH_ENTERPRISE_TOKEN" {
			clean = append(clean, entry)
		}
	}
	return clean
}
