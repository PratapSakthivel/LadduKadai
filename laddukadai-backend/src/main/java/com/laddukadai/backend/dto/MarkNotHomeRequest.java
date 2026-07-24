package com.laddukadai.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarkNotHomeRequest {

    @NotNull
    private LocalDate rescheduleDate;

    private String notes;
}
