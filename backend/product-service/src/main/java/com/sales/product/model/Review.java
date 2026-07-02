package com.sales.product.model;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    private String id;
    private String userId;
    private String userName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
