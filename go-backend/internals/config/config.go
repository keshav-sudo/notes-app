package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port   string
	DbURI  string
	DbName string
}

func LoadEnv() *Config {
	err := godotenv.Load()
	if err != nil {
		log.Println("⚠️ No .env file found")
	}

	port := os.Getenv("Port")
	if port == "" {
		port = "8000"
	}

	dbURI := os.Getenv("DbURI")
	if dbURI == "" {
		log.Println("⚠️ DbURI not found")
	}

	dbName := os.Getenv("DbName")
	if dbName == "" {
		log.Println("⚠️ DbName not found")
	}

	cfg := &Config{
		Port:   port,
		DbURI:  dbURI,
		DbName: dbName,
	}

	log.Printf("✅ Loaded Config: %+v\n", cfg)

	return cfg
}
