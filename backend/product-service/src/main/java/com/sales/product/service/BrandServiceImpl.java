package com.sales.product.service;

import com.sales.product.exception.ResourceNotFoundException;
import com.sales.product.model.Brand;
import com.sales.product.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;

    @Override
    @Transactional
    public Brand createBrand(Brand brand) {
        Brand saved = brandRepository.save(brand);
        log.info("Brand created: {} - {}", saved.getId(), saved.getName());
        return saved;
    }

    @Override
    @Transactional
    public Brand updateBrand(UUID id, Brand brand) {
        Brand existing = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found: " + id));
        existing.setName(brand.getName());
        existing.setSlug(brand.getSlug());
        existing.setDescription(brand.getDescription());
        existing.setLogo(brand.getLogo());
        existing.setStatus(brand.getStatus());
        Brand saved = brandRepository.save(existing);
        log.info("Brand updated: {} - {}", saved.getId(), saved.getName());
        return saved;
    }

    @Override
    public Brand getBrand(UUID id) {
        return brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found: " + id));
    }

    @Override
    public Brand getBrandBySlug(String slug) {
        return brandRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found by slug: " + slug));
    }

    @Override
    public List<Brand> getAllBrands() {
        return brandRepository.findAll();
    }

    @Override
    @Transactional
    public void deleteBrand(UUID id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found: " + id));
        brandRepository.delete(brand);
        log.info("Brand deleted: {}", id);
    }
}
