package com.bnqaccesorios.repository;

import com.bnqaccesorios.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
} 