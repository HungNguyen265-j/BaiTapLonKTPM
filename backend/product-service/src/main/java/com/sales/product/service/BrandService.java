package com.sales.product.service;

import com.sales.product.model.Brand;

import java.util.List;
import java.util.UUID;

public interface BrandService {

    Brand createBrand(Brand brand);

    Brand updateBrand(UUID id, Brand brand);

    Brand getBrand(UUID id);

    Brand getBrandBySlug(String slug);

    List<Brand> getAllBrands();

    void deleteBrand(UUID id);
}
