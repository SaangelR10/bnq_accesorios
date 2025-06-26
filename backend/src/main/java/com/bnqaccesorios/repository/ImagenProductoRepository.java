package com.bnqaccesorios.repository;

import com.bnqaccesorios.model.ImagenProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ImagenProductoRepository extends JpaRepository<ImagenProducto, Long> {
    List<ImagenProducto> findByProductoId(Long productoId);
} 