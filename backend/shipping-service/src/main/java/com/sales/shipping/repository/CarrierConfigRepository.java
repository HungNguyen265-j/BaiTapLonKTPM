package com.sales.shipping.repository;

import com.sales.shipping.model.CarrierConfig;
import com.sales.shipping.model.enums.Carrier;
import com.sales.shipping.model.enums.CarrierStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CarrierConfigRepository extends JpaRepository<CarrierConfig, UUID> {

    Optional<CarrierConfig> findByCarrier(Carrier carrier);

    List<CarrierConfig> findByStatus(CarrierStatus status);
}
