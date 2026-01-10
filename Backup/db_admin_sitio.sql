CREATE DATABASE  IF NOT EXISTS `db_admin_sitio` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `db_admin_sitio`;
-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: db_vvff_admin
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `adm_aplicaciones_sitio`
--

DROP TABLE IF EXISTS `adm_aplicaciones_sitio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adm_aplicaciones_sitio` (
  `id_aplicacion` int NOT NULL AUTO_INCREMENT,
  `id_sitio` int NOT NULL COMMENT 'Vínculo multisitio',
  `id_entidad` int DEFAULT NULL COMMENT 'Vínculo con el diccionario de entidades',
  `id_estado` int DEFAULT NULL,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `enlace` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'URL o enlace relacionado con la aplicación',
  `metodo_http` enum('GET','POST','PUT','DELETE') COLLATE utf8mb4_unicode_ci DEFAULT 'GET' COMMENT 'Método de acceso al endpoint',
  `icono` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ruta o nombre del icono asociado a la aplicación',
  `es_menu` tinyint(1) DEFAULT '1' COMMENT 'Indica si debe aparecer en el sidebar o es solo un endpoint de API',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `clave` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_aplicacion`),
  KEY `idx_aplicaciones_sitio_sitios` (`id_sitio`),
  KEY `idx_aplicaciones_sitio_estados` (`id_estado`),
  KEY `idx_aplicaciones_sitio_entidades` (`id_entidad`),
  CONSTRAINT `fk_aplicaciones_sitio_entidades` FOREIGN KEY (`id_entidad`) REFERENCES `adm_entidades` (`id_entidad`),
  CONSTRAINT `fk_aplicaciones_sitio_estados` FOREIGN KEY (`id_estado`) REFERENCES `adm_estados` (`id_estado`),
  CONSTRAINT `fk_aplicaciones_sitio_sitios` FOREIGN KEY (`id_sitio`) REFERENCES `adm_sitios` (`id_sitio`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Gestor de endpoints y módulos de navegación vinculados a entidades';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_aplicaciones_sitio`
--

LOCK TABLES `adm_aplicaciones_sitio` WRITE;
/*!40000 ALTER TABLE `adm_aplicaciones_sitio` DISABLE KEYS */;
INSERT INTO `adm_aplicaciones_sitio` VALUES (1,1,19,1,'Lista de Usuarios','/api/v1/usuarios','GET','fa-users',1,NULL,NULL,NULL,'2026-01-08 12:14:25',NULL),(2,1,19,1,'Crear Usuario','/api/v1/usuarios','POST','fa-user-plus',0,NULL,NULL,NULL,'2026-01-08 12:14:25',NULL),(3,1,14,1,'Gestión de Roles','/api/v1/roles','GET','fa-shield',1,NULL,NULL,NULL,'2026-01-08 12:14:25',NULL),(4,1,3,1,'Ver Auditoría','/api/v1/auditoria','GET','fa-history',1,NULL,NULL,NULL,'2026-01-08 12:14:25',NULL),(5,1,4,1,'Ajustes del Sistema','/api/v1/config','GET','fa-cogs',1,NULL,NULL,NULL,'2026-01-08 12:14:25',NULL);
/*!40000 ALTER TABLE `adm_aplicaciones_sitio` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `tg_auditoria_apps_update` AFTER UPDATE ON `adm_aplicaciones_sitio` FOR EACH ROW BEGIN
    INSERT INTO `adm_auditoria` (id_entidad, id_registro, accion, datos_anteriores, datos_nuevos, fecha)
    VALUES (
        (SELECT id_entidad FROM adm_entidades WHERE nombre_tabla = 'adm_aplicaciones_sitio'),
        OLD.id_aplicacion,
        IF(NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL, 'DELETE', 'UPDATE'),
        JSON_OBJECT('enlace', OLD.enlace, 'id_estado', OLD.id_estado),
        JSON_OBJECT('enlace', NEW.enlace, 'id_estado', NEW.id_estado),
        NOW()
    );
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `adm_atributos`
--

DROP TABLE IF EXISTS `adm_atributos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adm_atributos` (
  `id_atributo` int NOT NULL AUTO_INCREMENT,
  `id_entidad` int NOT NULL COMMENT 'ID de la tabla a la que pertenece este campo',
  `nombre_columna` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre técnico de la columna',
  `tipo_dato` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tipo de dato (varchar, int, json, etc)',
  `es_auditable` tinyint(1) DEFAULT '1' COMMENT 'Flag para indicar si los cambios en este campo deben registrarse',
  `id_estado` int NOT NULL DEFAULT '1' COMMENT 'Estado de la columna (Activa, Depreciada, Oculta)',
  `ver_en_crear` tinyint(1) DEFAULT '1' COMMENT 'Visible en formulario de creación',
  `ver_en_editar` tinyint(1) DEFAULT '1' COMMENT 'Visible en formulario de edición',
  `ver_en_lista` tinyint(1) DEFAULT '1' COMMENT 'Visible en tablas o listados',
  `ver_en_detalle` tinyint(1) DEFAULT '1' COMMENT 'Visible en vista de solo lectura',
  `es_fk` tinyint(1) DEFAULT '0' COMMENT 'Indica si el campo es una llave foránea',
  `fk_tabla_referencia` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tabla a la que apunta la FK',
  `fk_columna_mostrar` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Columna de la FK con texto legible (ej: nombre)',
  PRIMARY KEY (`id_atributo`),
  KEY `fk_atributos_entidad` (`id_entidad`),
  KEY `fk_atributos_estado` (`id_estado`),
  CONSTRAINT `fk_atributos_entidad` FOREIGN KEY (`id_entidad`) REFERENCES `adm_entidades` (`id_entidad`) ON DELETE CASCADE,
  CONSTRAINT `fk_atributos_estado` FOREIGN KEY (`id_estado`) REFERENCES `adm_estados` (`id_estado`)
) ENGINE=InnoDB AUTO_INCREMENT=256 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Diccionario de columnas críticas para gestión de auditoría y formularios dinámicos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_atributos`
--

LOCK TABLES `adm_atributos` WRITE;
/*!40000 ALTER TABLE `adm_atributos` DISABLE KEYS */;
INSERT INTO `adm_atributos` VALUES (1,1,'id_aplicacion','int',1,1,0,0,0,0,0,NULL,NULL),(2,1,'id_sitio','int',1,1,1,1,1,1,0,'1','nombre'),(3,1,'id_estado','int',1,1,1,1,1,1,0,'1','nombre'),(4,1,'nombre','varchar',1,1,1,1,1,1,0,NULL,NULL),(5,1,'clave','varchar',1,1,1,1,1,1,0,NULL,NULL),(6,1,'descripcion','text',1,1,1,1,1,1,0,NULL,NULL),(7,1,'created_at','timestamp',1,1,1,1,1,1,0,NULL,NULL),(8,1,'updated_at','timestamp',1,1,1,1,1,1,0,NULL,NULL),(9,1,'deleted_at','timestamp',1,1,1,1,1,1,0,NULL,NULL),(10,2,'id_atributo','int',1,1,0,0,0,0,0,NULL,NULL),(11,2,'id_entidad','int',1,1,1,1,1,1,0,'1','nombre'),(12,2,'nombre_columna','varchar',1,1,1,1,1,1,0,NULL,NULL),(13,2,'tipo_dato','varchar',1,1,1,1,1,1,0,NULL,NULL),(14,2,'es_auditable','tinyint',1,1,1,1,1,1,0,NULL,NULL),(15,2,'id_estado','int',1,1,1,1,1,1,0,'1','nombre'),(16,3,'id_auditoria','int',1,1,0,0,0,0,0,NULL,NULL),(17,3,'id_entidad','int',1,1,1,1,1,1,0,'1','nombre'),(18,3,'id_registro','int',1,1,1,1,1,1,0,'1','nombre'),(19,3,'id_usuario','int',1,1,1,1,1,1,0,'1','nombre'),(20,3,'accion','varchar',1,1,1,1,1,1,0,NULL,NULL),(21,3,'datos_anteriores','json',1,1,1,1,1,1,0,NULL,NULL),(22,3,'datos_nuevos','json',1,1,1,1,1,1,0,NULL,NULL),(23,3,'fecha','timestamp',1,1,1,1,1,1,0,NULL,NULL),(24,3,'direccion_ip','varchar',1,1,1,1,1,1,0,NULL,NULL),(25,4,'id_configuracion','int',1,1,0,0,0,0,0,NULL,NULL),(26,4,'id_usuario','int',1,1,1,1,1,1,0,'1','nombre_usuario'),(27,4,'id_estado','int',1,1,1,1,1,1,0,'1','nombre'),(28,4,'clave','varchar',1,1,1,1,1,1,0,NULL,NULL),(29,4,'valor','text',1,1,1,1,1,1,0,NULL,NULL),(30,4,'descripcion','varchar',1,1,1,1,1,1,0,NULL,NULL),(31,4,'tipo','enum',1,1,1,1,1,1,0,NULL,NULL),(32,4,'publico','tinyint',1,1,1,1,1,1,0,NULL,NULL),(33,4,'protegido','tinyint',1,1,1,1,1,1,0,NULL,NULL),(34,4,'creado_por','int',1,1,1,1,1,1,0,NULL,NULL),(35,4,'fecha_creacion','timestamp',1,1,1,1,1,1,0,NULL,NULL),(36,4,'actualizado_por','int',1,1,1,1,1,1,0,NULL,NULL),(37,4,'fecha_actualizacion','timestamp',1,1,1,1,1,1,0,NULL,NULL),(38,5,'id_entidad','int',1,1,0,0,0,0,0,NULL,NULL),(39,5,'nombre_tabla','varchar',1,1,1,1,1,1,0,NULL,NULL),(40,5,'alias_nombre','varchar',1,1,1,1,1,1,0,NULL,NULL),(41,5,'id_estado','int',1,1,1,1,1,1,0,'1','nombre'),(42,5,'descripcion','text',1,1,1,1,1,1,0,NULL,NULL),(43,6,'id_estado','int',1,1,0,0,0,0,0,NULL,NULL),(44,6,'nombre','varchar',1,1,1,1,1,1,0,NULL,NULL),(45,6,'tipo_entidad','enum',1,1,1,1,1,1,0,NULL,NULL),(46,6,'descripcion','varchar',1,1,1,1,1,1,0,NULL,NULL),(47,6,'id_applicaciones_sitio','int',1,1,1,1,1,1,0,'1','nombre'),(48,6,'activo','tinyint',1,1,1,1,1,1,0,NULL,NULL),(49,7,'id_acceso','int',1,1,0,0,0,0,0,NULL,NULL),(50,7,'id_usuario','int',1,1,1,1,1,1,0,'1','nombre_usuario'),(51,7,'fecha_entrada','datetime',1,1,1,1,1,1,0,NULL,NULL),(52,7,'fecha_salida','datetime',1,1,1,1,1,1,0,NULL,NULL),(53,7,'direccion_ip','varchar',1,1,1,1,1,1,0,NULL,NULL),(54,7,'user_agent','varchar',1,1,1,1,1,1,0,NULL,NULL),(55,8,'id_accion','int',1,1,0,0,0,0,0,NULL,NULL),(56,8,'id_usuario','int',1,1,1,1,1,1,0,'1','nombre_usuario'),(57,8,'accion','varchar',1,1,1,1,1,1,0,NULL,NULL),(58,8,'descripcion','varchar',1,1,1,1,1,1,0,NULL,NULL),(59,8,'fecha','datetime',1,1,1,1,1,1,0,NULL,NULL),(60,8,'direccion_ip','varchar',1,1,1,1,1,1,0,NULL,NULL),(61,9,'id_historial','int',1,1,0,0,0,0,0,NULL,NULL),(62,9,'id_usuario','int',1,1,1,1,1,1,0,'1','nombre_usuario'),(63,9,'hash_contrasena','varchar',1,1,1,1,1,1,0,NULL,NULL),(64,9,'fecha_cambio','datetime',1,1,1,1,1,1,0,NULL,NULL),(65,10,'id_jerarquia','int',1,1,0,0,0,0,0,NULL,NULL),(66,10,'id_jerarquia_padre','int',1,1,1,1,1,1,0,'1','nombre'),(67,10,'id_estado','int',1,1,1,1,1,1,0,'1','nombre'),(68,10,'nombre','varchar',1,1,1,1,1,1,0,NULL,NULL),(69,10,'descripcion','varchar',1,1,1,1,1,1,0,NULL,NULL),(70,11,'id_menu','int',1,1,0,0,0,0,0,NULL,NULL),(71,11,'id_menu_padre','int',1,1,1,1,1,1,0,'1','nombre'),(72,11,'id_aplicacion','int',1,1,1,1,1,1,0,'1','nombre'),(73,11,'id_estado','int',1,1,1,1,1,1,0,'1','nombre'),(74,11,'nombre','varchar',1,1,1,1,1,1,0,NULL,NULL),(75,11,'url','varchar',1,1,1,1,1,1,0,NULL,NULL),(76,11,'orden','int',1,1,1,1,1,1,0,NULL,NULL),(77,11,'icono','varchar',1,1,1,1,1,1,0,NULL,NULL),(78,11,'visible','tinyint',1,1,1,1,1,1,0,NULL,NULL),(79,11,'nivel','int',1,1,1,1,1,1,0,NULL,NULL),(80,12,'id_menu_permiso','int',1,1,0,0,0,0,0,NULL,NULL),(81,12,'id_menu','int',1,1,1,1,1,1,0,'1','nombre'),(82,12,'id_permiso','int',1,1,1,1,1,1,0,'1','nombre'),(83,12,'id_estado','int',1,1,1,1,1,1,0,'1','nombre'),(84,13,'id_permiso','int',1,1,0,0,0,0,0,NULL,NULL),(85,13,'id_estado','int',1,1,1,1,1,1,0,'1','nombre'),(86,13,'nombre','varchar',1,1,1,1,1,1,0,NULL,NULL),(87,13,'descripcion','varchar',1,1,1,1,1,1,0,NULL,NULL),(88,14,'id_rol','int',1,1,1,1,1,1,0,NULL,NULL),(89,14,'id_estado','int',1,1,1,1,1,1,0,'1','nombre'),(90,14,'nombre','varchar',1,1,1,1,1,1,0,NULL,NULL),(91,14,'descripcion','varchar',1,1,1,1,1,1,0,NULL,NULL),(92,14,'deleted_at','timestamp',1,1,1,1,1,1,0,NULL,NULL),(93,15,'id_rol_permiso','int',1,1,0,0,0,0,0,NULL,NULL),(94,15,'id_rol','int',1,1,1,1,1,1,0,'1','nombre'),(95,15,'id_permiso','int',1,1,1,1,1,1,0,'1','nombre'),(96,15,'id_estado','int',1,1,1,1,1,1,0,'1','nombre'),(97,16,'id_sesion','int',1,1,0,0,0,0,0,NULL,NULL),(98,16,'id_usuario','int',1,1,1,1,1,1,0,'1','nombre_usuario'),(99,16,'token_hash','varchar',1,1,1,1,1,1,0,NULL,NULL),(100,16,'fecha_expiracion','datetime',1,1,1,1,1,1,0,NULL,NULL),(101,16,'creado_at','timestamp',1,1,1,1,1,1,0,NULL,NULL),(102,17,'id_sitio','int',1,1,0,0,0,0,0,NULL,NULL),(103,17,'id_estado','int',1,1,1,1,1,1,0,'1','nombre'),(104,17,'nombre','varchar',1,1,1,1,1,1,0,NULL,NULL),(105,17,'codigo','varchar',1,1,1,1,1,1,0,NULL,NULL),(106,17,'descripcion','text',1,1,1,1,1,1,0,NULL,NULL),(107,17,'created_at','timestamp',1,1,1,1,1,1,0,NULL,NULL),(108,17,'updated_at','timestamp',1,1,1,1,1,1,0,NULL,NULL),(109,18,'id_tipo_usuario','int',1,1,0,0,0,0,0,NULL,NULL),(110,18,'id_estado','int',1,1,1,1,1,1,0,'1','nombre'),(111,18,'nombre','varchar',1,1,1,1,1,1,0,NULL,NULL),(112,18,'descripcion','varchar',1,1,1,1,1,1,0,NULL,NULL),(113,19,'id_usuario','int',1,1,1,1,1,1,0,'1','nombre_usuario'),(114,19,'id_tipo_usuario','int',1,1,0,0,0,0,0,NULL,NULL),(115,19,'id_estado','int',1,1,1,1,1,1,0,'1','nombre'),(116,19,'correo_electronico','varchar',1,1,1,1,1,1,0,NULL,NULL),(117,19,'hash_contrasena','varchar',1,1,1,1,1,1,0,NULL,NULL),(118,19,'nombre_usuario','varchar',1,1,1,1,1,1,0,NULL,NULL),(119,19,'nombres','varchar',1,1,1,1,1,1,0,NULL,NULL),(120,19,'apellidos','varchar',1,1,1,1,1,1,0,NULL,NULL),(121,19,'fecha_creacion','datetime',1,1,1,1,1,1,0,NULL,NULL),(122,19,'fecha_actualizacion','datetime',1,1,1,1,1,1,0,NULL,NULL),(123,19,'fecha_cambio_contrasena','datetime',1,1,1,1,1,1,0,NULL,NULL),(124,19,'img','varchar',1,1,1,1,1,1,0,NULL,NULL),(125,19,'deleted_at','timestamp',1,1,1,1,1,1,0,NULL,NULL),(126,20,'id_usuario_aplicacion','int',1,1,0,0,0,0,0,NULL,NULL),(127,20,'id_usuario','int',1,1,1,1,1,1,0,'1','nombre_usuario'),(128,20,'id_aplicacion','int',1,1,1,1,1,1,0,'1','nombre'),(129,20,'id_estado','int',1,1,1,1,1,1,0,'1','nombre'),(130,20,'created_at','timestamp',1,1,1,1,1,1,0,NULL,NULL),(131,20,'updated_at','timestamp',1,1,1,1,1,1,0,NULL,NULL),(132,21,'id_usuario_jerarquia','int',1,1,0,0,0,0,0,NULL,''),(133,21,'id_usuario','int',1,1,1,1,1,1,0,'1','nombre_usuario'),(134,21,'id_jerarquia','int',1,1,1,1,1,1,0,'1','nombre'),(135,21,'id_estado','int',1,1,1,1,1,1,0,'1','nombre'),(136,22,'id_usuario_rol','int',1,1,0,0,0,0,0,NULL,NULL),(137,22,'id_usuario','int',1,1,1,1,1,1,0,'1','nombre_usuario'),(138,22,'id_rol','int',1,1,1,1,1,1,0,'1','nombre'),(139,22,'id_estado','int',1,1,1,1,1,1,0,'1','nombre'),(140,22,'adm_usuarios_rolescol','varchar',1,1,1,1,1,1,0,NULL,NULL);
/*!40000 ALTER TABLE `adm_atributos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adm_auditoria`
--

DROP TABLE IF EXISTS `adm_auditoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adm_auditoria` (
  `id_auditoria` int NOT NULL AUTO_INCREMENT,
  `id_entidad` int NOT NULL COMMENT 'Referencia al módulo afectado',
  `id_registro` int NOT NULL COMMENT 'ID del registro modificado en la tabla origen',
  `id_usuario` int DEFAULT NULL COMMENT 'Usuario que realizó la acción',
  `accion` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'INSERT, UPDATE, DELETE o RESTORE',
  `datos_anteriores` json DEFAULT NULL COMMENT 'Captura de los valores antes del cambio',
  `datos_nuevos` json DEFAULT NULL COMMENT 'Captura de los nuevos valores aplicados',
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Momento exacto del cambio',
  `direccion_ip` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'IP desde donde se realizó la operación',
  PRIMARY KEY (`id_auditoria`),
  KEY `idx_auditoria_entidades` (`id_entidad`),
  KEY `idx_auditoria_usuarios` (`id_usuario`),
  CONSTRAINT `fk_auditoria_entidades` FOREIGN KEY (`id_entidad`) REFERENCES `adm_entidades` (`id_entidad`),
  CONSTRAINT `fk_auditoria_usuarios` FOREIGN KEY (`id_usuario`) REFERENCES `adm_usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro histórico de transacciones del sistema para trazabilidad forense';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_auditoria`
--

LOCK TABLES `adm_auditoria` WRITE;
/*!40000 ALTER TABLE `adm_auditoria` DISABLE KEYS */;
/*!40000 ALTER TABLE `adm_auditoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adm_configuraciones`
--

DROP TABLE IF EXISTS `adm_configuraciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adm_configuraciones` (
  `id_configuracion` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL,
  `id_estado` int DEFAULT NULL,
  `clave` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor` text COLLATE utf8mb4_unicode_ci,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo` enum('string','number','boolean','json','select','file','date','time') COLLATE utf8mb4_unicode_ci DEFAULT 'string',
  `publico` tinyint(1) DEFAULT '1',
  `protegido` tinyint(1) DEFAULT '0',
  `creado_por` int DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_por` int DEFAULT NULL,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_configuracion`),
  UNIQUE KEY `uq_clave_usuario` (`clave`,`id_usuario`),
  KEY `idx_clave` (`clave`),
  KEY `idx_id_usuario` (`id_usuario`),
  KEY `adm_configuraciones_estados_idx` (`id_estado`),
  CONSTRAINT `adm_configuraciones_estados` FOREIGN KEY (`id_estado`) REFERENCES `adm_estados` (`id_estado`),
  CONSTRAINT `fk_configuraciones_usuarios` FOREIGN KEY (`id_usuario`) REFERENCES `adm_usuarios` (`id_usuario`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_configuraciones`
--

LOCK TABLES `adm_configuraciones` WRITE;
/*!40000 ALTER TABLE `adm_configuraciones` DISABLE KEYS */;
INSERT INTO `adm_configuraciones` VALUES (1,NULL,1,'site_name','Administrador Sitio','Nombre mostrado en la cabecera','string',1,0,1,'2025-12-30 14:21:03',NULL,'2026-01-06 10:54:08'),(2,NULL,1,'site_logo','/assets/img/logo.png','Ruta al logo del sitio','file',1,1,1,'2025-12-30 14:21:03',NULL,'2026-01-06 10:54:08'),(3,NULL,1,'default_language','es','Idioma por defecto del sitio','select',1,0,1,'2025-12-30 14:21:03',NULL,'2026-01-06 10:54:08'),(4,NULL,1,'items_per_page','10','Elementos por página en listados','number',1,0,1,'2025-12-30 14:21:03',NULL,'2026-01-06 10:54:08'),(5,NULL,1,'allow_registration','1','Permitir registro público (0/1)','boolean',1,0,1,'2025-12-30 14:21:03',NULL,'2026-01-06 10:54:08'),(6,NULL,1,'maintenance_mode','0','Modo mantenimiento activado (0/1)','boolean',1,1,1,'2025-12-30 14:21:03',NULL,'2026-01-06 10:54:08'),(7,NULL,1,'support_email','gjpierp@gmail.com','Email de soporte','string',1,0,1,'2025-12-30 14:21:03',NULL,'2026-01-06 10:54:08'),(8,NULL,1,'default_theme','light','Tema por defecto (light/dark)','select',1,0,1,'2025-12-30 14:21:03',NULL,'2026-01-06 10:54:08'),(9,NULL,1,'date_format','DD/MM/YYYY','Formato de fecha','string',1,0,1,'2025-12-30 14:21:03',NULL,'2026-01-06 10:54:08'),(10,NULL,1,'timezone','America/Santiago','Zona horaria por defecto','string',1,0,1,'2025-12-30 14:21:03',NULL,'2026-01-06 10:54:08'),(11,NULL,1,'max_upload_mb','10','Tamaño máximo de upload en MB','number',1,0,1,'2025-12-30 14:21:03',NULL,'2026-01-06 10:54:08'),(12,NULL,1,'password_policy','{\"min\":8,\"upper\":1,\"digit\":1,\"special\":1}','Política de contraseñas (JSON)','json',0,1,1,'2025-12-30 14:21:03',NULL,'2026-01-06 10:54:08'),(13,NULL,1,'session_timeout_minutes','720','Tiempo de expiración de sesión en minutos','number',0,0,1,'2025-12-30 14:21:03',NULL,'2026-01-06 10:54:08'),(14,NULL,1,'enable_2fa','0','Habilitar 2FA globalmente (0/1)','boolean',0,0,1,'2025-12-30 14:21:03',NULL,'2026-01-06 10:54:08'),(15,NULL,1,'analytics_tracking_id','','ID de analytics (p.e. GA)','string',0,0,1,'2025-12-30 14:21:03',NULL,'2026-01-06 10:54:08'),(16,NULL,1,'terms_url','/legal/terms','URL de términos y condiciones','string',1,0,1,'2025-12-30 14:21:03',NULL,'2026-01-06 10:54:08');
/*!40000 ALTER TABLE `adm_configuraciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adm_entidades`
--

DROP TABLE IF EXISTS `adm_entidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adm_entidades` (
  `id_entidad` int NOT NULL AUTO_INCREMENT,
  `nombre_tabla` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre técnico de la tabla en MySQL',
  `alias_nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre legible para el usuario en la interfaz',
  `id_estado` int NOT NULL DEFAULT '1' COMMENT 'Relación con adm_estados para control de activación del módulo',
  `descripcion` text COLLATE utf8mb4_unicode_ci COMMENT 'Explicación del propósito del módulo',
  PRIMARY KEY (`id_entidad`),
  UNIQUE KEY `uq_nombre_tabla` (`nombre_tabla`),
  KEY `fk_entidades_estado` (`id_estado`),
  CONSTRAINT `fk_entidades_estado` FOREIGN KEY (`id_estado`) REFERENCES `adm_estados` (`id_estado`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Diccionario maestro de tablas/módulos registrados en el sistema';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_entidades`
--

LOCK TABLES `adm_entidades` WRITE;
/*!40000 ALTER TABLE `adm_entidades` DISABLE KEYS */;
INSERT INTO `adm_entidades` VALUES (1,'adm_aplicaciones_sitio','Aplicaciones y Módulos',1,'Diccionario de aplicaciones que tiene el sitio'),(2,'adm_atributos','Maestro de Atributos',1,'Diccionario de columnas críticas para gestión de auditoría y formularios dinámicos'),(3,'adm_auditoria','Bitácora de Cambios',1,'Registro histórico de transacciones del sistema para trazabilidad forense'),(4,'adm_configuraciones','Configuraciones de Usuario',1,'Configuraciones del sistema'),(5,'adm_entidades','Maestro de Entidades',1,'Diccionario maestro de tablas/módulos registrados en el sistema'),(6,'adm_estados','Maestro de Estados',1,'Estados generales para entidades del sistema'),(7,'adm_historial_accesos','Log de Inicios de Sesión',1,'Historial de accesos de los usuarios'),(8,'adm_historial_acciones','Log de Inicios de Acciones',1,'Historial de acciones de los usuarios'),(9,'adm_historial_contrasenas','Log de Inicios de Cambios de Contrasenas',1,'Historial de contraseñas de los usuarios'),(10,'adm_jerarquias','adm_jerarquias',1,'Jerarquías organizacionales'),(11,'adm_menus','adm_menus',1,'Menús del sistema'),(12,'adm_menus_permisos','adm_menus_permisos',1,'Relación entre menús y permisos'),(13,'adm_permisos','adm_permisos',1,'Permisos del sistema'),(14,'adm_roles','Perfiles de Seguridad',1,'Roles de usuario'),(15,'adm_roles_permisos','adm_roles_permisos',1,'Relación entre roles y permisos'),(16,'adm_sesiones_activas','adm_sesiones_activas',1,'Registra las sessiones activas'),(17,'adm_sitios','adm_sitios',1,'Diccionarios de Sitios'),(18,'adm_tipos_usuario','adm_tipos_usuario',1,'Tipos de usuario del sistema'),(19,'adm_usuarios','Cuentas de Usuario',1,'Usuarios registrados en el sistema'),(20,'adm_usuarios_aplicaciones','adm_usuarios_aplicaciones',1,'Relación entre usuarios y aplicaciones'),(21,'adm_usuarios_jerarquias','adm_usuarios_jerarquias',1,'Relación entre usuarios y jerarquías'),(22,'adm_usuarios_roles','Asignación de Permisos',1,'Relación entre usuarios y roles');
/*!40000 ALTER TABLE `adm_entidades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adm_estados`
--

DROP TABLE IF EXISTS `adm_estados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adm_estados` (
  `id_estado` int NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del estado',
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre del estado',
  `tipo_entidad` enum('SISTEMA','VIVIENDA','USUARIO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SISTEMA',
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Descripción del estado',
  `id_applicaciones_sitio` int DEFAULT NULL,
  PRIMARY KEY (`id_estado`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `fk_estados_sitio_idx` (`id_applicaciones_sitio`),
  CONSTRAINT `fk_estados_sitio` FOREIGN KEY (`id_applicaciones_sitio`) REFERENCES `adm_aplicaciones_sitio` (`id_aplicacion`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Estados generales para entidades del sistema';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_estados`
--

LOCK TABLES `adm_estados` WRITE;
/*!40000 ALTER TABLE `adm_estados` DISABLE KEYS */;
INSERT INTO `adm_estados` VALUES (1,'Activo','SISTEMA','Estado activo',1),(2,'Inactivo','SISTEMA','Estado inactivo',1),(3,'Pendiente','SISTEMA','Estado pendiente de aprobación',1),(4,'Eliminado','SISTEMA','Estado eliminado o dado de baja',1),(5,'Disponible','VIVIENDA','Vivienda disponible para asignación',2),(6,'Ocupada','VIVIENDA','Vivienda actualmente ocupada',2),(7,'En Mantención','VIVIENDA','Vivienda en proceso de mantención',2),(8,'Activo2','SISTEMA','Estado activo2',1);
/*!40000 ALTER TABLE `adm_estados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adm_historial_accesos`
--

DROP TABLE IF EXISTS `adm_historial_accesos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adm_historial_accesos` (
  `id_acceso` int NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del acceso',
  `id_usuario` int NOT NULL COMMENT 'Usuario',
  `fecha_entrada` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora de entrada',
  `fecha_salida` datetime DEFAULT NULL COMMENT 'Fecha y hora de salida',
  `direccion_ip` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Dirección IP',
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Agente de usuario',
  PRIMARY KEY (`id_acceso`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `adm_historial_accesos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `adm_usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=87 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Historial de accesos de los usuarios';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_historial_accesos`
--

LOCK TABLES `adm_historial_accesos` WRITE;
/*!40000 ALTER TABLE `adm_historial_accesos` DISABLE KEYS */;
INSERT INTO `adm_historial_accesos` VALUES (1,1,'2025-12-28 17:19:10',NULL,'::1','PostmanRuntime/7.51.0'),(2,1,'2025-12-28 17:49:18',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(3,1,'2025-12-28 17:50:21',NULL,'::1','PostmanRuntime/7.51.0'),(4,1,'2025-12-28 17:52:18',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(5,1,'2025-12-28 17:52:49',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(6,1,'2025-12-28 17:53:11',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(7,1,'2025-12-28 18:00:02',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(8,1,'2025-12-28 18:01:03',NULL,'::1','PostmanRuntime/7.51.0'),(9,1,'2025-12-28 19:48:25',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(10,1,'2025-12-28 19:55:23',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(11,1,'2025-12-28 20:36:50',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(12,1,'2025-12-28 20:37:54',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(13,1,'2025-12-28 20:39:04',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(14,1,'2025-12-29 08:10:46',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(15,1,'2025-12-29 08:18:32',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(16,1,'2025-12-29 08:21:17',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(17,1,'2025-12-29 08:25:09',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(18,1,'2025-12-29 08:29:51',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(19,1,'2025-12-29 08:36:56',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(20,1,'2025-12-29 08:42:20',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(21,1,'2025-12-29 08:43:38',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(22,1,'2025-12-29 08:47:47',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(23,1,'2025-12-29 09:05:28',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(24,1,'2025-12-29 09:05:42',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(25,1,'2025-12-29 10:49:11',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(26,1,'2025-12-29 12:11:28',NULL,'::1','PostmanRuntime/7.51.0'),(27,1,'2025-12-29 14:14:43',NULL,'::1','PostmanRuntime/7.51.0'),(28,1,'2025-12-29 15:19:06',NULL,'::1','PostmanRuntime/7.51.0'),(29,1,'2025-12-29 15:44:13',NULL,'::1','PostmanRuntime/7.51.0'),(30,1,'2025-12-29 19:02:05',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(31,1,'2025-12-30 13:46:45',NULL,'::1','PostmanRuntime/7.51.0'),(32,1,'2025-12-30 14:10:30',NULL,'::1','PostmanRuntime/7.51.0'),(33,1,'2025-12-30 16:13:16',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(34,1,'2025-12-30 16:15:45',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(35,1,'2025-12-30 19:45:46',NULL,'::1','PostmanRuntime/7.51.0'),(36,1,'2025-12-30 20:39:16',NULL,'::1','PostmanRuntime/7.39.1'),(37,1,'2025-12-30 20:39:32',NULL,'::1','PostmanRuntime/7.39.1'),(38,1,'2025-12-30 20:42:08',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(39,1,'2025-12-30 20:49:02',NULL,'::1','PostmanRuntime/7.39.1'),(40,1,'2025-12-30 20:49:18',NULL,'::1','PostmanRuntime/7.39.1'),(41,1,'2025-12-30 21:10:52',NULL,'::1','PostmanRuntime/7.39.1'),(42,1,'2025-12-30 21:14:25',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(43,1,'2025-12-30 21:29:25',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(44,1,'2025-12-30 21:30:21',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(45,1,'2025-12-30 21:37:14',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(46,1,'2025-12-30 21:39:59',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(47,1,'2026-01-01 15:42:31',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(49,1,'2026-01-01 15:44:01',NULL,'::1','PostmanRuntime/7.51.0'),(50,1,'2026-01-01 15:44:25',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(51,1,'2026-01-03 15:23:20',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(52,1,'2026-01-03 15:31:09',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(53,1,'2026-01-03 15:41:47',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(54,1,'2026-01-03 15:42:19',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(55,1,'2026-01-03 16:00:44',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(56,1,'2026-01-03 16:36:03',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(57,1,'2026-01-03 19:07:09',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(58,1,'2026-01-03 19:13:29',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(59,1,'2026-01-03 19:14:43',NULL,'::1','PostmanRuntime/7.51.0'),(60,1,'2026-01-03 19:15:31',NULL,'::1','PostmanRuntime/7.51.0'),(61,1,'2026-01-03 19:17:13',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(62,1,'2026-01-03 19:42:56',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(63,1,'2026-01-03 19:52:14',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(64,1,'2026-01-03 19:53:10',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(65,1,'2026-01-03 19:53:38',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(66,1,'2026-01-03 19:56:07',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(67,1,'2026-01-03 20:09:25',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(68,1,'2026-01-03 20:30:24',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(69,1,'2026-01-03 21:25:58',NULL,'::1','PostmanRuntime/7.51.0'),(70,1,'2026-01-03 21:28:31',NULL,'::1','PostmanRuntime/7.51.0'),(71,1,'2026-01-03 21:28:34',NULL,'::1','PostmanRuntime/7.51.0'),(72,1,'2026-01-03 21:39:28',NULL,'::1','PostmanRuntime/7.51.0'),(73,1,'2026-01-03 23:33:39',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(74,1,'2026-01-04 08:50:18',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(76,1,'2026-01-04 22:20:57',NULL,'::1','PostmanRuntime/7.51.0'),(77,1,'2026-01-04 22:21:37',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(78,1,'2026-01-05 09:03:04',NULL,'::1','PostmanRuntime/7.51.0'),(79,1,'2026-01-05 10:33:53',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(80,1,'2026-01-05 13:09:45',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(81,1,'2026-01-06 09:16:22',NULL,'::1','PostmanRuntime/7.51.0'),(82,1,'2026-01-06 10:28:07',NULL,'::1','PostmanRuntime/7.51.0'),(83,1,'2026-01-06 13:10:26',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(84,1,'2026-01-06 13:29:16',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(85,1,'2026-01-07 20:37:28',NULL,'::1','PostmanRuntime/7.51.0'),(86,1,'2026-01-08 15:48:56',NULL,'::1','PostmanRuntime/7.51.0');
/*!40000 ALTER TABLE `adm_historial_accesos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adm_historial_acciones`
--

DROP TABLE IF EXISTS `adm_historial_acciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adm_historial_acciones` (
  `id_accion` int NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de la acción',
  `id_usuario` int NOT NULL COMMENT 'Usuario',
  `accion` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Acción realizada',
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Descripción de la acción',
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de la acción',
  `direccion_ip` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Dirección IP',
  PRIMARY KEY (`id_accion`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `adm_historial_acciones_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `adm_usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=139 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Historial de acciones de los usuarios';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_historial_acciones`
--

LOCK TABLES `adm_historial_acciones` WRITE;
/*!40000 ALTER TABLE `adm_historial_acciones` DISABLE KEYS */;
INSERT INTO `adm_historial_acciones` VALUES (1,1,'ELIMINAR','ELIMINAR en roles',NULL,NULL),(2,1,'ASIGNAR_PERMISOS','ASIGNAR_PERMISOS en roles',NULL,NULL),(3,1,'ASIGNAR_PERMISOS','ASIGNAR_PERMISOS en roles',NULL,NULL),(4,1,'CREAR','CREAR en adm_roles',NULL,NULL),(5,1,'ELIMINAR','ELIMINAR en roles',NULL,NULL),(6,1,'CREAR','CREAR en adm_roles',NULL,NULL),(7,1,'ACTUALIZAR','ACTUALIZAR en roles',NULL,NULL),(8,1,'ACTUALIZAR','ACTUALIZAR en roles',NULL,NULL),(9,1,'ELIMINAR','ELIMINAR en roles',NULL,NULL),(10,1,'CREAR','CREAR en permisos',NULL,NULL),(11,1,'CREAR','CREAR en permisos',NULL,NULL),(12,1,'ACTUALIZAR','ACTUALIZAR en permisos',NULL,NULL),(13,1,'ACTUALIZAR','ACTUALIZAR en permisos',NULL,NULL),(14,1,'ACTUALIZAR','ACTUALIZAR en permisos',NULL,NULL),(15,1,'ACTUALIZAR','ACTUALIZAR en permisos',NULL,NULL),(16,1,'CREAR','CREAR en permisos',NULL,NULL),(17,1,'CREAR','CREAR en permisos',NULL,NULL),(18,1,'ELIMINAR','ELIMINAR en permisos',NULL,NULL),(19,1,'CREAR','CREAR en menus',NULL,NULL),(20,1,'CREAR','CREAR en menus',NULL,NULL),(21,1,'ACTUALIZAR','ACTUALIZAR en menus',NULL,NULL),(22,1,'ELIMINAR','ELIMINAR en menus',NULL,NULL),(23,1,'ELIMINAR','ELIMINAR en menus',NULL,NULL),(24,1,'ASIGNAR_PERMISOS','ASIGNAR_PERMISOS en menus',NULL,NULL),(25,1,'ACTUALIZAR','ACTUALIZAR en roles',NULL,NULL),(26,1,'ACTUALIZAR','ACTUALIZAR en roles',NULL,NULL),(27,1,'ACTUALIZAR','ACTUALIZAR en roles',NULL,NULL),(28,1,'ACTUALIZAR','ACTUALIZAR en aplicaciones_sitio','2026-01-03 20:29:44','::ffff:127.0.0.1'),(29,1,'ELIMINAR','ELIMINAR en aplicaciones_sitio','2026-01-03 20:29:55','::ffff:127.0.0.1'),(30,1,'ELIMINAR','ELIMINAR en aplicaciones_sitio','2026-01-03 20:29:58','::ffff:127.0.0.1'),(31,1,'ELIMINAR','ELIMINAR en aplicaciones_sitio','2026-01-03 20:30:01','::ffff:127.0.0.1'),(32,1,'ELIMINAR','ELIMINAR en aplicaciones_sitio','2026-01-03 20:30:03','::ffff:127.0.0.1'),(33,1,'ACTUALIZAR','ACTUALIZAR en aplicaciones_sitio','2026-01-03 20:30:08','::ffff:127.0.0.1'),(34,1,'ELIMINAR','ELIMINAR en aplicaciones_sitio','2026-01-03 20:30:12','::ffff:127.0.0.1'),(35,1,'CREAR','CREAR en aplicaciones_sitio','2026-01-03 20:30:46','::ffff:127.0.0.1'),(36,1,'ELIMINAR','ELIMINAR en aplicaciones_sitio','2026-01-03 20:30:50','::ffff:127.0.0.1'),(37,1,'ACTUALIZAR','ACTUALIZAR en usuarios','2026-01-03 21:24:33','::1'),(38,1,'ACTUALIZAR','ACTUALIZAR en usuarios','2026-01-03 21:25:04','::1'),(39,1,'ELIMINAR','ELIMINAR en usuarios','2026-01-03 21:25:19','::1'),(40,1,'ACTUALIZAR','ACTUALIZAR en usuarios','2026-01-03 21:29:21','::1'),(41,1,'ELIMINAR','ELIMINAR en usuarios','2026-01-03 21:29:35','::1'),(42,1,'CREAR','CREAR en adm_roles','2026-01-03 21:36:51','::1'),(43,1,'ACTUALIZAR','ACTUALIZAR en roles','2026-01-03 21:37:17','::1'),(44,1,'ELIMINAR','ELIMINAR en roles','2026-01-03 21:37:37','::1'),(45,1,'ASIGNAR_PERMISOS','ASIGNAR_PERMISOS en roles','2026-01-03 21:38:17','::1'),(46,1,'CREAR','CREAR en menus','2026-01-03 22:25:06','::1'),(47,1,'ACTUALIZAR','ACTUALIZAR en menus','2026-01-03 22:26:51','::1'),(48,1,'ELIMINAR','ELIMINAR en menus','2026-01-03 22:27:02','::1'),(49,1,'ASIGNAR_PERMISOS','ASIGNAR_PERMISOS en menus','2026-01-03 22:27:27','::1'),(50,1,'CREAR','CREAR en estados','2026-01-03 22:28:59','::1'),(51,1,'ACTUALIZAR','ACTUALIZAR en estados','2026-01-03 22:29:22','::1'),(52,1,'ELIMINAR','ELIMINAR en estados','2026-01-03 22:29:44','::1'),(53,1,'ACTUALIZAR','ACTUALIZAR en estados','2026-01-03 22:30:15','::1'),(54,1,'ELIMINAR','ELIMINAR en estados','2026-01-03 22:30:24','::1'),(55,1,'CREAR','CREAR en tipos_usuario','2026-01-03 22:32:17','::1'),(56,1,'ACTUALIZAR','ACTUALIZAR en tipos_usuario','2026-01-03 22:32:51','::1'),(57,1,'ELIMINAR','ELIMINAR en tipos_usuario','2026-01-03 22:33:19','::1'),(58,1,'CREAR','CREAR en jerarquias','2026-01-03 22:34:45','::1'),(59,1,'ACTUALIZAR','ACTUALIZAR en jerarquias','2026-01-03 22:35:33','::1'),(60,1,'ELIMINAR','ELIMINAR en jerarquias','2026-01-03 22:35:43','::1'),(61,1,'CREAR','CREAR en sitios','2026-01-03 22:39:28','::1'),(62,1,'ACTUALIZAR','ACTUALIZAR en sitios','2026-01-03 22:39:44','::1'),(63,1,'ELIMINAR','ELIMINAR en sitios','2026-01-03 22:40:03','::1'),(64,1,'CREAR','CREAR en aplicaciones_sitio','2026-01-03 22:41:37','::1'),(65,1,'ACTUALIZAR','ACTUALIZAR en aplicaciones_sitio','2026-01-03 22:42:11','::1'),(66,1,'ACTUALIZAR','ACTUALIZAR en aplicaciones_sitio','2026-01-03 22:42:19','::1'),(67,1,'ELIMINAR','ELIMINAR en aplicaciones_sitio','2026-01-03 22:42:33','::1'),(69,1,'ELIMINAR','ELIMINAR en usuarios','2026-01-03 22:49:39','::ffff:127.0.0.1'),(70,1,'ACTUALIZAR','ACTUALIZAR en usuarios','2026-01-03 23:31:17','::ffff:127.0.0.1'),(71,1,'ACTUALIZAR','ACTUALIZAR en usuarios','2026-01-03 23:31:36','::ffff:127.0.0.1'),(72,1,'ACTUALIZAR','ACTUALIZAR en usuarios','2026-01-03 23:36:12','::ffff:127.0.0.1'),(73,1,'ACTUALIZAR','ACTUALIZAR en usuarios','2026-01-05 16:26:32','::1'),(74,1,'ACTUALIZAR','ACTUALIZAR en usuarios','2026-01-05 16:26:58','::1'),(75,1,'ACTUALIZAR','ACTUALIZAR en usuarios','2026-01-05 16:27:05','::1'),(76,1,'ACTUALIZAR','ACTUALIZAR en usuarios','2026-01-05 19:10:31','::ffff:127.0.0.1'),(77,1,'ELIMINAR','ELIMINAR en usuarios','2026-01-05 19:11:54','::ffff:127.0.0.1'),(78,1,'ELIMINAR','ELIMINAR en usuarios','2026-01-05 19:14:13','::ffff:127.0.0.1'),(79,1,'ELIMINAR','ELIMINAR en usuarios','2026-01-05 19:23:32','::ffff:127.0.0.1'),(80,1,'ELIMINAR','ELIMINAR en usuarios','2026-01-06 07:17:14','::ffff:127.0.0.1'),(81,1,'ACTUALIZAR','ACTUALIZAR en usuarios','2026-01-06 10:44:13','::ffff:127.0.0.1'),(82,1,'ELIMINAR','ELIMINAR en usuarios','2026-01-06 10:47:36','::ffff:127.0.0.1'),(83,1,'ELIMINAR','ELIMINAR en usuarios','2026-01-06 10:47:39','::ffff:127.0.0.1'),(84,1,'ACTUALIZAR','ACTUALIZAR en usuarios','2026-01-06 11:00:17','::ffff:127.0.0.1'),(85,1,'ACTUALIZAR','ACTUALIZAR en usuarios','2026-01-06 11:00:24','::ffff:127.0.0.1'),(86,1,'ELIMINAR','ELIMINAR en usuarios','2026-01-06 11:00:33','::ffff:127.0.0.1'),(87,1,'ELIMINAR','ELIMINAR en usuarios','2026-01-06 11:00:35','::ffff:127.0.0.1'),(88,11,'CREAR','CREAR en usuarios','2026-01-06 11:01:52','::ffff:127.0.0.1'),(89,1,'ELIMINAR','ELIMINAR en usuarios','2026-01-06 11:01:58','::ffff:127.0.0.1'),(90,1,'ELIMINAR','ELIMINAR en usuarios','2026-01-06 11:02:00','::ffff:127.0.0.1'),(91,1,'ELIMINAR','ELIMINAR en usuarios','2026-01-06 11:05:55','::ffff:127.0.0.1'),(92,1,'ELIMINAR','ELIMINAR en usuarios','2026-01-06 11:05:58','::ffff:127.0.0.1'),(93,1,'ELIMINAR','ELIMINAR en usuarios','2026-01-06 11:17:09','::ffff:127.0.0.1'),(94,1,'ELIMINAR','ELIMINAR en usuarios','2026-01-06 11:17:10','::ffff:127.0.0.1'),(95,1,'ELIMINAR','ELIMINAR en usuarios','2026-01-06 11:18:10','::1'),(96,1,'ACTUALIZAR','ACTUALIZAR en usuarios','2026-01-06 11:25:28','::ffff:127.0.0.1'),(97,1,'ELIMINAR','ELIMINAR en usuarios','2026-01-06 11:25:58','::ffff:127.0.0.1'),(98,1,'ELIMINAR','ELIMINAR en usuarios','2026-01-06 11:25:59','::ffff:127.0.0.1'),(99,1,'ELIMINAR','ELIMINAR en usuarios','2026-01-06 11:27:01','::1'),(100,1,'ACTUALIZAR','ACTUALIZAR en usuarios','2026-01-06 11:41:03','::ffff:127.0.0.1'),(101,1,'ELIMINAR','ELIMINAR en usuarios','2026-01-06 13:26:40','::ffff:127.0.0.1'),(102,1,'ELIMINAR','ELIMINAR en usuarios','2026-01-06 13:26:42','::ffff:127.0.0.1'),(103,1,'ELIMINAR','ELIMINAR en usuarios','2026-01-06 13:29:23','::ffff:127.0.0.1'),(104,1,'ELIMINAR','ELIMINAR en usuarios','2026-01-06 13:29:25','::ffff:127.0.0.1'),(105,1,'ELIMINAR','ELIMINAR en usuarios','2026-01-06 13:32:05','::ffff:127.0.0.1'),(106,1,'ELIMINAR','ELIMINAR en usuarios','2026-01-06 13:32:05','::ffff:127.0.0.1'),(107,1,'ELIMINAR','ELIMINAR en usuarios','2026-01-06 13:37:08','::ffff:127.0.0.1'),(108,1,'ELIMINAR','ELIMINAR en usuarios','2026-01-06 13:37:09','::ffff:127.0.0.1'),(109,1,'ACTUALIZAR','ACTUALIZAR en roles','2026-01-06 14:57:49','::ffff:127.0.0.1'),(110,1,'ACTUALIZAR','ACTUALIZAR en roles','2026-01-06 15:05:50','::ffff:127.0.0.1'),(111,1,'ACTUALIZAR','ACTUALIZAR en roles','2026-01-06 15:07:07','::ffff:127.0.0.1'),(112,1,'ACTUALIZAR','ACTUALIZAR en roles','2026-01-06 15:07:16','::ffff:127.0.0.1'),(113,1,'ACTUALIZAR','ACTUALIZAR en roles','2026-01-06 15:09:55','::ffff:127.0.0.1'),(114,1,'ACTUALIZAR','ACTUALIZAR en roles','2026-01-06 15:19:11','::ffff:127.0.0.1'),(115,1,'CREAR','CREAR en adm_roles','2026-01-06 15:20:58','::ffff:127.0.0.1'),(116,1,'ACTUALIZAR','ACTUALIZAR en roles','2026-01-06 15:29:00','::ffff:127.0.0.1'),(117,1,'ACTUALIZAR','ACTUALIZAR en roles','2026-01-06 15:29:45','::ffff:127.0.0.1'),(118,1,'ELIMINAR','ELIMINAR en roles','2026-01-06 15:37:32','::ffff:127.0.0.1'),(119,1,'ACTUALIZAR','ACTUALIZAR en roles','2026-01-06 15:38:34','::ffff:127.0.0.1'),(120,1,'ELIMINAR','ELIMINAR en usuarios','2026-01-06 18:29:39','::ffff:127.0.0.1'),(121,12,'CREAR','CREAR en usuarios','2026-01-06 19:35:49','::ffff:127.0.0.1'),(122,13,'CREAR','CREAR en usuarios','2026-01-06 19:36:12','::ffff:127.0.0.1'),(123,14,'CREAR','CREAR en usuarios','2026-01-06 19:37:20','::ffff:127.0.0.1'),(124,1,'CREAR','CREAR en adm_roles','2026-01-07 09:46:34','::ffff:127.0.0.1'),(125,1,'CREAR','CREAR en adm_roles','2026-01-07 09:58:37','::ffff:127.0.0.1'),(126,1,'ACTUALIZAR','ACTUALIZAR en roles','2026-01-07 09:59:08','::ffff:127.0.0.1'),(127,1,'ELIMINAR','ELIMINAR en roles','2026-01-07 09:59:16','::ffff:127.0.0.1'),(128,1,'ELIMINAR','ELIMINAR en roles','2026-01-07 10:35:01','::ffff:127.0.0.1'),(129,1,'CREAR','CREAR en adm_roles','2026-01-07 10:51:13','::ffff:127.0.0.1'),(130,1,'ELIMINAR','ELIMINAR en roles','2026-01-07 10:51:20','::ffff:127.0.0.1'),(131,1,'CREAR','CREAR en adm_roles','2026-01-07 11:30:30','::ffff:127.0.0.1'),(132,1,'ELIMINAR','ELIMINAR en roles','2026-01-07 11:31:27','::ffff:127.0.0.1'),(133,1,'CREAR','CREAR en adm_roles','2026-01-07 11:36:51','::ffff:127.0.0.1'),(134,1,'ACTUALIZAR','ACTUALIZAR en roles','2026-01-07 11:36:58','::ffff:127.0.0.1'),(135,1,'ELIMINAR','ELIMINAR en roles','2026-01-07 11:37:03','::ffff:127.0.0.1'),(136,1,'CREAR','CREAR en adm_roles','2026-01-07 14:08:15','::ffff:127.0.0.1'),(137,1,'ACTUALIZAR','ACTUALIZAR en roles','2026-01-07 14:09:04','::ffff:127.0.0.1'),(138,1,'ELIMINAR','ELIMINAR en roles','2026-01-07 14:09:35','::ffff:127.0.0.1');
/*!40000 ALTER TABLE `adm_historial_acciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adm_historial_contrasenas`
--

DROP TABLE IF EXISTS `adm_historial_contrasenas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adm_historial_contrasenas` (
  `id_historial` int NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del historial',
  `id_usuario` int NOT NULL COMMENT 'Usuario',
  `hash_contrasena` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Hash de la contraseña',
  `fecha_cambio` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de cambio',
  PRIMARY KEY (`id_historial`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `adm_historial_contrasenas_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `adm_usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Historial de contraseñas de los usuarios';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_historial_contrasenas`
--

LOCK TABLES `adm_historial_contrasenas` WRITE;
/*!40000 ALTER TABLE `adm_historial_contrasenas` DISABLE KEYS */;
INSERT INTO `adm_historial_contrasenas` VALUES (1,1,'$2b$10$tV8cHM4GHG1svlHY2Kt1de82J5l.pdGxBiy.7n8ZdOEIWmK25PW/y','2025-12-26 14:24:23'),(2,1,'$2b$10$JZLTtUUVJE38jf8JOxCwMuZ/OrD9GwlJK3P4gTrNEtKj0RLN9OTee','2025-12-26 14:24:43'),(3,1,'$2b$10$2I02ujpFqkplpX9/qgghDeYZgM2obhbvDajOGFD6Iu58eee2WEq.m','2025-12-26 14:24:50'),(4,1,'$2b$10$nAL/9xyZuKbA7fflHqUr8uoVTUX.cIzwkQh5gdqiplLQ1JSt.VRSy','2025-12-26 14:25:00'),(5,1,'$2b$10$LuQw27emEONKMKsyuR1/r.vxpORLa3p88KVR6gYKkL.YEMkVMYzXm','2025-12-26 14:25:08'),(6,1,'$2b$10$mH4tq3Bg.HifC28zLmDCx.HpjSd2PuMpwYQzujzCGovnF1UsiSOK.','2025-12-26 14:25:17'),(7,1,'$2b$10$ou6rndZiwkCoI13aDfHq4eUkSQFnHmaQYgWonKxK.iU5tvB.MxNRu','2025-12-26 14:25:39'),(8,1,'$2b$10$BgQxVoE.2RlZ71I.O4pN.Ow8rirrbA5b1PwOeeF41rPWojxf5GwbK','2025-12-26 14:25:47'),(9,1,'$2b$10$mM9ToIk9dossvUK4XpeTR.SHHWxCqfUOrDojGam2j1jQbYwHK47e6','2025-12-26 14:25:57'),(10,1,'$2b$10$Mel7lSuiZDsDOwMlTRFnmu3yOIsnSs.1jybzpWUoPSNVCm/XvceQC','2025-12-26 14:26:24'),(11,1,'$2b$10$Isfyt1SJSC5Raxb.adGftuzYF6T5bMe8jYBqFWIDXPdpyfH6DIhzu','2025-12-26 14:34:00'),(12,1,'$2b$10$oPMBZ4fEX/fb92G/XS17p.iSUETdZTD4LqfAUMNudh3pmwIRQC6/2','2025-12-26 14:34:15');
/*!40000 ALTER TABLE `adm_historial_contrasenas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adm_jerarquias`
--

DROP TABLE IF EXISTS `adm_jerarquias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adm_jerarquias` (
  `id_jerarquia` int NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de la jerarquía',
  `id_jerarquia_padre` int DEFAULT NULL COMMENT 'Jerarquía padre (si aplica)',
  `id_estado` int DEFAULT '1' COMMENT 'Estado de la jerarquía',
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre de la jerarquía',
  `descripcion` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_jerarquia`),
  KEY `fk_jerarquia_estado` (`id_estado`),
  KEY `fk_jerarquias_jerarquia_padre` (`id_jerarquia_padre`),
  CONSTRAINT `fk_jerarquia_estado` FOREIGN KEY (`id_estado`) REFERENCES `adm_estados` (`id_estado`),
  CONSTRAINT `fk_jerarquias_jerarquia_padre` FOREIGN KEY (`id_jerarquia_padre`) REFERENCES `adm_jerarquias` (`id_jerarquia`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Jerarquías organizacionales';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_jerarquias`
--

LOCK TABLES `adm_jerarquias` WRITE;
/*!40000 ALTER TABLE `adm_jerarquias` DISABLE KEYS */;
INSERT INTO `adm_jerarquias` VALUES (1,NULL,1,'Administrador','Jerarquía con todos los privilegios'),(2,1,1,'Supervisor','Jerarquía con permisos de supervisión'),(3,2,1,'Operador','Jerarquía para usuarios operativos'),(4,NULL,1,'Invitado','Jerarquía con acceso limitado'),(5,2,1,'Gestor Viviendas','Gestión de viviendas, asignaciones y mantención'),(6,2,1,'Finanzas','Gestión de pagos, servicios y facturación'),(7,2,1,'Beneficiario','Acceso a información personal, contratos y mensajería'),(8,2,1,'Auditor','Consulta y revisión de bitácora y auditoría'),(9,2,1,'Soporte','Gestión técnica y soporte de usuarios');
/*!40000 ALTER TABLE `adm_jerarquias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adm_menus`
--

DROP TABLE IF EXISTS `adm_menus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adm_menus` (
  `id_menu` int NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del menú',
  `id_menu_padre` int DEFAULT NULL COMMENT 'Menú padre (si aplica)',
  `id_aplicacion` int DEFAULT NULL,
  `id_estado` int DEFAULT '1' COMMENT 'Estado del menú',
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre del menú',
  `url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'URL del menú',
  `orden` int DEFAULT '0' COMMENT 'Orden de aparición',
  `icono` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ícono del menú',
  `visible` tinyint(1) NOT NULL DEFAULT '1',
  `nivel` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_menu`),
  KEY `fk_menu_estado` (`id_estado`),
  KEY `fk_menu_aplicacion_idx` (`id_aplicacion`),
  KEY `fk_menus_menu_padre` (`id_menu_padre`),
  CONSTRAINT `fk_menu_aplicacion` FOREIGN KEY (`id_aplicacion`) REFERENCES `adm_aplicaciones_sitio` (`id_aplicacion`),
  CONSTRAINT `fk_menu_estado` FOREIGN KEY (`id_estado`) REFERENCES `adm_estados` (`id_estado`),
  CONSTRAINT `fk_menus_menu_padre` FOREIGN KEY (`id_menu_padre`) REFERENCES `adm_menus` (`id_menu`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Menús del sistema';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_menus`
--

LOCK TABLES `adm_menus` WRITE;
/*!40000 ALTER TABLE `adm_menus` DISABLE KEYS */;
INSERT INTO `adm_menus` VALUES (1,NULL,1,1,'Panel de Control','dashboard',1,'dashboard',1,0),(2,1,1,1,'Dashboard','dashboard',1,'dashboard',0,0),(3,1,1,1,'Usuarios','usuarios',2,'group',1,0),(4,1,1,1,'Roles','roles',3,'shield',1,0),(5,1,1,1,'Permisos','permisos',4,'key',1,0),(6,1,1,1,'Menús','menus',5,'menu',1,0),(7,1,1,1,'Configuración','configuracion',98,'settings',1,0),(8,1,1,1,'Mi Perfil','perfil',99,'person',1,0),(9,3,1,1,'Crear Usuario','usuarios/crear',1,'person_add',0,0),(10,3,1,1,'Listar Usuarios','usuarios',2,'list',0,0),(13,4,1,1,'Crear Rol','roles/crear',1,'key',0,0),(14,4,1,1,'Listar Roles','roles',2,'list',0,0),(15,5,1,1,'Crear Permiso','permisos/crear',1,'key',0,0),(16,5,1,1,'Listar Permisos','permisos',2,'list',0,0),(17,6,1,1,'Crear Menú','menus/crear',1,'menu',0,0),(18,6,1,1,'Listar Menús','menus',2,'list',0,0),(19,1,1,1,'Tipos de Usuario','tipos-usuarios',6,'group',1,0),(20,1,1,1,'Jerarquías','jerarquias',7,'account_tree',1,0),(21,1,1,1,'Estados','estados',8,'bookmark',1,0),(22,1,1,1,'Búsquedas','busquedas/general',9,'search',0,0),(23,3,1,1,'Uploads Usuarios','uploads/usuarios',3,'cloud-upload',0,1),(24,19,1,1,'Crear Tipos de Usuario','tipos-usuarios/crear',1,'group',0,0),(25,19,1,1,'Listar Tipos de Usuario','tipos-usuarios',2,'list',0,0),(26,20,1,1,'Crear Jerarquías','jerarquias/crear',1,'account_tree',0,0),(27,20,1,1,'Listar Jerarquías','jerarquias',2,'list',0,0),(28,21,1,1,'Crear Estados','estados/crear',1,'bookmark',0,0),(29,21,1,1,'Listar Estados','estados',2,'list',0,0),(30,1,1,1,'Aplicaciones','aplicaciones-sitio',10,'apps',1,1),(31,1,1,1,'Auditoría','',12,'history',1,1),(32,31,1,1,'Historial - Accesos','/historial/accesos',2,'login',1,1),(33,31,1,1,'Historial - Acciones','/historial/acciones',3,'rule',1,1),(34,31,1,1,'Historial - Contraseñas','/historial/contrasenas',4,'key',1,1),(35,1,1,1,'Sitios','sitios',11,'public',1,1),(40,30,1,1,'Crear Aplicaciones','aplicaciones-sitio/crear',1,'apps',0,0),(41,30,1,1,'Listar Aplicaciones','aplicaciones-sitio',2,'list',0,0),(42,35,1,1,'Crear Sitios','sitios/crear',1,'public',0,0),(43,35,1,1,'Listar Sitios','sitios',2,'list',0,0),(44,31,1,1,'Auditoría','/auditoria',1,'history',1,0);
/*!40000 ALTER TABLE `adm_menus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adm_menus_permisos`
--

DROP TABLE IF EXISTS `adm_menus_permisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adm_menus_permisos` (
  `id_menu_permiso` int NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de la relación menú-permiso',
  `id_menu` int NOT NULL COMMENT 'Menú',
  `id_permiso` int NOT NULL COMMENT 'Permiso',
  `id_estado` int DEFAULT NULL,
  PRIMARY KEY (`id_menu_permiso`),
  KEY `fk_menus_permisos_estados_idx` (`id_estado`),
  KEY `fk_menus_permisos_menus` (`id_menu`),
  KEY `fk_menus_permisos_permisos` (`id_permiso`),
  CONSTRAINT `fk_menus_permisos_estados` FOREIGN KEY (`id_estado`) REFERENCES `adm_estados` (`id_estado`),
  CONSTRAINT `fk_menus_permisos_menus` FOREIGN KEY (`id_menu`) REFERENCES `adm_menus` (`id_menu`),
  CONSTRAINT `fk_menus_permisos_permisos` FOREIGN KEY (`id_permiso`) REFERENCES `adm_permisos` (`id_permiso`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Relación entre menús y permisos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_menus_permisos`
--

LOCK TABLES `adm_menus_permisos` WRITE;
/*!40000 ALTER TABLE `adm_menus_permisos` DISABLE KEYS */;
INSERT INTO `adm_menus_permisos` VALUES (1,10,32,1),(2,14,4,1),(3,16,8,1),(4,18,12,1),(5,19,36,1),(6,20,31,1),(7,21,21,1),(8,22,38,1),(9,23,39,1),(10,27,36,1),(11,24,37,1),(12,26,28,1),(13,27,31,1),(14,28,22,1),(15,29,21,1),(16,30,40,1),(17,31,41,1),(18,32,42,1),(19,33,43,1),(20,34,44,1),(21,35,45,1),(22,1,1,1),(23,1,2,1);
/*!40000 ALTER TABLE `adm_menus_permisos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adm_permisos`
--

DROP TABLE IF EXISTS `adm_permisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adm_permisos` (
  `id_permiso` int NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del permiso',
  `id_estado` int DEFAULT '1' COMMENT 'Estado del permiso',
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre del permiso',
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Descripción del permiso',
  PRIMARY KEY (`id_permiso`),
  KEY `fk_permiso_estado` (`id_estado`),
  CONSTRAINT `fk_permiso_estado` FOREIGN KEY (`id_estado`) REFERENCES `adm_estados` (`id_estado`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Permisos del sistema';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_permisos`
--

LOCK TABLES `adm_permisos` WRITE;
/*!40000 ALTER TABLE `adm_permisos` DISABLE KEYS */;
INSERT INTO `adm_permisos` VALUES (1,1,'GESTION_USUARIOS','Permiso para gestionar usuarios'),(2,1,'GESTION_MENUS','Permiso para gestionar menús'),(4,1,'ROLES_VER','Permiso para ver roles'),(5,1,'ROLES_CREAR','Permiso para crear roles'),(6,1,'ROLES_EDITAR','Permiso para editar roles'),(7,1,'ROLES_ELIMINAR','Permiso para eliminar roles'),(8,1,'PERMISOS_VER','Permiso para ver permisos'),(9,1,'PERMISOS_CREAR','Permiso para crear permisos'),(10,1,'PERMISOS_EDITAR','Permiso para editar permisos'),(11,1,'PERMISOS_ELIMINAR','Permiso para eliminar permisos'),(12,1,'MENUS_VER','Permiso para ver menus'),(13,1,'MENUS_CREAR','Permiso para crear menú'),(14,1,'MENUS_EDITAR','Permiso para editar menú'),(15,1,'MENUS_ELIMINAR','Permiso para eliminar menú'),(16,1,'VER_REPORTES','Permiso para ver reportes'),(21,1,'ESTADOS_VER','Permiso para ver estados'),(22,1,'ESTADOS_CREAR','Permiso para crear estados'),(23,1,'ESTADOS_EDITAR','Permiso para editar estados'),(24,1,'ESTADOS_ELIMINAR','Permiso para eliminar estados'),(28,1,'JERARQUIAS_CREAR','Permiso para crear jerarquías'),(29,1,'JERARQUIAS_EDITAR','Permiso para editar jerarquías'),(30,1,'JERARQUIAS_ELIMINAR','Permiso para eliminar jerarquías'),(31,1,'JERARQUIAS_VER','Permiso para ver jerarquías'),(32,1,'USUARIOS_VER','Permiso para ver usuarios'),(33,1,'USUARIOS_CREAR','Permiso para crear usuarios'),(34,1,'USUARIOS_EDITAR','Permiso para editar usuarios'),(35,1,'USUARIOS_ELIMINAR','Permiso para eliminar usuarios'),(36,1,'TIPOS_USUARIO_VER','Permiso para ver tipos de usuario'),(37,1,'TIPOS_USUARIO_CREAR','Permiso para crear tipos de usuario'),(38,1,'BUSQUEDAS_VER','Permiso para ver búsquedas generales'),(39,1,'UPLOADS_USUARIOS_VER','Permiso para ver uploads de usuarios'),(40,1,'VER_APLICACIONES_SITIO','Ver aplicaciones del sitio'),(41,1,'VER_AUDITORIA','Ver registro de auditoría'),(42,1,'VER_HISTORIAL_ACCESOS','Ver historial de accesos'),(43,1,'VER_HISTORIAL_ACCIONES','Ver historial de acciones'),(44,1,'VER_HISTORIAL_CONTRASENAS','Ver historial de cambios de contraseñas'),(45,1,'VER_SITIOS','Ver sitios registrados');
/*!40000 ALTER TABLE `adm_permisos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adm_roles`
--

DROP TABLE IF EXISTS `adm_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adm_roles` (
  `id_rol` int NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del rol',
  `id_estado` int DEFAULT '1' COMMENT 'Estado del rol',
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre del rol',
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Descripción del rol',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_rol`),
  KEY `fk_rol_estado` (`id_estado`),
  CONSTRAINT `fk_rol_estado` FOREIGN KEY (`id_estado`) REFERENCES `adm_estados` (`id_estado`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Roles de usuario';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_roles`
--

LOCK TABLES `adm_roles` WRITE;
/*!40000 ALTER TABLE `adm_roles` DISABLE KEYS */;
INSERT INTO `adm_roles` VALUES (1,1,'ADMIN_ROLE','Rol con todos los permisos',NULL),(2,1,'USER_ROLE','Rol básico de usuario',NULL);
/*!40000 ALTER TABLE `adm_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adm_roles_permisos`
--

DROP TABLE IF EXISTS `adm_roles_permisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adm_roles_permisos` (
  `id_rol_permiso` int NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de la relación rol-permiso',
  `id_rol` int NOT NULL COMMENT 'Rol',
  `id_permiso` int NOT NULL COMMENT 'Permiso',
  `id_estado` int DEFAULT NULL,
  PRIMARY KEY (`id_rol_permiso`),
  KEY `fk_roles_permisos_estado_idx` (`id_estado`),
  KEY `fk_roles_permisos_roles` (`id_rol`),
  KEY `fk_roles_permisos_permisos` (`id_permiso`),
  CONSTRAINT `fk_roles_permisos_estado` FOREIGN KEY (`id_estado`) REFERENCES `adm_estados` (`id_estado`),
  CONSTRAINT `fk_roles_permisos_permisos` FOREIGN KEY (`id_permiso`) REFERENCES `adm_permisos` (`id_permiso`),
  CONSTRAINT `fk_roles_permisos_roles` FOREIGN KEY (`id_rol`) REFERENCES `adm_roles` (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Relación entre roles y permisos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_roles_permisos`
--

LOCK TABLES `adm_roles_permisos` WRITE;
/*!40000 ALTER TABLE `adm_roles_permisos` DISABLE KEYS */;
INSERT INTO `adm_roles_permisos` VALUES (1,1,32,1),(2,1,33,1),(3,1,34,1),(4,1,35,1),(8,1,4,1),(9,1,5,1),(10,1,6,1),(11,1,7,1),(15,1,8,1),(16,1,9,1),(17,1,10,1),(18,1,11,1),(22,1,12,1),(23,1,13,1),(24,1,14,1),(25,1,15,1),(29,1,36,1),(30,1,37,1),(32,1,28,1),(33,1,31,1),(35,1,21,1),(36,1,23,1),(38,1,38,1),(39,1,39,1),(40,1,1,1),(41,1,2,1);
/*!40000 ALTER TABLE `adm_roles_permisos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adm_sesiones_activas`
--

DROP TABLE IF EXISTS `adm_sesiones_activas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adm_sesiones_activas` (
  `id_sesion` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `fecha_expiracion` datetime NOT NULL,
  `creado_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_sesion`),
  UNIQUE KEY `uq_token` (`token_hash`),
  KEY `fk_sesiones_usuario` (`id_usuario`),
  CONSTRAINT `fk_sesiones_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `adm_usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_sesiones_activas`
--

LOCK TABLES `adm_sesiones_activas` WRITE;
/*!40000 ALTER TABLE `adm_sesiones_activas` DISABLE KEYS */;
/*!40000 ALTER TABLE `adm_sesiones_activas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adm_sitios`
--

DROP TABLE IF EXISTS `adm_sitios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adm_sitios` (
  `id_sitio` int NOT NULL AUTO_INCREMENT,
  `id_estado` int DEFAULT NULL,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_sitio`),
  KEY `idx_sitios_estados` (`id_estado`),
  CONSTRAINT `fk_sitios_estados` FOREIGN KEY (`id_estado`) REFERENCES `adm_estados` (`id_estado`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_sitios`
--

LOCK TABLES `adm_sitios` WRITE;
/*!40000 ALTER TABLE `adm_sitios` DISABLE KEYS */;
INSERT INTO `adm_sitios` VALUES (1,1,'Admin Sitio','admin-sitio','Plataforma de administración principal (Admin Sitio)','2025-12-29 12:47:45','2026-01-06 11:00:08'),(2,1,'Viviendas Fiscales','vvff-sitio','Plataforma de Viviendas Fiscales','2026-01-03 21:20:51','2026-01-07 00:15:29'),(3,1,'Admin Sitio3','admin-sitio2','Plataforma de administración principal (Admin Sitio)','2026-01-04 01:39:28','2026-01-07 00:15:29');
/*!40000 ALTER TABLE `adm_sitios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adm_tipos_usuario`
--

DROP TABLE IF EXISTS `adm_tipos_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adm_tipos_usuario` (
  `id_tipo_usuario` int NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del tipo de usuario',
  `id_estado` int DEFAULT '1' COMMENT 'Estado del tipo de usuario',
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre del tipo de usuario',
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Descripción del tipo de usuario',
  PRIMARY KEY (`id_tipo_usuario`),
  KEY `fk_tipo_usuario_estado` (`id_estado`),
  CONSTRAINT `fk_tipo_usuario_estado` FOREIGN KEY (`id_estado`) REFERENCES `adm_estados` (`id_estado`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tipos de usuario del sistema';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_tipos_usuario`
--

LOCK TABLES `adm_tipos_usuario` WRITE;
/*!40000 ALTER TABLE `adm_tipos_usuario` DISABLE KEYS */;
INSERT INTO `adm_tipos_usuario` VALUES (1,1,'Administrador','Usuario con todos los privilegios'),(2,1,'Operador','Usuario con permisos limitados'),(4,1,'Usuario','Usuario con permisos limitados'),(5,1,'Invitado','Usuario sin permisos');
/*!40000 ALTER TABLE `adm_tipos_usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adm_usuarios`
--

DROP TABLE IF EXISTS `adm_usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adm_usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del usuario',
  `id_tipo_usuario` int NOT NULL COMMENT 'Tipo de usuario',
  `id_estado` int DEFAULT '1' COMMENT 'Estado del usuario',
  `correo_electronico` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Correo electrónico único para login',
  `hash_contrasena` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Hash de la contraseña',
  `nombre_usuario` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre de usuario',
  `nombres` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `apellidos` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
  `fecha_actualizacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
  `fecha_cambio_contrasena` datetime DEFAULT NULL,
  `img` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `correo` (`correo_electronico`),
  KEY `id_tipo_usuario` (`id_tipo_usuario`),
  KEY `fk_usuario_estado` (`id_estado`),
  CONSTRAINT `adm_usuarios_ibfk_1` FOREIGN KEY (`id_tipo_usuario`) REFERENCES `adm_tipos_usuario` (`id_tipo_usuario`),
  CONSTRAINT `fk_usuario_estado` FOREIGN KEY (`id_estado`) REFERENCES `adm_estados` (`id_estado`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Usuarios registrados en el sistema';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_usuarios`
--

LOCK TABLES `adm_usuarios` WRITE;
/*!40000 ALTER TABLE `adm_usuarios` DISABLE KEYS */;
INSERT INTO `adm_usuarios` VALUES (1,1,1,'gjpierp@gmail.com','$2b$10$l.Pt1Lwaw1EIT9vDBzSfzeG2vfBSU5UcU7J2zDwnBF59GM3m9AL4.','Gerardo Paiva','Gerardo','Paiva','2025-12-25 17:35:40','2026-01-06 14:09:26','2025-12-26 14:34:15','4fe4a85a-4c6d-4615-9d1c-50d9d4227bf6.jpg',NULL),(2,2,1,'gjpierpspam@gmail.com','$2b$10$kmhsbyRkFT7NcbNCzEvFaOUFQwHleU4YaJ/m7FDUzmgSUBx0dy8iS','Gerardo Paiva','Gerardo','Paiva','2025-12-26 09:24:32','2026-01-06 10:44:12',NULL,'',NULL),(3,1,1,'gjpierpspam2@gmail.com','$2b$10$s/dKwY9BsQbXeBayVhB1e.UybproNaRodSvQuu9v3UAXUWO073eVi','gjpierpspam2',NULL,NULL,'2025-12-26 09:24:46','2026-01-06 07:17:14',NULL,NULL,NULL),(7,1,1,'gjpierp2@gmail.com','$2b$10$P4HAw3f77335wVvyAjHlpO.0LztxislTAmZ.q/EBrbG13vnAuSD/S','Gerado Paiva','Gerardo','Paiva','2026-01-03 21:24:02','2026-01-06 19:42:57',NULL,'',NULL),(8,1,1,'gjpierp3@gmail.com','$2b$10$kqz9grBmuqf254DIO4EOV.cl1HeyIas0rDUuYOry29saj.f8NgNFa','Gerardo Paiva',NULL,NULL,'2026-01-03 21:28:04','2026-01-06 19:42:57',NULL,NULL,NULL),(9,1,1,'gjpierp4@gmail.com','$2b$10$tVvuSpy7nuuNfMIgwd8N0eomKDwoQsnt.nGzhG/rFaIDRe4tT1Mj2','Gerado Paiva','Gerardo Jean Pierre','Paiva González','2026-01-03 21:29:10','2026-01-06 19:42:57',NULL,NULL,NULL),(10,1,1,'gjpierp10@gmail.com','$2b$10$1AK9rRQDFlw1/A2Q58ShCurhNk/OsTIdIfF87Q4ZWuGgtNM10pnDa','Gerardo Paiva Gonzalez',NULL,NULL,'2026-01-03 22:43:55','2026-01-03 23:33:20',NULL,NULL,NULL),(11,1,1,'gjpierp23@gmail.com','$2b$10$tpxYDEMl7H2Ck2DKNvDnQ.qZDU1WkxGLQzUON8GTNik512nuygOJ2','gjpierp',NULL,NULL,'2026-01-06 11:01:52','2026-01-06 19:42:57',NULL,NULL,NULL),(12,1,1,'gjpierp102@gmail.com','$2b$10$B9/P7ost4G4JVNSj51pnx.L8l0HRah4EN7.1V1gT.o.WGC9YdI0iG','gjpierp2',NULL,NULL,'2026-01-06 19:35:49','2026-01-06 19:35:49',NULL,NULL,NULL),(13,1,1,'gjpierp103@gmail.com','$2b$10$ooASkqRY/t5S238XatKzv.87ReoupZZdzFeyZAu2XmkZy3PU9nr8.','gjpierp3',NULL,NULL,'2026-01-06 19:36:12','2026-01-06 19:36:12',NULL,NULL,NULL),(14,1,1,'gjpierp104@gmail.com','$2b$10$BHD2x2.v1ojKdceNaNacVeZID17obdKmLnjAoyilwEMOwRjADjyBy','gjpierp4',NULL,NULL,'2026-01-06 19:37:20','2026-01-06 19:37:20',NULL,NULL,NULL);
/*!40000 ALTER TABLE `adm_usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `tg_auditoria_usuarios_insert` AFTER INSERT ON `adm_usuarios` FOR EACH ROW BEGIN
    INSERT INTO `adm_auditoria` (id_entidad, id_registro, accion, datos_nuevos)
    VALUES (
        (SELECT id_entidad FROM adm_entidades WHERE nombre_tabla = 'adm_usuarios'),
        NEW.id_usuario,
        'INSERT',
        JSON_OBJECT('nombre_usuario', NEW.nombre_usuario, 'correo_electronico', NEW.correo_electronico)
    );
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `tg_auditoria_usuarios_update` AFTER UPDATE ON `adm_usuarios` FOR EACH ROW BEGIN
    -- Solo insertamos si hubo un cambio real o si es un Soft Delete
    INSERT INTO `adm_auditoria` (
        id_entidad, 
        id_registro, 
        accion, 
        datos_anteriores, 
        datos_nuevos, 
        fecha
    )
    VALUES (
        (SELECT id_entidad FROM adm_entidades WHERE nombre_tabla = 'adm_usuarios'),
        OLD.id_usuario,
        IF(NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL, 'DELETE', 'UPDATE'),
        JSON_OBJECT('nombre_usuario', OLD.nombre_usuario, 'correo_electronico', OLD.correo_electronico, 'id_estado', OLD.id_estado),
        JSON_OBJECT('nombre_usuario', NEW.nombre_usuario, 'correo_electronico', NEW.correo_electronico, 'id_estado', NEW.id_estado),
        NOW()
    );
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `adm_usuarios_aplicaciones`
--

DROP TABLE IF EXISTS `adm_usuarios_aplicaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adm_usuarios_aplicaciones` (
  `id_usuario_aplicacion` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_aplicacion` int NOT NULL,
  `id_estado` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario_aplicacion`),
  UNIQUE KEY `ux_usuario_aplicacion` (`id_usuario`,`id_aplicacion`),
  KEY `idx_id_usuario` (`id_usuario`),
  KEY `idx_id_aplicacion` (`id_aplicacion`),
  KEY `fk_usu_aplicacion_estado_idx` (`id_estado`),
  CONSTRAINT `fk_usu_aplicacion_aplicacion` FOREIGN KEY (`id_aplicacion`) REFERENCES `adm_aplicaciones_sitio` (`id_aplicacion`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_usu_aplicacion_estado` FOREIGN KEY (`id_estado`) REFERENCES `adm_estados` (`id_estado`),
  CONSTRAINT `fk_usu_aplicacion_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `adm_usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_usuarios_aplicaciones`
--

LOCK TABLES `adm_usuarios_aplicaciones` WRITE;
/*!40000 ALTER TABLE `adm_usuarios_aplicaciones` DISABLE KEYS */;
INSERT INTO `adm_usuarios_aplicaciones` VALUES (1,1,1,1,'2025-12-29 17:25:55','2026-01-06 11:10:16'),(2,1,2,1,'2025-12-29 17:25:55','2026-01-06 11:10:16');
/*!40000 ALTER TABLE `adm_usuarios_aplicaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adm_usuarios_jerarquias`
--

DROP TABLE IF EXISTS `adm_usuarios_jerarquias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adm_usuarios_jerarquias` (
  `id_usuario_jerarquia` int NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de la relación usuario-jerarquía',
  `id_usuario` int NOT NULL COMMENT 'Usuario',
  `id_jerarquia` int NOT NULL COMMENT 'Jerarquía',
  `id_estado` int DEFAULT NULL,
  PRIMARY KEY (`id_usuario_jerarquia`),
  KEY `fk_usuarios_jerarquias_estados_idx` (`id_estado`),
  KEY `fk_usuarios_jerarquias_usuarios` (`id_usuario`),
  KEY `fk_usuarios_jerarquias_jerarquias` (`id_jerarquia`),
  CONSTRAINT `fk_usuarios_jerarquias_estados` FOREIGN KEY (`id_estado`) REFERENCES `adm_estados` (`id_estado`),
  CONSTRAINT `fk_usuarios_jerarquias_jerarquias` FOREIGN KEY (`id_jerarquia`) REFERENCES `adm_jerarquias` (`id_jerarquia`),
  CONSTRAINT `fk_usuarios_jerarquias_usuarios` FOREIGN KEY (`id_usuario`) REFERENCES `adm_usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Relación entre usuarios y jerarquías';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_usuarios_jerarquias`
--

LOCK TABLES `adm_usuarios_jerarquias` WRITE;
/*!40000 ALTER TABLE `adm_usuarios_jerarquias` DISABLE KEYS */;
INSERT INTO `adm_usuarios_jerarquias` VALUES (2,1,1,1),(3,7,1,1),(4,9,1,1),(5,10,1,1),(6,11,1,NULL),(7,12,1,NULL),(8,13,1,NULL),(9,14,1,NULL);
/*!40000 ALTER TABLE `adm_usuarios_jerarquias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adm_usuarios_roles`
--

DROP TABLE IF EXISTS `adm_usuarios_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adm_usuarios_roles` (
  `id_usuario_rol` int NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de la relación usuario-rol',
  `id_usuario` int NOT NULL COMMENT 'Usuario',
  `id_rol` int NOT NULL COMMENT 'Rol',
  `id_estado` int DEFAULT NULL,
  `adm_usuarios_rolescol` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_usuario_rol`),
  KEY `fk_usuarios_roles_estados_idx` (`id_estado`),
  KEY `fk_usuarios_roles_usuarios` (`id_usuario`),
  KEY `fk_usuarios_roles_roles` (`id_rol`),
  CONSTRAINT `fk_usuarios_roles_estados` FOREIGN KEY (`id_estado`) REFERENCES `adm_estados` (`id_estado`),
  CONSTRAINT `fk_usuarios_roles_roles` FOREIGN KEY (`id_rol`) REFERENCES `adm_roles` (`id_rol`),
  CONSTRAINT `fk_usuarios_roles_usuarios` FOREIGN KEY (`id_usuario`) REFERENCES `adm_usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Relación entre usuarios y roles';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_usuarios_roles`
--

LOCK TABLES `adm_usuarios_roles` WRITE;
/*!40000 ALTER TABLE `adm_usuarios_roles` DISABLE KEYS */;
INSERT INTO `adm_usuarios_roles` VALUES (11,1,1,1,NULL),(12,1,2,1,NULL),(13,3,1,1,NULL),(14,3,2,1,NULL),(15,7,1,1,NULL),(16,9,1,1,NULL),(17,8,1,1,NULL),(18,8,2,1,NULL),(19,10,1,1,NULL),(20,2,2,1,NULL),(21,11,1,1,NULL),(22,12,1,NULL,NULL),(23,13,1,NULL,NULL),(24,14,1,NULL,NULL);
/*!40000 ALTER TABLE `adm_usuarios_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `vw_configuracion_ui_atributos`
--

DROP TABLE IF EXISTS `vw_configuracion_ui_atributos`;
/*!50001 DROP VIEW IF EXISTS `vw_configuracion_ui_atributos`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_configuracion_ui_atributos` AS SELECT 
 1 AS `entidad`,
 1 AS `campo`,
 1 AS `tipo_dato`,
 1 AS `ver_en_crear`,
 1 AS `ver_en_editar`,
 1 AS `ver_en_lista`,
 1 AS `ver_en_detalle`,
 1 AS `es_fk`,
 1 AS `fk_tabla_referencia`,
 1 AS `fk_columna_mostrar`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_diccionario_entidades_atributos`
--

DROP TABLE IF EXISTS `vw_diccionario_entidades_atributos`;
/*!50001 DROP VIEW IF EXISTS `vw_diccionario_entidades_atributos`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_diccionario_entidades_atributos` AS SELECT 
 1 AS `id_entidad`,
 1 AS `entidad_tecnica`,
 1 AS `entidad_nombre`,
 1 AS `entidad_estado`,
 1 AS `id_atributo`,
 1 AS `atributo_tecnico`,
 1 AS `tipo_dato`,
 1 AS `es_auditable`,
 1 AS `atributo_estado`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_modulos_visibles`
--

DROP TABLE IF EXISTS `vw_modulos_visibles`;
/*!50001 DROP VIEW IF EXISTS `vw_modulos_visibles`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_modulos_visibles` AS SELECT 
 1 AS `id_aplicacion`,
 1 AS `nombre`,
 1 AS `enlace`,
 1 AS `icono`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_rutas_configuradas`
--

DROP TABLE IF EXISTS `vw_rutas_configuradas`;
/*!50001 DROP VIEW IF EXISTS `vw_rutas_configuradas`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_rutas_configuradas` AS SELECT 
 1 AS `id_aplicacion`,
 1 AS `modulo`,
 1 AS `etiqueta`,
 1 AS `ruta_endpoint`,
 1 AS `metodo_http`,
 1 AS `estado_nombre`,
 1 AS `es_menu`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_rutas_por_sitio`
--

DROP TABLE IF EXISTS `vw_rutas_por_sitio`;
/*!50001 DROP VIEW IF EXISTS `vw_rutas_por_sitio`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_rutas_por_sitio` AS SELECT 
 1 AS `nombre_sitio`,
 1 AS `codigo_sitio`,
 1 AS `modulo_entidad`,
 1 AS `etiqueta_enlace`,
 1 AS `url`,
 1 AS `metodo_http`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_usuarios_activos`
--

DROP TABLE IF EXISTS `vw_usuarios_activos`;
/*!50001 DROP VIEW IF EXISTS `vw_usuarios_activos`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_usuarios_activos` AS SELECT 
 1 AS `id_usuario`,
 1 AS `nombre_usuario`,
 1 AS `correo_electronico`,
 1 AS `id_estado`,
 1 AS `fecha_creacion`*/;
SET character_set_client = @saved_cs_client;

--
-- Dumping events for database 'db_vvff_admin'
--

--
-- Dumping routines for database 'db_vvff_admin'
--

--
-- Final view structure for view `vw_configuracion_ui_atributos`
--

/*!50001 DROP VIEW IF EXISTS `vw_configuracion_ui_atributos`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_configuracion_ui_atributos` AS select `e`.`nombre_tabla` AS `entidad`,`a`.`nombre_columna` AS `campo`,`a`.`tipo_dato` AS `tipo_dato`,`a`.`ver_en_crear` AS `ver_en_crear`,`a`.`ver_en_editar` AS `ver_en_editar`,`a`.`ver_en_lista` AS `ver_en_lista`,`a`.`ver_en_detalle` AS `ver_en_detalle`,`a`.`es_fk` AS `es_fk`,`a`.`fk_tabla_referencia` AS `fk_tabla_referencia`,`a`.`fk_columna_mostrar` AS `fk_columna_mostrar` from (`adm_atributos` `a` join `adm_entidades` `e` on((`a`.`id_entidad` = `e`.`id_entidad`))) where (`a`.`id_estado` = 1) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_diccionario_entidades_atributos`
--

/*!50001 DROP VIEW IF EXISTS `vw_diccionario_entidades_atributos`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_diccionario_entidades_atributos` AS select `e`.`id_entidad` AS `id_entidad`,`e`.`nombre_tabla` AS `entidad_tecnica`,`e`.`alias_nombre` AS `entidad_nombre`,`ee`.`nombre` AS `entidad_estado`,`a`.`id_atributo` AS `id_atributo`,`a`.`nombre_columna` AS `atributo_tecnico`,`a`.`tipo_dato` AS `tipo_dato`,(case when (`a`.`es_auditable` = 1) then 'Sí' else 'No' end) AS `es_auditable`,`ea`.`nombre` AS `atributo_estado` from (((`adm_entidades` `e` join `adm_estados` `ee` on((`e`.`id_estado` = `ee`.`id_estado`))) left join `adm_atributos` `a` on((`e`.`id_entidad` = `a`.`id_entidad`))) join `adm_estados` `ea` on((`a`.`id_estado` = `ea`.`id_estado`))) order by `e`.`alias_nombre`,`a`.`nombre_columna` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_modulos_visibles`
--

/*!50001 DROP VIEW IF EXISTS `vw_modulos_visibles`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_modulos_visibles` AS select `adm_aplicaciones_sitio`.`id_aplicacion` AS `id_aplicacion`,`adm_aplicaciones_sitio`.`nombre` AS `nombre`,`adm_aplicaciones_sitio`.`enlace` AS `enlace`,`adm_aplicaciones_sitio`.`icono` AS `icono` from `adm_aplicaciones_sitio` where ((`adm_aplicaciones_sitio`.`deleted_at` is null) and (`adm_aplicaciones_sitio`.`id_estado` = 1)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_rutas_configuradas`
--

/*!50001 DROP VIEW IF EXISTS `vw_rutas_configuradas`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_rutas_configuradas` AS select `a`.`id_aplicacion` AS `id_aplicacion`,`e`.`alias_nombre` AS `modulo`,`a`.`nombre` AS `etiqueta`,`a`.`enlace` AS `ruta_endpoint`,`a`.`metodo_http` AS `metodo_http`,`s`.`nombre` AS `estado_nombre`,`a`.`es_menu` AS `es_menu` from ((`adm_aplicaciones_sitio` `a` left join `adm_entidades` `e` on((`a`.`id_entidad` = `e`.`id_entidad`))) join `adm_estados` `s` on((`a`.`id_estado` = `s`.`id_estado`))) where (`a`.`deleted_at` is null) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_rutas_por_sitio`
--

/*!50001 DROP VIEW IF EXISTS `vw_rutas_por_sitio`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_rutas_por_sitio` AS select `s`.`nombre` AS `nombre_sitio`,`s`.`codigo` AS `codigo_sitio`,`e`.`alias_nombre` AS `modulo_entidad`,`a`.`nombre` AS `etiqueta_enlace`,`a`.`enlace` AS `url`,`a`.`metodo_http` AS `metodo_http` from ((`adm_aplicaciones_sitio` `a` join `adm_sitios` `s` on((`a`.`id_sitio` = `s`.`id_sitio`))) left join `adm_entidades` `e` on((`a`.`id_entidad` = `e`.`id_entidad`))) where ((`a`.`id_estado` = 1) and (`s`.`id_estado` = 1)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_usuarios_activos`
--

/*!50001 DROP VIEW IF EXISTS `vw_usuarios_activos`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_usuarios_activos` AS select `adm_usuarios`.`id_usuario` AS `id_usuario`,`adm_usuarios`.`nombre_usuario` AS `nombre_usuario`,`adm_usuarios`.`correo_electronico` AS `correo_electronico`,`adm_usuarios`.`id_estado` AS `id_estado`,`adm_usuarios`.`fecha_creacion` AS `fecha_creacion` from `adm_usuarios` where (`adm_usuarios`.`deleted_at` is null) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-09  8:13:56
