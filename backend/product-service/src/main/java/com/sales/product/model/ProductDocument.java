package com.sales.product.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.Map;

@Document(collection = "product_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDocument {

    @Id
    @Indexed(unique = true)
    private String id;

    private String richContent;

    private Map<String, Object> specifications;

    private Map<String, Object> seoMetadata;

    private List<Review> reviews;

    private Map<String, Object> attributes;
}
