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
  PRIMARY KEY (`id_menu`),
  KEY `id_menu_padre` (`id_menu_padre`),
  KEY `fk_menu_estado` (`id_estado`),
  CONSTRAINT `adm_menus_ibfk_1` FOREIGN KEY (`id_menu_padre`) REFERENCES `adm_menus` (`id_menu`),
  CONSTRAINT `fk_menu_estado` FOREIGN KEY (`id_estado`) REFERENCES `adm_estados` (`id_estado`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Menús del sistema';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_menus`
--

LOCK TABLES `adm_menus` WRITE;
/*!40000 ALTER TABLE `adm_menus` DISABLE KEYS */;
INSERT INTO `adm_menus` VALUES (1,'Panel de Control','dashboard',NULL,1,'dashboard',1,1,0),(2,'Dashboard','dashboard',NULL,1,'dashboard',1,0,0),(3,'Usuarios','',NULL,2,'group',1,1,0),(4,'Roles','',NULL,3,'shield',1,1,0),(5,'Permisos','',NULL,4,'key',1,1,0),(6,'Menús','',NULL,5,'menu',1,1,0),(7,'Configuración','configuracion',NULL,10,'settings',1,1,0),(8,'Mi Perfil','perfil',NULL,11,'person',1,1,0),(9,'Crear Usuario','usuarios/crear',3,1,'person_add',1,1,0),(10,'Listar Usuarios','usuarios',3,2,'list',1,1,0),(13,'Crear Rol','roles/crear',4,1,'key',1,1,0),(14,'Listar Roles','roles',4,2,'list',1,1,0),(15,'Crear Permiso','permisos/crear',5,1,'key',1,1,0),(16,'Listar Permisos','permisos',5,2,'list',1,1,0),(17,'Crear Menú','menus/crear',6,1,'menu',1,1,0),(18,'Listar Menús','menus',6,2,'list',1,1,0),(19,'Tipos de Usuario','tipos-usuarios',NULL,6,'group',1,1,0),(20,'Jerarquías','jerarquias',NULL,7,'account_tree',1,1,0),(21,'Estados','estados',NULL,8,'bookmark',1,1,0),(22,'Búsquedas','busquedas/general',NULL,9,'search',1,1,0),(23,'Uploads Usuarios','uploads/usuarios',3,3,'cloud-upload',1,0,1),(24,'Crear Tipos de Usuario','tipos-usuarios/crear',19,1,'group',1,1,0),(25,'Listar Tipos de Usuario','tipos-usuarios',19,2,'list',1,1,0),(26,'Crear Jerarquías','jerarquias/crear',20,1,'account_tree',1,1,0),(27,'Listar Jerarquías','jerarquias',20,2,'list',1,1,0),(28,'Crear Estados','estados/crear',21,1,'bookmark',1,1,0),(29,'Listar Estados','estados',21,2,'list',1,1,0);
/*!40000 ALTER TABLE `adm_menus` ENABLE KEYS */;
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
