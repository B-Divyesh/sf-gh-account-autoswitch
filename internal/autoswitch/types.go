package autoswitch

import "fmt"

const ConfigVersion = 1

type Config struct {
	Version int
	Rules   []Rule
}

type Rule struct {
	Name      string `json:"name"`
	Account   string `json:"account"`
	Host      string `json:"host,omitempty"`
	Owner     string `json:"owner,omitempty"`
	Remote    string `json:"remote,omitempty"`
	Directory string `json:"directory,omitempty"`
}

type Repository struct {
	Directory string `json:"directory"`
	RemoteURL string `json:"remote_url,omitempty"`
	Canonical string `json:"remote,omitempty"`
	Host      string `json:"host,omitempty"`
	Owner     string `json:"owner,omitempty"`
	Name      string `json:"repository,omitempty"`
}

type Selection struct {
	Account   string `json:"account"`
	Rule      string `json:"rule"`
	RuleIndex int    `json:"rule_index"`
	Host      string `json:"host"`
	Remote    string `json:"remote,omitempty"`
	Directory string `json:"directory"`
}

type ExitError struct {
	Code int
	Err  error
}

func (e *ExitError) Error() string { return e.Err.Error() }
func (e *ExitError) Unwrap() error { return e.Err }

func usageError(format string, args ...any) error {
	return &ExitError{Code: 2, Err: fmt.Errorf(format, args...)}
}

func noMatchError(format string, args ...any) error {
	return &ExitError{Code: 3, Err: fmt.Errorf(format, args...)}
}

func tokenError(format string, args ...any) error {
	return &ExitError{Code: 4, Err: fmt.Errorf(format, args...)}
}
