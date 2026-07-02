package com.sales.product.service;

import com.sales.product.model.Category;

import java.util.List;
import java.util.UUID;

public interface CategoryService {

    Category createCategory(Category category);

    Category updateCategory(UUID id, Category category);

    Category getCategory(UUID id);

    Category getCategoryBySlug(String slug);

    List<Category> getAllCategories();

    List<Category> getCategoriesByParent(UUID parentId);

    void deleteCategory(UUID id);
}
