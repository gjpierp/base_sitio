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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Estados generales para entidades del sistema';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_estados`
--

LOCK TABLES `adm_estados` WRITE;
/*!40000 ALTER TABLE `adm_estados` DISABLE KEYS */;
INSERT INTO `adm_estados` VALUES (1,'Activo','Estado activo',1,1),(2,'Inactivo','Estado inactivo',1,1),(3,'Pendiente','Estado pendiente de aprobación',1,1),(4,'Eliminado','Estado eliminado o dado de baja',1,1),(5,'Disponible','Vivienda disponible para asignación',2,1),(6,'Ocupada','Vivienda actualmente ocupada',2,1),(7,'En Mantención','Vivienda en proceso de mantención',2,1);
/*!40000 ALTER TABLE `adm_estados` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-29 11:38:09
