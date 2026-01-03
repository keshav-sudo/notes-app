package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/keshav-sudo/notes-app/internals/handlers"
)

func SetupRoutes(app *fiber.App, noteHandler *handlers.NoteHandler) {
	api := app.Group("/api")

	api.Get("/notes", noteHandler.GetAllNotes)
	api.Post("/notes", noteHandler.CreateNote)
	api.Get("/notes/:id", noteHandler.GetNoteById)
}
