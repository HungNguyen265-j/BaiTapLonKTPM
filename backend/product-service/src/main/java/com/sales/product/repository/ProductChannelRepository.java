package com.sales.product.repository;

import com.sales.product.model.ProductChannel;
import com.sales.product.model.SalesChannel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductChannelRepository extends JpaRepository<ProductChannel, UUID> {

    List<ProductChannel> findByProductId(UUID productId);

    Optional<ProductChannel> findByProductIdAndChannel(UUID productId, SalesChannel channel);

    List<ProductChannel> findByChannelAndSyncStatus(SalesChannel channel, String syncStatus);
}
