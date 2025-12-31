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
  PRIMARY KEY (`id_jerarquia`),
  KEY `id_jerarquia_padre` (`id_jerarquia_padre`),
  KEY `fk_jerarquia_estado` (`id_estado`),
  CONSTRAINT `adm_jerarquias_ibfk_1` FOREIGN KEY (`id_jerarquia_padre`) REFERENCES `adm_jerarquias` (`id_jerarquia`),
  CONSTRAINT `fk_jerarquia_estado` FOREIGN KEY (`id_estado`) REFERENCES `adm_estados` (`id_estado`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Jerarquías organizacionales';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_jerarquias`
--

LOCK TABLES `adm_jerarquias` WRITE;
/*!40000 ALTER TABLE `adm_jerarquias` DISABLE KEYS */;
INSERT INTO `adm_jerarquias` VALUES (1,'Administrador','Jerarquía con todos los privilegios',NULL,1),(2,'Supervisor','Jerarquía con permisos de supervisión',1,1),(3,'Operador','Jerarquía para usuarios operativos',2,1),(4,'Invitado','Jerarquía con acceso limitado',NULL,1);
/*!40000 ALTER TABLE `adm_jerarquias` ENABLE KEYS */;
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
