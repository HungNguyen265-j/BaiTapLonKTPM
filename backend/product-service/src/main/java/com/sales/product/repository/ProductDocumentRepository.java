package com.sales.product.repository;

import com.sales.product.model.ProductDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductDocumentRepository extends MongoRepository<ProductDocument, String> {
}
