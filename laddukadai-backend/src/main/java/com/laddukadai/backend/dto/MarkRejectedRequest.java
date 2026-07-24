package com.laddukadai.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarkRejectedRequest {

    @NotBlank(message = "Rejection notes are required")
    private String notes;
}
