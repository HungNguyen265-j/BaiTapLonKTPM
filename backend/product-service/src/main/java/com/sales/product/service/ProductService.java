package com.sales.product.service;

import com.sales.product.dto.*;
import com.sales.product.model.SalesChannel;

import java.util.List;
import java.util.UUID;

public interface ProductService {

    ProductResponse createProduct(ProductRequest request);

    ProductResponse updateProduct(UUID id, ProductRequest request);

    ProductResponse getProduct(UUID id);

    ProductResponse getProductBySku(String sku);

    ProductResponse getProductBySlug(String slug);

    void deleteProduct(UUID id);

    PageResponse<ProductResponse> searchProducts(ProductSearchCriteria criteria);

    List<ProductChannelResponse> getProductChannels(UUID productId);

    void syncProductToChannels(UUID productId, List<SalesChannel> channels);
}
