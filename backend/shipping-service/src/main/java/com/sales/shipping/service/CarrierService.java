package com.sales.shipping.service;

import com.sales.shipping.dto.CarrierConfigRequest;
import com.sales.shipping.model.CarrierConfig;
import com.sales.shipping.model.enums.Carrier;
import com.sales.shipping.model.enums.CarrierStatus;
import com.sales.shipping.repository.CarrierConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CarrierService {

    private final CarrierConfigRepository configRepository;

    public List<CarrierConfig> getAllConfigs() {
        return configRepository.findAll();
    }

    public CarrierConfig getConfig(Carrier carrier) {
        return configRepository.findByCarrier(carrier)
                .orElse(null);
    }

    @Transactional
    public CarrierConfig saveConfig(CarrierConfigRequest request) {
        CarrierConfig config = CarrierConfig.builder()
                .carrier(request.getCarrier())
                .apiKey(request.getApiKey())
                .apiSecret(request.getApiSecret())
                .endpointUrl(request.getEndpointUrl())
                .callbackUrl(request.getCallbackUrl())
                .status(request.getStatus())
                .configData(request.getConfigData())
                .build();
        config = configRepository.save(config);
        log.info("Carrier config saved: {}", config.getCarrier());
        return config;
    }

    @Transactional
    public CarrierConfig updateConfig(UUID id, CarrierConfigRequest request) {
        CarrierConfig config = configRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Carrier config not found: " + id));
        config.setCarrier(request.getCarrier());
        config.setApiKey(request.getApiKey());
        config.setApiSecret(request.getApiSecret());
        config.setEndpointUrl(request.getEndpointUrl());
        config.setCallbackUrl(request.getCallbackUrl());
        config.setStatus(request.getStatus());
        config.setConfigData(request.getConfigData());
        config = configRepository.save(config);
        log.info("Carrier config updated: {}", config.getCarrier());
        return config;
    }

    @Transactional
    public void deleteConfig(UUID id) {
        configRepository.deleteById(id);
        log.info("Carrier config deleted: {}", id);
    }

    public List<CarrierConfig> getActiveConfigs() {
        return configRepository.findByStatus(CarrierStatus.ACTIVE);
    }
}
