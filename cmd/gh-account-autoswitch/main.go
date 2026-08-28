package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"

	"github.com/B-Divyesh/sf-gh-account-autoswitch/internal/autoswitch"
)

const version = "0.1.0"

type options struct {
	config string
	cwd    string
	json   bool
	dryRun bool
	force  bool
}

func main() {
	if err := execute(os.Args[1:], os.Stdout, os.Stderr); err != nil {
		fmt.Fprintln(os.Stderr, "gh-account-autoswitch:", err)
		var exit *autoswitch.ExitError
		if errors.As(err, &exit) {
			os.Exit(exit.Code)
		}
		os.Exit(2)
	}
}

func execute(args []string, stdout, stderr io.Writer) error {
	opts, command, rest, err := parseArgs(args)
	if err != nil {
		return err
	}
	if command == "help" {
		fmt.Fprint(stdout, helpText)
		return nil
	}
	if command == "version" {
		if opts.json {
			return writeJSON(stdout, map[string]string{"version": version})
		}
		fmt.Fprintf(stdout, "gh-account-autoswitch %s\n", version)
		return nil
	}
	if command == "demo" {
		return runDemo(opts, stdout)
	}
	configPath, err := resolveConfigPath(opts.config)
	if err != nil {
		return err
	}
	if command == "init" {
		return runInit(configPath, opts, stdout)
	}
	config, err := autoswitch.LoadConfig(configPath)
	if err != nil {
		return err
	}
	repo, err := autoswitch.InspectRepository(opts.cwd, autoswitch.ExecRunner{})
	if err != nil {
		return err
	}
	selection, err := autoswitch.Select(config, repo)
	if err != nil {
		return err
	}
	if command == "which" {
		if opts.json {
			return writeJSON(stdout, selection)
		}
		fmt.Fprintf(stdout, "Account:   %s\nRule:      %s (#%d)\n", selection.Account, selection.Rule, selection.RuleIndex)
		if selection.Remote == "" {
			fmt.Fprintln(stdout, "Remote:    none (directory rule)")
		} else {
			fmt.Fprintf(stdout, "Remote:    %s\n", selection.Remote)
		}
		fmt.Fprintf(stdout, "Directory: %s\n", selection.Directory)
		return nil
	}
	if len(rest) == 0 {
		return &autoswitch.ExitError{Code: 2, Err: fmt.Errorf("run requires gh arguments after `--`")}
	}
	ghPath, err := autoswitch.FindGH()
	if err != nil {
		return err
	}
	token, err := autoswitch.GetToken(ghPath, selection)
	if err != nil {
		return err
	}
	if opts.json {
		if err := writeJSON(stderr, selection); err != nil {
			return err
		}
	}
	return autoswitch.RunGH(ghPath, selection, token, rest)
}

func parseArgs(args []string) (options, string, []string, error) {
	opts := options{}
	cwd, err := os.Getwd()
	if err != nil {
		return opts, "", nil, err
	}
	opts.cwd = cwd
	command := ""
	var rest []string
	for i := 0; i < len(args); i++ {
		arg := args[i]
		if command == "run" && arg == "--" {
			rest = append(rest, args[i+1:]...)
			break
		}
		switch arg {
		case "-h", "--help", "help":
			return opts, "help", nil, nil
		case "-v", "--version", "version":
			command = "version"
		case "--json":
			opts.json = true
		case "--dry-run":
			opts.dryRun = true
		case "--force":
			opts.force = true
		case "--config", "--cwd":
			if i+1 >= len(args) {
				return opts, "", nil, &autoswitch.ExitError{Code: 2, Err: fmt.Errorf("%s requires a value", arg)}
			}
			i++
			if arg == "--config" {
				opts.config = args[i]
			} else {
				opts.cwd = args[i]
			}
		case "which", "init", "run", "demo":
			if command != "" {
				return opts, "", nil, &autoswitch.ExitError{Code: 2, Err: fmt.Errorf("only one command may be used")}
			}
			command = arg
		default:
			if command == "run" {
				rest = append(rest, arg)
			} else {
				return opts, "", nil, &autoswitch.ExitError{Code: 2, Err: fmt.Errorf("unknown argument %q; use --help", arg)}
			}
		}
	}
	if command == "" {
		return opts, "help", nil, nil
	}
	if command != "init" && (opts.dryRun || opts.force) {
		return opts, "", nil, &autoswitch.ExitError{Code: 2, Err: fmt.Errorf("--dry-run and --force are only valid with init")}
	}
	return opts, command, rest, nil
}

type demoResult struct {
	Repository string `json:"repository"`
	Directory  string `json:"directory"`
	Account    string `json:"account,omitempty"`
	Rule       string `json:"rule,omitempty"`
	ExitCode   int    `json:"exit_code"`
}

func runDemo(opts options, stdout io.Writer) error {
	workspace, err := os.MkdirTemp("", "gh-account-autoswitch-demo-")
	if err != nil {
		return fmt.Errorf("create demo workspace: %w", err)
	}
	cleaned := false
	defer func() {
		if !cleaned {
			_ = os.RemoveAll(workspace)
		}
	}()

	configPath := filepath.Join(workspace, "gh-accounts.toml")
	configText := fmt.Sprintf(`version = 1

[[rules]]
name = "Acme work"
account = "dev@acme.example"
host = "github.com"
owner = "^acme-corp$"

[[rules]]
name = "Personal projects"
account = "octocat"
directory = %q

[[rules]]
name = "Client enterprise"
account = "consultant@client.example"
host = "github.corp.example"
remote = "^github\\.corp\\.example/field-team/"
`, filepath.ToSlash(filepath.Join(workspace, "personal", "**")))
	if err := os.WriteFile(configPath, []byte(configText), 0o600); err != nil {
		return fmt.Errorf("write demo config: %w", err)
	}
	config, err := autoswitch.LoadConfig(configPath)
	if err != nil {
		return err
	}

	repositories := []autoswitch.Repository{
		{Directory: filepath.Join(workspace, "work", "payments"), Host: "github.com", Owner: "acme-corp", Name: "payments", Canonical: "github.com/acme-corp/payments"},
		{Directory: filepath.Join(workspace, "personal", "dotfiles"), Host: "github.com", Owner: "octocat", Name: "dotfiles", Canonical: "github.com/octocat/dotfiles"},
		{Directory: filepath.Join(workspace, "client", "mobile"), Host: "github.corp.example", Owner: "field-team", Name: "mobile", Canonical: "github.corp.example/field-team/mobile"},
		{Directory: filepath.Join(workspace, "scratch", "prototype"), Host: "github.com", Owner: "unknown-org", Name: "prototype", Canonical: "github.com/unknown-org/prototype"},
	}
	results := make([]demoResult, 0, len(repositories))
	for _, repo := range repositories {
		result := demoResult{Repository: repo.Canonical, Directory: strings.TrimPrefix(filepath.ToSlash(repo.Directory), filepath.ToSlash(workspace)+"/")}
		selection, selectErr := autoswitch.Select(config, repo)
		if selectErr != nil {
			var exit *autoswitch.ExitError
			if !errors.As(selectErr, &exit) || exit.Code != 3 {
				return selectErr
			}
			result.ExitCode = 3
		} else {
			result.Account, result.Rule = selection.Account, selection.Rule
		}
		results = append(results, result)
	}
	if err := os.RemoveAll(workspace); err != nil {
		return fmt.Errorf("remove demo workspace: %w", err)
	}
	cleaned = true

	if opts.json {
		return writeJSON(stdout, map[string]any{
			"demo": true, "saved": false, "workspace": workspace, "workspace_removed": true,
			"token_requested": false, "results": results,
		})
	}
	fmt.Fprintln(stdout, "Demo — bundled sample data; no token is requested and nothing is saved.")
	fmt.Fprintln(stdout, "REPOSITORY                                      ACCOUNT                       RULE")
	for _, result := range results {
		if result.ExitCode == 3 {
			fmt.Fprintf(stdout, "%-47s %-29s %s\n", result.Repository, "—", "no match · exit 3")
			continue
		}
		fmt.Fprintf(stdout, "%-47s %-29s %s\n", result.Repository, result.Account, result.Rule)
	}
	fmt.Fprintf(stdout, "Temporary workspace: %s (removed)\n", workspace)
	return nil
}

func resolveConfigPath(value string) (string, error) {
	if value == "" {
		return autoswitch.DefaultConfigPath()
	}
	return filepath.Abs(value)
}

func runInit(path string, opts options, stdout io.Writer) error {
	ghPath, err := autoswitch.FindGH()
	if err != nil {
		return err
	}
	accounts, err := autoswitch.DiscoverAccounts(ghPath, autoswitch.ExecRunner{})
	if err != nil {
		return &autoswitch.ExitError{Code: 2, Err: err}
	}
	content := autoswitch.RenderConfig(accounts)
	if opts.dryRun {
		if opts.json {
			return writeJSON(stdout, map[string]any{"path": path, "written": false, "accounts": accounts, "config": content})
		}
		fmt.Fprint(stdout, content)
		return nil
	}
	if _, err := os.Stat(path); err == nil && !opts.force {
		return &autoswitch.ExitError{Code: 2, Err: fmt.Errorf("config already exists at %s; use --force to replace it", path)}
	} else if err != nil && !os.IsNotExist(err) {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(path), 0o700); err != nil {
		return fmt.Errorf("create config directory: %w", err)
	}
	if err := os.WriteFile(path, []byte(content), 0o600); err != nil {
		return fmt.Errorf("write config: %w", err)
	}
	if opts.json {
		return writeJSON(stdout, map[string]any{"path": path, "written": true, "accounts": accounts})
	}
	logins := make([]string, len(accounts))
	for i, account := range accounts {
		logins[i] = account.Login + "@" + account.Host
	}
	fmt.Fprintf(stdout, "Wrote %s with %d account rule(s): %s\nReview each matcher before using run.\n", path, len(accounts), strings.Join(logins, ", "))
	return nil
}

func writeJSON(writer io.Writer, value any) error {
	encoder := json.NewEncoder(writer)
	encoder.SetEscapeHTML(false)
	return encoder.Encode(value)
}

const helpText = `gh-account-autoswitch 0.1.0

Select a GitHub CLI account from the current repository without changing gh's
global active account.

Usage:
  gh-account-autoswitch [global options] which [--json]
  gh-account-autoswitch [global options] run [--json] -- <gh arguments...>
  gh-account-autoswitch [global options] init [--dry-run] [--force] [--json]
  gh-account-autoswitch demo [--json]
  gh-account-autoswitch version [--json]

Commands:
  which     Explain the first matching rule. Does not retrieve a token.
  run       Retrieve that account's token and run the real gh in a child process.
  init      Generate rules from accounts reported by gh auth status.
  demo      Match bundled samples in a temporary workspace. Never calls gh.

Global options:
  --config PATH   Config file (default: ~/.config/gh-accounts.toml)
  --cwd PATH      Resolve repository context from PATH (default: current directory)
  --json          Emit machine-readable output; run writes its trace to stderr
  -h, --help      Show this help
  -v, --version   Show the version

Init options:
  --dry-run       Print the generated config without writing it
  --force         Replace an existing config (never prompted interactively)

Exit codes:
  0 success; 2 usage/config error; 3 no matching rule; 4 token unavailable;
  run otherwise preserves the real gh exit code.
`
