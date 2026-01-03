package main

import (
	"context"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/keshav-sudo/notes-app/internals/config"
	"github.com/keshav-sudo/notes-app/internals/handlers"
	"github.com/keshav-sudo/notes-app/internals/repository"
	"github.com/keshav-sudo/notes-app/internals/routes"
	"github.com/keshav-sudo/notes-app/internals/service"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	// Load config from .env
	cfg := config.LoadEnv()

	client, err := mongo.NewClient(options.Client().ApplyURI(cfg.DbURI))
	if err != nil {
		log.Fatal(err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err = client.Connect(ctx)
	if err != nil {
		log.Fatal(err)
	}

	db := client.Database(cfg.DbName)

	// Initialize repository, service, and handler
	noteRepo := repository.NewNoteRepository(db)
	noteService := service.NewNoteService(noteRepo)
	noteHandler := handlers.NewNoteHandler(noteService)

	// Initialize Fiber app
	app := fiber.New()

	// Enable CORS
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	// Setup routes
	routes.SetupRoutes(app, noteHandler)

	// Start the server
	log.Fatal(app.Listen(":" + cfg.Port))
}
