package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/keshav-sudo/notes-app/internals/models"
	"github.com/keshav-sudo/notes-app/internals/service"
)

type NoteHandler struct {
	service *service.NoteService
}

func NewNoteHandler(service *service.NoteService) *NoteHandler {
	return &NoteHandler{service: service}
}

func (h *NoteHandler) GetAllNotes(c *fiber.Ctx) error {
	notes, err := h.service.GetAllNotes(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).
			JSON(fiber.Map{"error": "Failed to retrieve notes"})
	}

	return c.JSON(notes)
}

func (h *NoteHandler) CreateNote(c *fiber.Ctx) error {
	var note models.Note

	if err := c.BodyParser(&note); err != nil {
		return c.Status(fiber.StatusBadRequest).
			JSON(fiber.Map{"error": "Invalid request payload"})
	}

	if err := h.service.CreateNote(c.Context(), &note); err != nil {
		return c.Status(fiber.StatusInternalServerError).
			JSON(fiber.Map{"error": "Failed to create note"})
	}

	return c.Status(fiber.StatusCreated).JSON(note)
}

func (h *NoteHandler) GetNoteById(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).
			JSON(fiber.Map{"error": "id is required"})
	}

	note, err := h.service.GetNoteById(c.Context(), id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).
			JSON(fiber.Map{"error": "Note not found"})
	}

	return c.JSON(note)
}
