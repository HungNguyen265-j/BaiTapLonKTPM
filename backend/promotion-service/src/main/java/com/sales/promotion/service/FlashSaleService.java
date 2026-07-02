package com.sales.promotion.service;

import com.sales.promotion.model.FlashSale;

import java.util.List;
import java.util.UUID;

public interface FlashSaleService {

    FlashSale createFlashSale(FlashSale flashSale);

    FlashSale updateFlashSale(UUID id, FlashSale flashSale);

    FlashSale getFlashSale(UUID id);

    List<FlashSale> getAllFlashSales();

    void deleteFlashSale(UUID id);

    FlashSale activateFlashSale(UUID id);

    FlashSale endFlashSale(UUID id);

    List<FlashSale> getActiveFlashSales();
}
