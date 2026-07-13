package com.reportservice.controller;

import com.reportservice.dto.ExportRequest;
import com.reportservice.service.ExportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ExportController {

    private final ExportService exportService;

    @PostMapping("/export")
    public ResponseEntity<byte[]> exportReport(@Valid @RequestBody ExportRequest request) {
        byte[] data = exportService.exportReport(request);

        String filename = "report_" + request.getReportType() + "_"
                + request.getStartDate() + "_" + request.getEndDate();

        MediaType mediaType;
        String extension;
        if (request.getFormat() == ExportRequest.ExportFormat.PDF) {
            mediaType = MediaType.APPLICATION_PDF;
            extension = ".pdf";
        } else {
            mediaType = MediaType.parseMediaType(
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            extension = ".xlsx";
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + extension + "\"")
                .body(data);
    }
}
