package com.sales.product.service;

import com.sales.product.exception.ResourceNotFoundException;
import com.sales.product.model.Category;
import com.sales.product.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    @Transactional
    public Category createCategory(Category category) {
        Category saved = categoryRepository.save(category);
        log.info("Category created: {} - {}", saved.getId(), saved.getName());
        return saved;
    }

    @Override
    @Transactional
    public Category updateCategory(UUID id, Category category) {
        Category existing = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));
        existing.setName(category.getName());
        existing.setSlug(category.getSlug());
        existing.setDescription(category.getDescription());
        existing.setParentId(category.getParentId());
        existing.setImage(category.getImage());
        existing.setSortOrder(category.getSortOrder());
        existing.setStatus(category.getStatus());
        Category saved = categoryRepository.save(existing);
        log.info("Category updated: {} - {}", saved.getId(), saved.getName());
        return saved;
    }

    @Override
    public Category getCategory(UUID id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));
    }

    @Override
    public Category getCategoryBySlug(String slug) {
        return categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found by slug: " + slug));
    }

    @Override
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Override
    public List<Category> getCategoriesByParent(UUID parentId) {
        return categoryRepository.findByParentId(parentId);
    }

    @Override
    @Transactional
    public void deleteCategory(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));
        categoryRepository.delete(category);
        log.info("Category deleted: {}", id);
    }
}
