package com.sales.product.service;

import com.sales.product.dto.*;
import com.sales.product.event.ProductCreatedEvent;
import com.sales.product.event.ProductUpdatedEvent;
import com.sales.product.exception.ResourceNotFoundException;
import com.sales.product.model.*;
import com.sales.product.repository.ProductChannelRepository;
import com.sales.product.repository.ProductDocumentRepository;
import com.sales.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.*;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductChannelRepository productChannelRepository;
    private final ProductDocumentRepository productDocumentRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final CacheService cacheService;

    @Override
    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductResponse createProduct(ProductRequest request) {
        Product product = Product.builder()
                .sku(request.getSku())
                .name(request.getName())
                .slug(request.getSlug())
                .description(request.getDescription())
                .categoryId(request.getCategoryId())
                .brandId(request.getBrandId())
                .basePrice(request.getBasePrice())
                .salePrice(request.getSalePrice())
                .unit(request.getUnit())
                .weight(request.getWeight())
                .images(request.getImages())
                .tags(request.getTags())
                .status(request.getStatus() != null ? request.getStatus() : ProductStatus.DRAFT)
                .channelSettings(request.getChannelSettings())
                .build();

        product = productRepository.save(product);

        ProductDocument doc = ProductDocument.builder()
                .id(product.getId().toString())
                .richContent("")
                .build();
        productDocumentRepository.save(doc);

        ProductCreatedEvent event = new ProductCreatedEvent();
        event.setProductId(product.getId().toString());
        event.setSku(product.getSku());
        event.setEventType("PRODUCT_CREATED");
        kafkaTemplate.send("product-events", event);

        log.info("Product created: {} - {}", product.getSku(), product.getName());
        return mapToResponse(product);
    }

    @Override
    @Transactional
    @CacheEvict(value = "products", key = "#id", beforeInvocation = true)
    public ProductResponse updateProduct(UUID id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));

        product.setSku(request.getSku());
        product.setName(request.getName());
        product.setSlug(request.getSlug());
        product.setDescription(request.getDescription());
        product.setCategoryId(request.getCategoryId());
        product.setBrandId(request.getBrandId());
        product.setBasePrice(request.getBasePrice());
        product.setSalePrice(request.getSalePrice());
        product.setUnit(request.getUnit());
        product.setWeight(request.getWeight());
        product.setImages(request.getImages());
        product.setTags(request.getTags());
        if (request.getStatus() != null) {
            product.setStatus(request.getStatus());
        }
        product.setChannelSettings(request.getChannelSettings());

        product = productRepository.save(product);

        ProductUpdatedEvent event = new ProductUpdatedEvent();
        event.setProductId(product.getId().toString());
        event.setSku(product.getSku());
        event.setEventType("PRODUCT_UPDATED");
        kafkaTemplate.send("product-events", event);

        log.info("Product updated: {} - {}", product.getSku(), product.getName());
        return mapToResponse(product);
    }

    @Override
    @Cacheable(value = "products", key = "#id", unless = "#result == null")
    public ProductResponse getProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
        return mapToResponse(product);
    }

    @Override
    public ProductResponse getProductBySku(String sku) {
        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found by SKU: " + sku));
        return mapToResponse(product);
    }

    @Override
    public ProductResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found by slug: " + slug));
        return mapToResponse(product);
    }

    @Override
    @Transactional
    @CacheEvict(value = "products", key = "#id")
    public void deleteProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
        productRepository.delete(product);
        productDocumentRepository.deleteById(id.toString());
        log.info("Product deleted: {}", id);
    }

    @Override
    public PageResponse<ProductResponse> searchProducts(ProductSearchCriteria criteria) {
        Pageable pageable = PageRequest.of(
                criteria.getPage(),
                criteria.getSize(),
                Sort.by(Sort.Direction.fromString(criteria.getSortDir()), criteria.getSortBy())
        );

        Page<Product> productPage;

        if (criteria.getKeyword() != null && !criteria.getKeyword().isBlank()) {
            List<Product> products = productRepository.searchProducts(criteria.getKeyword());
            int start = (int) pageable.getOffset();
            int end = Math.min(start + pageable.getPageSize(), products.size());
            List<Product> paged = products.subList(start, end);
            productPage = new PageImpl<>(paged, pageable, products.size());
        } else {
            ExampleMatcher matcher = ExampleMatcher.matching()
                    .withIgnoreNullValues()
                    .withIgnoreCase();

            Product probe = Product.builder()
                    .categoryId(criteria.getCategoryId())
                    .brandId(criteria.getBrandId())
                    .status(criteria.getStatus())
                    .build();

            if (criteria.getCategoryId() != null || criteria.getBrandId() != null || criteria.getStatus() != null) {
                productPage = productRepository.findAll(Example.of(probe, matcher), pageable);
            } else {
                productPage = productRepository.findAll(pageable);
            }
        }

        Page<ProductResponse> responsePage = productPage.map(this::mapToResponse);
        return PageResponse.from(responsePage);
    }

    @Override
    public List<ProductChannelResponse> getProductChannels(UUID productId) {
        List<ProductChannel> channels = productChannelRepository.findByProductId(productId);
        return channels.stream().map(this::mapToChannelResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void syncProductToChannels(UUID productId, List<SalesChannel> channels) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        for (SalesChannel channel : channels) {
            ProductChannel productChannel = productChannelRepository
                    .findByProductIdAndChannel(productId, channel)
                    .orElse(ProductChannel.builder()
                            .productId(productId)
                            .channel(channel)
                            .status(ProductStatus.DRAFT)
                            .syncStatus(SyncStatus.PENDING)
                            .build());

            productChannel.setSyncStatus(SyncStatus.PENDING);
            productChannelRepository.save(productChannel);

            com.sales.product.event.ProductSyncEvent syncEvent =
                    new com.sales.product.event.ProductSyncEvent();
            syncEvent.setProductId(productId.toString());
            syncEvent.setSku(product.getSku());
            syncEvent.setChannel(channel.name());
            syncEvent.setEventType("PRODUCT_SYNC");
            kafkaTemplate.send("product-sync-events", syncEvent);
        }

        log.info("Product {} synced to channels: {}", productId, channels);
    }

    private ProductResponse mapToResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .sku(product.getSku())
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .categoryId(product.getCategoryId())
                .brandId(product.getBrandId())
                .basePrice(product.getBasePrice())
                .salePrice(product.getSalePrice())
                .unit(product.getUnit())
                .weight(product.getWeight())
                .images(product.getImages())
                .tags(product.getTags())
                .status(product.getStatus())
                .channelSettings(product.getChannelSettings())
                .createdBy(product.getCreatedBy())
                .updatedBy(product.getUpdatedBy())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .version(product.getVersion())
                .build();
    }

    private ProductChannelResponse mapToChannelResponse(ProductChannel pc) {
        return ProductChannelResponse.builder()
                .id(pc.getId())
                .productId(pc.getProductId())
                .channel(pc.getChannel())
                .channelProductId(pc.getChannelProductId())
                .channelUrl(pc.getChannelUrl())
                .syncStatus(pc.getSyncStatus())
                .status(pc.getStatus().name())
                .lastSyncAt(pc.getLastSyncAt())
                .channelData(pc.getChannelData())
                .createdAt(pc.getCreatedAt())
                .updatedAt(pc.getUpdatedAt())
                .build();
    }
}
