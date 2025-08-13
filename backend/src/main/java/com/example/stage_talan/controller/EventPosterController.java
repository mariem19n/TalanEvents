package com.example.stage_talan.controller;

import com.example.stage_talan.model.Event;
import com.example.stage_talan.repository.EventRepository;
import com.example.stage_talan.service.CloudinaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*") // à adapter si besoin
public class EventPosterController {

    private final CloudinaryService cloudinaryService;
    private final EventRepository eventRepository;

    public EventPosterController(CloudinaryService cloudinaryService, EventRepository eventRepository) {
        this.cloudinaryService = cloudinaryService;
        this.eventRepository = eventRepository;
    }

    @PostMapping("/{eventId}/poster")
    public ResponseEntity<?> uploadPoster(@PathVariable Long eventId, @RequestParam("poster") MultipartFile poster) {
        try {
            String url = cloudinaryService.uploadImage(poster);
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new RuntimeException("Événement non trouvé"));

            event.setPosterUrl(url);
            eventRepository.save(event);

            return ResponseEntity.ok(Map.of("url", url));
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Erreur lors du téléversement de l'image");
        }
    }

    @DeleteMapping("/{eventId}/poster")
    public ResponseEntity<?> deletePoster(@PathVariable Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Événement non trouvé"));

        String posterUrl = event.getPosterUrl();
        if (posterUrl != null && !posterUrl.isEmpty()) {
            try {
                cloudinaryService.deleteImage(posterUrl);  // suppression de Cloudinary
            } catch (IOException e) {
                return ResponseEntity.status(500).body("Erreur lors de la suppression sur Cloudinary.");
            }
            event.setPosterUrl(null);
            eventRepository.save(event);
        }

        return ResponseEntity.ok().build();
    }


}
