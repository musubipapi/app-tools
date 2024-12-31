package file

import (
	"os"
)

type Service struct{}

func NewService() *Service {
	return &Service{}
}

func (s *Service) ReadFile(path string) (string, error) {
	content, err := os.ReadFile(path)
	if err != nil {
		return "", err
	}
	return string(content), nil
}
