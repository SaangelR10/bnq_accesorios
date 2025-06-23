package com.bnqaccesorios.repository;

import com.bnqaccesorios.model.Orden;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrdenRepository extends JpaRepository<Orden, Long> {
} 