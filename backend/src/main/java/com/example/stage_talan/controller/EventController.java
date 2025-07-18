package com.example.stage_talan.controller;

import com.example.stage_talan.dto.EventRequestDTO;
import com.example.stage_talan.dto.EventResponseDTO;
import com.example.stage_talan.model.AppUser;
import com.example.stage_talan.model.Event;
import com.example.stage_talan.model.EventStatus;
import com.example.stage_talan.model.Role;
import com.example.stage_talan.repository.AppUserRepository;
import com.example.stage_talan.repository.EventRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "http://localhost:4200")
public class EventController {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private AppUserRepository userRepository;

    // Créer un événement
    @PostMapping
    public ResponseEntity<EventResponseDTO> createEvent(@RequestBody EventRequestDTO dto) {
        try {
            // Récupérer l'utilisateur connecté via le JWT
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            AppUser creator = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

            // Ajouter le rôle ORGANIZER si besoin
            if (creator.getRoles().contains(Role.USER) && !creator.getRoles().contains(Role.ORGANIZER)) {
                creator.getRoles().add(Role.ORGANIZER);
                userRepository.save(creator);
            }

            // Création de l'entité Event à partir du DTO
            Event event = new Event();
            event.setTitle(dto.getTitle());
            event.setDescription(dto.getDescription());
            event.setEventDate(dto.getEventDate());
            event.setStartTime(dto.getStartTime());
            event.setEndTime(dto.getEndTime());
            event.setLocation(dto.getLocation());
            event.setCreatedBy(creator);
            event.setStatus(EventStatus.PENDING);


            Event saved = eventRepository.save(event);
            return ResponseEntity.ok(convertToDTO(saved));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }


    // Modifier un événement (organisateur uniquement)
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable Long id, @RequestParam Long userId, @RequestBody EventRequestDTO dto) {
        Event existing = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Événement introuvable"));

        if (!existing.getCreatedBy().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Vous n'êtes pas autorisé à modifier cet événement."));
        }

        existing.setTitle(dto.getTitle());
        existing.setDescription(dto.getDescription());
        existing.setEventDate(dto.getEventDate());
        existing.setStartTime(dto.getStartTime());
        existing.setEndTime(dto.getEndTime());
        existing.setLocation(dto.getLocation());

        Event updated = eventRepository.save(existing);
        return ResponseEntity.ok(convertToDTO(updated));
    }

    // Récupérer tous les événements
    @GetMapping
    public ResponseEntity<List<EventResponseDTO>> getAllEvents() {
        List<EventResponseDTO> list = eventRepository.findAll()
                .stream().map(this::convertToDTO).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventResponseDTO> getEventById(@PathVariable Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Événement introuvable"));
        return ResponseEntity.ok(convertToDTO(event));
    }


    @GetMapping("/my-events")
    public ResponseEntity<List<EventResponseDTO>> getMyEvents(@AuthenticationPrincipal UserDetails user) {
        String email = user.getUsername();
        List<EventResponseDTO> list = eventRepository.findByCreatedByEmail(email)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }


    @GetMapping("/conflicts")
    public ResponseEntity<List<EventResponseDTO>> getConflictingEvents(@AuthenticationPrincipal UserDetails user) {
        String email = user.getUsername();

        List<EventResponseDTO> conflicts = eventRepository.findAll().stream()
                .filter(e -> !e.getCreatedBy().getEmail().equals(email)) // autres organisateurs
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(conflicts);
    }



    // Récupérer les événements en attente
    @GetMapping("/pending")
    public ResponseEntity<List<EventResponseDTO>> getPendingEvents() {
        List<EventResponseDTO> list = eventRepository.findByStatus(EventStatus.PENDING)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    // Valider un événement
    @PutMapping("/validate/{id}")
    public ResponseEntity<EventResponseDTO> validateEvent(@PathVariable Long id) {
        Event event = eventRepository.findById(id).orElseThrow(() -> new RuntimeException("Événement introuvable"));
        event.setStatus(EventStatus.VALIDATED);
        return ResponseEntity.ok(convertToDTO(eventRepository.save(event)));
    }

    // Rejeter un événement
    @PutMapping("/reject/{id}")
    public ResponseEntity<EventResponseDTO> rejectEvent(@PathVariable Long id) {
        Event event = eventRepository.findById(id).orElseThrow(() -> new RuntimeException("Événement introuvable"));
        event.setStatus(EventStatus.REJECTED);
        return ResponseEntity.ok(convertToDTO(eventRepository.save(event)));
    }

    // Supprimer un événement
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // conversion Event en EventResponseDTO
    private EventResponseDTO convertToDTO(Event event) {
        EventResponseDTO dto = new EventResponseDTO();
        dto.setId(event.getId());
        dto.setTitle(event.getTitle());
        dto.setDescription(event.getDescription());
        dto.setEventDate(event.getEventDate());
        dto.setStartTime(event.getStartTime());
        dto.setEndTime(event.getEndTime());
        dto.setLocation(event.getLocation());
        dto.setStatus(event.getStatus());

        AppUser creator = event.getCreatedBy();
        dto.setCreatorId(creator.getId());
        dto.setCreatorEmail(creator.getEmail());
        dto.setCreatorRoles(creator.getRoles().stream().map(Enum::name).collect(Collectors.toSet()));
        dto.setCreatorFirstName(creator.getFirstName());
        dto.setCreatorLastName(creator.getLastName());


        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String connectedEmail = auth.getName();
        dto.setColor(creator.getEmail().equals(connectedEmail) ? "blue" : "gray");

        return dto;
    }
}
