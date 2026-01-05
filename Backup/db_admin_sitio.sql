CREATE DATABASE  IF NOT EXISTS `db_vvff_admin` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `db_vvff_admin`;
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
  `id_sitio` int NOT NULL,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `clave` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_aplicacion`),
  KEY `idx_aplicaciones_id_sitio` (`id_sitio`),
  CONSTRAINT `fk_aplicaciones_sitio_sitio` FOREIGN KEY (`id_sitio`) REFERENCES `adm_sitios` (`id_sitio`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_aplicaciones_sitio`
--

LOCK TABLES `adm_aplicaciones_sitio` WRITE;
/*!40000 ALTER TABLE `adm_aplicaciones_sitio` DISABLE KEYS */;
INSERT INTO `adm_aplicaciones_sitio` VALUES (1,1,'Admin Sitio - Frontend','admin-sitio-pro','Frontend Angular del Admin Sitio',1,'2025-12-29 12:47:45',NULL),(2,1,'Admin Sitio - Backend','admin-bcknd','API REST Node/Express para Admin Sitio',1,'2025-12-29 12:47:45',NULL),(3,2,'VVFF - Frontend','vvff-frntnd','Frontend Angular de Vivienda Fiscal',1,'2025-12-29 12:54:09','2026-01-03 21:21:48'),(4,2,'VVFF - Backend','vvff-bcknd','API REST Node/Express para Viviendas Fiscales',1,'2026-01-03 21:21:48','2026-01-03 21:28:26'),(5,2,'VVFF - Backend 3','vvff-bcknd2','API REST Node/Express para Viviendas Fiscales',0,'2026-01-03 23:20:59','2026-01-03 23:30:12'),(6,2,'VVFF - Backend 3','vvff-bcknd2','API REST Node/Express para Viviendas Fiscales',0,'2026-01-03 23:21:17','2026-01-03 23:30:03'),(7,2,'VVFF - Backend 4','vvff-bcknd2','API REST Node/Express para Viviendas Fiscales',0,'2026-01-03 23:23:03','2026-01-03 23:30:01'),(8,2,'VVFF - Backend 4','vvff-bcknd2','API REST Node/Express para Viviendas Fiscales',0,'2026-01-03 23:25:28','2026-01-03 23:29:58'),(9,2,'VVFF - Backend 6','vvff-bcknd2','API REST Node/Express para Viviendas Fiscales',0,'2026-01-03 23:25:41','2026-01-03 23:29:55'),(10,1,'VVFF - Backend 3','vvff-bcknd333','API REST Node/Express para Viviendas Fiscales',0,'2026-01-03 23:30:46','2026-01-03 23:30:50'),(11,1,'Admin Sitio - Frontend4','admin-sitio-pro','Frontend Angular del Admin Sitio',0,'2026-01-04 01:41:37','2026-01-04 01:42:33');
/*!40000 ALTER TABLE `adm_aplicaciones_sitio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adm_auditoria`
--

DROP TABLE IF EXISTS `adm_auditoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adm_auditoria` (
  `id_auditoria` int NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de la auditoría',
  `tabla` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre de la tabla afectada',
  `id_registro` int NOT NULL COMMENT 'ID del registro afectado',
  `accion` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Acción (INSERTAR/ACTUALIZAR/ELIMINAR)',
  `id_usuario` int DEFAULT NULL COMMENT 'Usuario que realizó la acción',
  `datos_anteriores` text COLLATE utf8mb4_unicode_ci COMMENT 'Datos anteriores (JSON/texto)',
  `datos_nuevos` text COLLATE utf8mb4_unicode_ci COMMENT 'Datos nuevos (JSON/texto)',
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de la acción',
  `direccion_ip` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Dirección IP',
  PRIMARY KEY (`id_auditoria`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `adm_auditoria_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `adm_usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Auditoría de cambios en el sistema';
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
  `clave` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor` text COLLATE utf8mb4_unicode_ci,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo` enum('string','number','boolean','json','select','file','date','time') COLLATE utf8mb4_unicode_ci DEFAULT 'string',
  `publico` tinyint(1) DEFAULT '1',
  `id_usuario` int DEFAULT NULL,
  `protegido` tinyint(1) DEFAULT '0',
  `creado_por` int DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_por` int DEFAULT NULL,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_configuracion`),
  UNIQUE KEY `uq_clave_usuario` (`clave`,`id_usuario`),
  KEY `idx_clave` (`clave`),
  KEY `idx_id_usuario` (`id_usuario`),
  CONSTRAINT `adm_configuraciones_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `adm_usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_configuraciones`
--

LOCK TABLES `adm_configuraciones` WRITE;
/*!40000 ALTER TABLE `adm_configuraciones` DISABLE KEYS */;
INSERT INTO `adm_configuraciones` VALUES (1,'site_name','Administrador Sitio','Nombre mostrado en la cabecera','string',1,NULL,0,1,'2025-12-30 14:21:03',NULL,'2025-12-30 14:21:03'),(2,'site_logo','/assets/img/logo.png','Ruta al logo del sitio','file',1,NULL,1,1,'2025-12-30 14:21:03',NULL,'2025-12-30 14:21:03'),(3,'default_language','es','Idioma por defecto del sitio','select',1,NULL,0,1,'2025-12-30 14:21:03',NULL,'2025-12-30 14:21:03'),(4,'items_per_page','10','Elementos por página en listados','number',1,NULL,0,1,'2025-12-30 14:21:03',NULL,'2025-12-30 14:21:03'),(5,'allow_registration','1','Permitir registro público (0/1)','boolean',1,NULL,0,1,'2025-12-30 14:21:03',NULL,'2025-12-30 14:21:03'),(6,'maintenance_mode','0','Modo mantenimiento activado (0/1)','boolean',1,NULL,1,1,'2025-12-30 14:21:03',NULL,'2025-12-30 14:21:03'),(7,'support_email','gjpierp@gmail.com','Email de soporte','string',1,NULL,0,1,'2025-12-30 14:21:03',NULL,'2025-12-30 14:21:03'),(8,'default_theme','light','Tema por defecto (light/dark)','select',1,NULL,0,1,'2025-12-30 14:21:03',NULL,'2025-12-30 14:21:03'),(9,'date_format','DD/MM/YYYY','Formato de fecha','string',1,NULL,0,1,'2025-12-30 14:21:03',NULL,'2025-12-30 14:21:03'),(10,'timezone','America/Santiago','Zona horaria por defecto','string',1,NULL,0,1,'2025-12-30 14:21:03',NULL,'2025-12-30 14:21:03'),(11,'max_upload_mb','10','Tamaño máximo de upload en MB','number',1,NULL,0,1,'2025-12-30 14:21:03',NULL,'2025-12-30 14:21:03'),(12,'password_policy','{\"min\":8,\"upper\":1,\"digit\":1,\"special\":1}','Política de contraseñas (JSON)','json',0,NULL,1,1,'2025-12-30 14:21:03',NULL,'2025-12-30 14:21:03'),(13,'session_timeout_minutes','720','Tiempo de expiración de sesión en minutos','number',0,NULL,0,1,'2025-12-30 14:21:03',NULL,'2025-12-30 14:21:03'),(14,'enable_2fa','0','Habilitar 2FA globalmente (0/1)','boolean',0,NULL,0,1,'2025-12-30 14:21:03',NULL,'2025-12-30 14:21:03'),(15,'analytics_tracking_id','','ID de analytics (p.e. GA)','string',0,NULL,0,1,'2025-12-30 14:21:03',NULL,'2025-12-30 14:21:03'),(16,'terms_url','/legal/terms','URL de términos y condiciones','string',1,NULL,0,1,'2025-12-30 14:21:03',NULL,'2025-12-30 14:21:03');
/*!40000 ALTER TABLE `adm_configuraciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adm_configuraciones_tema`
--

DROP TABLE IF EXISTS `adm_configuraciones_tema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adm_configuraciones_tema` (
  `id_config` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_tema` int NOT NULL,
  `nombre` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creado_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `meta` json DEFAULT NULL,
  PRIMARY KEY (`id_config`),
  KEY `idx_conf_usuario` (`id_usuario`),
  KEY `fk_conf_tema` (`id_tema`),
  CONSTRAINT `fk_conf_tema` FOREIGN KEY (`id_tema`) REFERENCES `adm_temas` (`id_tema`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_configuraciones_tema`
--

LOCK TABLES `adm_configuraciones_tema` WRITE;
/*!40000 ALTER TABLE `adm_configuraciones_tema` DISABLE KEYS */;
/*!40000 ALTER TABLE `adm_configuraciones_tema` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adm_configuraciones_valores`
--

DROP TABLE IF EXISTS `adm_configuraciones_valores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adm_configuraciones_valores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_config` int NOT NULL,
  `id_tema_var` int NOT NULL,
  `valor` text COLLATE utf8mb4_unicode_ci,
  `creado_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_conf_var` (`id_config`,`id_tema_var`),
  KEY `idx_conf` (`id_config`),
  CONSTRAINT `fk_conf_val_conf` FOREIGN KEY (`id_config`) REFERENCES `adm_configuraciones_tema` (`id_config`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_configuraciones_valores`
--

LOCK TABLES `adm_configuraciones_valores` WRITE;
/*!40000 ALTER TABLE `adm_configuraciones_valores` DISABLE KEYS */;
/*!40000 ALTER TABLE `adm_configuraciones_valores` ENABLE KEYS */;
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
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Descripción del estado',
  `id_applicaciones_sitio` int DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
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
INSERT INTO `adm_estados` VALUES (1,'Activo','Estado activo',1,1),(2,'Inactivo','Estado inactivo',1,1),(3,'Pendiente','Estado pendiente de aprobación',1,1),(4,'Eliminado','Estado eliminado o dado de baja',1,1),(5,'Disponible','Vivienda disponible para asignación',2,1),(6,'Ocupada','Vivienda actualmente ocupada',2,1),(7,'En Mantención','Vivienda en proceso de mantención',2,1),(8,'Activo2','Estado activo2',1,0);
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
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Historial de accesos de los usuarios';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_historial_accesos`
--

LOCK TABLES `adm_historial_accesos` WRITE;
/*!40000 ALTER TABLE `adm_historial_accesos` DISABLE KEYS */;
INSERT INTO `adm_historial_accesos` VALUES (1,1,'2025-12-28 17:19:10',NULL,'::1','PostmanRuntime/7.51.0'),(2,1,'2025-12-28 17:49:18',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(3,1,'2025-12-28 17:50:21',NULL,'::1','PostmanRuntime/7.51.0'),(4,1,'2025-12-28 17:52:18',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(5,1,'2025-12-28 17:52:49',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(6,1,'2025-12-28 17:53:11',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(7,1,'2025-12-28 18:00:02',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(8,1,'2025-12-28 18:01:03',NULL,'::1','PostmanRuntime/7.51.0'),(9,1,'2025-12-28 19:48:25',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(10,1,'2025-12-28 19:55:23',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(11,1,'2025-12-28 20:36:50',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(12,1,'2025-12-28 20:37:54',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(13,1,'2025-12-28 20:39:04',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(14,1,'2025-12-29 08:10:46',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(15,1,'2025-12-29 08:18:32',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(16,1,'2025-12-29 08:21:17',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(17,1,'2025-12-29 08:25:09',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(18,1,'2025-12-29 08:29:51',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(19,1,'2025-12-29 08:36:56',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(20,1,'2025-12-29 08:42:20',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(21,1,'2025-12-29 08:43:38',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(22,1,'2025-12-29 08:47:47',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(23,1,'2025-12-29 09:05:28',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(24,1,'2025-12-29 09:05:42',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(25,1,'2025-12-29 10:49:11',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(26,1,'2025-12-29 12:11:28',NULL,'::1','PostmanRuntime/7.51.0'),(27,1,'2025-12-29 14:14:43',NULL,'::1','PostmanRuntime/7.51.0'),(28,1,'2025-12-29 15:19:06',NULL,'::1','PostmanRuntime/7.51.0'),(29,1,'2025-12-29 15:44:13',NULL,'::1','PostmanRuntime/7.51.0'),(30,1,'2025-12-29 19:02:05',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(31,1,'2025-12-30 13:46:45',NULL,'::1','PostmanRuntime/7.51.0'),(32,1,'2025-12-30 14:10:30',NULL,'::1','PostmanRuntime/7.51.0'),(33,1,'2025-12-30 16:13:16',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(34,1,'2025-12-30 16:15:45',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(35,1,'2025-12-30 19:45:46',NULL,'::1','PostmanRuntime/7.51.0'),(36,1,'2025-12-30 20:39:16',NULL,'::1','PostmanRuntime/7.39.1'),(37,1,'2025-12-30 20:39:32',NULL,'::1','PostmanRuntime/7.39.1'),(38,1,'2025-12-30 20:42:08',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(39,1,'2025-12-30 20:49:02',NULL,'::1','PostmanRuntime/7.39.1'),(40,1,'2025-12-30 20:49:18',NULL,'::1','PostmanRuntime/7.39.1'),(41,1,'2025-12-30 21:10:52',NULL,'::1','PostmanRuntime/7.39.1'),(42,1,'2025-12-30 21:14:25',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(43,1,'2025-12-30 21:29:25',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(44,1,'2025-12-30 21:30:21',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(45,1,'2025-12-30 21:37:14',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(46,1,'2025-12-30 21:39:59',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(47,1,'2026-01-01 15:42:31',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(49,1,'2026-01-01 15:44:01',NULL,'::1','PostmanRuntime/7.51.0'),(50,1,'2026-01-01 15:44:25',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(51,1,'2026-01-03 15:23:20',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(52,1,'2026-01-03 15:31:09',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(53,1,'2026-01-03 15:41:47',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(54,1,'2026-01-03 15:42:19',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(55,1,'2026-01-03 16:00:44',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(56,1,'2026-01-03 16:36:03',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(57,1,'2026-01-03 19:07:09',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(58,1,'2026-01-03 19:13:29',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(59,1,'2026-01-03 19:14:43',NULL,'::1','PostmanRuntime/7.51.0'),(60,1,'2026-01-03 19:15:31',NULL,'::1','PostmanRuntime/7.51.0'),(61,1,'2026-01-03 19:17:13',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(62,1,'2026-01-03 19:42:56',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(63,1,'2026-01-03 19:52:14',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(64,1,'2026-01-03 19:53:10',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(65,1,'2026-01-03 19:53:38',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(66,1,'2026-01-03 19:56:07',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(67,1,'2026-01-03 20:09:25',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(68,1,'2026-01-03 20:30:24',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(69,1,'2026-01-03 21:25:58',NULL,'::1','PostmanRuntime/7.51.0'),(70,1,'2026-01-03 21:28:31',NULL,'::1','PostmanRuntime/7.51.0'),(71,1,'2026-01-03 21:28:34',NULL,'::1','PostmanRuntime/7.51.0'),(72,1,'2026-01-03 21:39:28',NULL,'::1','PostmanRuntime/7.51.0'),(73,1,'2026-01-03 23:33:39',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),(74,1,'2026-01-04 08:50:18',NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36');
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
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Historial de acciones de los usuarios';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_historial_acciones`
--

LOCK TABLES `adm_historial_acciones` WRITE;
/*!40000 ALTER TABLE `adm_historial_acciones` DISABLE KEYS */;
INSERT INTO `adm_historial_acciones` VALUES (1,1,'ELIMINAR','ELIMINAR en roles',NULL,NULL),(2,1,'ASIGNAR_PERMISOS','ASIGNAR_PERMISOS en roles',NULL,NULL),(3,1,'ASIGNAR_PERMISOS','ASIGNAR_PERMISOS en roles',NULL,NULL),(4,1,'CREAR','CREAR en adm_roles',NULL,NULL),(5,1,'ELIMINAR','ELIMINAR en roles',NULL,NULL),(6,1,'CREAR','CREAR en adm_roles',NULL,NULL),(7,1,'ACTUALIZAR','ACTUALIZAR en roles',NULL,NULL),(8,1,'ACTUALIZAR','ACTUALIZAR en roles',NULL,NULL),(9,1,'ELIMINAR','ELIMINAR en roles',NULL,NULL),(10,1,'CREAR','CREAR en permisos',NULL,NULL),(11,1,'CREAR','CREAR en permisos',NULL,NULL),(12,1,'ACTUALIZAR','ACTUALIZAR en permisos',NULL,NULL),(13,1,'ACTUALIZAR','ACTUALIZAR en permisos',NULL,NULL),(14,1,'ACTUALIZAR','ACTUALIZAR en permisos',NULL,NULL),(15,1,'ACTUALIZAR','ACTUALIZAR en permisos',NULL,NULL),(16,1,'CREAR','CREAR en permisos',NULL,NULL),(17,1,'CREAR','CREAR en permisos',NULL,NULL),(18,1,'ELIMINAR','ELIMINAR en permisos',NULL,NULL),(19,1,'CREAR','CREAR en menus',NULL,NULL),(20,1,'CREAR','CREAR en menus',NULL,NULL),(21,1,'ACTUALIZAR','ACTUALIZAR en menus',NULL,NULL),(22,1,'ELIMINAR','ELIMINAR en menus',NULL,NULL),(23,1,'ELIMINAR','ELIMINAR en menus',NULL,NULL),(24,1,'ASIGNAR_PERMISOS','ASIGNAR_PERMISOS en menus',NULL,NULL),(25,1,'ACTUALIZAR','ACTUALIZAR en roles',NULL,NULL),(26,1,'ACTUALIZAR','ACTUALIZAR en roles',NULL,NULL),(27,1,'ACTUALIZAR','ACTUALIZAR en roles',NULL,NULL),(28,1,'ACTUALIZAR','ACTUALIZAR en aplicaciones_sitio','2026-01-03 20:29:44','::ffff:127.0.0.1'),(29,1,'ELIMINAR','ELIMINAR en aplicaciones_sitio','2026-01-03 20:29:55','::ffff:127.0.0.1'),(30,1,'ELIMINAR','ELIMINAR en aplicaciones_sitio','2026-01-03 20:29:58','::ffff:127.0.0.1'),(31,1,'ELIMINAR','ELIMINAR en aplicaciones_sitio','2026-01-03 20:30:01','::ffff:127.0.0.1'),(32,1,'ELIMINAR','ELIMINAR en aplicaciones_sitio','2026-01-03 20:30:03','::ffff:127.0.0.1'),(33,1,'ACTUALIZAR','ACTUALIZAR en aplicaciones_sitio','2026-01-03 20:30:08','::ffff:127.0.0.1'),(34,1,'ELIMINAR','ELIMINAR en aplicaciones_sitio','2026-01-03 20:30:12','::ffff:127.0.0.1'),(35,1,'CREAR','CREAR en aplicaciones_sitio','2026-01-03 20:30:46','::ffff:127.0.0.1'),(36,1,'ELIMINAR','ELIMINAR en aplicaciones_sitio','2026-01-03 20:30:50','::ffff:127.0.0.1'),(37,1,'ACTUALIZAR','ACTUALIZAR en usuarios','2026-01-03 21:24:33','::1'),(38,1,'ACTUALIZAR','ACTUALIZAR en usuarios','2026-01-03 21:25:04','::1'),(39,1,'ELIMINAR','ELIMINAR en usuarios','2026-01-03 21:25:19','::1'),(40,1,'ACTUALIZAR','ACTUALIZAR en usuarios','2026-01-03 21:29:21','::1'),(41,1,'ELIMINAR','ELIMINAR en usuarios','2026-01-03 21:29:35','::1'),(42,1,'CREAR','CREAR en adm_roles','2026-01-03 21:36:51','::1'),(43,1,'ACTUALIZAR','ACTUALIZAR en roles','2026-01-03 21:37:17','::1'),(44,1,'ELIMINAR','ELIMINAR en roles','2026-01-03 21:37:37','::1'),(45,1,'ASIGNAR_PERMISOS','ASIGNAR_PERMISOS en roles','2026-01-03 21:38:17','::1'),(46,1,'CREAR','CREAR en menus','2026-01-03 22:25:06','::1'),(47,1,'ACTUALIZAR','ACTUALIZAR en menus','2026-01-03 22:26:51','::1'),(48,1,'ELIMINAR','ELIMINAR en menus','2026-01-03 22:27:02','::1'),(49,1,'ASIGNAR_PERMISOS','ASIGNAR_PERMISOS en menus','2026-01-03 22:27:27','::1'),(50,1,'CREAR','CREAR en estados','2026-01-03 22:28:59','::1'),(51,1,'ACTUALIZAR','ACTUALIZAR en estados','2026-01-03 22:29:22','::1'),(52,1,'ELIMINAR','ELIMINAR en estados','2026-01-03 22:29:44','::1'),(53,1,'ACTUALIZAR','ACTUALIZAR en estados','2026-01-03 22:30:15','::1'),(54,1,'ELIMINAR','ELIMINAR en estados','2026-01-03 22:30:24','::1'),(55,1,'CREAR','CREAR en tipos_usuario','2026-01-03 22:32:17','::1'),(56,1,'ACTUALIZAR','ACTUALIZAR en tipos_usuario','2026-01-03 22:32:51','::1'),(57,1,'ELIMINAR','ELIMINAR en tipos_usuario','2026-01-03 22:33:19','::1'),(58,1,'CREAR','CREAR en jerarquias','2026-01-03 22:34:45','::1'),(59,1,'ACTUALIZAR','ACTUALIZAR en jerarquias','2026-01-03 22:35:33','::1'),(60,1,'ELIMINAR','ELIMINAR en jerarquias','2026-01-03 22:35:43','::1'),(61,1,'CREAR','CREAR en sitios','2026-01-03 22:39:28','::1'),(62,1,'ACTUALIZAR','ACTUALIZAR en sitios','2026-01-03 22:39:44','::1'),(63,1,'ELIMINAR','ELIMINAR en sitios','2026-01-03 22:40:03','::1'),(64,1,'CREAR','CREAR en aplicaciones_sitio','2026-01-03 22:41:37','::1'),(65,1,'ACTUALIZAR','ACTUALIZAR en aplicaciones_sitio','2026-01-03 22:42:11','::1'),(66,1,'ACTUALIZAR','ACTUALIZAR en aplicaciones_sitio','2026-01-03 22:42:19','::1'),(67,1,'ELIMINAR','ELIMINAR en aplicaciones_sitio','2026-01-03 22:42:33','::1'),(69,1,'ELIMINAR','ELIMINAR en usuarios','2026-01-03 22:49:39','::ffff:127.0.0.1'),(70,1,'ACTUALIZAR','ACTUALIZAR en usuarios','2026-01-03 23:31:17','::ffff:127.0.0.1'),(71,1,'ACTUALIZAR','ACTUALIZAR en usuarios','2026-01-03 23:31:36','::ffff:127.0.0.1'),(72,1,'ACTUALIZAR','ACTUALIZAR en usuarios','2026-01-03 23:36:12','::ffff:127.0.0.1');
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
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre de la jerarquía',
  `descripcion` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_jerarquia_padre` int DEFAULT NULL COMMENT 'Jerarquía padre (si aplica)',
  `id_estado` int DEFAULT '1' COMMENT 'Estado de la jerarquía',
  `activo` int DEFAULT '1',
  PRIMARY KEY (`id_jerarquia`),
  KEY `id_jerarquia_padre` (`id_jerarquia_padre`),
  KEY `fk_jerarquia_estado` (`id_estado`),
  CONSTRAINT `adm_jerarquias_ibfk_1` FOREIGN KEY (`id_jerarquia_padre`) REFERENCES `adm_jerarquias` (`id_jerarquia`),
  CONSTRAINT `fk_jerarquia_estado` FOREIGN KEY (`id_estado`) REFERENCES `adm_estados` (`id_estado`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Jerarquías organizacionales';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_jerarquias`
--

LOCK TABLES `adm_jerarquias` WRITE;
/*!40000 ALTER TABLE `adm_jerarquias` DISABLE KEYS */;
INSERT INTO `adm_jerarquias` VALUES (1,'Administrador','Jerarquía con todos los privilegios',NULL,1,1),(2,'Supervisor','Jerarquía con permisos de supervisión',1,1,1),(3,'Operador','Jerarquía para usuarios operativos',2,1,1),(4,'Invitado','Jerarquía con acceso limitado',NULL,1,1),(5,'Gestor Viviendas','Gestión de viviendas, asignaciones y mantención',2,1,1),(6,'Finanzas','Gestión de pagos, servicios y facturación',2,1,1),(7,'Beneficiario','Acceso a información personal, contratos y mensajería',2,1,1),(8,'Auditor','Consulta y revisión de bitácora y auditoría',2,1,1),(9,'Soporte','Gestión técnica y soporte de usuarios',2,1,1);
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
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre del menú',
  `url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'URL del menú',
  `id_menu_padre` int DEFAULT NULL COMMENT 'Menú padre (si aplica)',
  `orden` int DEFAULT '0' COMMENT 'Orden de aparición',
  `icono` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ícono del menú',
  `id_estado` int DEFAULT '1' COMMENT 'Estado del menú',
  `visible` tinyint(1) NOT NULL DEFAULT '1',
  `nivel` int NOT NULL DEFAULT '0',
  `id_aplicacion` int DEFAULT NULL,
  PRIMARY KEY (`id_menu`),
  KEY `id_menu_padre` (`id_menu_padre`),
  KEY `fk_menu_estado` (`id_estado`),
  KEY `fk_menu_aplicacion_idx` (`id_aplicacion`),
  CONSTRAINT `adm_menus_ibfk_1` FOREIGN KEY (`id_menu_padre`) REFERENCES `adm_menus` (`id_menu`),
  CONSTRAINT `fk_menu_aplicacion` FOREIGN KEY (`id_aplicacion`) REFERENCES `adm_aplicaciones_sitio` (`id_aplicacion`),
  CONSTRAINT `fk_menu_estado` FOREIGN KEY (`id_estado`) REFERENCES `adm_estados` (`id_estado`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Menús del sistema';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_menus`
--

LOCK TABLES `adm_menus` WRITE;
/*!40000 ALTER TABLE `adm_menus` DISABLE KEYS */;
INSERT INTO `adm_menus` VALUES (1,'Panel de Control','dashboard',NULL,1,'dashboard',1,1,0,NULL),(2,'Dashboard','dashboard',1,1,'dashboard',1,0,0,NULL),(3,'Usuarios','usuarios',1,2,'group',1,1,0,NULL),(4,'Roles','roles',1,3,'shield',1,1,0,NULL),(5,'Permisos','permisos',1,4,'key',1,1,0,NULL),(6,'Menús','menus',1,5,'menu',1,1,0,NULL),(7,'Configuración','configuracion',1,98,'settings',1,1,0,NULL),(8,'Mi Perfil','perfil',1,99,'person',1,1,0,NULL),(9,'Crear Usuario','usuarios/crear',3,1,'person_add',1,0,0,NULL),(10,'Listar Usuarios','usuarios',3,2,'list',1,0,0,NULL),(13,'Crear Rol','roles/crear',4,1,'key',1,0,0,NULL),(14,'Listar Roles','roles',4,2,'list',1,0,0,NULL),(15,'Crear Permiso','permisos/crear',5,1,'key',1,0,0,NULL),(16,'Listar Permisos','permisos',5,2,'list',1,0,0,NULL),(17,'Crear Menú','menus/crear',6,1,'menu',1,0,0,NULL),(18,'Listar Menús','menus',6,2,'list',1,0,0,NULL),(19,'Tipos de Usuario','tipos-usuarios',1,6,'group',1,1,0,NULL),(20,'Jerarquías','jerarquias',1,7,'account_tree',1,1,0,NULL),(21,'Estados','estados',1,8,'bookmark',1,1,0,NULL),(22,'Búsquedas','busquedas/general',1,9,'search',1,0,0,NULL),(23,'Uploads Usuarios','uploads/usuarios',3,3,'cloud-upload',1,0,1,NULL),(24,'Crear Tipos de Usuario','tipos-usuarios/crear',19,1,'group',1,0,0,NULL),(25,'Listar Tipos de Usuario','tipos-usuarios',19,2,'list',1,0,0,NULL),(26,'Crear Jerarquías','jerarquias/crear',20,1,'account_tree',1,0,0,NULL),(27,'Listar Jerarquías','jerarquias',20,2,'list',1,0,0,NULL),(28,'Crear Estados','estados/crear',21,1,'bookmark',1,0,0,NULL),(29,'Listar Estados','estados',21,2,'list',1,0,0,NULL),(30,'Aplicaciones','aplicaciones-sitio',1,10,'apps',1,1,1,NULL),(31,'Auditoría','',1,12,'history',1,1,1,NULL),(32,'Historial - Accesos','/historial/accesos',31,2,'login',1,1,1,NULL),(33,'Historial - Acciones','/historial/acciones',31,3,'rule',1,1,1,NULL),(34,'Historial - Contraseñas','/historial/contrasenas',31,4,'key',1,1,1,NULL),(35,'Sitios','sitios',1,11,'public',1,1,1,NULL),(40,'Crear Aplicaciones','aplicaciones-sitio/crear',30,1,'apps',1,0,0,NULL),(41,'Listar Aplicaciones','aplicaciones-sitio',30,2,'list',1,0,0,NULL),(42,'Crear Sitios','sitios/crear',35,1,'public',1,0,0,NULL),(43,'Listar Sitios','sitios',35,2,'list',1,0,0,NULL),(44,'Auditoría','/auditoria',31,1,'history',1,1,0,NULL);
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
  `activo` int DEFAULT '1',
  PRIMARY KEY (`id_menu_permiso`),
  KEY `id_menu` (`id_menu`),
  KEY `id_permiso` (`id_permiso`),
  CONSTRAINT `adm_menus_permisos_ibfk_1` FOREIGN KEY (`id_menu`) REFERENCES `adm_menus` (`id_menu`),
  CONSTRAINT `adm_menus_permisos_ibfk_2` FOREIGN KEY (`id_permiso`) REFERENCES `adm_permisos` (`id_permiso`)
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
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre del permiso',
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Descripción del permiso',
  `id_estado` int DEFAULT '1' COMMENT 'Estado del permiso',
  `activo` int DEFAULT '1',
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
INSERT INTO `adm_permisos` VALUES (1,'GESTION_USUARIOS','Permiso para gestionar usuarios',1,1),(2,'GESTION_MENUS','Permiso para gestionar menús',1,1),(4,'ROLES_VER','Permiso para ver roles',1,1),(5,'ROLES_CREAR','Permiso para crear roles',1,1),(6,'ROLES_EDITAR','Permiso para editar roles',1,1),(7,'ROLES_ELIMINAR','Permiso para eliminar roles',1,1),(8,'PERMISOS_VER','Permiso para ver permisos',1,1),(9,'PERMISOS_CREAR','Permiso para crear permisos',1,1),(10,'PERMISOS_EDITAR','Permiso para editar permisos',1,1),(11,'PERMISOS_ELIMINAR','Permiso para eliminar permisos',1,1),(12,'MENUS_VER','Permiso para ver menus',1,1),(13,'MENUS_CREAR','Permiso para crear menú',1,1),(14,'MENUS_EDITAR','Permiso para editar menú',1,1),(15,'MENUS_ELIMINAR','Permiso para eliminar menú',1,1),(16,'VER_REPORTES','Permiso para ver reportes',1,1),(21,'ESTADOS_VER','Permiso para ver estados',1,1),(22,'ESTADOS_CREAR','Permiso para crear estados',1,1),(23,'ESTADOS_EDITAR','Permiso para editar estados',1,1),(24,'ESTADOS_ELIMINAR','Permiso para eliminar estados',1,1),(28,'JERARQUIAS_CREAR','Permiso para crear jerarquías',1,1),(29,'JERARQUIAS_EDITAR','Permiso para editar jerarquías',1,1),(30,'JERARQUIAS_ELIMINAR','Permiso para eliminar jerarquías',1,1),(31,'JERARQUIAS_VER','Permiso para ver jerarquías',1,1),(32,'USUARIOS_VER','Permiso para ver usuarios',1,1),(33,'USUARIOS_CREAR','Permiso para crear usuarios',1,1),(34,'USUARIOS_EDITAR','Permiso para editar usuarios',1,1),(35,'USUARIOS_ELIMINAR','Permiso para eliminar usuarios',1,1),(36,'TIPOS_USUARIO_VER','Permiso para ver tipos de usuario',1,1),(37,'TIPOS_USUARIO_CREAR','Permiso para crear tipos de usuario',1,1),(38,'BUSQUEDAS_VER','Permiso para ver búsquedas generales',1,1),(39,'UPLOADS_USUARIOS_VER','Permiso para ver uploads de usuarios',1,1),(40,'VER_APLICACIONES_SITIO','Ver aplicaciones del sitio',1,1),(41,'VER_AUDITORIA','Ver registro de auditoría',1,1),(42,'VER_HISTORIAL_ACCESOS','Ver historial de accesos',1,1),(43,'VER_HISTORIAL_ACCIONES','Ver historial de acciones',1,1),(44,'VER_HISTORIAL_CONTRASENAS','Ver historial de cambios de contraseñas',1,1),(45,'VER_SITIOS','Ver sitios registrados',1,1);
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
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre del rol',
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Descripción del rol',
  `id_estado` int DEFAULT '1' COMMENT 'Estado del rol',
  `activo` int DEFAULT '1',
  PRIMARY KEY (`id_rol`),
  KEY `fk_rol_estado` (`id_estado`),
  CONSTRAINT `fk_rol_estado` FOREIGN KEY (`id_estado`) REFERENCES `adm_estados` (`id_estado`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Roles de usuario';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_roles`
--

LOCK TABLES `adm_roles` WRITE;
/*!40000 ALTER TABLE `adm_roles` DISABLE KEYS */;
INSERT INTO `adm_roles` VALUES (1,'ADMIN_ROLE','Rol con todos los permisos',1,1),(2,'USER_ROLE','Rol básico de usuario',1,1);
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
  `activo` int DEFAULT '1',
  PRIMARY KEY (`id_rol_permiso`),
  KEY `id_rol` (`id_rol`),
  KEY `id_permiso` (`id_permiso`),
  CONSTRAINT `adm_roles_permisos_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `adm_roles` (`id_rol`),
  CONSTRAINT `adm_roles_permisos_ibfk_2` FOREIGN KEY (`id_permiso`) REFERENCES `adm_permisos` (`id_permiso`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Relación entre roles y permisos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_roles_permisos`
--

LOCK TABLES `adm_roles_permisos` WRITE;
/*!40000 ALTER TABLE `adm_roles_permisos` DISABLE KEYS */;
INSERT INTO `adm_roles_permisos` VALUES (1,1,32,0),(2,1,33,0),(3,1,34,0),(4,1,35,0),(8,1,4,0),(9,1,5,0),(10,1,6,0),(11,1,7,0),(15,1,8,0),(16,1,9,0),(17,1,10,0),(18,1,11,0),(22,1,12,0),(23,1,13,0),(24,1,14,0),(25,1,15,0),(29,1,36,0),(30,1,37,0),(32,1,28,0),(33,1,31,0),(35,1,21,0),(36,1,23,0),(38,1,38,0),(39,1,39,0),(40,1,1,1),(41,1,2,1);
/*!40000 ALTER TABLE `adm_roles_permisos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adm_sitios`
--

DROP TABLE IF EXISTS `adm_sitios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adm_sitios` (
  `id_sitio` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_sitio`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_sitios`
--

LOCK TABLES `adm_sitios` WRITE;
/*!40000 ALTER TABLE `adm_sitios` DISABLE KEYS */;
INSERT INTO `adm_sitios` VALUES (1,'Admin Sitio','admin-sitio','Plataforma de administración principal (Admin Sitio)',1,'2025-12-29 12:47:45',NULL),(2,'Viviendas Fiscales','vvff-sitio','Plataforma de Viviendas Fiscales',1,'2026-01-03 21:20:51',NULL),(3,'Admin Sitio3','admin-sitio2','Plataforma de administración principal (Admin Sitio)',0,'2026-01-04 01:39:28','2026-01-04 01:40:03');
/*!40000 ALTER TABLE `adm_sitios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adm_temas`
--

DROP TABLE IF EXISTS `adm_temas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adm_temas` (
  `id_tema` int NOT NULL,
  `id_usuario` int DEFAULT NULL,
  `clave` varchar(100) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `tipo` enum('builtin','custom') DEFAULT 'custom',
  `css_vars` json DEFAULT NULL,
  `preview` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `publico` tinyint(1) DEFAULT '1',
  `creado_por` int DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_por` int DEFAULT NULL,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_tema`),
  UNIQUE KEY `uq_clave` (`clave`),
  KEY `idx_id_usuario` (`id_usuario`),
  CONSTRAINT `adm_temas_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `adm_usuarios` (`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_temas`
--

LOCK TABLES `adm_temas` WRITE;
/*!40000 ALTER TABLE `adm_temas` DISABLE KEYS */;
INSERT INTO `adm_temas` VALUES (1,NULL,'classic','Classic','Tema classic','builtin','{\"--shadow\": \"0 2px 12px rgba(191, 167, 111, 0.12)\", \"--bg-card\": \"#fffbe6\", \"--bg-logo\": \"var(--color-accent)\", \"--bg-main\": \"#f8f8f8\", \"--space-1\": \"0.25rem\", \"--space-2\": \"0.5rem\", \"--space-3\": \"0.75rem\", \"--space-4\": \"1rem\", \"--space-5\": \"1.25rem\", \"--space-6\": \"1.5rem\", \"--color-bg\": \"var(--bg-main, #fff)\", \"--shadow-1\": \"var(--shadow, 0 2px 8px rgba(0, 0, 0, 0.06))\", \"--bg-active\": \"var(--bg-sidebar-active, var(--color-accent))\", \"--bg-images\": \"var(--bg-card)\", \"--color-btn\": \"var(--color-primary)\", \"--radius-lg\": \"0.5rem\", \"--radius-md\": \"var(--border-radius, 0.375rem)\", \"--radius-sm\": \"0.25rem\", \"--select-bg\": \"var(--color-elev-2)\", \"--bg-overlay\": \"rgba(10, 10, 10, 0.85)\", \"--bg-sidebar\": \"#bfa76f\", \"--color-info\": \"#90caf9\", \"--color-text\": \"#2d2d2d\", \"--focus-ring\": \"var(--color-accent)\", \"--bg-gradient\": \"linear-gradient(180deg, #ffffff, #f5f3ea 60%)\", \"--color-accent\": \"#ffd700\", \"--color-border\": \"rgba(0, 0, 0, 0.08)\", \"--color-danger\": \"#ef5350\", \"--color-elev-1\": \"var(--bg-card, var(--color-bg))\", \"--color-elev-2\": \"rgba(255, 255, 255, 0.6)\", \"--border-radius\": \"12px\", \"--breadcrumb-bg\": \"#232946\", \"--color-primary\": \"#bfa76f\", \"--color-success\": \"#4caf50\", \"--breadcrumb-text\": \"#ffd700\", \"--color-header-bg\": \"#bfa76f\", \"--color-secondary\": \"#8c7b4f\", \"--color-text-muted\": \"rgba(0, 0, 0, 0.6)\", \"--bg-sidebar-active\": \"#8c7b4f\", \"--breadcrumb-active\": \"#fff\", \"--color-header-text\": \"var(--color-primary)\", \"--color-text-inverse\": \"#000000\", \"--select-disabled-bg\": \"rgba(0, 0, 0, 0.04)\", \"--breadcrumb-separator\": \"var(--color-primary)\"}','/assets/img/themes/classic.png',1,1,1,'2025-12-30 14:30:26',NULL,'2025-12-30 14:30:26'),(2,NULL,'dark','Dark','Tema dark','builtin','{\"--shadow\": \"0 2px 12px rgba(0, 0, 0, 0.18)\", \"--bg-card\": \"#23272f\", \"--bg-logo\": \"var(--color-accent)\", \"--bg-main\": \"#181a1b\", \"--space-1\": \"0.25rem\", \"--space-2\": \"0.5rem\", \"--space-3\": \"0.75rem\", \"--space-4\": \"1rem\", \"--space-5\": \"1.25rem\", \"--space-6\": \"1.5rem\", \"--color-bg\": \"var(--bg-main, #111)\", \"--shadow-1\": \"var(--shadow, 0 2px 8px rgba(0, 0, 0, 0.12))\", \"--bg-active\": \"var(--bg-sidebar-active, var(--color-accent))\", \"--bg-images\": \"var(--bg-card)\", \"--color-btn\": \"var(--color-primary)\", \"--radius-lg\": \"0.5rem\", \"--radius-md\": \"var(--border-radius, 0.375rem)\", \"--radius-sm\": \"0.25rem\", \"--select-bg\": \"#232946\", \"--bg-overlay\": \"rgba(20, 20, 20, 0.9)\", \"--bg-sidebar\": \"#23272f\", \"--color-info\": \"#90caf9\", \"--color-text\": \"#ffffff\", \"--focus-ring\": \"var(--color-accent)\", \"--bg-gradient\": \"linear-gradient(180deg, #0b0b0b, #090909 60%)\", \"--color-accent\": \"#ffa000\", \"--color-border\": \"rgba(0, 0, 0, 0.08)\", \"--color-danger\": \"#ef5350\", \"--color-elev-1\": \"var(--bg-card, var(--color-bg))\", \"--color-elev-2\": \"rgba(0, 0, 0, 0.6)\", \"--border-radius\": \"12px\", \"--breadcrumb-bg\": \"#232946\", \"--color-primary\": \"#1976d2\", \"--color-success\": \"#4caf50\", \"--breadcrumb-text\": \"#ffd700\", \"--color-header-bg\": \"#23272f\", \"--color-secondary\": \"#4caf50\", \"--table-row-hover\": \"rgba(255, 255, 255, 0.02)\", \"--color-text-muted\": \"rgba(255, 255, 255, 0.6)\", \"--bg-sidebar-active\": \"#181a1b\", \"--breadcrumb-active\": \"#fff\", \"--color-header-text\": \"var(--color-primary)\", \"--color-text-inverse\": \"#ffffff\", \"--select-disabled-bg\": \"#181a1b\", \"--breadcrumb-separator\": \"var(--color-primary)\"}','/assets/img/themes/dark.png',1,1,1,'2025-12-30 14:30:26',NULL,'2025-12-30 14:30:26'),(3,NULL,'elegant','Elegant','Tema elegant','builtin','{\"--shadow\": \"0 2px 12px rgba(60, 60, 60, 0.08)\", \"--bg-card\": \"#fff\", \"--bg-logo\": \"var(--color-accent)\", \"--bg-main\": \"#f4f4f9\", \"--space-1\": \"0.25rem\", \"--space-2\": \"0.5rem\", \"--space-3\": \"0.75rem\", \"--space-4\": \"1rem\", \"--space-5\": \"1.25rem\", \"--space-6\": \"1.5rem\", \"--color-bg\": \"var(--bg-main, #fff)\", \"--shadow-1\": \"var(--shadow, 0 2px 8px rgba(0, 0, 0, 0.06))\", \"--bg-active\": \"var(--bg-sidebar-active, var(--color-accent))\", \"--bg-images\": \"var(--bg-card)\", \"--color-btn\": \"var(--color-primary)\", \"--radius-lg\": \"0.5rem\", \"--radius-md\": \"var(--border-radius, 0.375rem)\", \"--radius-sm\": \"0.25rem\", \"--select-bg\": \"var(--color-elev-2)\", \"--bg-overlay\": \"rgba(20, 20, 20, 0.9)\", \"--bg-sidebar\": \"#22223b\", \"--color-info\": \"#90caf9\", \"--color-text\": \"#22223b\", \"--focus-ring\": \"var(--color-accent)\", \"--bg-gradient\": \"linear-gradient(180deg, #ffffff, #f0eef6 60%)\", \"--color-accent\": \"#9a8c98\", \"--color-border\": \"rgba(0, 0, 0, 0.08)\", \"--color-danger\": \"#ef5350\", \"--color-elev-1\": \"var(--bg-card, var(--color-bg))\", \"--color-elev-2\": \"rgba(255, 255, 255, 0.6)\", \"--border-radius\": \"12px\", \"--breadcrumb-bg\": \"#232946\", \"--color-primary\": \"#c9ada7\", \"--color-success\": \"#4caf50\", \"--breadcrumb-text\": \"#ffd700\", \"--color-header-bg\": \"#22223b\", \"--color-secondary\": \"#22223b\", \"--color-text-muted\": \"rgba(0, 0, 0, 0.6)\", \"--bg-sidebar-active\": \"#c9ada7\", \"--breadcrumb-active\": \"#fff\", \"--color-header-text\": \"var(--color-primary)\", \"--color-text-inverse\": \"#000000\", \"--select-disabled-bg\": \"rgba(0, 0, 0, 0.04)\", \"--breadcrumb-separator\": \"var(--color-primary)\"}','/assets/img/themes/elegant.png',1,1,1,'2025-12-30 14:30:26',NULL,'2025-12-30 14:30:26'),(4,NULL,'fach-dark','Fach-dark','Tema fach-dark','builtin','{\"--shadow\": \"0 2px 12px rgba(60, 60, 60, 0.12)\", \"--bg-card\": \"#232946\", \"--bg-logo\": \"var(--color-accent)\", \"--bg-main\": \"#1a2236\", \"--space-1\": \"0.25rem\", \"--space-2\": \"0.5rem\", \"--space-3\": \"0.75rem\", \"--space-4\": \"1rem\", \"--space-5\": \"1.25rem\", \"--space-6\": \"1.5rem\", \"--color-bg\": \"var(--bg-main, #111)\", \"--shadow-1\": \"var(--shadow, 0 2px 8px rgba(0, 0, 0, 0.12))\", \"--bg-active\": \"var(--bg-sidebar-active, var(--color-accent))\", \"--bg-images\": \"var(--bg-card)\", \"--color-btn\": \"var(--color-primary)\", \"--radius-lg\": \"0.5rem\", \"--radius-md\": \"var(--border-radius, 0.375rem)\", \"--radius-sm\": \"0.25rem\", \"--select-bg\": \"#121212\", \"--bg-overlay\": \"rgba(20, 20, 20, 0.9)\", \"--bg-sidebar\": \"#003a8f\", \"--color-info\": \"#90caf9\", \"--color-text\": \"#ffffff\", \"--focus-ring\": \"var(--color-accent)\", \"--bg-gradient\": \"linear-gradient(180deg, #0f151d, #0c1117 60%)\", \"--color-accent\": \"#ffd700\", \"--color-border\": \"rgba(0, 0, 0, 0.08)\", \"--color-danger\": \"#ef5350\", \"--color-elev-1\": \"var(--bg-card, var(--color-bg))\", \"--color-elev-2\": \"rgba(0, 0, 0, 0.6)\", \"--sidebar-text\": \"var(--color-header-text, #ffd700)\", \"--border-radius\": \"10px\", \"--breadcrumb-bg\": \"#232946\", \"--color-primary\": \"#003a8f\", \"--color-success\": \"#4caf50\", \"--breadcrumb-text\": \"#ffd700\", \"--color-header-bg\": \"#003a8f\", \"--color-secondary\": \"#e5e5e5\", \"--color-text-muted\": \"rgba(255, 255, 255, 0.6)\", \"--bg-sidebar-active\": \"#00296b\", \"--breadcrumb-active\": \"#fff\", \"--color-header-text\": \"var(--color-accent)\", \"--color-text-inverse\": \"#fff\", \"--select-disabled-bg\": \"rgba(255, 255, 255, 0.03)\", \"--breadcrumb-separator\": \"var(--color-primary)\"}','/assets/img/themes/fach-dark.png',1,1,1,'2025-12-30 14:30:26',NULL,'2025-12-30 14:30:26'),(5,NULL,'fach-light','Fach-light','Tema fach-light','builtin','{\"--shadow\": \"0 2px 12px rgba(60, 60, 60, 0.08)\", \"--bg-card\": \"#ffffff\", \"--bg-logo\": \"var(--color-accent)\", \"--bg-main\": \"#f5f8fa\", \"--space-1\": \"0.25rem\", \"--space-2\": \"0.5rem\", \"--space-3\": \"0.75rem\", \"--space-4\": \"1rem\", \"--space-5\": \"1.25rem\", \"--space-6\": \"1.5rem\", \"--color-bg\": \"var(--bg-main, #fff)\", \"--shadow-1\": \"var(--shadow, 0 2px 8px rgba(0, 0, 0, 0.06))\", \"--bg-active\": \"var(--bg-sidebar-active, var(--color-accent))\", \"--bg-images\": \"var(--bg-card)\", \"--color-btn\": \"var(--color-primary)\", \"--radius-lg\": \"0.5rem\", \"--radius-md\": \"var(--border-radius, 0.375rem)\", \"--radius-sm\": \"0.25rem\", \"--select-bg\": \"var(--color-elev-2)\", \"--bg-overlay\": \"rgba(20, 20, 20, 0.9)\", \"--bg-sidebar\": \"#003a8f\", \"--color-info\": \"#1976d2\", \"--color-text\": \"#0f1724\", \"--focus-ring\": \"var(--color-accent)\", \"--bg-gradient\": \"linear-gradient(180deg, #ffffff, #eef4fb 60%)\", \"--color-accent\": \"#ffd700\", \"--color-border\": \"rgba(0, 0, 0, 0.08)\", \"--color-danger\": \"#b3261e\", \"--color-elev-1\": \"var(--bg-card, var(--color-bg))\", \"--color-elev-2\": \"rgba(255, 255, 255, 0.6)\", \"--sidebar-text\": \"var(--color-header-text, #ffd700)\", \"--border-radius\": \"10px\", \"--breadcrumb-bg\": \"#003a8f\", \"--color-primary\": \"#003a8f\", \"--color-success\": \"#2e7d32\", \"--breadcrumb-text\": \"#ffd700\", \"--color-header-bg\": \"#003a8f\", \"--color-secondary\": \"#e5e5e5\", \"--color-text-muted\": \"rgba(0, 0, 0, 0.6)\", \"--bg-sidebar-active\": \"#00296b\", \"--breadcrumb-active\": \"#fff\", \"--color-header-text\": \"var(--color-accent)\", \"--color-text-inverse\": \"#000000\", \"--select-disabled-bg\": \"rgba(0, 0, 0, 0.04)\", \"--breadcrumb-separator\": \"var(--color-primary)\"}','/assets/img/themes/fach-light.png',1,1,1,'2025-12-30 14:30:26',NULL,'2025-12-30 14:30:26'),(6,NULL,'flat','Flat','Tema flat','builtin','{\"--shadow\": \"0 2px 8px rgba(60, 60, 60, 0.04)\", \"--bg-card\": \"#fff\", \"--bg-logo\": \"var(--color-accent)\", \"--bg-main\": \"#f7f7f7\", \"--space-1\": \"0.25rem\", \"--space-2\": \"0.5rem\", \"--space-3\": \"0.75rem\", \"--space-4\": \"1rem\", \"--space-5\": \"1.25rem\", \"--space-6\": \"1.5rem\", \"--color-bg\": \"var(--bg-main, #fff)\", \"--shadow-1\": \"var(--shadow, 0 2px 8px rgba(0, 0, 0, 0.06))\", \"--bg-active\": \"var(--bg-sidebar-active, var(--color-accent))\", \"--bg-images\": \"var(--bg-card)\", \"--color-btn\": \"var(--color-primary)\", \"--radius-lg\": \"0.5rem\", \"--radius-md\": \"var(--border-radius, 0.375rem)\", \"--radius-sm\": \"0.25rem\", \"--select-bg\": \"var(--color-elev-2)\", \"--bg-overlay\": \"rgba(20, 20, 20, 0.9)\", \"--bg-sidebar\": \"#009688\", \"--color-info\": \"#90caf9\", \"--color-text\": \"#222\", \"--focus-ring\": \"var(--color-accent)\", \"--bg-gradient\": \"linear-gradient(180deg, #ffffff, #f3f3f3 60%)\", \"--color-accent\": \"#ffd600\", \"--color-border\": \"rgba(0, 0, 0, 0.08)\", \"--color-danger\": \"#ef5350\", \"--color-elev-1\": \"var(--bg-card, var(--color-bg))\", \"--color-elev-2\": \"rgba(255, 255, 255, 0.6)\", \"--border-radius\": \"8px\", \"--breadcrumb-bg\": \"#232946\", \"--color-primary\": \"#009688\", \"--color-success\": \"#4caf50\", \"--breadcrumb-text\": \"#ffd700\", \"--color-header-bg\": \"#009688\", \"--color-secondary\": \"#607d8b\", \"--color-text-muted\": \"rgba(0, 0, 0, 0.6)\", \"--bg-sidebar-active\": \"#607d8b\", \"--breadcrumb-active\": \"#fff\", \"--color-header-text\": \"var(--color-primary)\", \"--color-text-inverse\": \"#000000\", \"--select-disabled-bg\": \"rgba(0, 0, 0, 0.04)\", \"--breadcrumb-separator\": \"var(--color-primary)\"}','/assets/img/themes/flat.png',1,1,1,'2025-12-30 14:30:26',NULL,'2025-12-30 14:30:26'),(7,NULL,'futuristic','Futuristic','Tema futuristic','builtin','{\"--shadow\": \"0 2px 16px rgba(0, 198, 255, 0.15)\", \"--bg-card\": \"#203a43\", \"--bg-logo\": \"var(--color-accent)\", \"--bg-main\": \"#0f2027\", \"--space-1\": \"0.25rem\", \"--space-2\": \"0.5rem\", \"--space-3\": \"0.75rem\", \"--space-4\": \"1rem\", \"--space-5\": \"1.25rem\", \"--space-6\": \"1.5rem\", \"--color-bg\": \"var(--bg-main, #000)\", \"--shadow-1\": \"var(--shadow, 0 2px 8px rgba(0, 0, 0, 0.12))\", \"--bg-active\": \"var(--bg-sidebar-active, var(--color-accent))\", \"--bg-images\": \"var(--bg-card)\", \"--color-btn\": \"var(--color-primary)\", \"--radius-lg\": \"0.5rem\", \"--radius-md\": \"var(--border-radius, 0.375rem)\", \"--radius-sm\": \"0.25rem\", \"--select-bg\": \"#121212\", \"--bg-overlay\": \"rgba(20, 20, 20, 0.9)\", \"--bg-sidebar\": \"#2c5364\", \"--color-info\": \"#90caf9\", \"--color-text\": \"#fff\", \"--focus-ring\": \"var(--color-accent)\", \"--bg-gradient\": \"linear-gradient(180deg, #081014, #0d1b22 60%)\", \"--color-accent\": \"#ffe600\", \"--color-border\": \"rgba(0, 0, 0, 0.08)\", \"--color-danger\": \"#ef5350\", \"--color-elev-1\": \"var(--bg-card, var(--color-bg))\", \"--color-elev-2\": \"rgba(255, 255, 255, 0.06)\", \"--border-radius\": \"12px\", \"--breadcrumb-bg\": \"#232946\", \"--color-primary\": \"#00c6ff\", \"--color-success\": \"#4caf50\", \"--breadcrumb-text\": \"#ffd700\", \"--color-header-bg\": \"#203a43\", \"--color-secondary\": \"#0072ff\", \"--color-text-muted\": \"rgba(255, 255, 255, 0.6)\", \"--bg-sidebar-active\": \"#00c6ff\", \"--breadcrumb-active\": \"#fff\", \"--color-header-text\": \"var(--color-primary)\", \"--color-text-inverse\": \"#ffffff\", \"--select-disabled-bg\": \"rgba(255, 255, 255, 0.03)\", \"--breadcrumb-separator\": \"var(--color-primary)\"}','/assets/img/themes/futuristic.png',1,1,1,'2025-12-30 14:30:26',NULL,'2025-12-30 14:30:26'),(8,NULL,'glassmorphism','Glassmorphism','Tema glassmorphism','builtin','{\"--shadow\": \"0 2px 12px rgba(60, 60, 60, 0.08)\", \"--bg-card\": \"rgba(255, 255, 255, 0.8)\", \"--bg-logo\": \"var(--color-accent)\", \"--bg-main\": \"rgba(255, 255, 255, 0.6)\", \"--space-1\": \"0.25rem\", \"--space-2\": \"0.5rem\", \"--space-3\": \"0.75rem\", \"--space-4\": \"1rem\", \"--space-5\": \"1.25rem\", \"--space-6\": \"1.5rem\", \"--color-bg\": \"var(--bg-main, #f6f8fa)\", \"--shadow-1\": \"var(--shadow, 0 2px 8px rgba(0, 0, 0, 0.06))\", \"--bg-active\": \"var(--bg-sidebar-active, var(--color-accent))\", \"--bg-images\": \"var(--bg-card)\", \"--color-btn\": \"var(--color-primary)\", \"--radius-lg\": \"0.5rem\", \"--radius-md\": \"var(--border-radius, 0.375rem)\", \"--radius-sm\": \"0.25rem\", \"--select-bg\": \"rgba(255, 255, 255, 0.12)\", \"--bg-overlay\": \"rgba(20, 20, 20, 0.9)\", \"--bg-sidebar\": \"rgba(35, 41, 70, 0.7)\", \"--color-info\": \"#90caf9\", \"--color-text\": \"#232946\", \"--focus-ring\": \"var(--color-accent)\", \"--glass-blur\": \"blur(8px)\", \"--bg-gradient\": \"linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(245, 250, 255, 0.7) 60%)\", \"--color-accent\": \"#f9d923\", \"--color-border\": \"rgba(0, 0, 0, 0.08)\", \"--color-danger\": \"#ef5350\", \"--color-elev-1\": \"var(--bg-card, var(--color-bg))\", \"--color-elev-2\": \"rgba(255, 255, 255, 0.6)\", \"--border-radius\": \"12px\", \"--breadcrumb-bg\": \"#232946\", \"--color-primary\": \"#1976d2\", \"--color-success\": \"#4caf50\", \"--color-warning\": \"#ffa000\", \"--breadcrumb-text\": \"#ffd700\", \"--color-header-bg\": \"rgba(35, 41, 70, 0.7)\", \"--color-secondary\": \"#4caf50\", \"--color-text-muted\": \"rgba(0, 0, 0, 0.6)\", \"--bg-sidebar-active\": \"rgba(26, 31, 43, 0.8)\", \"--breadcrumb-active\": \"#fff\", \"--color-header-text\": \"var(--color-primary)\", \"--color-text-inverse\": \"#000000\", \"--select-disabled-bg\": \"rgba(255, 255, 255, 0.06)\", \"--breadcrumb-separator\": \"var(--color-primary)\"}','/assets/img/themes/glassmorphism.png',1,1,1,'2025-12-30 14:30:26',NULL,'2025-12-30 14:30:26'),(9,NULL,'light','Light','Tema light','builtin','{\"--shadow\": \"0 2px 8px rgba(60, 60, 60, 0.04)\", \"--bg-card\": \"#fff\", \"--bg-logo\": \"var(--color-accent)\", \"--bg-main\": \"#f3f6fa\", \"--space-1\": \"0.25rem\", \"--space-2\": \"0.5rem\", \"--space-3\": \"0.75rem\", \"--space-4\": \"1rem\", \"--space-5\": \"1.25rem\", \"--space-6\": \"1.5rem\", \"--color-bg\": \"var(--bg-main, #fff)\", \"--shadow-1\": \"var(--shadow, 0 2px 8px rgba(0, 0, 0, 0.06))\", \"--bg-active\": \"var(--bg-sidebar-active, var(--color-accent))\", \"--bg-images\": \"var(--bg-card)\", \"--color-btn\": \"var(--color-primary)\", \"--radius-lg\": \"0.5rem\", \"--radius-md\": \"var(--border-radius, 0.375rem)\", \"--radius-sm\": \"0.25rem\", \"--select-bg\": \"#ffffff\", \"--bg-overlay\": \"rgba(20, 20, 20, 0.9)\", \"--bg-sidebar\": \"#e3e8f0\", \"--color-info\": \"#1976d2\", \"--color-text\": \"#111111\", \"--focus-ring\": \"var(--color-accent)\", \"--bg-gradient\": \"linear-gradient(180deg, #ffffff, #eef4fb 60%)\", \"--color-accent\": \"#90caf9\", \"--color-border\": \"rgba(0, 0, 0, 0.08)\", \"--color-danger\": \"#b3261e\", \"--color-elev-1\": \"var(--bg-card, var(--color-bg))\", \"--color-elev-2\": \"rgba(255, 255, 255, 0.6)\", \"--border-radius\": \"8px\", \"--breadcrumb-bg\": \"#e3e8f0\", \"--color-primary\": \"#1976d2\", \"--color-success\": \"#2e7d32\", \"--color-warning\": \"#ff9800\", \"--breadcrumb-text\": \"#1976d2\", \"--color-header-bg\": \"#e3e8f0\", \"--color-secondary\": \"#4caf50\", \"--table-row-hover\": \"#fafafa\", \"--color-text-muted\": \"rgba(0, 0, 0, 0.6)\", \"--bg-sidebar-active\": \"#cfd8dc\", \"--breadcrumb-active\": \"#fff\", \"--color-header-text\": \"var(--color-primary)\", \"--color-text-inverse\": \"#000000\", \"--select-disabled-bg\": \"#e3e8f0\", \"--breadcrumb-separator\": \"var(--color-primary)\"}','/assets/img/themes/light.png',1,1,1,'2025-12-30 14:30:26',NULL,'2025-12-30 14:30:26'),(10,NULL,'material','Material','Tema material','builtin','{\"--shadow\": \"0 2px 8px rgba(60, 60, 60, 0.04)\", \"--bg-card\": \"#fff\", \"--bg-logo\": \"var(--color-accent)\", \"--bg-main\": \"#f5f5f5\", \"--space-1\": \"0.25rem\", \"--space-2\": \"0.5rem\", \"--space-3\": \"0.75rem\", \"--space-4\": \"1rem\", \"--space-5\": \"1.25rem\", \"--space-6\": \"1.5rem\", \"--color-bg\": \"var(--bg-main, #fff)\", \"--shadow-1\": \"var(--shadow, 0 2px 8px rgba(0, 0, 0, 0.06))\", \"--bg-active\": \"var(--bg-sidebar-active, var(--color-accent))\", \"--bg-images\": \"var(--bg-card)\", \"--color-btn\": \"var(--color-primary)\", \"--radius-lg\": \"0.5rem\", \"--radius-md\": \"var(--border-radius, 0.375rem)\", \"--radius-sm\": \"0.25rem\", \"--select-bg\": \"#ffffff\", \"--bg-overlay\": \"rgba(20, 20, 20, 0.9)\", \"--bg-sidebar\": \"#1976d2\", \"--color-info\": \"#1976d2\", \"--color-text\": \"#222\", \"--focus-ring\": \"var(--color-accent)\", \"--bg-gradient\": \"linear-gradient(180deg, #ffffff, #eef5ff 60%)\", \"--color-accent\": \"#ffb300\", \"--color-border\": \"rgba(0, 0, 0, 0.08)\", \"--color-danger\": \"#d32f2f\", \"--color-elev-1\": \"var(--bg-card, var(--color-bg))\", \"--color-elev-2\": \"rgba(255, 255, 255, 0.6)\", \"--border-radius\": \"8px\", \"--breadcrumb-bg\": \"#1976d2\", \"--color-primary\": \"#1976d2\", \"--color-success\": \"#388e3c\", \"--color-warning\": \"#ffa000\", \"--breadcrumb-text\": \"#fff\", \"--color-header-bg\": \"#1976d2\", \"--color-secondary\": \"#4caf50\", \"--table-row-hover\": \"rgba(0, 0, 0, 0.02)\", \"--color-text-muted\": \"rgba(0, 0, 0, 0.6)\", \"--bg-sidebar-active\": \"#1565c0\", \"--breadcrumb-active\": \"#fff\", \"--color-header-text\": \"var(--color-primary)\", \"--color-text-inverse\": \"#000000\", \"--select-disabled-bg\": \"#f3f3f3\", \"--breadcrumb-separator\": \"var(--color-primary)\"}','/assets/img/themes/material.png',1,1,1,'2025-12-30 14:30:26',NULL,'2025-12-30 14:30:26'),(11,NULL,'minimalist','Minimalist','Tema minimalist','builtin','{\"--shadow\": \"0 2px 8px rgba(60, 60, 60, 0.04)\", \"--bg-card\": \"#fff\", \"--bg-logo\": \"var(--color-accent)\", \"--bg-main\": \"#fff\", \"--space-1\": \"0.25rem\", \"--space-2\": \"0.5rem\", \"--space-3\": \"0.75rem\", \"--space-4\": \"1rem\", \"--space-5\": \"1.25rem\", \"--space-6\": \"1.5rem\", \"--color-bg\": \"var(--bg-main, #fff)\", \"--shadow-1\": \"var(--shadow, 0 2px 8px rgba(0, 0, 0, 0.06))\", \"--bg-active\": \"var(--bg-sidebar-active, var(--color-accent))\", \"--bg-images\": \"var(--bg-card)\", \"--color-btn\": \"var(--color-primary)\", \"--radius-lg\": \"0.5rem\", \"--radius-md\": \"var(--border-radius, 0.375rem)\", \"--radius-sm\": \"0.25rem\", \"--select-bg\": \"var(--color-elev-2)\", \"--bg-overlay\": \"rgba(20, 20, 20, 0.9)\", \"--bg-sidebar\": \"#222\", \"--color-info\": \"#90caf9\", \"--color-text\": \"#222\", \"--focus-ring\": \"var(--color-accent)\", \"--bg-gradient\": \"linear-gradient(180deg, #ffffff, #f7f7f7 60%)\", \"--color-accent\": \"#e0e0e0\", \"--color-border\": \"rgba(0, 0, 0, 0.08)\", \"--color-danger\": \"#ef5350\", \"--color-elev-1\": \"var(--bg-card, var(--color-bg))\", \"--color-elev-2\": \"rgba(255, 255, 255, 0.6)\", \"--border-radius\": \"8px\", \"--breadcrumb-bg\": \"#232946\", \"--color-primary\": \"#222\", \"--color-success\": \"#4caf50\", \"--color-warning\": \"#ffa000\", \"--breadcrumb-text\": \"#ffd700\", \"--color-header-bg\": \"#fff\", \"--color-secondary\": \"#aaa\", \"--color-text-muted\": \"rgba(0, 0, 0, 0.6)\", \"--bg-sidebar-active\": \"#333\", \"--breadcrumb-active\": \"#fff\", \"--color-header-text\": \"var(--color-primary)\", \"--color-text-inverse\": \"#000000\", \"--select-disabled-bg\": \"rgba(0, 0, 0, 0.04)\", \"--breadcrumb-separator\": \"var(--color-primary)\"}','/assets/img/themes/minimalist.png',1,1,1,'2025-12-30 14:30:26',NULL,'2025-12-30 14:30:26'),(12,NULL,'modern','Modern','Tema modern','builtin','{\"--shadow\": \"0 2px 16px rgba(0, 198, 255, 0.15)\", \"--bg-card\": \"#ffffff\", \"--bg-logo\": \"var(--color-accent)\", \"--bg-main\": \"#f6f8fa\", \"--space-1\": \"0.25rem\", \"--space-2\": \"0.5rem\", \"--space-3\": \"0.75rem\", \"--space-4\": \"1rem\", \"--space-5\": \"1.25rem\", \"--space-6\": \"1.5rem\", \"--color-bg\": \"var(--bg-main, #fff)\", \"--shadow-1\": \"var(--shadow, 0 2px 8px rgba(0, 0, 0, 0.06))\", \"--bg-active\": \"var(--bg-sidebar-active, var(--color-accent))\", \"--bg-images\": \"var(--bg-card)\", \"--color-btn\": \"var(--color-primary)\", \"--radius-lg\": \"0.5rem\", \"--radius-md\": \"var(--border-radius, 0.375rem)\", \"--radius-sm\": \"0.25rem\", \"--select-bg\": \"#232946\", \"--bg-overlay\": \"rgba(20, 20, 20, 0.9)\", \"--bg-sidebar\": \"#232946\", \"--color-info\": \"#2563eb\", \"--color-text\": \"#232946\", \"--focus-ring\": \"var(--color-accent)\", \"--bg-gradient\": \"linear-gradient(180deg, #ffffff, #f1f4f8 60%)\", \"--color-accent\": \"#f9d923\", \"--color-border\": \"rgba(0, 0, 0, 0.08)\", \"--color-danger\": \"#e53935\", \"--color-elev-1\": \"var(--bg-card, var(--color-bg))\", \"--color-elev-2\": \"rgba(255, 255, 255, 0.6)\", \"--border-radius\": \"12px\", \"--breadcrumb-bg\": \"#232946\", \"--color-primary\": \"#2563eb\", \"--color-success\": \"#43a047\", \"--color-warning\": \"#ffb300\", \"--breadcrumb-text\": \"#ffd700\", \"--color-header-bg\": \"#232946\", \"--color-secondary\": \"#eebbc3\", \"--table-row-hover\": \"rgba(0, 0, 0, 0.03)\", \"--color-text-muted\": \"rgba(0, 0, 0, 0.6)\", \"--bg-sidebar-active\": \"#1a1f2b\", \"--breadcrumb-active\": \"#fff\", \"--color-header-text\": \"var(--color-primary)\", \"--color-text-inverse\": \"#000000\", \"--select-disabled-bg\": \"#181a1b\", \"--breadcrumb-separator\": \"var(--color-primary)\"}','/assets/img/themes/modern.png',1,1,1,'2025-12-30 14:30:26',NULL,'2025-12-30 14:30:26'),(13,NULL,'neumorphism','Neumorphism','Tema neumorphism','builtin','{\"--shadow\": \"8px 8px 16px #b8c6db, -8px -8px 16px #fff\", \"--bg-card\": \"#f9f9f9\", \"--bg-logo\": \"var(--color-accent)\", \"--bg-main\": \"#e0e5ec\", \"--space-1\": \"0.25rem\", \"--space-2\": \"0.5rem\", \"--space-3\": \"0.75rem\", \"--space-4\": \"1rem\", \"--space-5\": \"1.25rem\", \"--space-6\": \"1.5rem\", \"--color-bg\": \"var(--bg-main, #f0f2f5)\", \"--shadow-1\": \"var(--shadow, 0 2px 8px rgba(0, 0, 0, 0.06))\", \"--bg-active\": \"var(--bg-sidebar-active, var(--color-accent))\", \"--bg-images\": \"var(--bg-card)\", \"--color-btn\": \"var(--color-primary)\", \"--radius-lg\": \"0.5rem\", \"--radius-md\": \"var(--border-radius, 0.375rem)\", \"--radius-sm\": \"0.25rem\", \"--select-bg\": \"var(--color-elev-2)\", \"--bg-overlay\": \"rgba(20, 20, 20, 0.9)\", \"--bg-sidebar\": \"#b8c6db\", \"--color-info\": \"#90caf9\", \"--color-text\": \"#222\", \"--focus-ring\": \"var(--color-accent)\", \"--bg-gradient\": \"linear-gradient(180deg, #f2f6fa, #e6edf4 60%)\", \"--color-accent\": \"#388e3c\", \"--color-border\": \"rgba(0, 0, 0, 0.08)\", \"--color-danger\": \"#ef5350\", \"--color-elev-1\": \"var(--bg-card, var(--color-bg))\", \"--color-elev-2\": \"rgba(255, 255, 255, 0.6)\", \"--border-radius\": \"16px\", \"--breadcrumb-bg\": \"#232946\", \"--color-primary\": \"#b8c6db\", \"--color-success\": \"#4caf50\", \"--color-warning\": \"#ffa000\", \"--breadcrumb-text\": \"#ffd700\", \"--color-header-bg\": \"#e0e5ec\", \"--color-secondary\": \"#6c7a89\", \"--color-text-muted\": \"rgba(0, 0, 0, 0.6)\", \"--bg-sidebar-active\": \"#6c7a89\", \"--breadcrumb-active\": \"#fff\", \"--color-header-text\": \"var(--color-primary)\", \"--color-text-inverse\": \"#000000\", \"--select-disabled-bg\": \"rgba(0, 0, 0, 0.04)\", \"--breadcrumb-separator\": \"var(--color-primary)\"}','/assets/img/themes/neumorphism.png',1,1,1,'2025-12-30 14:30:26',NULL,'2025-12-30 14:30:26'),(14,NULL,'retro','Retro','Tema retro','builtin','{\"--shadow\": \"0 2px 8px rgba(166, 124, 82, 0.12)\", \"--bg-card\": \"#fff8e1\", \"--bg-logo\": \"var(--color-accent)\", \"--bg-main\": \"#fbeec1\", \"--space-1\": \"0.25rem\", \"--space-2\": \"0.5rem\", \"--space-3\": \"0.75rem\", \"--space-4\": \"1rem\", \"--space-5\": \"1.25rem\", \"--space-6\": \"1.5rem\", \"--color-bg\": \"var(--bg-main, #f6f1e6)\", \"--shadow-1\": \"var(--shadow, 0 2px 8px rgba(0, 0, 0, 0.06))\", \"--bg-active\": \"var(--bg-sidebar-active, var(--color-accent))\", \"--bg-images\": \"var(--bg-card)\", \"--color-btn\": \"var(--color-primary)\", \"--radius-lg\": \"0.5rem\", \"--radius-md\": \"var(--border-radius, 0.375rem)\", \"--radius-sm\": \"0.25rem\", \"--select-bg\": \"#fff8e1\", \"--bg-overlay\": \"rgba(20, 20, 20, 0.9)\", \"--bg-sidebar\": \"#a67c52\", \"--color-info\": \"#90caf9\", \"--color-text\": \"#4e342e\", \"--focus-ring\": \"var(--color-accent)\", \"--bg-gradient\": \"linear-gradient(180deg, #fff7e6, #f5e3c4 60%)\", \"--color-accent\": \"#ff9800\", \"--color-border\": \"rgba(0, 0, 0, 0.08)\", \"--color-danger\": \"#ef5350\", \"--color-elev-1\": \"var(--bg-card, var(--color-bg))\", \"--color-elev-2\": \"rgba(255, 255, 255, 0.6)\", \"--border-radius\": \"8px\", \"--breadcrumb-bg\": \"#232946\", \"--color-primary\": \"#a67c52\", \"--color-success\": \"#4caf50\", \"--color-warning\": \"#ffa000\", \"--breadcrumb-text\": \"#ffd700\", \"--color-header-bg\": \"#a67c52\", \"--color-secondary\": \"#d7b899\", \"--table-row-hover\": \"#fff6e8\", \"--color-text-muted\": \"rgba(0, 0, 0, 0.6)\", \"--bg-sidebar-active\": \"#d7b899\", \"--breadcrumb-active\": \"#fff\", \"--color-header-text\": \"var(--color-primary)\", \"--color-text-inverse\": \"#000000\", \"--select-disabled-bg\": \"#f3ede0\", \"--breadcrumb-separator\": \"var(--color-primary)\"}','/assets/img/themes/retro.png',1,1,1,'2025-12-30 14:30:26',NULL,'2025-12-30 14:30:26');
/*!40000 ALTER TABLE `adm_temas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adm_temas_valores`
--

DROP TABLE IF EXISTS `adm_temas_valores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adm_temas_valores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_tema` int NOT NULL,
  `id_tema_var` int NOT NULL,
  `valor` text COLLATE utf8mb4_unicode_ci,
  `creado_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_tema_var` (`id_tema`,`id_tema_var`),
  KEY `idx_tema` (`id_tema`),
  KEY `idx_tema_var` (`id_tema_var`),
  CONSTRAINT `fk_valores_tema` FOREIGN KEY (`id_tema`) REFERENCES `adm_temas` (`id_tema`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_valores_var` FOREIGN KEY (`id_tema_var`) REFERENCES `adm_temas_variables` (`id_tema_var`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1025 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_temas_valores`
--

LOCK TABLES `adm_temas_valores` WRITE;
/*!40000 ALTER TABLE `adm_temas_valores` DISABLE KEYS */;
INSERT INTO `adm_temas_valores` VALUES (1,14,1,'0 2px 8px rgba(166, 124, 82, 0.12)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(2,13,1,'8px 8px 16px #b8c6db, -8px -8px 16px #fff','2026-01-02 10:13:24','2026-01-02 10:14:25'),(3,12,1,'0 2px 16px rgba(0, 198, 255, 0.15)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(4,11,1,'0 2px 8px rgba(60, 60, 60, 0.04)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(5,10,1,'0 2px 8px rgba(60, 60, 60, 0.04)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(6,9,1,'0 2px 8px rgba(60, 60, 60, 0.04)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(7,8,1,'0 2px 12px rgba(60, 60, 60, 0.08)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(8,7,1,'0 2px 16px rgba(0, 198, 255, 0.15)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(9,6,1,'0 2px 8px rgba(60, 60, 60, 0.04)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(10,5,1,'0 2px 12px rgba(60, 60, 60, 0.08)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(11,4,1,'0 2px 12px rgba(60, 60, 60, 0.12)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(12,3,1,'0 2px 12px rgba(60, 60, 60, 0.08)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(13,2,1,'0 2px 12px rgba(0, 0, 0, 0.18)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(14,1,1,'0 2px 12px rgba(191, 167, 111, 0.12)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(15,14,2,'#fff8e1','2026-01-02 10:13:24','2026-01-02 10:14:25'),(16,13,2,'#f9f9f9','2026-01-02 10:13:24','2026-01-02 10:14:25'),(17,12,2,'#ffffff','2026-01-02 10:13:24','2026-01-02 10:14:25'),(18,11,2,'#fff','2026-01-02 10:13:24','2026-01-02 10:14:25'),(19,10,2,'#fff','2026-01-02 10:13:24','2026-01-02 10:14:25'),(20,9,2,'#fff','2026-01-02 10:13:24','2026-01-02 10:14:25'),(21,8,2,'rgba(255, 255, 255, 0.8)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(22,7,2,'#203a43','2026-01-02 10:13:24','2026-01-02 10:14:25'),(23,6,2,'#fff','2026-01-02 10:13:24','2026-01-02 10:14:25'),(24,5,2,'#ffffff','2026-01-02 10:13:24','2026-01-02 10:14:25'),(25,4,2,'#232946','2026-01-02 10:13:24','2026-01-02 10:14:25'),(26,3,2,'#fff','2026-01-02 10:13:24','2026-01-02 10:14:25'),(27,2,2,'#23272f','2026-01-02 10:13:24','2026-01-02 10:14:25'),(28,1,2,'#fffbe6','2026-01-02 10:13:24','2026-01-02 10:14:25'),(29,14,3,'var(--color-accent)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(30,13,3,'var(--color-accent)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(31,12,3,'var(--color-accent)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(32,11,3,'var(--color-accent)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(33,10,3,'var(--color-accent)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(34,9,3,'var(--color-accent)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(35,8,3,'var(--color-accent)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(36,7,3,'var(--color-accent)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(37,6,3,'var(--color-accent)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(38,5,3,'var(--color-accent)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(39,4,3,'var(--color-accent)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(40,3,3,'var(--color-accent)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(41,2,3,'var(--color-accent)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(42,1,3,'var(--color-accent)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(43,14,4,'#fbeec1','2026-01-02 10:13:24','2026-01-02 10:14:25'),(44,13,4,'#e0e5ec','2026-01-02 10:13:24','2026-01-02 10:14:25'),(45,12,4,'#f6f8fa','2026-01-02 10:13:24','2026-01-02 10:14:25'),(46,11,4,'#fff','2026-01-02 10:13:24','2026-01-02 10:14:25'),(47,10,4,'#f5f5f5','2026-01-02 10:13:24','2026-01-02 10:14:25'),(48,9,4,'#f3f6fa','2026-01-02 10:13:24','2026-01-02 10:14:25'),(49,8,4,'rgba(255, 255, 255, 0.6)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(50,7,4,'#0f2027','2026-01-02 10:13:24','2026-01-02 10:14:25'),(51,6,4,'#f7f7f7','2026-01-02 10:13:24','2026-01-02 10:14:25'),(52,5,4,'#f5f8fa','2026-01-02 10:13:24','2026-01-02 10:14:25'),(53,4,4,'#1a2236','2026-01-02 10:13:24','2026-01-02 10:14:25'),(54,3,4,'#f4f4f9','2026-01-02 10:13:24','2026-01-02 10:14:25'),(55,2,4,'#181a1b','2026-01-02 10:13:24','2026-01-02 10:14:25'),(56,1,4,'#f8f8f8','2026-01-02 10:13:24','2026-01-02 10:14:25'),(57,14,5,'0.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(58,13,5,'0.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(59,12,5,'0.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(60,11,5,'0.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(61,10,5,'0.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(62,9,5,'0.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(63,8,5,'0.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(64,7,5,'0.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(65,6,5,'0.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(66,5,5,'0.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(67,4,5,'0.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(68,3,5,'0.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(69,2,5,'0.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(70,1,5,'0.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(71,14,6,'0.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(72,13,6,'0.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(73,12,6,'0.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(74,11,6,'0.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(75,10,6,'0.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(76,9,6,'0.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(77,8,6,'0.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(78,7,6,'0.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(79,6,6,'0.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(80,5,6,'0.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(81,4,6,'0.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(82,3,6,'0.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(83,2,6,'0.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(84,1,6,'0.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(85,14,7,'0.75rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(86,13,7,'0.75rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(87,12,7,'0.75rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(88,11,7,'0.75rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(89,10,7,'0.75rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(90,9,7,'0.75rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(91,8,7,'0.75rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(92,7,7,'0.75rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(93,6,7,'0.75rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(94,5,7,'0.75rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(95,4,7,'0.75rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(96,3,7,'0.75rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(97,2,7,'0.75rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(98,1,7,'0.75rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(99,14,8,'1rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(100,13,8,'1rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(101,12,8,'1rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(102,11,8,'1rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(103,10,8,'1rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(104,9,8,'1rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(105,8,8,'1rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(106,7,8,'1rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(107,6,8,'1rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(108,5,8,'1rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(109,4,8,'1rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(110,3,8,'1rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(111,2,8,'1rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(112,1,8,'1rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(113,14,9,'1.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(114,13,9,'1.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(115,12,9,'1.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(116,11,9,'1.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(117,10,9,'1.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(118,9,9,'1.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(119,8,9,'1.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(120,7,9,'1.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(121,6,9,'1.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(122,5,9,'1.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(123,4,9,'1.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(124,3,9,'1.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(125,2,9,'1.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(126,1,9,'1.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(127,14,10,'1.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(128,13,10,'1.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(129,12,10,'1.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(130,11,10,'1.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(131,10,10,'1.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(132,9,10,'1.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(133,8,10,'1.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(134,7,10,'1.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(135,6,10,'1.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(136,5,10,'1.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(137,4,10,'1.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(138,3,10,'1.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(139,2,10,'1.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(140,1,10,'1.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(141,14,11,'var(--bg-main, #f6f1e6)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(142,13,11,'var(--bg-main, #f0f2f5)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(143,12,11,'var(--bg-main, #fff)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(144,11,11,'var(--bg-main, #fff)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(145,10,11,'var(--bg-main, #fff)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(146,9,11,'var(--bg-main, #fff)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(147,8,11,'var(--bg-main, #f6f8fa)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(148,7,11,'var(--bg-main, #000)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(149,6,11,'var(--bg-main, #fff)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(150,5,11,'var(--bg-main, #fff)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(151,4,11,'var(--bg-main, #111)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(152,3,11,'var(--bg-main, #fff)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(153,2,11,'var(--bg-main, #111)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(154,1,11,'var(--bg-main, #fff)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(155,14,12,'var(--shadow, 0 2px 8px rgba(0, 0, 0, 0.06))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(156,13,12,'var(--shadow, 0 2px 8px rgba(0, 0, 0, 0.06))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(157,12,12,'var(--shadow, 0 2px 8px rgba(0, 0, 0, 0.06))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(158,11,12,'var(--shadow, 0 2px 8px rgba(0, 0, 0, 0.06))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(159,10,12,'var(--shadow, 0 2px 8px rgba(0, 0, 0, 0.06))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(160,9,12,'var(--shadow, 0 2px 8px rgba(0, 0, 0, 0.06))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(161,8,12,'var(--shadow, 0 2px 8px rgba(0, 0, 0, 0.06))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(162,7,12,'var(--shadow, 0 2px 8px rgba(0, 0, 0, 0.12))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(163,6,12,'var(--shadow, 0 2px 8px rgba(0, 0, 0, 0.06))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(164,5,12,'var(--shadow, 0 2px 8px rgba(0, 0, 0, 0.06))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(165,4,12,'var(--shadow, 0 2px 8px rgba(0, 0, 0, 0.12))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(166,3,12,'var(--shadow, 0 2px 8px rgba(0, 0, 0, 0.06))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(167,2,12,'var(--shadow, 0 2px 8px rgba(0, 0, 0, 0.12))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(168,1,12,'var(--shadow, 0 2px 8px rgba(0, 0, 0, 0.06))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(169,14,13,'var(--bg-sidebar-active, var(--color-accent))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(170,13,13,'var(--bg-sidebar-active, var(--color-accent))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(171,12,13,'var(--bg-sidebar-active, var(--color-accent))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(172,11,13,'var(--bg-sidebar-active, var(--color-accent))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(173,10,13,'var(--bg-sidebar-active, var(--color-accent))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(174,9,13,'var(--bg-sidebar-active, var(--color-accent))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(175,8,13,'var(--bg-sidebar-active, var(--color-accent))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(176,7,13,'var(--bg-sidebar-active, var(--color-accent))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(177,6,13,'var(--bg-sidebar-active, var(--color-accent))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(178,5,13,'var(--bg-sidebar-active, var(--color-accent))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(179,4,13,'var(--bg-sidebar-active, var(--color-accent))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(180,3,13,'var(--bg-sidebar-active, var(--color-accent))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(181,2,13,'var(--bg-sidebar-active, var(--color-accent))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(182,1,13,'var(--bg-sidebar-active, var(--color-accent))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(183,14,14,'var(--bg-card)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(184,13,14,'var(--bg-card)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(185,12,14,'var(--bg-card)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(186,11,14,'var(--bg-card)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(187,10,14,'var(--bg-card)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(188,9,14,'var(--bg-card)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(189,8,14,'var(--bg-card)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(190,7,14,'var(--bg-card)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(191,6,14,'var(--bg-card)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(192,5,14,'var(--bg-card)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(193,4,14,'var(--bg-card)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(194,3,14,'var(--bg-card)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(195,2,14,'var(--bg-card)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(196,1,14,'var(--bg-card)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(197,14,15,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(198,13,15,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(199,12,15,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(200,11,15,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(201,10,15,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(202,9,15,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(203,8,15,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(204,7,15,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(205,6,15,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(206,5,15,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(207,4,15,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(208,3,15,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(209,2,15,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(210,1,15,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(211,14,16,'0.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(212,13,16,'0.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(213,12,16,'0.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(214,11,16,'0.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(215,10,16,'0.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(216,9,16,'0.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(217,8,16,'0.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(218,7,16,'0.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(219,6,16,'0.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(220,5,16,'0.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(221,4,16,'0.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(222,3,16,'0.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(223,2,16,'0.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(224,1,16,'0.5rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(225,14,17,'var(--border-radius, 0.375rem)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(226,13,17,'var(--border-radius, 0.375rem)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(227,12,17,'var(--border-radius, 0.375rem)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(228,11,17,'var(--border-radius, 0.375rem)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(229,10,17,'var(--border-radius, 0.375rem)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(230,9,17,'var(--border-radius, 0.375rem)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(231,8,17,'var(--border-radius, 0.375rem)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(232,7,17,'var(--border-radius, 0.375rem)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(233,6,17,'var(--border-radius, 0.375rem)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(234,5,17,'var(--border-radius, 0.375rem)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(235,4,17,'var(--border-radius, 0.375rem)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(236,3,17,'var(--border-radius, 0.375rem)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(237,2,17,'var(--border-radius, 0.375rem)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(238,1,17,'var(--border-radius, 0.375rem)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(239,14,18,'0.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(240,13,18,'0.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(241,12,18,'0.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(242,11,18,'0.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(243,10,18,'0.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(244,9,18,'0.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(245,8,18,'0.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(246,7,18,'0.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(247,6,18,'0.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(248,5,18,'0.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(249,4,18,'0.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(250,3,18,'0.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(251,2,18,'0.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(252,1,18,'0.25rem','2026-01-02 10:13:24','2026-01-02 10:14:25'),(253,14,19,'#fff8e1','2026-01-02 10:13:24','2026-01-02 10:14:25'),(254,13,19,'var(--color-elev-2)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(255,12,19,'#232946','2026-01-02 10:13:24','2026-01-02 10:14:25'),(256,11,19,'var(--color-elev-2)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(257,10,19,'#ffffff','2026-01-02 10:13:24','2026-01-02 10:14:25'),(258,9,19,'#ffffff','2026-01-02 10:13:24','2026-01-02 10:14:25'),(259,8,19,'rgba(255, 255, 255, 0.12)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(260,7,19,'#121212','2026-01-02 10:13:24','2026-01-02 10:14:25'),(261,6,19,'var(--color-elev-2)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(262,5,19,'var(--color-elev-2)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(263,4,19,'#121212','2026-01-02 10:13:24','2026-01-02 10:14:25'),(264,3,19,'var(--color-elev-2)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(265,2,19,'#232946','2026-01-02 10:13:24','2026-01-02 10:14:25'),(266,1,19,'var(--color-elev-2)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(267,14,20,'rgba(20, 20, 20, 0.9)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(268,13,20,'rgba(20, 20, 20, 0.9)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(269,12,20,'rgba(20, 20, 20, 0.9)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(270,11,20,'rgba(20, 20, 20, 0.9)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(271,10,20,'rgba(20, 20, 20, 0.9)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(272,9,20,'rgba(20, 20, 20, 0.9)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(273,8,20,'rgba(20, 20, 20, 0.9)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(274,7,20,'rgba(20, 20, 20, 0.9)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(275,6,20,'rgba(20, 20, 20, 0.9)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(276,5,20,'rgba(20, 20, 20, 0.9)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(277,4,20,'rgba(20, 20, 20, 0.9)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(278,3,20,'rgba(20, 20, 20, 0.9)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(279,2,20,'rgba(20, 20, 20, 0.9)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(280,1,20,'rgba(10, 10, 10, 0.85)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(281,14,21,'#a67c52','2026-01-02 10:13:24','2026-01-02 10:14:25'),(282,13,21,'#b8c6db','2026-01-02 10:13:24','2026-01-02 10:14:25'),(283,12,21,'#232946','2026-01-02 10:13:24','2026-01-02 10:14:25'),(284,11,21,'#222','2026-01-02 10:13:24','2026-01-02 10:14:25'),(285,10,21,'#1976d2','2026-01-02 10:13:24','2026-01-02 10:14:25'),(286,9,21,'#e3e8f0','2026-01-02 10:13:24','2026-01-02 10:14:25'),(287,8,21,'rgba(35, 41, 70, 0.7)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(288,7,21,'#2c5364','2026-01-02 10:13:24','2026-01-02 10:14:25'),(289,6,21,'#009688','2026-01-02 10:13:24','2026-01-02 10:14:25'),(290,5,21,'#003a8f','2026-01-02 10:13:24','2026-01-02 10:14:25'),(291,4,21,'#003a8f','2026-01-02 10:13:24','2026-01-02 10:14:25'),(292,3,21,'#22223b','2026-01-02 10:13:24','2026-01-02 10:14:25'),(293,2,21,'#23272f','2026-01-02 10:13:24','2026-01-02 10:14:25'),(294,1,21,'#bfa76f','2026-01-02 10:13:24','2026-01-02 10:14:25'),(295,14,22,'#90caf9','2026-01-02 10:13:24','2026-01-02 10:14:25'),(296,13,22,'#90caf9','2026-01-02 10:13:24','2026-01-02 10:14:25'),(297,12,22,'#2563eb','2026-01-02 10:13:24','2026-01-02 10:14:25'),(298,11,22,'#90caf9','2026-01-02 10:13:24','2026-01-02 10:14:25'),(299,10,22,'#1976d2','2026-01-02 10:13:24','2026-01-02 10:14:25'),(300,9,22,'#1976d2','2026-01-02 10:13:24','2026-01-02 10:14:25'),(301,8,22,'#90caf9','2026-01-02 10:13:24','2026-01-02 10:14:25'),(302,7,22,'#90caf9','2026-01-02 10:13:24','2026-01-02 10:14:25'),(303,6,22,'#90caf9','2026-01-02 10:13:24','2026-01-02 10:14:25'),(304,5,22,'#1976d2','2026-01-02 10:13:24','2026-01-02 10:14:25'),(305,4,22,'#90caf9','2026-01-02 10:13:24','2026-01-02 10:14:25'),(306,3,22,'#90caf9','2026-01-02 10:13:24','2026-01-02 10:14:25'),(307,2,22,'#90caf9','2026-01-02 10:13:24','2026-01-02 10:14:25'),(308,1,22,'#90caf9','2026-01-02 10:13:24','2026-01-02 10:14:25'),(309,14,23,'#4e342e','2026-01-02 10:13:24','2026-01-02 10:14:25'),(310,13,23,'#222','2026-01-02 10:13:24','2026-01-02 10:14:25'),(311,12,23,'#232946','2026-01-02 10:13:24','2026-01-02 10:14:25'),(312,11,23,'#222','2026-01-02 10:13:24','2026-01-02 10:14:25'),(313,10,23,'#222','2026-01-02 10:13:24','2026-01-02 10:14:25'),(314,9,23,'#111111','2026-01-02 10:13:24','2026-01-02 10:14:25'),(315,8,23,'#232946','2026-01-02 10:13:24','2026-01-02 10:14:25'),(316,7,23,'#fff','2026-01-02 10:13:24','2026-01-02 10:14:25'),(317,6,23,'#222','2026-01-02 10:13:24','2026-01-02 10:14:25'),(318,5,23,'#0f1724','2026-01-02 10:13:24','2026-01-02 10:14:25'),(319,4,23,'#ffffff','2026-01-02 10:13:24','2026-01-02 10:14:25'),(320,3,23,'#22223b','2026-01-02 10:13:24','2026-01-02 10:14:25'),(321,2,23,'#ffffff','2026-01-02 10:13:24','2026-01-02 10:14:25'),(322,1,23,'#2d2d2d','2026-01-02 10:13:24','2026-01-02 10:14:25'),(323,14,24,'var(--color-accent)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(324,13,24,'var(--color-accent)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(325,12,24,'var(--color-accent)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(326,11,24,'var(--color-accent)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(327,10,24,'var(--color-accent)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(328,9,24,'var(--color-accent)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(329,8,24,'var(--color-accent)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(330,7,24,'var(--color-accent)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(331,6,24,'var(--color-accent)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(332,5,24,'var(--color-accent)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(333,4,24,'var(--color-accent)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(334,3,24,'var(--color-accent)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(335,2,24,'var(--color-accent)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(336,1,24,'var(--color-accent)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(337,14,25,'linear-gradient(180deg, #fff7e6, #f5e3c4 60%)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(338,13,25,'linear-gradient(180deg, #f2f6fa, #e6edf4 60%)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(339,12,25,'linear-gradient(180deg, #ffffff, #f1f4f8 60%)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(340,11,25,'linear-gradient(180deg, #ffffff, #f7f7f7 60%)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(341,10,25,'linear-gradient(180deg, #ffffff, #eef5ff 60%)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(342,9,25,'linear-gradient(180deg, #ffffff, #eef4fb 60%)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(343,8,25,'linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(245, 250, 255, 0.7) 60%)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(344,7,25,'linear-gradient(180deg, #081014, #0d1b22 60%)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(345,6,25,'linear-gradient(180deg, #ffffff, #f3f3f3 60%)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(346,5,25,'linear-gradient(180deg, #ffffff, #eef4fb 60%)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(347,4,25,'linear-gradient(180deg, #0f151d, #0c1117 60%)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(348,3,25,'linear-gradient(180deg, #ffffff, #f0eef6 60%)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(349,2,25,'linear-gradient(180deg, #0b0b0b, #090909 60%)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(350,1,25,'linear-gradient(180deg, #ffffff, #f5f3ea 60%)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(351,14,26,'#ff9800','2026-01-02 10:13:24','2026-01-02 10:14:25'),(352,13,26,'#388e3c','2026-01-02 10:13:24','2026-01-02 10:14:25'),(353,12,26,'#f9d923','2026-01-02 10:13:24','2026-01-02 10:14:25'),(354,11,26,'#e0e0e0','2026-01-02 10:13:24','2026-01-02 10:14:25'),(355,10,26,'#ffb300','2026-01-02 10:13:24','2026-01-02 10:14:25'),(356,9,26,'#90caf9','2026-01-02 10:13:24','2026-01-02 10:14:25'),(357,8,26,'#f9d923','2026-01-02 10:13:24','2026-01-02 10:14:25'),(358,7,26,'#ffe600','2026-01-02 10:13:24','2026-01-02 10:14:25'),(359,6,26,'#ffd600','2026-01-02 10:13:24','2026-01-02 10:14:25'),(360,5,26,'#ffd700','2026-01-02 10:13:24','2026-01-02 10:14:25'),(361,4,26,'#ffd700','2026-01-02 10:13:24','2026-01-02 10:14:25'),(362,3,26,'#9a8c98','2026-01-02 10:13:24','2026-01-02 10:14:25'),(363,2,26,'#ffa000','2026-01-02 10:13:24','2026-01-02 10:14:25'),(364,1,26,'#ffd700','2026-01-02 10:13:24','2026-01-02 10:14:25'),(365,14,27,'rgba(0, 0, 0, 0.08)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(366,13,27,'rgba(0, 0, 0, 0.08)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(367,12,27,'rgba(0, 0, 0, 0.08)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(368,11,27,'rgba(0, 0, 0, 0.08)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(369,10,27,'rgba(0, 0, 0, 0.08)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(370,9,27,'rgba(0, 0, 0, 0.08)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(371,8,27,'rgba(0, 0, 0, 0.08)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(372,7,27,'rgba(0, 0, 0, 0.08)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(373,6,27,'rgba(0, 0, 0, 0.08)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(374,5,27,'rgba(0, 0, 0, 0.08)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(375,4,27,'rgba(0, 0, 0, 0.08)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(376,3,27,'rgba(0, 0, 0, 0.08)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(377,2,27,'rgba(0, 0, 0, 0.08)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(378,1,27,'rgba(0, 0, 0, 0.08)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(379,14,28,'#ef5350','2026-01-02 10:13:24','2026-01-02 10:14:25'),(380,13,28,'#ef5350','2026-01-02 10:13:24','2026-01-02 10:14:25'),(381,12,28,'#e53935','2026-01-02 10:13:24','2026-01-02 10:14:25'),(382,11,28,'#ef5350','2026-01-02 10:13:24','2026-01-02 10:14:25'),(383,10,28,'#d32f2f','2026-01-02 10:13:24','2026-01-02 10:14:25'),(384,9,28,'#b3261e','2026-01-02 10:13:24','2026-01-02 10:14:25'),(385,8,28,'#ef5350','2026-01-02 10:13:24','2026-01-02 10:14:25'),(386,7,28,'#ef5350','2026-01-02 10:13:24','2026-01-02 10:14:25'),(387,6,28,'#ef5350','2026-01-02 10:13:24','2026-01-02 10:14:25'),(388,5,28,'#b3261e','2026-01-02 10:13:24','2026-01-02 10:14:25'),(389,4,28,'#ef5350','2026-01-02 10:13:24','2026-01-02 10:14:25'),(390,3,28,'#ef5350','2026-01-02 10:13:24','2026-01-02 10:14:25'),(391,2,28,'#ef5350','2026-01-02 10:13:24','2026-01-02 10:14:25'),(392,1,28,'#ef5350','2026-01-02 10:13:24','2026-01-02 10:14:25'),(393,14,29,'var(--bg-card, var(--color-bg))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(394,13,29,'var(--bg-card, var(--color-bg))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(395,12,29,'var(--bg-card, var(--color-bg))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(396,11,29,'var(--bg-card, var(--color-bg))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(397,10,29,'var(--bg-card, var(--color-bg))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(398,9,29,'var(--bg-card, var(--color-bg))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(399,8,29,'var(--bg-card, var(--color-bg))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(400,7,29,'var(--bg-card, var(--color-bg))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(401,6,29,'var(--bg-card, var(--color-bg))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(402,5,29,'var(--bg-card, var(--color-bg))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(403,4,29,'var(--bg-card, var(--color-bg))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(404,3,29,'var(--bg-card, var(--color-bg))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(405,2,29,'var(--bg-card, var(--color-bg))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(406,1,29,'var(--bg-card, var(--color-bg))','2026-01-02 10:13:24','2026-01-02 10:14:25'),(407,14,30,'rgba(255, 255, 255, 0.6)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(408,13,30,'rgba(255, 255, 255, 0.6)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(409,12,30,'rgba(255, 255, 255, 0.6)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(410,11,30,'rgba(255, 255, 255, 0.6)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(411,10,30,'rgba(255, 255, 255, 0.6)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(412,9,30,'rgba(255, 255, 255, 0.6)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(413,8,30,'rgba(255, 255, 255, 0.6)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(414,7,30,'rgba(255, 255, 255, 0.06)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(415,6,30,'rgba(255, 255, 255, 0.6)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(416,5,30,'rgba(255, 255, 255, 0.6)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(417,4,30,'rgba(0, 0, 0, 0.6)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(418,3,30,'rgba(255, 255, 255, 0.6)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(419,2,30,'rgba(0, 0, 0, 0.6)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(420,1,30,'rgba(255, 255, 255, 0.6)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(421,14,31,'8px','2026-01-02 10:13:24','2026-01-02 10:14:25'),(422,13,31,'16px','2026-01-02 10:13:24','2026-01-02 10:14:25'),(423,12,31,'12px','2026-01-02 10:13:24','2026-01-02 10:14:25'),(424,11,31,'8px','2026-01-02 10:13:24','2026-01-02 10:14:25'),(425,10,31,'8px','2026-01-02 10:13:24','2026-01-02 10:14:25'),(426,9,31,'8px','2026-01-02 10:13:24','2026-01-02 10:14:25'),(427,8,31,'12px','2026-01-02 10:13:24','2026-01-02 10:14:25'),(428,7,31,'12px','2026-01-02 10:13:24','2026-01-02 10:14:25'),(429,6,31,'8px','2026-01-02 10:13:24','2026-01-02 10:14:25'),(430,5,31,'10px','2026-01-02 10:13:24','2026-01-02 10:14:25'),(431,4,31,'10px','2026-01-02 10:13:24','2026-01-02 10:14:25'),(432,3,31,'12px','2026-01-02 10:13:24','2026-01-02 10:14:25'),(433,2,31,'12px','2026-01-02 10:13:24','2026-01-02 10:14:25'),(434,1,31,'12px','2026-01-02 10:13:24','2026-01-02 10:14:25'),(435,14,32,'#232946','2026-01-02 10:13:24','2026-01-02 10:14:25'),(436,13,32,'#232946','2026-01-02 10:13:24','2026-01-02 10:14:25'),(437,12,32,'#232946','2026-01-02 10:13:24','2026-01-02 10:14:25'),(438,11,32,'#232946','2026-01-02 10:13:24','2026-01-02 10:14:25'),(439,10,32,'#1976d2','2026-01-02 10:13:24','2026-01-02 10:14:25'),(440,9,32,'#e3e8f0','2026-01-02 10:13:24','2026-01-02 10:14:25'),(441,8,32,'#232946','2026-01-02 10:13:24','2026-01-02 10:14:25'),(442,7,32,'#232946','2026-01-02 10:13:24','2026-01-02 10:14:25'),(443,6,32,'#232946','2026-01-02 10:13:24','2026-01-02 10:14:25'),(444,5,32,'#003a8f','2026-01-02 10:13:24','2026-01-02 10:14:25'),(445,4,32,'#232946','2026-01-02 10:13:24','2026-01-02 10:14:25'),(446,3,32,'#232946','2026-01-02 10:13:24','2026-01-02 10:14:25'),(447,2,32,'#232946','2026-01-02 10:13:24','2026-01-02 10:14:25'),(448,1,32,'#232946','2026-01-02 10:13:24','2026-01-02 10:14:25'),(449,14,33,'#a67c52','2026-01-02 10:13:24','2026-01-02 10:14:25'),(450,13,33,'#b8c6db','2026-01-02 10:13:24','2026-01-02 10:14:25'),(451,12,33,'#2563eb','2026-01-02 10:13:24','2026-01-02 10:14:25'),(452,11,33,'#222','2026-01-02 10:13:24','2026-01-02 10:14:25'),(453,10,33,'#1976d2','2026-01-02 10:13:24','2026-01-02 10:14:25'),(454,9,33,'#1976d2','2026-01-02 10:13:24','2026-01-02 10:14:25'),(455,8,33,'#1976d2','2026-01-02 10:13:24','2026-01-02 10:14:25'),(456,7,33,'#00c6ff','2026-01-02 10:13:24','2026-01-02 10:14:25'),(457,6,33,'#009688','2026-01-02 10:13:24','2026-01-02 10:14:25'),(458,5,33,'#003a8f','2026-01-02 10:13:24','2026-01-02 10:14:25'),(459,4,33,'#003a8f','2026-01-02 10:13:24','2026-01-02 10:14:25'),(460,3,33,'#c9ada7','2026-01-02 10:13:24','2026-01-02 10:14:25'),(461,2,33,'#1976d2','2026-01-02 10:13:24','2026-01-02 10:14:25'),(462,1,33,'#bfa76f','2026-01-02 10:13:24','2026-01-02 10:14:25'),(463,14,34,'#4caf50','2026-01-02 10:13:24','2026-01-02 10:14:25'),(464,13,34,'#4caf50','2026-01-02 10:13:24','2026-01-02 10:14:25'),(465,12,34,'#43a047','2026-01-02 10:13:24','2026-01-02 10:14:25'),(466,11,34,'#4caf50','2026-01-02 10:13:24','2026-01-02 10:14:25'),(467,10,34,'#388e3c','2026-01-02 10:13:24','2026-01-02 10:14:25'),(468,9,34,'#2e7d32','2026-01-02 10:13:24','2026-01-02 10:14:25'),(469,8,34,'#4caf50','2026-01-02 10:13:24','2026-01-02 10:14:25'),(470,7,34,'#4caf50','2026-01-02 10:13:24','2026-01-02 10:14:25'),(471,6,34,'#4caf50','2026-01-02 10:13:24','2026-01-02 10:14:25'),(472,5,34,'#2e7d32','2026-01-02 10:13:24','2026-01-02 10:14:25'),(473,4,34,'#4caf50','2026-01-02 10:13:24','2026-01-02 10:14:25'),(474,3,34,'#4caf50','2026-01-02 10:13:24','2026-01-02 10:14:25'),(475,2,34,'#4caf50','2026-01-02 10:13:24','2026-01-02 10:14:25'),(476,1,34,'#4caf50','2026-01-02 10:13:24','2026-01-02 10:14:25'),(477,14,35,'#ffd700','2026-01-02 10:13:24','2026-01-02 10:14:25'),(478,13,35,'#ffd700','2026-01-02 10:13:24','2026-01-02 10:14:25'),(479,12,35,'#ffd700','2026-01-02 10:13:24','2026-01-02 10:14:25'),(480,11,35,'#ffd700','2026-01-02 10:13:24','2026-01-02 10:14:25'),(481,10,35,'#fff','2026-01-02 10:13:24','2026-01-02 10:14:25'),(482,9,35,'#1976d2','2026-01-02 10:13:24','2026-01-02 10:14:25'),(483,8,35,'#ffd700','2026-01-02 10:13:24','2026-01-02 10:14:25'),(484,7,35,'#ffd700','2026-01-02 10:13:24','2026-01-02 10:14:25'),(485,6,35,'#ffd700','2026-01-02 10:13:24','2026-01-02 10:14:25'),(486,5,35,'#ffd700','2026-01-02 10:13:24','2026-01-02 10:14:25'),(487,4,35,'#ffd700','2026-01-02 10:13:24','2026-01-02 10:14:25'),(488,3,35,'#ffd700','2026-01-02 10:13:24','2026-01-02 10:14:25'),(489,2,35,'#ffd700','2026-01-02 10:13:24','2026-01-02 10:14:25'),(490,1,35,'#ffd700','2026-01-02 10:13:24','2026-01-02 10:14:25'),(491,14,36,'#a67c52','2026-01-02 10:13:24','2026-01-02 10:14:25'),(492,13,36,'#e0e5ec','2026-01-02 10:13:24','2026-01-02 10:14:25'),(493,12,36,'#232946','2026-01-02 10:13:24','2026-01-02 10:14:25'),(494,11,36,'#fff','2026-01-02 10:13:24','2026-01-02 10:14:25'),(495,10,36,'#1976d2','2026-01-02 10:13:24','2026-01-02 10:14:25'),(496,9,36,'#e3e8f0','2026-01-02 10:13:24','2026-01-02 10:14:25'),(497,8,36,'rgba(35, 41, 70, 0.7)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(498,7,36,'#203a43','2026-01-02 10:13:24','2026-01-02 10:14:25'),(499,6,36,'#009688','2026-01-02 10:13:24','2026-01-02 10:14:25'),(500,5,36,'#003a8f','2026-01-02 10:13:24','2026-01-02 10:14:25'),(501,4,36,'#003a8f','2026-01-02 10:13:24','2026-01-02 10:14:25'),(502,3,36,'#22223b','2026-01-02 10:13:24','2026-01-02 10:14:25'),(503,2,36,'#23272f','2026-01-02 10:13:24','2026-01-02 10:14:25'),(504,1,36,'#bfa76f','2026-01-02 10:13:24','2026-01-02 10:14:25'),(505,14,37,'#d7b899','2026-01-02 10:13:24','2026-01-02 10:14:25'),(506,13,37,'#6c7a89','2026-01-02 10:13:24','2026-01-02 10:14:25'),(507,12,37,'#eebbc3','2026-01-02 10:13:24','2026-01-02 10:14:25'),(508,11,37,'#aaa','2026-01-02 10:13:24','2026-01-02 10:14:25'),(509,10,37,'#4caf50','2026-01-02 10:13:24','2026-01-02 10:14:25'),(510,9,37,'#4caf50','2026-01-02 10:13:24','2026-01-02 10:14:25'),(511,8,37,'#4caf50','2026-01-02 10:13:24','2026-01-02 10:14:25'),(512,7,37,'#0072ff','2026-01-02 10:13:24','2026-01-02 10:14:25'),(513,6,37,'#607d8b','2026-01-02 10:13:24','2026-01-02 10:14:25'),(514,5,37,'#e5e5e5','2026-01-02 10:13:24','2026-01-02 10:14:25'),(515,4,37,'#e5e5e5','2026-01-02 10:13:24','2026-01-02 10:14:25'),(516,3,37,'#22223b','2026-01-02 10:13:24','2026-01-02 10:14:25'),(517,2,37,'#4caf50','2026-01-02 10:13:24','2026-01-02 10:14:25'),(518,1,37,'#8c7b4f','2026-01-02 10:13:24','2026-01-02 10:14:25'),(519,14,38,'rgba(0, 0, 0, 0.6)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(520,13,38,'rgba(0, 0, 0, 0.6)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(521,12,38,'rgba(0, 0, 0, 0.6)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(522,11,38,'rgba(0, 0, 0, 0.6)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(523,10,38,'rgba(0, 0, 0, 0.6)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(524,9,38,'rgba(0, 0, 0, 0.6)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(525,8,38,'rgba(0, 0, 0, 0.6)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(526,7,38,'rgba(255, 255, 255, 0.6)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(527,6,38,'rgba(0, 0, 0, 0.6)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(528,5,38,'rgba(0, 0, 0, 0.6)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(529,4,38,'rgba(255, 255, 255, 0.6)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(530,3,38,'rgba(0, 0, 0, 0.6)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(531,2,38,'rgba(255, 255, 255, 0.6)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(532,1,38,'rgba(0, 0, 0, 0.6)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(533,14,39,'#d7b899','2026-01-02 10:13:24','2026-01-02 10:14:25'),(534,13,39,'#6c7a89','2026-01-02 10:13:24','2026-01-02 10:14:25'),(535,12,39,'#1a1f2b','2026-01-02 10:13:24','2026-01-02 10:14:25'),(536,11,39,'#333','2026-01-02 10:13:24','2026-01-02 10:14:25'),(537,10,39,'#1565c0','2026-01-02 10:13:24','2026-01-02 10:14:25'),(538,9,39,'#cfd8dc','2026-01-02 10:13:24','2026-01-02 10:14:25'),(539,8,39,'rgba(26, 31, 43, 0.8)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(540,7,39,'#00c6ff','2026-01-02 10:13:24','2026-01-02 10:14:25'),(541,6,39,'#607d8b','2026-01-02 10:13:24','2026-01-02 10:14:25'),(542,5,39,'#00296b','2026-01-02 10:13:24','2026-01-02 10:14:25'),(543,4,39,'#00296b','2026-01-02 10:13:24','2026-01-02 10:14:25'),(544,3,39,'#c9ada7','2026-01-02 10:13:24','2026-01-02 10:14:25'),(545,2,39,'#181a1b','2026-01-02 10:13:24','2026-01-02 10:14:25'),(546,1,39,'#8c7b4f','2026-01-02 10:13:24','2026-01-02 10:14:25'),(547,14,40,'#fff','2026-01-02 10:13:24','2026-01-02 10:14:25'),(548,13,40,'#fff','2026-01-02 10:13:24','2026-01-02 10:14:25'),(549,12,40,'#fff','2026-01-02 10:13:24','2026-01-02 10:14:25'),(550,11,40,'#fff','2026-01-02 10:13:24','2026-01-02 10:14:25'),(551,10,40,'#fff','2026-01-02 10:13:24','2026-01-02 10:14:25'),(552,9,40,'#fff','2026-01-02 10:13:24','2026-01-02 10:14:25'),(553,8,40,'#fff','2026-01-02 10:13:24','2026-01-02 10:14:25'),(554,7,40,'#fff','2026-01-02 10:13:24','2026-01-02 10:14:25'),(555,6,40,'#fff','2026-01-02 10:13:24','2026-01-02 10:14:25'),(556,5,40,'#fff','2026-01-02 10:13:24','2026-01-02 10:14:25'),(557,4,40,'#fff','2026-01-02 10:13:24','2026-01-02 10:14:25'),(558,3,40,'#fff','2026-01-02 10:13:24','2026-01-02 10:14:25'),(559,2,40,'#fff','2026-01-02 10:13:24','2026-01-02 10:14:25'),(560,1,40,'#fff','2026-01-02 10:13:24','2026-01-02 10:14:25'),(561,14,41,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(562,13,41,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(563,12,41,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(564,11,41,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(565,10,41,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(566,9,41,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(567,8,41,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(568,7,41,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(569,6,41,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(570,5,41,'var(--color-accent)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(571,4,41,'var(--color-accent)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(572,3,41,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(573,2,41,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(574,1,41,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(575,14,42,'#000000','2026-01-02 10:13:24','2026-01-02 10:14:25'),(576,13,42,'#000000','2026-01-02 10:13:24','2026-01-02 10:14:25'),(577,12,42,'#000000','2026-01-02 10:13:24','2026-01-02 10:14:25'),(578,11,42,'#000000','2026-01-02 10:13:24','2026-01-02 10:14:25'),(579,10,42,'#000000','2026-01-02 10:13:24','2026-01-02 10:14:25'),(580,9,42,'#000000','2026-01-02 10:13:24','2026-01-02 10:14:25'),(581,8,42,'#000000','2026-01-02 10:13:24','2026-01-02 10:14:25'),(582,7,42,'#ffffff','2026-01-02 10:13:24','2026-01-02 10:14:25'),(583,6,42,'#000000','2026-01-02 10:13:24','2026-01-02 10:14:25'),(584,5,42,'#000000','2026-01-02 10:13:24','2026-01-02 10:14:25'),(585,4,42,'#fff','2026-01-02 10:13:24','2026-01-02 10:14:25'),(586,3,42,'#000000','2026-01-02 10:13:24','2026-01-02 10:14:25'),(587,2,42,'#ffffff','2026-01-02 10:13:24','2026-01-02 10:14:25'),(588,1,42,'#000000','2026-01-02 10:13:24','2026-01-02 10:14:25'),(589,14,43,'#f3ede0','2026-01-02 10:13:24','2026-01-02 10:14:25'),(590,13,43,'rgba(0, 0, 0, 0.04)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(591,12,43,'#181a1b','2026-01-02 10:13:24','2026-01-02 10:14:25'),(592,11,43,'rgba(0, 0, 0, 0.04)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(593,10,43,'#f3f3f3','2026-01-02 10:13:24','2026-01-02 10:14:25'),(594,9,43,'#e3e8f0','2026-01-02 10:13:24','2026-01-02 10:14:25'),(595,8,43,'rgba(255, 255, 255, 0.06)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(596,7,43,'rgba(255, 255, 255, 0.03)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(597,6,43,'rgba(0, 0, 0, 0.04)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(598,5,43,'rgba(0, 0, 0, 0.04)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(599,4,43,'rgba(255, 255, 255, 0.03)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(600,3,43,'rgba(0, 0, 0, 0.04)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(601,2,43,'#181a1b','2026-01-02 10:13:24','2026-01-02 10:14:25'),(602,1,43,'rgba(0, 0, 0, 0.04)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(603,14,44,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(604,13,44,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(605,12,44,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(606,11,44,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(607,10,44,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(608,9,44,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(609,8,44,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(610,7,44,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(611,6,44,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(612,5,44,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(613,4,44,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(614,3,44,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(615,2,44,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(616,1,44,'var(--color-primary)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(617,14,45,'#fff6e8','2026-01-02 10:13:24','2026-01-02 10:14:25'),(618,13,45,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(619,12,45,'rgba(0, 0, 0, 0.03)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(620,11,45,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(621,10,45,'rgba(0, 0, 0, 0.02)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(622,9,45,'#fafafa','2026-01-02 10:13:24','2026-01-02 10:14:25'),(623,8,45,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(624,7,45,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(625,6,45,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(626,5,45,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(627,4,45,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(628,3,45,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(629,2,45,'rgba(255, 255, 255, 0.02)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(630,1,45,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(631,14,46,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(632,13,46,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(633,12,46,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(634,11,46,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(635,10,46,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(636,9,46,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(637,8,46,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(638,7,46,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(639,6,46,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(640,5,46,'var(--color-header-text, #ffd700)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(641,4,46,'var(--color-header-text, #ffd700)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(642,3,46,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(643,2,46,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(644,1,46,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(645,14,47,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(646,13,47,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(647,12,47,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(648,11,47,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(649,10,47,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(650,9,47,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(651,8,47,'blur(8px)','2026-01-02 10:13:24','2026-01-02 10:14:25'),(652,7,47,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(653,6,47,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(654,5,47,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(655,4,47,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(656,3,47,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(657,2,47,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(658,1,47,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(659,14,48,'#ffa000','2026-01-02 10:13:24','2026-01-02 10:14:25'),(660,13,48,'#ffa000','2026-01-02 10:13:24','2026-01-02 10:14:25'),(661,12,48,'#ffb300','2026-01-02 10:13:24','2026-01-02 10:14:25'),(662,11,48,'#ffa000','2026-01-02 10:13:24','2026-01-02 10:14:25'),(663,10,48,'#ffa000','2026-01-02 10:13:24','2026-01-02 10:14:25'),(664,9,48,'#ff9800','2026-01-02 10:13:24','2026-01-02 10:14:25'),(665,8,48,'#ffa000','2026-01-02 10:13:24','2026-01-02 10:14:25'),(666,7,48,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(667,6,48,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(668,5,48,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(669,4,48,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(670,3,48,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(671,2,48,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25'),(672,1,48,NULL,'2026-01-02 10:13:24','2026-01-02 10:14:25');
/*!40000 ALTER TABLE `adm_temas_valores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adm_temas_variables`
--

DROP TABLE IF EXISTS `adm_temas_variables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adm_temas_variables` (
  `id_tema_var` int NOT NULL AUTO_INCREMENT,
  `clave` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `etiqueta` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'string',
  `valor_defecto` text COLLATE utf8mb4_unicode_ci,
  `meta` json DEFAULT NULL,
  `creado_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_tema_var`),
  UNIQUE KEY `ux_adm_temas_variables_clave` (`clave`)
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_temas_variables`
--

LOCK TABLES `adm_temas_variables` WRITE;
/*!40000 ALTER TABLE `adm_temas_variables` DISABLE KEYS */;
INSERT INTO `adm_temas_variables` VALUES (1,'--shadow','shadow','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(2,'--bg-card','bg-card','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(3,'--bg-logo','bg-logo','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(4,'--bg-main','bg-main','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(5,'--space-1','space-1','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(6,'--space-2','space-2','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(7,'--space-3','space-3','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(8,'--space-4','space-4','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(9,'--space-5','space-5','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(10,'--space-6','space-6','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(11,'--color-bg','color-bg','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(12,'--shadow-1','shadow-1','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(13,'--bg-active','bg-active','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(14,'--bg-images','bg-images','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(15,'--color-btn','color-btn','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(16,'--radius-lg','radius-lg','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(17,'--radius-md','radius-md','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(18,'--radius-sm','radius-sm','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(19,'--select-bg','select-bg','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(20,'--bg-overlay','bg-overlay','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(21,'--bg-sidebar','bg-sidebar','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(22,'--color-info','color-info','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(23,'--color-text','color-text','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(24,'--focus-ring','focus-ring','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(25,'--bg-gradient','bg-gradient','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(26,'--color-accent','color-accent','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(27,'--color-border','color-border','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(28,'--color-danger','color-danger','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(29,'--color-elev-1','color-elev-1','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(30,'--color-elev-2','color-elev-2','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(31,'--border-radius','border-radius','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(32,'--breadcrumb-bg','breadcrumb-bg','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(33,'--color-primary','color-primary','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(34,'--color-success','color-success','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(35,'--breadcrumb-text','breadcrumb-text','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(36,'--color-header-bg','color-header-bg','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(37,'--color-secondary','color-secondary','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(38,'--color-text-muted','color-text-muted','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(39,'--bg-sidebar-active','bg-sidebar-active','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(40,'--breadcrumb-active','breadcrumb-active','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(41,'--color-header-text','color-header-text','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(42,'--color-text-inverse','color-text-inverse','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(43,'--select-disabled-bg','select-disabled-bg','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(44,'--breadcrumb-separator','breadcrumb-separator','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(45,'--table-row-hover','table-row-hover','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(46,'--sidebar-text','sidebar-text','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(47,'--glass-blur','glass-blur','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24'),(48,'--color-warning','color-warning','css',NULL,NULL,'2026-01-02 10:13:24','2026-01-02 10:13:24');
/*!40000 ALTER TABLE `adm_temas_variables` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adm_temas_variables_valores`
--

DROP TABLE IF EXISTS `adm_temas_variables_valores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adm_temas_variables_valores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_tema` int NOT NULL,
  `id_tema_var` int NOT NULL,
  `valor` text COLLATE utf8mb4_unicode_ci,
  `creado_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_tema_var` (`id_tema`,`id_tema_var`),
  KEY `idx_tema` (`id_tema`),
  KEY `idx_tema_var` (`id_tema_var`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_temas_variables_valores`
--

LOCK TABLES `adm_temas_variables_valores` WRITE;
/*!40000 ALTER TABLE `adm_temas_variables_valores` DISABLE KEYS */;
/*!40000 ALTER TABLE `adm_temas_variables_valores` ENABLE KEYS */;
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
  `activo` int DEFAULT '1',
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
INSERT INTO `adm_tipos_usuario` VALUES (1,1,1,'Administrador','Usuario con todos los privilegios'),(2,1,1,'Operador','Usuario con permisos limitados'),(4,1,1,'Usuario','Usuario con permisos limitados'),(5,1,1,'Invitado','Usuario sin permisos');
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
  `correo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Correo electrónico único para login',
  `hash_contrasena` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Hash de la contraseña',
  `nombre_usuario` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre de usuario',
  `nombres` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `apellidos` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_configuracion_default` int DEFAULT NULL,
  `id_tipo_usuario` int NOT NULL COMMENT 'Tipo de usuario',
  `id_estado` int DEFAULT '1' COMMENT 'Estado del usuario',
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
  `fecha_actualizacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
  `fecha_cambio_contrasena` datetime DEFAULT NULL,
  `img` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` int DEFAULT '1',
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `correo` (`correo`),
  KEY `id_tipo_usuario` (`id_tipo_usuario`),
  KEY `fk_usuario_estado` (`id_estado`),
  KEY `idx_usuarios_conf_default` (`id_configuracion_default`),
  CONSTRAINT `adm_usuarios_ibfk_1` FOREIGN KEY (`id_tipo_usuario`) REFERENCES `adm_tipos_usuario` (`id_tipo_usuario`),
  CONSTRAINT `fk_usuario_estado` FOREIGN KEY (`id_estado`) REFERENCES `adm_estados` (`id_estado`),
  CONSTRAINT `fk_usuarios_conf_default` FOREIGN KEY (`id_configuracion_default`) REFERENCES `adm_configuraciones_tema` (`id_config`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Usuarios registrados en el sistema';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_usuarios`
--

LOCK TABLES `adm_usuarios` WRITE;
/*!40000 ALTER TABLE `adm_usuarios` DISABLE KEYS */;
INSERT INTO `adm_usuarios` VALUES (1,'gjpierp@gmail.com','$2b$10$l.Pt1Lwaw1EIT9vDBzSfzeG2vfBSU5UcU7J2zDwnBF59GM3m9AL4.','Gerardo Paiva','Gerardo','Paiva',NULL,1,1,'2025-12-25 17:35:40','2026-01-04 15:52:57','2025-12-26 14:34:15','4fe4a85a-4c6d-4615-9d1c-50d9d4227bf6.jpg',1),(2,'gjpierpspam@gmail.com','$2b$10$kmhsbyRkFT7NcbNCzEvFaOUFQwHleU4YaJ/m7FDUzmgSUBx0dy8iS','Gerardo Paiva',NULL,NULL,NULL,2,1,'2025-12-26 09:24:32','2025-12-26 10:25:11',NULL,NULL,1),(3,'gjpierpspam2@gmail.com','$2b$10$s/dKwY9BsQbXeBayVhB1e.UybproNaRodSvQuu9v3UAXUWO073eVi','gjpierpspam2',NULL,NULL,NULL,1,1,'2025-12-26 09:24:46','2026-01-03 23:33:20',NULL,NULL,1),(7,'gjpierp2@gmail.com','$2b$10$P4HAw3f77335wVvyAjHlpO.0LztxislTAmZ.q/EBrbG13vnAuSD/S','Gerado Paiva',NULL,NULL,NULL,1,1,'2026-01-03 21:24:02','2026-01-03 23:33:20',NULL,NULL,1),(8,'gjpierp3@gmail.com','$2b$10$kqz9grBmuqf254DIO4EOV.cl1HeyIas0rDUuYOry29saj.f8NgNFa','Gerardo Paiva',NULL,NULL,NULL,1,1,'2026-01-03 21:28:04','2026-01-03 21:28:04',NULL,NULL,1),(9,'gjpierp4@gmail.com','$2b$10$tVvuSpy7nuuNfMIgwd8N0eomKDwoQsnt.nGzhG/rFaIDRe4tT1Mj2','Gerado Paiva',NULL,NULL,NULL,1,1,'2026-01-03 21:29:10','2026-01-03 23:33:20',NULL,NULL,1),(10,'gjpierp10@gmail.com','$2b$10$1AK9rRQDFlw1/A2Q58ShCurhNk/OsTIdIfF87Q4ZWuGgtNM10pnDa','Gerardo Paiva Gonzalez',NULL,NULL,NULL,1,1,'2026-01-03 22:43:55','2026-01-03 23:33:20',NULL,NULL,1);
/*!40000 ALTER TABLE `adm_usuarios` ENABLE KEYS */;
UNLOCK TABLES;

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
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario_aplicacion`),
  UNIQUE KEY `ux_usuario_aplicacion` (`id_usuario`,`id_aplicacion`),
  KEY `idx_id_usuario` (`id_usuario`),
  KEY `idx_id_aplicacion` (`id_aplicacion`),
  CONSTRAINT `fk_usu_aplicacion_aplicacion` FOREIGN KEY (`id_aplicacion`) REFERENCES `adm_aplicaciones_sitio` (`id_aplicacion`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_usu_aplicacion_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `adm_usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_usuarios_aplicaciones`
--

LOCK TABLES `adm_usuarios_aplicaciones` WRITE;
/*!40000 ALTER TABLE `adm_usuarios_aplicaciones` DISABLE KEYS */;
INSERT INTO `adm_usuarios_aplicaciones` VALUES (1,1,1,1,'2025-12-29 17:25:55',NULL),(2,1,2,1,'2025-12-29 17:25:55',NULL);
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
  `activo` int DEFAULT '1',
  PRIMARY KEY (`id_usuario_jerarquia`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_jerarquia` (`id_jerarquia`),
  CONSTRAINT `adm_usuarios_jerarquias_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `adm_usuarios` (`id_usuario`),
  CONSTRAINT `adm_usuarios_jerarquias_ibfk_2` FOREIGN KEY (`id_jerarquia`) REFERENCES `adm_jerarquias` (`id_jerarquia`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Relación entre usuarios y jerarquías';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_usuarios_jerarquias`
--

LOCK TABLES `adm_usuarios_jerarquias` WRITE;
/*!40000 ALTER TABLE `adm_usuarios_jerarquias` DISABLE KEYS */;
INSERT INTO `adm_usuarios_jerarquias` VALUES (2,1,1,1),(3,7,1,1),(4,9,1,1),(5,10,1,1);
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
  `activo` int DEFAULT '1',
  PRIMARY KEY (`id_usuario_rol`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_rol` (`id_rol`),
  CONSTRAINT `adm_usuarios_roles_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `adm_usuarios` (`id_usuario`),
  CONSTRAINT `adm_usuarios_roles_ibfk_2` FOREIGN KEY (`id_rol`) REFERENCES `adm_roles` (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Relación entre usuarios y roles';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_usuarios_roles`
--

LOCK TABLES `adm_usuarios_roles` WRITE;
/*!40000 ALTER TABLE `adm_usuarios_roles` DISABLE KEYS */;
INSERT INTO `adm_usuarios_roles` VALUES (11,1,1,1),(12,1,2,0),(13,3,1,1),(14,3,2,0),(15,7,1,1),(16,9,1,1),(17,8,1,1),(18,8,2,1),(19,10,1,1);
/*!40000 ALTER TABLE `adm_usuarios_roles` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-04 16:04:13
