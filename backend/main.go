package main

import (
	"encoding/json"
	"fmt"
	"log"
	mnistpb "main/mnistpb"
	"math/rand"
	"net/http"
	"os"
	"strconv"

	"github.com/gorilla/mux"
	"google.golang.org/protobuf/proto"
)

type Server struct {
	cachedDatasetSample map[int32][][]float32
}

func NewServer(pbPath string) (*Server, error) {
	var s Server = Server{}
	s.loadDatasetSample(pbPath)
	fmt.Println(len(s.cachedDatasetSample[1]))
	return &s, nil
}

func (s *Server) getRandomImage(label int32) []float32 {
	if label > 9 || label < 0 {
		return nil
	}
	images := s.cachedDatasetSample[label]
	if len(images) == 0 {
		return nil
	}
	id := rand.Intn(len(images))
	return images[id]
}

func (s *Server) loadDatasetSample(pbPath string) {
	data, err := os.ReadFile(pbPath)
	if err != nil {
		log.Fatalf("Failed to read file: %v", err)
	}
	var dataset mnistpb.Dataset
	if err := proto.Unmarshal(data, &dataset); err != nil {
		log.Fatalf("Failed to parse protobuf: %v", err)
	}
	var cache map[int32][][]float32 = make(map[int32][][]float32)
	for _, sample := range dataset.Samples {
		cache[sample.Label] = append(cache[sample.Label], sample.Pixels)
	}
	s.cachedDatasetSample = cache
}

func (s *Server) randomImageHandler(w http.ResponseWriter, r *http.Request) {
	labelStr := r.URL.Query().Get("label")
	labelInt, err := strconv.Atoi(labelStr)
	if err != nil {
		http.Error(w, "Invalid label", http.StatusBadRequest)
		return
	}

	image := s.getRandomImage(int32(labelInt))
	json.NewEncoder(w).Encode(map[string]interface{}{
		"label": labelInt,
		"image": image,
	})
}

func noCache(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
		w.Header().Set("Pragma", "no-cache")
		w.Header().Set("Expires", "0")

		next.ServeHTTP(w, r)
	})
}

func runServer() {
	s, err := NewServer("sampled_mnist.pb")
	if err != nil {
		log.Fatal(err)
	}
	router := mux.NewRouter()
	router.HandleFunc("/api/random-image", s.randomImageHandler).Methods("GET")

	// When running under Nginx, this is not needed.
	modelFs := http.FileServer(http.Dir("../model/tfjs/"))
	router.PathPrefix("/model/").Handler(http.StripPrefix("/model/", modelFs))
	fs := http.FileServer(http.Dir("../front"))
	router.PathPrefix("/").Handler(noCache(fs))

	log.Println("Server started on :8080")
	err = http.ListenAndServe(":8080", router)
	if err != nil {
		log.Fatal(err)
	}
}

func main() {
	runServer()
}
