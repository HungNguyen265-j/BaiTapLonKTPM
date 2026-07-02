package com.sales.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.ReactiveRedisConnectionFactory;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {

    @Bean
    public ReactiveRedisTemplate<String, Object> reactiveRedisTemplate(
            ReactiveRedisConnectionFactory factory) {

        GenericJackson2JsonRedisSerializer jsonSerializer =
                new GenericJackson2JsonRedisSerializer();

        RedisSerializationContext<String, Object> context =
                RedisSerializationContext.<String, Object>newSerializationContext()
                        .key(StringRedisSerializer.UTF_8)
                        .value(jsonSerializer)
                        .hashKey(StringRedisSerializer.UTF_8)
                        .hashValue(jsonSerializer)
                        .build();

        return new ReactiveRedisTemplate<>(factory, context);
    }
}
