package repository

import (
	"context"

	"github.com/keshav-sudo/notes-app/internals/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type NoteRepository struct {
	collection mongo.Collection
}

func NewNoteRepository(db *mongo.Database) *NoteRepository {
	return &NoteRepository{
		collection: *db.Collection("notes"),
	}
}

func (r *NoteRepository) CreateNote(ctx context.Context, note *models.Note) error {
	_, err := r.collection.InsertOne(ctx, note)
	return err
}

func (r *NoteRepository) GetNoteById(ctx context.Context, id primitive.ObjectID) (*models.Note, error) {
	var note models.Note
	err := r.collection.
		FindOne(ctx, bson.M{"_id": id}).Decode(&note)
	if err != nil {
		return nil, err
	}
	return &note, err
}

func (r *NoteRepository) GetAllNotes(ctx context.Context) ([]*models.Note, error) {
	var notes []*models.Note
	cursor, err := r.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var Note models.Note
		if err := cursor.Decode(&Note); err != nil {
			return nil, err
		}
		notes = append(notes, &Note)
	}
	return notes, nil
}

