package autoswitch

import (
	"bufio"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

func DefaultConfigPath() (string, error) {
	if value := os.Getenv("GH_AUTOSWITCH_CONFIG"); value != "" {
		return filepath.Abs(value)
	}
	dir, err := os.UserConfigDir()
	if err != nil {
		return "", fmt.Errorf("find user config directory: %w", err)
	}
	return filepath.Join(dir, "gh-accounts.toml"), nil
}

func LoadConfig(path string) (Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			return Config{}, usageError("config not found at %s; run `gh-account-autoswitch init`", path)
		}
		return Config{}, usageError("read config %s: %v", path, err)
	}
	config, err := ParseConfig(string(data))
	if err != nil {
		return Config{}, usageError("invalid config %s: %v", path, err)
	}
	return config, nil
}

func ParseConfig(input string) (Config, error) {
	config := Config{}
	var current *Rule
	seenVersion := false
	seenKeys := map[string]bool{}
	scanner := bufio.NewScanner(strings.NewReader(input))
	for lineNo := 1; scanner.Scan(); lineNo++ {
		line := stripComment(strings.TrimSpace(scanner.Text()))
		if line == "" {
			continue
		}
		if line == "[[rules]]" {
			config.Rules = append(config.Rules, Rule{})
			current = &config.Rules[len(config.Rules)-1]
			seenKeys = map[string]bool{}
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			return Config{}, fmt.Errorf("line %d: expected key = value", lineNo)
		}
		key, raw := strings.TrimSpace(parts[0]), strings.TrimSpace(parts[1])
		if current == nil {
			if key != "version" {
				return Config{}, fmt.Errorf("line %d: unknown top-level key %q", lineNo, key)
			}
			if seenVersion {
				return Config{}, fmt.Errorf("line %d: duplicate version", lineNo)
			}
			version, err := strconv.Atoi(raw)
			if err != nil {
				return Config{}, fmt.Errorf("line %d: version must be an integer", lineNo)
			}
			config.Version, seenVersion = version, true
			continue
		}
		if seenKeys[key] {
			return Config{}, fmt.Errorf("line %d: duplicate rule key %q", lineNo, key)
		}
		value, err := strconv.Unquote(raw)
		if err != nil {
			return Config{}, fmt.Errorf("line %d: %s must be a quoted string", lineNo, key)
		}
		switch key {
		case "name":
			current.Name = value
		case "account":
			current.Account = value
		case "host":
			current.Host = value
		case "owner":
			current.Owner = value
		case "remote":
			current.Remote = value
		case "directory":
			current.Directory = value
		default:
			return Config{}, fmt.Errorf("line %d: unknown rule key %q", lineNo, key)
		}
		seenKeys[key] = true
	}
	if err := scanner.Err(); err != nil {
		return Config{}, err
	}
	if !seenVersion || config.Version != ConfigVersion {
		return Config{}, fmt.Errorf("version must be %d", ConfigVersion)
	}
	if len(config.Rules) == 0 {
		return Config{}, fmt.Errorf("at least one [[rules]] entry is required")
	}
	for i, rule := range config.Rules {
		if strings.TrimSpace(rule.Account) == "" {
			return Config{}, fmt.Errorf("rule %d: account is required", i+1)
		}
		if rule.Host == "" && rule.Owner == "" && rule.Remote == "" && rule.Directory == "" {
			return Config{}, fmt.Errorf("rule %d: add at least one matcher", i+1)
		}
	}
	return config, nil
}

func stripComment(line string) string {
	quoted, escaped := false, false
	for i, r := range line {
		if escaped {
			escaped = false
			continue
		}
		if quoted && r == '\\' {
			escaped = true
			continue
		}
		if r == '"' {
			quoted = !quoted
			continue
		}
		if r == '#' && !quoted {
			return strings.TrimSpace(line[:i])
		}
	}
	return line
}
