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
-- Table structure for table `adm_roles_permisos`
--

DROP TABLE IF EXISTS `adm_roles_permisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adm_roles_permisos` (
  `id_rol_permiso` int NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de la relación rol-permiso',
  `id_rol` int NOT NULL COMMENT 'Rol',
  `id_permiso` int NOT NULL COMMENT 'Permiso',
  PRIMARY KEY (`id_rol_permiso`),
  KEY `id_rol` (`id_rol`),
  KEY `id_permiso` (`id_permiso`),
  CONSTRAINT `adm_roles_permisos_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `adm_roles` (`id_rol`),
  CONSTRAINT `adm_roles_permisos_ibfk_2` FOREIGN KEY (`id_permiso`) REFERENCES `adm_permisos` (`id_permiso`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Relación entre roles y permisos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_roles_permisos`
--

LOCK TABLES `adm_roles_permisos` WRITE;
/*!40000 ALTER TABLE `adm_roles_permisos` DISABLE KEYS */;
INSERT INTO `adm_roles_permisos` VALUES (1,1,32),(2,1,33),(3,1,34),(4,1,35),(8,1,4),(9,1,5),(10,1,6),(11,1,7),(15,1,8),(16,1,9),(17,1,10),(18,1,11),(22,1,12),(23,1,13),(24,1,14),(25,1,15),(29,1,36),(30,1,37),(32,1,28),(33,1,31),(35,1,21),(36,1,23),(38,1,38),(39,1,39);
/*!40000 ALTER TABLE `adm_roles_permisos` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-29 11:38:07
