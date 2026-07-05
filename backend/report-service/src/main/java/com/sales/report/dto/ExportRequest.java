package com.sales.report.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExportRequest {

    @NotNull(message = "format is required")
    private ExportFormat format;

    @NotBlank(message = "reportType is required")
    private String reportType;

    @NotNull(message = "startDate is required")
    private LocalDate startDate;

    @NotNull(message = "endDate is required")
    private LocalDate endDate;

    private List<String> channels;

    private List<String> includeFields;

    public enum ExportFormat {
        EXCEL, PDF
    }
}
