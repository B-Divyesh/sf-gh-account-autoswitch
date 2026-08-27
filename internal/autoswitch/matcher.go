package autoswitch

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

func Select(config Config, repo Repository) (Selection, error) {
	for i, rule := range config.Rules {
		matched, err := matches(rule, repo)
		if err != nil {
			return Selection{}, usageError("rule %d (%s): %v", i+1, ruleLabel(rule, i), err)
		}
		if matched {
			host := repo.Host
			if host == "" {
				host = rule.Host
			}
			if host == "" {
				host = "github.com"
			}
			return Selection{Account: rule.Account, Rule: ruleLabel(rule, i), RuleIndex: i + 1, Host: host, Remote: repo.Canonical, Directory: repo.Directory}, nil
		}
	}
	context := repo.Directory
	if repo.Canonical != "" {
		context = repo.Canonical + " from " + repo.Directory
	}
	return Selection{}, noMatchError("no account rule matched %s", context)
}

func matches(rule Rule, repo Repository) (bool, error) {
	if rule.Host != "" && !strings.EqualFold(rule.Host, repo.Host) {
		return false, nil
	}
	for _, pair := range []struct{ pattern, value string }{{rule.Owner, repo.Owner}, {rule.Remote, repo.Canonical}} {
		pattern, value := pair.pattern, pair.value
		if pattern == "" {
			continue
		}
		re, err := regexp.Compile(pattern)
		if err != nil {
			return false, fmt.Errorf("invalid regular expression %q: %w", pattern, err)
		}
		if !re.MatchString(value) {
			return false, nil
		}
	}
	if rule.Directory != "" {
		pattern, err := expandHome(rule.Directory)
		if err != nil {
			return false, err
		}
		re, err := globRegexp(filepath.Clean(pattern))
		if err != nil {
			return false, fmt.Errorf("invalid directory glob %q: %w", rule.Directory, err)
		}
		if !re.MatchString(filepath.Clean(repo.Directory)) {
			return false, nil
		}
	}
	return true, nil
}

func ruleLabel(rule Rule, index int) string {
	if strings.TrimSpace(rule.Name) != "" {
		return rule.Name
	}
	return fmt.Sprintf("rule %d", index+1)
}

func expandHome(path string) (string, error) {
	if path == "~" || strings.HasPrefix(path, "~/") || strings.HasPrefix(path, "~\\") {
		home, err := os.UserHomeDir()
		if err != nil {
			return "", fmt.Errorf("expand home directory: %w", err)
		}
		if path == "~" {
			return home, nil
		}
		return filepath.Join(home, path[2:]), nil
	}
	return path, nil
}

func globRegexp(pattern string) (*regexp.Regexp, error) {
	pattern = filepath.ToSlash(pattern)
	var out strings.Builder
	out.WriteString("^")
	for i := 0; i < len(pattern); i++ {
		switch pattern[i] {
		case '*':
			if i+1 < len(pattern) && pattern[i+1] == '*' {
				i++
				if i+1 < len(pattern) && pattern[i+1] == '/' {
					i++
					out.WriteString("(?:.*/)?")
				} else {
					out.WriteString(".*")
				}
			} else {
				out.WriteString("[^/]*")
			}
		case '?':
			out.WriteString("[^/]")
		default:
			out.WriteString(regexp.QuoteMeta(string(pattern[i])))
		}
	}
	out.WriteString("$")
	return regexp.Compile(out.String())
}
