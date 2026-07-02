package com.sales.promotion.service;

import com.sales.promotion.exception.PromotionNotFoundException;
import com.sales.promotion.model.FlashSale;
import com.sales.promotion.repository.FlashSaleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FlashSaleServiceImpl implements FlashSaleService {

    private final FlashSaleRepository flashSaleRepository;

    @Override
    @Transactional
    public FlashSale createFlashSale(FlashSale flashSale) {
        flashSale.setStatus(FlashSale.FlashSaleStatus.SCHEDULED);
        return flashSaleRepository.save(flashSale);
    }

    @Override
    @Transactional
    public FlashSale updateFlashSale(UUID id, FlashSale updated) {
        FlashSale flashSale = flashSaleRepository.findById(id)
                .orElseThrow(() -> new PromotionNotFoundException("FlashSale not found: " + id));

        flashSale.setName(updated.getName());
        flashSale.setDescription(updated.getDescription());
        flashSale.setStartTime(updated.getStartTime());
        flashSale.setEndTime(updated.getEndTime());
        if (updated.getStatus() != null) {
            flashSale.setStatus(updated.getStatus());
        }
        return flashSaleRepository.save(flashSale);
    }

    @Override
    public FlashSale getFlashSale(UUID id) {
        return flashSaleRepository.findById(id)
                .orElseThrow(() -> new PromotionNotFoundException("FlashSale not found: " + id));
    }

    @Override
    public List<FlashSale> getAllFlashSales() {
        return flashSaleRepository.findAll();
    }

    @Override
    @Transactional
    public void deleteFlashSale(UUID id) {
        FlashSale flashSale = flashSaleRepository.findById(id)
                .orElseThrow(() -> new PromotionNotFoundException("FlashSale not found: " + id));
        flashSaleRepository.delete(flashSale);
    }

    @Override
    @Transactional
    public FlashSale activateFlashSale(UUID id) {
        FlashSale flashSale = flashSaleRepository.findById(id)
                .orElseThrow(() -> new PromotionNotFoundException("FlashSale not found: " + id));
        flashSale.setStatus(FlashSale.FlashSaleStatus.ACTIVE);
        return flashSaleRepository.save(flashSale);
    }

    @Override
    @Transactional
    public FlashSale endFlashSale(UUID id) {
        FlashSale flashSale = flashSaleRepository.findById(id)
                .orElseThrow(() -> new PromotionNotFoundException("FlashSale not found: " + id));
        flashSale.setStatus(FlashSale.FlashSaleStatus.ENDED);
        return flashSaleRepository.save(flashSale);
    }

    @Override
    public List<FlashSale> getActiveFlashSales() {
        LocalDateTime now = LocalDateTime.now();
        return flashSaleRepository.findByStartTimeLessThanEqualAndEndTimeGreaterThanEqual(now, now);
    }
}
