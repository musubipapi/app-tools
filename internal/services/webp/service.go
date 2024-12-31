package webp

// #cgo CFLAGS: -x objective-c
// #cgo LDFLAGS: -framework Foundation
// #import <Foundation/Foundation.h>
// char* getAppPaths() {
//     @autoreleasepool {
//         NSBundle* mainBundle = [NSBundle mainBundle];
//         NSString* containerPath = NSHomeDirectory();
//         NSString* bundlePath = [mainBundle bundlePath];
//         NSString* result = [NSString stringWithFormat:@"%@|%@",
//             containerPath,
//             bundlePath];
//         return strdup([result UTF8String]);
//     }
// }
import "C"
import (
	"app-tools/internal/models"
	"context"
	_ "embed"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"
	"unsafe"

	wailsruntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

type Service struct {
	ctx       context.Context
	cwebpPath string
}

type (
	ConversionStatus = models.ConversionStatus
	File             = models.File
)

func getAppPaths() (containerPath, bundlePath string, err error) {
	cPaths := C.getAppPaths()
	if cPaths == nil {
		return "", "", fmt.Errorf("failed to get paths")
	}
	defer C.free(unsafe.Pointer(cPaths))

	paths := strings.Split(C.GoString(cPaths), "|")
	if len(paths) != 2 {
		return "", "", fmt.Errorf("invalid paths format")
	}

	fmt.Printf("Container Path: %s\n", paths[0])
	fmt.Printf("Bundle Path: %s\n", paths[1])

	return paths[0], paths[1], nil
}
func NewService(ctx context.Context) (*Service, error) {
	s := &Service{ctx: ctx}
	_, bundlePath, err := getAppPaths()
	if err != nil {
		return nil, fmt.Errorf("failed to get app paths: %w", err)
	}

	prodPaths := make([]string, 0)

	prodPaths = append(prodPaths,
		filepath.Join(bundlePath, "Contents", "Resources", "cwebp"), // Direct path to Resources
	)

	for _, path := range prodPaths {
		if fileExists(path) {
			fmt.Printf("Found cwebp in production path: %s\n", path)
			s.cwebpPath = path
			return s, nil
		} else {
			fmt.Printf("cwebp not found in production path: %s\n", path)
		}
	}

	devPath := filepath.Join("internal", "assets", "cwebp")
	if fileExists(devPath) {
		fmt.Println("Found cwebp in development path")
		if err := os.Chmod(devPath, 0755); err != nil {
			fmt.Printf("Warning: Failed to set dev binary permissions: %v\n", err)
		}
		s.cwebpPath = devPath
		return s, nil
	}

	return nil, fmt.Errorf("could not find cwebp binary in either production or development paths")
}

func (s *Service) CheckWebP() bool {
	return s.cwebpPath != "" && fileExists(s.cwebpPath)
}

func (s *Service) ConvertToWebP(file File, targetDirectory string) error {
	if s.cwebpPath == "" {
		return fmt.Errorf("cwebp binary not available")
	}

	if info, err := os.Stat(s.cwebpPath); err == nil {
		fmt.Printf("Binary permissions before execution: %v\n", info.Mode())
	}

	tempDir, err := os.MkdirTemp("", "webp_conversion")
	if err != nil {
		return fmt.Errorf("failed to create temp directory: %w", err)
	}
	defer os.RemoveAll(tempDir)

	inputPath := filepath.Join(tempDir, file.Filename)
	if err := os.WriteFile(inputPath, file.Data, 0644); err != nil {
		return fmt.Errorf("failed to write temp file: %w", err)
	}

	outputPath := filepath.Join(tempDir,
		strings.TrimSuffix(file.Filename, filepath.Ext(file.Filename))+".webp")
	fmt.Println("Path:", s.cwebpPath)

	cmd := exec.CommandContext(s.ctx, s.cwebpPath,
		"-lossless",
		"-z", "9",
		inputPath,
		"-o", outputPath,
	)

	// Capture both stdout and stderr
	output, err := cmd.CombinedOutput()

	if err != nil {
		fmt.Printf("Command output: %s\n", string(output))
		fmt.Printf("Error type: %T\n", err)
		fmt.Printf("Error details: %v\n", err)
		if exitErr, ok := err.(*exec.ExitError); ok {
			fmt.Printf("Exit code: %d\n", exitErr.ExitCode())
			fmt.Printf("Stderr: %s\n", string(exitErr.Stderr))
		}
		return fmt.Errorf("cwebp conversion failed: %w (output: %s)", err, string(output))
	}

	convertedData, err := os.ReadFile(outputPath)
	if err != nil {
		return fmt.Errorf("failed to read converted file: %w", err)
	}

	targetPath := filepath.Join(targetDirectory,
		strings.TrimSuffix(file.Filename, filepath.Ext(file.Filename))+".webp")
	if err := os.WriteFile(targetPath, convertedData, 0644); err != nil {
		return fmt.Errorf("failed to save converted file: %w", err)
	}

	return nil
}

func (s *Service) BatchConvertToWebP(files []File, targetDirectory string) {
	if s == nil || s.ctx == nil {
		fmt.Println("Error: Service or context is nil")
		return
	}

	var wg sync.WaitGroup

	for _, file := range files {
		wg.Add(1)
		go func(file File) {
			defer wg.Done()

			if s.ctx != nil {
				wailsruntime.EventsEmit(s.ctx, "conversion_status", ConversionStatus{
					Filename:    file.Filename,
					ID:          file.ID,
					Status:      models.ConversionStatusConverting,
					OriginalExt: filepath.Ext(file.Filename),
				})
			}

			err := s.ConvertToWebP(file, targetDirectory)

			if err != nil {
				fmt.Println("Error converting to WebP:", err)
				if s.ctx != nil {
					wailsruntime.EventsEmit(s.ctx, "conversion_status", ConversionStatus{
						Filename:    file.Filename,
						ID:          file.ID,
						Status:      models.ConversionStatusFailed,
						Error:       err.Error(),
						OriginalExt: filepath.Ext(file.Filename),
					})
				}
				return
			}

			if s.ctx != nil {
				wailsruntime.EventsEmit(s.ctx, "conversion_status", ConversionStatus{
					Filename:    file.Filename,
					ID:          file.ID,
					Status:      models.ConversionStatusCompleted,
					OriginalExt: filepath.Ext(file.Filename),
				})
			}
		}(file)
	}

	wg.Wait()
	wailsruntime.EventsEmit(s.ctx, "conversion_complete", true)
}

func fileExists(path string) bool {
	info, err := os.Stat(path)
	if err != nil {
		if os.IsPermission(err) {
			fmt.Printf("Permission denied for %s: %v\n", path, err)
		} else if os.IsNotExist(err) {
			fmt.Printf("File not found at %s: %v\n", path, err)
		} else {
			fmt.Printf("Error accessing %s: %v\n", path, err)
		}
		return false
	}

	fmt.Printf("File found at %s with permissions: %v\n", path, info.Mode())
	// Try to read the file to verify access
	if _, err := os.ReadFile(path); err != nil {
		fmt.Printf("Found file but cannot read it: %v\n", err)
		return false
	}
	return true
}
