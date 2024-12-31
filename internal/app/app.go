package app

import (
	"context"
	"fmt"

	"app-tools/internal/models"
	"app-tools/internal/services/file"

	"app-tools/internal/services/webp"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx         context.Context
	webpService *webp.Service
	fileService *file.Service
}

func NewApp() *App {
	return &App{
		fileService: file.NewService(),
	}
}

func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
	webpService, err := webp.NewService(ctx)
	if err != nil {
		fmt.Println("Error initializing webp service:", err)
	}
	a.webpService = webpService
}

func (a *App) SelectFolder() (string, error) {
	return runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title:                "Select a folder",
		DefaultDirectory:     "",
		CanCreateDirectories: true,
	})
}

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
