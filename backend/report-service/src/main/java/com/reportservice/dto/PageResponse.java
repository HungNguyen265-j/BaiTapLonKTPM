package com.reportservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Khớp với cấu trúc phân trang mà order/customer/product-service trả về:
 * { content: [...], page, size, totalElements, totalPages }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> {
    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
}
