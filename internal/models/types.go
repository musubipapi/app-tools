package models

type Data struct {
	TargetFolder string `json:"targetFolder"`
}

// ConversionStatus represents the current status of a file conversion
type ConversionStatus struct {
	Filename    string `json:"filename"`
	Status      string `json:"status"` // "pending", "converting", "completed", "failed"
	Error       string `json:"error,omitempty"`
	OriginalExt string `json:"originalExt"`
	ID          string `json:"id"`
}

type File struct {
	Data     []byte
	Filename string
	ID       string
}

const (
	ConversionStatusPending    = "pending"
	ConversionStatusConverting = "converting"
	ConversionStatusCompleted  = "completed"
	ConversionStatusFailed     = "failed"
)
