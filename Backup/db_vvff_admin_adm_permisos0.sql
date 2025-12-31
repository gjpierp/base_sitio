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
  PRIMARY KEY (`id_permiso`),
  KEY `fk_permiso_estado` (`id_estado`),
  CONSTRAINT `fk_permiso_estado` FOREIGN KEY (`id_estado`) REFERENCES `adm_estados` (`id_estado`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Permisos del sistema';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_permisos`
--

LOCK TABLES `adm_permisos` WRITE;
/*!40000 ALTER TABLE `adm_permisos` DISABLE KEYS */;
INSERT INTO `adm_permisos` VALUES (1,'GESTION_USUARIOS','Permiso para gestionar usuarios',1),(2,'GESTION_MENUS','Permiso para gestionar menús',1),(4,'ROLES_VER','Permiso para ver roles',1),(5,'ROLES_CREAR','Permiso para crear roles',1),(6,'ROLES_EDITAR','Permiso para editar roles',1),(7,'ROLES_ELIMINAR','Permiso para eliminar roles',1),(8,'PERMISOS_VER','Permiso para ver permisos',1),(9,'PERMISOS_CREAR','Permiso para crear permisos',1),(10,'PERMISOS_EDITAR','Permiso para editar permisos',1),(11,'PERMISOS_ELIMINAR','Permiso para eliminar permisos',1),(12,'MENUS_VER','Permiso para ver menus',1),(13,'MENUS_CREAR','Permiso para crear menú',1),(14,'MENUS_EDITAR','Permiso para editar menú',1),(15,'MENUS_ELIMINAR','Permiso para eliminar menú',1),(16,'VER_REPORTES','Permiso para ver reportes',1),(21,'ESTADOS_VER','Permiso para ver estados',1),(22,'ESTADOS_CREAR','Permiso para crear estados',1),(23,'ESTADOS_EDITAR','Permiso para editar estados',1),(24,'ESTADOS_ELIMINAR','Permiso para eliminar estados',1),(28,'JERARQUIAS_CREAR','Permiso para crear jerarquías',1),(29,'JERARQUIAS_EDITAR','Permiso para editar jerarquías',1),(30,'JERARQUIAS_ELIMINAR','Permiso para eliminar jerarquías',1),(31,'JERARQUIAS_VER','Permiso para ver jerarquías',1),(32,'USUARIOS_VER','Permiso para ver usuarios',1),(33,'USUARIOS_CREAR','Permiso para crear usuarios',1),(34,'USUARIOS_EDITAR','Permiso para editar usuarios',1),(35,'USUARIOS_ELIMINAR','Permiso para eliminar usuarios',1),(36,'TIPOS_USUARIO_VER','Permiso para ver tipos de usuario',1),(37,'TIPOS_USUARIO_CREAR','Permiso para crear tipos de usuario',1),(38,'BUSQUEDAS_VER','Permiso para ver búsquedas generales',1),(39,'UPLOADS_USUARIOS_VER','Permiso para ver uploads de usuarios',1);
/*!40000 ALTER TABLE `adm_permisos` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-29 11:38:05
