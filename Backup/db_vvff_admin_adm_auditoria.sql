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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-29 11:38:06
