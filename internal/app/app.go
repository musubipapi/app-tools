package app

import (
	"context"
	"fmt"

	"app-tools/internal/models"
	"app-tools/internal/services/file"

	"app-tools/internal/services/webp"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx         context.Context
	webpService *webp.Service
	fileService *file.Service
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{
		fileService: file.NewService(),
	}
}

// startup is called when the app starts. The context is saved
func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
	webpService, err := webp.NewService(ctx)
	if err != nil {
		fmt.Println("Error initializing webp service:", err)
	}
	a.webpService = webpService
}

// SelectFolder opens a directory selection dialog
func (a *App) SelectFolder() (string, error) {
	return runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title:                "Select a folder",
		DefaultDirectory:     "",
		CanCreateDirectories: true,
	})
}

// ReadFile exposes file reading functionality to the frontend
func (a *App) ReadFile(path string) (string, error) {
	return a.fileService.ReadFile(path)
}

func (a *App) ConvertToWebP(file models.File, target_directory string) error {
	return a.webpService.ConvertToWebP(file, target_directory)
}

type ConversionStatus = models.ConversionStatus

func (a *App) BatchConvertToWebP(files []models.File, targetDirectory string) {
	a.webpService.BatchConvertToWebP(files, targetDirectory)
}
