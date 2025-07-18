package com.example.stage_talan.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
        import lombok.*;

import java.util.HashSet;
import java.util.Set;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "app_user")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private String password;

    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    private Set<Role> roles = new HashSet<>();

    @PrePersist
    public void setDefaultRole() {
        if (this.roles == null || this.roles.isEmpty()) {
            this.roles = Set.of(Role.USER);
        }
    }

    public boolean hasRole(Role role) {
        return roles.contains(role);
    }
}
