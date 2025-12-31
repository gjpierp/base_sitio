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
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Historial de acciones de los usuarios';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_historial_acciones`
--

LOCK TABLES `adm_historial_acciones` WRITE;
/*!40000 ALTER TABLE `adm_historial_acciones` DISABLE KEYS */;
INSERT INTO `adm_historial_acciones` VALUES (1,1,'ELIMINAR','ELIMINAR en roles',NULL,NULL),(2,1,'ASIGNAR_PERMISOS','ASIGNAR_PERMISOS en roles',NULL,NULL),(3,1,'ASIGNAR_PERMISOS','ASIGNAR_PERMISOS en roles',NULL,NULL),(4,1,'CREAR','CREAR en adm_roles',NULL,NULL),(5,1,'ELIMINAR','ELIMINAR en roles',NULL,NULL),(6,1,'CREAR','CREAR en adm_roles',NULL,NULL),(7,1,'ACTUALIZAR','ACTUALIZAR en roles',NULL,NULL),(8,1,'ACTUALIZAR','ACTUALIZAR en roles',NULL,NULL),(9,1,'ELIMINAR','ELIMINAR en roles',NULL,NULL),(10,1,'CREAR','CREAR en permisos',NULL,NULL),(11,1,'CREAR','CREAR en permisos',NULL,NULL),(12,1,'ACTUALIZAR','ACTUALIZAR en permisos',NULL,NULL),(13,1,'ACTUALIZAR','ACTUALIZAR en permisos',NULL,NULL),(14,1,'ACTUALIZAR','ACTUALIZAR en permisos',NULL,NULL),(15,1,'ACTUALIZAR','ACTUALIZAR en permisos',NULL,NULL),(16,1,'CREAR','CREAR en permisos',NULL,NULL),(17,1,'CREAR','CREAR en permisos',NULL,NULL),(18,1,'ELIMINAR','ELIMINAR en permisos',NULL,NULL),(19,1,'CREAR','CREAR en menus',NULL,NULL),(20,1,'CREAR','CREAR en menus',NULL,NULL),(21,1,'ACTUALIZAR','ACTUALIZAR en menus',NULL,NULL),(22,1,'ELIMINAR','ELIMINAR en menus',NULL,NULL),(23,1,'ELIMINAR','ELIMINAR en menus',NULL,NULL),(24,1,'ASIGNAR_PERMISOS','ASIGNAR_PERMISOS en menus',NULL,NULL);
/*!40000 ALTER TABLE `adm_historial_acciones` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-29 11:38:08
