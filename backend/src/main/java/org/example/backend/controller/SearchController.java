package org.example.backend.controller;

import org.example.backend.dto.SearchResultDTO;
import org.example.backend.service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "http://localhost:5173")
public class SearchController {

    private final SearchService searchService;

    @Autowired
    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping
    public ResponseEntity<List<SearchResultDTO>> search(
            @RequestParam String query,
            @RequestParam String field) {

        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        List<SearchResultDTO> results;

        switch(field) {
            case "name":
                results = searchService.searchByName(query);
                break;
            case "id":
                results = searchService.searchById(query);
                break;
            case "email":
                results = searchService.searchByEmail(query);
                break;
            case "date":
                results = searchService.searchByDate(query);
                break;
            case "subject":
                results = searchService.searchBySubject(query);
                break;
            case "title":
                results = searchService.searchByTitle(query);
                break;
            case "author":
                results = searchService.searchByAuthor(query);
                break;
            case "all":
            default:
                results = searchService.searchAllFields(query);
                break;
        }

        return ResponseEntity.ok(results);
    }

    // Erweiterte Endpunkte für die Paginierung
    @GetMapping("/paginated")
    public ResponseEntity<List<SearchResultDTO>> searchPaginated(
            @RequestParam String query,
            @RequestParam String field,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        // Implementierung der Paginierung (für zukünftige Erweiterung)
        // Hier würde die Logik für die paginierte Suche stehen

        return search(query, field);
    }
}