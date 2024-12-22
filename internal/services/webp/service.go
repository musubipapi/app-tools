package webp

import (
	"app-tools/internal/models"
	"context"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type Service struct {
	ctx context.Context
}
type (
	ConversionStatus = models.ConversionStatus
	File             = models.File
)

func NewService(ctx context.Context) *Service {
	return &Service{ctx: ctx}
}

// streamOutput reads from a pipe and sends output to the logger
func (s *Service) streamOutput(pipe io.ReadCloser, isError bool) {
	buffer := make([]byte, 1024)
	for {
		n, err := pipe.Read(buffer)
		if n > 0 {
			if isError {
				runtime.LogError(s.ctx, string(buffer[:n]))
			} else {
				runtime.LogInfo(s.ctx, string(buffer[:n]))
			}
		}
		if err != nil {
			break
		}
	}
}

// InstallWebP attempts to install webp using brew
func (s *Service) InstallWebP() (bool, error) {
	brewPath, err := exec.LookPath("brew")
	if err != nil {
		return false, fmt.Errorf("brew not found: %v", err)
	}

	cmd := exec.Command(brewPath, "install", "webp")

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return false, fmt.Errorf("failed to create stdout pipe: %v", err)
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		return false, fmt.Errorf("failed to create stderr pipe: %v", err)
	}

	if err := cmd.Start(); err != nil {
		return false, fmt.Errorf("failed to start command: %v", err)
	}

	go s.streamOutput(stdout, false)
	go s.streamOutput(stderr, true)

	if err := cmd.Wait(); err != nil {
		return false, fmt.Errorf("installation failed: %v", err)
	}

	if s.CheckWebP() {
		return true, nil
	}

	return false, fmt.Errorf("installation completed but webp is not available")
}

// CheckWebP checks if webp is installed
func (s *Service) CheckWebP() bool {
	_, err := exec.LookPath("cwebp")
	return err == nil
}

func (s *Service) ConvertToWebP(file File, target_directory string) error {
	// Create a temporary directory for processing
	tempDir, err := os.MkdirTemp("", "webp_conversion")
	if err != nil {
		return fmt.Errorf("failed to create temp directory: %w", err)
	}
	defer os.RemoveAll(tempDir) // Clean up when done

	// Save the incoming data to a temporary file
	inputPath := filepath.Join(tempDir, file.Filename)
	if err := os.WriteFile(inputPath, file.Data, 0644); err != nil {
		return fmt.Errorf("failed to write temp file: %w", err)
	}

	// Create output filename (replace original extension with .webp)
	outputPath := filepath.Join(tempDir,
		strings.TrimSuffix(file.Filename, filepath.Ext(file.Filename))+".webp")

	// Find cwebp executable path
	cwebpPath, err := exec.LookPath("cwebp")
	if err != nil {
		return fmt.Errorf("cwebp not found: %w", err)
	}

	// Prepare cwebp command with full path
	cmd := exec.Command(cwebpPath,
		"-lossless",
		"-z", "9",
		inputPath,
		"-o", outputPath,
	)

	// Run the conversion
	if output, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("cwebp conversion failed: %s, error: %w", string(output), err)
	}

	// Read the converted file
	convertedData, err := os.ReadFile(outputPath)
	if err != nil {
		return fmt.Errorf("failed to read converted file: %w", err)
	}

	// Save the converted file to target directory
	targetPath := filepath.Join(target_directory, strings.TrimSuffix(file.Filename, filepath.Ext(file.Filename))+".webp")
	if err := os.WriteFile(targetPath, convertedData, 0644); err != nil {
		return fmt.Errorf("failed to save converted file to target directory: %w", err)
	}

	return nil
}

// BatchConvertToWebP converts multiple files concurrently and emits events for status updates
func (s *Service) BatchConvertToWebP(files []File, targetDirectory string) {
	// Create a WaitGroup to track all goroutines
	var wg sync.WaitGroup

	for _, file := range files {
		wg.Add(1)
		// Launch a goroutine for each file
		go func(file struct {
			Data     []byte
			Filename string
			ID       string
		}) {
			defer wg.Done()

			// Emit converting status
			runtime.EventsEmit(s.ctx, "conversion_status", ConversionStatus{
				Filename:    file.Filename,
				ID:          file.ID,
				Status:      models.ConversionStatusConverting,
				OriginalExt: filepath.Ext(file.Filename),
			})

			// Convert the file
			err := s.ConvertToWebP(file, targetDirectory)

			if err != nil {
				runtime.EventsEmit(s.ctx, "conversion_status", ConversionStatus{
					Filename:    file.Filename,
					ID:          file.ID,
					Status:      models.ConversionStatusFailed,
					Error:       err.Error(),
					OriginalExt: filepath.Ext(file.Filename),
				})
				return
			}

			// Emit completion status
			runtime.EventsEmit(s.ctx, "conversion_status", ConversionStatus{
				Filename:    file.Filename,
				ID:          file.ID,
				Status:      models.ConversionStatusCompleted,
				OriginalExt: filepath.Ext(file.Filename),
			})
		}(file)
	}

	// Wait for all conversions to complete
	wg.Wait()

	// Emit final completion event
	runtime.EventsEmit(s.ctx, "conversion_complete", true)
}
