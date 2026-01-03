package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/keshav-sudo/notes-app/internals/handlers"
)

func SetupRoutes(app *fiber.App, noteHandler *handlers.NoteHandler) {
	// Initialize benchmark handler
	benchmarkHandler := handlers.NewBenchmarkHandler()

	api := app.Group("/api")

	// Notes routes
	api.Get("/notes", noteHandler.GetAllNotes)
	api.Post("/notes", noteHandler.CreateNote)
	api.Get("/notes/:id", noteHandler.GetNoteById)

	// Benchmark routes
	api.Get("/ping", benchmarkHandler.Ping)
	api.Get("/cpu/:n", benchmarkHandler.CpuTest)
	api.Get("/concurrent/:n", benchmarkHandler.ConcurrentTest)
	api.Post("/json", benchmarkHandler.JsonTest)
}
