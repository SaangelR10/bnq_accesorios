package com.bnqaccesorios.controller;

import com.bnqaccesorios.model.Producto;
import com.bnqaccesorios.model.Categoria;
import com.bnqaccesorios.service.ProductoService;
import com.bnqaccesorios.repository.CategoriaRepository;
import com.bnqaccesorios.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import java.io.IOException;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvException;
import java.io.StringReader;
import java.io.InputStream;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProductoController {
    private final ProductoService productoService;
    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;

    // Endpoints públicos
    @GetMapping("/productos")
    public ResponseEntity<List<Producto>> listarPublicos() {
        return ResponseEntity.ok(productoService.listarPublicos());
    }

    @GetMapping("/productos/{id}")
    public ResponseEntity<Producto> detallePublico(@PathVariable Long id) {
        return productoService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Endpoints admin
    @GetMapping("/admin/productos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Producto>> listarAdmin() {
        return ResponseEntity.ok(productoService.listarAdmin());
    }

    @PostMapping(value = "/admin/productos", consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Producto> crearProducto(
            @RequestParam("producto") String productoJson,
            @RequestParam("categoriaId") Long categoriaId,
            @RequestPart(value = "imagenes", required = false) List<MultipartFile> imagenes
    ) throws IOException {
        System.out.println("=== CREAR PRODUCTO ===");
        System.out.println("Producto JSON: " + productoJson);
        System.out.println("Categoría ID: " + categoriaId);
        System.out.println("Imágenes: " + (imagenes != null ? imagenes.size() : "null"));
        
        ObjectMapper mapper = new ObjectMapper();
        Producto producto = mapper.readValue(productoJson, Producto.class);
        System.out.println("Producto parseado: " + producto.getNombre());
        
        Producto creado = productoService.crearProducto(producto, categoriaId, imagenes);
        System.out.println("Producto creado con categoría: " + (creado.getCategoria() != null ? creado.getCategoria().getNombre() : "null"));
        
        return ResponseEntity.ok(creado);
    }

    @PutMapping(value = "/admin/productos/{id}", consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Producto> editarProducto(
            @PathVariable Long id,
            @RequestParam("producto") String productoJson,
            @RequestParam("categoriaId") Long categoriaId,
            @RequestPart(value = "imagenes", required = false) List<MultipartFile> imagenes,
            @RequestParam(value = "imagenesAEliminar", required = false) List<String> imagenesAEliminar
    ) throws IOException {
        System.out.println("=== EDITAR PRODUCTO ===");
        System.out.println("ID: " + id);
        System.out.println("Producto JSON: " + productoJson);
        System.out.println("Categoría ID: " + categoriaId);
        System.out.println("Imágenes: " + (imagenes != null ? imagenes.size() : "null"));
        System.out.println("Imágenes a eliminar: " + (imagenesAEliminar != null ? imagenesAEliminar : "null"));
        ObjectMapper mapper = new ObjectMapper();
        Producto producto = mapper.readValue(productoJson, Producto.class);
        System.out.println("Producto parseado: " + producto.getNombre());
        Producto editado = productoService.editarProducto(id, producto, categoriaId, imagenes, imagenesAEliminar);
        System.out.println("Producto editado con categoría: " + (editado.getCategoria() != null ? editado.getCategoria().getNombre() : "null"));
        return ResponseEntity.ok(editado);
    }

    @DeleteMapping("/admin/productos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminarProducto(@PathVariable Long id) {
        productoService.eliminarProducto(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping(value = "/admin/productos/{id}/estado", consumes = {"application/json", "application/x-www-form-urlencoded"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Producto> cambiarEstado(@PathVariable Long id, @RequestParam boolean activo) {
        Producto actualizado = productoService.cambiarEstado(id, activo);
        return ResponseEntity.ok(actualizado);
    }

    // Servir imágenes de productos
    @GetMapping("/imagenes_productos/{filename:.+}")
    public ResponseEntity<Resource> getImagen(@PathVariable String filename) throws Exception {
        Path file = Paths.get(System.getProperty("user.dir"), "uploads", "imagenes_productos").resolve(filename);
        if (!Files.exists(file)) {
            return ResponseEntity.notFound().build();
        }
        Resource resource = new UrlResource(file.toUri());
        String contentType = Files.probeContentType(file);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(resource);
    }

    // PUT para edición inline (application/json)
    @PutMapping(value = "/admin/productos/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> editarProductoInline(@PathVariable Long id, @RequestBody Producto datos) {
        // Validar nombre único
        Producto existente = productoService.buscarPorNombre(datos.getNombre());
        if (existente != null && !existente.getId().equals(id)) {
            return ResponseEntity.status(409).body("Ya existe un producto con ese nombre");
        }
        Producto editado = productoService.editarProductoInline(id, datos);
        return ResponseEntity.ok(editado);
    }

    // Endpoint para carga masiva de productos
    @PostMapping("/productos/masivo")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> cargarProductosMasivo(@RequestParam("archivo") MultipartFile archivo) {
        try {
            List<Map<String, Object>> productos = procesarArchivoMasivo(archivo);
            return ResponseEntity.ok(productos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al procesar archivo: " + e.getMessage());
        }
    }

    // Endpoint para confirmar y guardar productos masivos
    @PostMapping("/productos/masivo/confirmar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> confirmarProductosMasivo(@RequestBody List<Map<String, Object>> productos) {
        try {
            List<Producto> productosGuardados = new ArrayList<>();
            for (Map<String, Object> productoData : productos) {
                Producto producto = new Producto();
                producto.setNombre((String) productoData.get("nombre"));
                producto.setDescripcion((String) productoData.get("descripcion"));
                producto.setPrecio(Double.parseDouble(productoData.get("precio").toString()));
                producto.setStock(Integer.parseInt(productoData.get("stock").toString()));
                producto.setMateriales((String) productoData.get("materiales"));
                producto.setActivo(true);
                
                // Buscar categoría por nombre
                String nombreCategoria = (String) productoData.get("categoria");
                if (nombreCategoria != null && !nombreCategoria.trim().isEmpty()) {
                    Categoria categoria = categoriaRepository.findByNombre(nombreCategoria.trim())
                            .orElseGet(() -> {
                                Categoria nuevaCategoria = new Categoria();
                                nuevaCategoria.setNombre(nombreCategoria.trim());
                                return categoriaRepository.save(nuevaCategoria);
                            });
                    producto.setCategoria(categoria);
                }
                
                productosGuardados.add(productoRepository.save(producto));
            }
            return ResponseEntity.ok(productosGuardados);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al guardar productos: " + e.getMessage());
        }
    }

    private List<Map<String, Object>> procesarArchivoMasivo(MultipartFile archivo) throws IOException {
        List<Map<String, Object>> productos = new ArrayList<>();
        String nombreArchivo = archivo.getOriginalFilename();
        
        if (nombreArchivo == null) {
            throw new RuntimeException("Nombre de archivo no válido");
        }
        
        if (nombreArchivo.toLowerCase().endsWith(".csv")) {
            productos = procesarCSV(archivo);
        } else if (nombreArchivo.toLowerCase().endsWith(".xlsx") || nombreArchivo.toLowerCase().endsWith(".xls")) {
            productos = procesarExcel(archivo);
        } else {
            throw new RuntimeException("Formato de archivo no soportado. Use CSV o Excel.");
        }
        
        return productos;
    }

    private List<Map<String, Object>> procesarCSV(MultipartFile archivo) throws IOException {
        List<Map<String, Object>> productos = new ArrayList<>();
        String contenido = new String(archivo.getBytes());
        
        System.out.println("=== PROCESANDO CSV ===");
        System.out.println("Contenido del archivo:");
        System.out.println(contenido);
        
        // Detectar separador: si hay más ; que , usar ;
        char separador = ',';
        int comas = contenido.split(",").length;
        int puntosYComa = contenido.split(";").length;
        if (puntosYComa > comas) separador = ';';
        System.out.println("Separador detectado: " + separador);
        
        // Leer líneas manualmente para máxima tolerancia
        String[] lineas = contenido.split("\r?\n");
        if (lineas.length < 2) return productos;
        
        // Procesar cada línea (saltando encabezado)
        for (int i = 1; i < lineas.length; i++) {
            String linea = lineas[i].trim();
            if (linea.isEmpty()) continue;
            String[] fila = linea.split(String.valueOf(separador), -1);
            if (fila.length < 6) {
                System.out.println("Fila " + i + " ignorada (menos de 6 columnas): " + linea);
                continue;
            }
            try {
                Map<String, Object> producto = new HashMap<>();
                String nombre = limpiarCampo(fila[0]);
                String precioStr = limpiarCampo(fila[1]);
                String stockStr = limpiarCampo(fila[2]);
                String descripcion = limpiarCampo(fila[3]);
                String materiales = limpiarCampo(fila[4]);
                String categoria = limpiarCampo(fila[5]);
                
                // Convertir precio
                double precio = 0.0;
                try {
                    precioStr = precioStr.replaceAll("[^0-9.]", "");
                    precio = Double.parseDouble(precioStr);
                } catch (NumberFormatException e) {
                    System.out.println("Error al parsear precio: " + precioStr + ", usando 0.0");
                }
                // Convertir stock
                int stock = 0;
                try {
                    stock = Integer.parseInt(stockStr);
                } catch (NumberFormatException e) {
                    System.out.println("Error al parsear stock: " + stockStr + ", usando 0");
                }
                producto.put("nombre", nombre);
                producto.put("precio", precio);
                producto.put("stock", stock);
                producto.put("descripcion", descripcion);
                producto.put("materiales", materiales);
                producto.put("categoria", categoria);
                System.out.println("Producto procesado: " + producto);
                productos.add(producto);
            } catch (Exception e) {
                System.out.println("Error procesando fila " + i + ": " + e.getMessage());
            }
        }
        System.out.println("Total de productos válidos encontrados: " + productos.size());
        return productos;
    }

    private String limpiarCampo(String campo) {
        if (campo == null) return "";
        return campo.replaceAll("^\"|\"$", "").replaceAll("^'|'$", "").trim();
    }

    private List<Map<String, Object>> procesarExcel(MultipartFile archivo) throws IOException {
        List<Map<String, Object>> productos = new ArrayList<>();
        String nombreArchivo = archivo.getOriginalFilename();
        
        System.out.println("=== PROCESANDO EXCEL ===");
        System.out.println("Nombre del archivo: " + nombreArchivo);
        
        try (InputStream is = archivo.getInputStream();
             Workbook workbook = (nombreArchivo != null && nombreArchivo.toLowerCase().endsWith(".xlsx")) ? 
                 new XSSFWorkbook(is) : new HSSFWorkbook(is)) {
            
            Sheet sheet = workbook.getSheetAt(0);
            System.out.println("Total de filas en Excel: " + sheet.getLastRowNum());
            
            // Saltar la primera fila (encabezados)
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row fila = sheet.getRow(i);
                System.out.println("Procesando fila Excel " + i + ": " + (fila != null ? "fila encontrada" : "fila null"));
                
                if (fila != null && fila.getCell(0) != null && !fila.getCell(0).toString().trim().isEmpty()) {
                    try {
                        Map<String, Object> producto = new HashMap<>();
                        
                        String nombre = getCellValueAsString(fila.getCell(0));
                        double precio = getCellValueAsDouble(fila.getCell(1));
                        int stock = getCellValueAsInt(fila.getCell(2));
                        String descripcion = getCellValueAsString(fila.getCell(3));
                        String materiales = getCellValueAsString(fila.getCell(4));
                        String categoria = getCellValueAsString(fila.getCell(5));
                        
                        producto.put("nombre", nombre);
                        producto.put("precio", precio);
                        producto.put("stock", stock);
                        producto.put("descripcion", descripcion);
                        producto.put("materiales", materiales);
                        producto.put("categoria", categoria);
                        
                        System.out.println("Producto Excel procesado: " + producto);
                        productos.add(producto);
                        
                    } catch (Exception e) {
                        System.out.println("Error procesando fila Excel " + i + ": " + e.getMessage());
                        // Continuar con la siguiente fila
                    }
                } else {
                    System.out.println("Fila Excel " + i + " ignorada (vacía o sin nombre)");
                }
            }
        }
        
        System.out.println("Total de productos Excel válidos encontrados: " + productos.size());
        return productos;
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING: return cell.getStringCellValue().trim();
            case NUMERIC: return String.valueOf((int) cell.getNumericCellValue());
            default: return "";
        }
    }

    private Double getCellValueAsDouble(Cell cell) {
        if (cell == null) return 0.0;
        switch (cell.getCellType()) {
            case NUMERIC: return cell.getNumericCellValue();
            case STRING: return Double.parseDouble(cell.getStringCellValue().trim());
            default: return 0.0;
        }
    }

    private Integer getCellValueAsInt(Cell cell) {
        if (cell == null) return 0;
        switch (cell.getCellType()) {
            case NUMERIC: return (int) cell.getNumericCellValue();
            case STRING: return Integer.parseInt(cell.getStringCellValue().trim());
            default: return 0;
        }
    }
} 