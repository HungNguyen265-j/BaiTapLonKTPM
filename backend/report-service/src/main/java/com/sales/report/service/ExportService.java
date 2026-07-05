package com.sales.report.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.UnitValue;
import com.sales.report.dto.ExportRequest;
import com.sales.report.dto.RevenueReportResponse;
import com.sales.report.exception.ReportGenerationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExportService {

    private final ReportService reportService;

    public byte[] exportReport(ExportRequest request) {
        if (request.getFormat() == ExportRequest.ExportFormat.EXCEL) {
            return exportToExcel(request);
        } else {
            return exportToPdf(request);
        }
    }

    public byte[] exportToExcel(ExportRequest request) {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet(request.getReportType());
            Row headerRow = sheet.createRow(0);
            String[] headers = getHeaders(request.getReportType(), request.getIncludeFields());
            for (int i = 0; i < headers.length; i++) {
                headerRow.createCell(i).setCellValue(headers[i]);
            }

            List<RevenueReportResponse> data = fetchReportData(request);
            int rowNum = 1;
            for (RevenueReportResponse item : data) {
                Row row = sheet.createRow(rowNum++);
                int cellNum = 0;
                if (shouldInclude("reportDate", request.getIncludeFields())) {
                    row.createCell(cellNum++).setCellValue(
                            item.getReportDate() != null ? item.getReportDate().toString() : "");
                }
                if (shouldInclude("channel", request.getIncludeFields())) {
                    row.createCell(cellNum++).setCellValue(
                            item.getChannel() != null ? item.getChannel() : "");
                }
                if (shouldInclude("revenue", request.getIncludeFields())) {
                    row.createCell(cellNum++).setCellValue(
                            item.getRevenue() != null ? item.getRevenue().doubleValue() : 0.0);
                }
                if (shouldInclude("orderCount", request.getIncludeFields())) {
                    row.createCell(cellNum++).setCellValue(
                            item.getOrderCount() != null ? item.getOrderCount() : 0);
                }
                if (shouldInclude("productCount", request.getIncludeFields())) {
                    row.createCell(cellNum++).setCellValue(
                            item.getProductCount() != null ? item.getProductCount() : 0);
                }
                if (shouldInclude("averageOrderValue", request.getIncludeFields())) {
                    row.createCell(cellNum).setCellValue(
                            item.getAverageOrderValue() != null ? item.getAverageOrderValue().doubleValue() : 0.0);
                }
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            workbook.write(baos);
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate Excel report: {}", e.getMessage());
            throw new ReportGenerationException("Failed to generate Excel report", e);
        }
    }

    public byte[] exportToPdf(ExportRequest request) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            document.add(new Paragraph("Report: " + request.getReportType())
                    .setFontSize(20).setBold());
            document.add(new Paragraph("Period: " + request.getStartDate() + " to " + request.getEndDate())
                    .setFontSize(12));
            document.add(new Paragraph(" "));

            String[] headers = getHeaders(request.getReportType(), request.getIncludeFields());
            float[] colWidths = new float[headers.length];
            for (int i = 0; i < headers.length; i++) {
                colWidths[i] = 1f / headers.length;
            }
            Table table = new Table(UnitValue.createPercentArray(colWidths));
            table.setWidth(UnitValue.createPercentValue(100));

            for (String header : headers) {
                table.addCell(new Cell().add(new Paragraph(header).setBold()));
            }

            List<RevenueReportResponse> data = fetchReportData(request);
            for (RevenueReportResponse item : data) {
                if (shouldInclude("reportDate", request.getIncludeFields())) {
                    table.addCell(item.getReportDate() != null ? item.getReportDate().toString() : "");
                }
                if (shouldInclude("channel", request.getIncludeFields())) {
                    table.addCell(item.getChannel() != null ? item.getChannel() : "");
                }
                if (shouldInclude("revenue", request.getIncludeFields())) {
                    table.addCell(item.getRevenue() != null ? item.getRevenue().toString() : "0");
                }
                if (shouldInclude("orderCount", request.getIncludeFields())) {
                    table.addCell(item.getOrderCount() != null ? item.getOrderCount().toString() : "0");
                }
                if (shouldInclude("productCount", request.getIncludeFields())) {
                    table.addCell(item.getProductCount() != null ? item.getProductCount().toString() : "0");
                }
                if (shouldInclude("averageOrderValue", request.getIncludeFields())) {
                    table.addCell(item.getAverageOrderValue() != null ? item.getAverageOrderValue().toString() : "0");
                }
            }

            document.add(table);
            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate PDF report: {}", e.getMessage());
            throw new ReportGenerationException("Failed to generate PDF report", e);
        }
    }

    private List<RevenueReportResponse> fetchReportData(ExportRequest request) {
        if ("top-products".equalsIgnoreCase(request.getReportType())) {
            return reportService.getTopProductsReport(request.getStartDate(), request.getEndDate());
        }
        String channel = (request.getChannels() != null && !request.getChannels().isEmpty())
                ? request.getChannels().get(0) : null;
        return reportService.getRevenueReport(request.getStartDate(), request.getEndDate(), channel);
    }

    private String[] getHeaders(String reportType, List<String> includeFields) {
        if ("top-products".equalsIgnoreCase(reportType)) {
            return new String[]{"Report Date", "Channel", "Revenue", "Quantity Sold"};
        }
        if (includeFields != null && !includeFields.isEmpty()) {
            return includeFields.toArray(new String[0]);
        }
        return new String[]{"reportDate", "channel", "revenue", "orderCount", "productCount", "averageOrderValue"};
    }

    private boolean shouldInclude(String field, List<String> includeFields) {
        if (includeFields == null || includeFields.isEmpty()) {
            return true;
        }
        return includeFields.contains(field);
    }
}
