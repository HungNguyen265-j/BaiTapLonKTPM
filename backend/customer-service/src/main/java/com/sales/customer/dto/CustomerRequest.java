package com.sales.customer.dto;

import com.sales.customer.model.Customer;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.time.LocalDate;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerRequest {

    @NotBlank(message = "Customer name is required")
    private String name;

    @Email(message = "Invalid email format")
    private String email;

    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Invalid phone number")
    private String phone;

    private Customer.Gender gender;

    @Past(message = "Birthday must be in the past")
    private LocalDate birthday;

    private String address;

    private String city;

    private String district;

    private String ward;

    private String avatar;

    private Customer.Source source;

    private Map<String, Object> tags;

    private String notes;
}
