package com.sales.product.controller;

import com.sales.product.model.Brand;
import com.sales.product.service.BrandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/brands")
@RequiredArgsConstructor
public class BrandController {

    private final BrandService brandService;

    @PostMapping
    public ResponseEntity<Brand> createBrand(@Valid @RequestBody Brand brand) {
        Brand created = brandService.createBrand(brand);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Brand> updateBrand(
            @PathVariable UUID id,
            @Valid @RequestBody Brand brand) {
        Brand updated = brandService.updateBrand(id, brand);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Brand> getBrand(@PathVariable UUID id) {
        Brand brand = brandService.getBrand(id);
        return ResponseEntity.ok(brand);
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<Brand> getBrandBySlug(@PathVariable String slug) {
        Brand brand = brandService.getBrandBySlug(slug);
        return ResponseEntity.ok(brand);
    }

    @GetMapping
    public ResponseEntity<List<Brand>> getAllBrands() {
        List<Brand> brands = brandService.getAllBrands();
        return ResponseEntity.ok(brands);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBrand(@PathVariable UUID id) {
        brandService.deleteBrand(id);
        return ResponseEntity.noContent().build();
    }
}
