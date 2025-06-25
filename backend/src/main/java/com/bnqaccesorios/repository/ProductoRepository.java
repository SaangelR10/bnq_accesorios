package com.bnqaccesorios.repository;

import com.bnqaccesorios.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    Optional<Producto> findByNombre(String nombre);
    
    @Query("SELECT p FROM Producto p LEFT JOIN FETCH p.categoria LEFT JOIN FETCH p.imagenes")
    List<Producto> findAllWithCategoria();
    
    @Query("SELECT p FROM Producto p LEFT JOIN FETCH p.categoria LEFT JOIN FETCH p.imagenes WHERE p.activo = true")
    List<Producto> findAllActivosWithCategoria();
    
    @Query("SELECT p FROM Producto p LEFT JOIN FETCH p.categoria LEFT JOIN FETCH p.imagenes WHERE p.id = :id")
    Optional<Producto> findByIdWithCategoria(@Param("id") Long id);
} 