package service

import (
	"context"
	"time"

	"github.com/keshav-sudo/notes-app/internals/models"
	"github.com/keshav-sudo/notes-app/internals/repository"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type NoteService struct {
	repo *repository.NoteRepository
}

func NewNoteService(repo *repository.NoteRepository) *NoteService {
	return &NoteService{repo: repo}
}

func (s *NoteService) CreateNote(ctx context.Context, note *models.Note) error {
	now := time.Now()

	note.CreatedAt = now
	note.UpdatedAt = now

	if note.Title == "" {
		note.Title = "Untitled Note"
	}

	if note.Content == "" {
		note.Content = "No Content"
	}

	return s.repo.CreateNote(ctx, note)
}

func (s *NoteService) GetNoteById(ctx context.Context, id string) (*models.Note, error) {
	noteID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}
	return s.repo.GetNoteById(ctx, noteID)
}

func (s *NoteService) GetAllNotes(ctx context.Context) ([]*models.Note, error) {
	return s.repo.GetAllNotes(ctx)
}
