package com.sales.product.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.support.mapping.Jackson2JavaTypeMapper;
import org.springframework.kafka.support.converter.JsonMessageConverter;
import org.springframework.kafka.support.mapping.DefaultJackson2JavaTypeMapper;

import java.util.Map;

@Configuration
public class KafkaConfig {

    @Bean
    public NewTopic productEventsTopic() {
        return TopicBuilder.name("product-events")
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic productSyncEventsTopic() {
        return TopicBuilder.name("product-sync-events")
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public JsonMessageConverter jsonMessageConverter() {
        DefaultJackson2JavaTypeMapper typeMapper = new DefaultJackson2JavaTypeMapper();
        typeMapper.setTypePrecedence(Jackson2JavaTypeMapper.TypePrecedence.TYPE_ID);
        typeMapper.setIdClassMapping(Map.of(
                "com.sales.product.event.ProductCreatedEvent",
                com.sales.product.event.ProductCreatedEvent.class,
                "com.sales.product.event.ProductUpdatedEvent",
                com.sales.product.event.ProductUpdatedEvent.class,
                "com.sales.product.event.ProductSyncEvent",
                com.sales.product.event.ProductSyncEvent.class
        ));
        JsonMessageConverter converter = new JsonMessageConverter();
        converter.setTypeMapper(typeMapper);
        return converter;
    }
}
