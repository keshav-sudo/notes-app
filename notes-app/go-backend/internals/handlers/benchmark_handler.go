package handlers

import (
	"encoding/json"
	"sync"

	"github.com/gofiber/fiber/v2"
)

// BenchmarkHandler handles all benchmark related routes
type BenchmarkHandler struct{}

// NewBenchmarkHandler creates a new BenchmarkHandler
func NewBenchmarkHandler() *BenchmarkHandler {
	return &BenchmarkHandler{}
}

// Ping - Raw HTTP speed test
func (h *BenchmarkHandler) Ping(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"message": "pong", "backend": "go"})
}

// CpuTest - Fibonacci calculation for CPU benchmark
func (h *BenchmarkHandler) CpuTest(c *fiber.Ctx) error {
	n, _ := c.ParamsInt("n", 30)
	result := fibonacci(n)
	return c.JSON(fiber.Map{"result": result, "n": n, "backend": "go"})
}

// ConcurrentTest - Goroutines test
func (h *BenchmarkHandler) ConcurrentTest(c *fiber.Ctx) error {
	n, _ := c.ParamsInt("n", 100)
	var wg sync.WaitGroup
	results := make([]int, n)

	for i := 0; i < n; i++ {
		wg.Add(1)
		go func(idx int) {
			defer wg.Done()
			results[idx] = fibonacci(25)
		}(i)
	}
	wg.Wait()

	return c.JSON(fiber.Map{
		"goroutines": n,
		"completed":  len(results),
		"backend":    "go",
	})
}

// JsonTest - JSON processing test
func (h *BenchmarkHandler) JsonTest(c *fiber.Ctx) error {
	var data []map[string]interface{}

	if err := json.Unmarshal(c.Body(), &data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid JSON"})
	}

	for i := range data {
		data[i]["processed"] = true
		data[i]["index"] = i
	}

	return c.JSON(fiber.Map{
		"items":   len(data),
		"backend": "go",
		"data":    data,
	})
}

// CPU intensive function
func fibonacci(n int) int {
	if n <= 1 {
		return n
	}
	return fibonacci(n-1) + fibonacci(n-2)
}
