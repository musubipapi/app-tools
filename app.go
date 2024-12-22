package main

import (
	"context"
	"fmt"
	"io"
	"os"
	"os/exec"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

type Person struct {
	Name    string   `json:"name"`
	Age     uint8    `json:"age"`
	Address *Address `json:"address"`
}
type Address struct {
	Street   string `json:"street"`
	Postcode string `json:"postcode"`
}

// Greet returns a greeting for the given name
func (a *App) Greet(p Person) string {
	return fmt.Sprintf("Hello %s (Age: %d)!", p.Name, p.Age)
}

func (a *App) ReadFile(path string) (string, error) {
	content, err := os.ReadFile(path)
	if err != nil {
		return "", err
	}
	return string(content), nil
}

func (a *App) SelectFolder() (string, error) {
	return runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title:                "Select a folder",
		DefaultDirectory:     "", // Optional: Set a default directory
		CanCreateDirectories: true,
	})
}

// streamOutput reads from a pipe and sends output to the logger
func (a *App) streamOutput(pipe io.ReadCloser, isError bool) {
	buffer := make([]byte, 1024)
	for {
		n, err := pipe.Read(buffer)
		if n > 0 {
			if isError {
				runtime.LogError(a.ctx, string(buffer[:n]))
			} else {
				runtime.LogInfo(a.ctx, string(buffer[:n]))
			}
		}
		if err != nil {
			break
		}
	}
}

// InstallWebP attempts to install webp using brew
func (a *App) InstallWebP() (bool, error) {
	cmd := exec.Command("brew", "install", "webp")

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return false, fmt.Errorf("failed to create stdout pipe: %v", err)
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		return false, fmt.Errorf("failed to create stderr pipe: %v", err)
	}

	// Start the command
	if err := cmd.Start(); err != nil {
		return false, fmt.Errorf("failed to start command: %v", err)
	}

	// Stream output in real-time
	go a.streamOutput(stdout, false)
	go a.streamOutput(stderr, true)

	// Wait for the command to complete
	if err := cmd.Wait(); err != nil {
		return false, fmt.Errorf("installation failed: %v", err)
	}

	// Verify installation was successful by checking if cwebp is now available
	if a.CheckWebP() {
		return true, nil
	}

	return false, fmt.Errorf("installation completed but webp is not available")
}

// CheckWebP checks if webp is installed
func (a *App) CheckWebP() bool {
	_, err := exec.LookPath("cwebp")
	return err == nil
}
