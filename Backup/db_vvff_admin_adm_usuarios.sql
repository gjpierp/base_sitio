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
-- Table structure for table `adm_usuarios`
--

DROP TABLE IF EXISTS `adm_usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adm_usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del usuario',
  `nombre_usuario` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre de usuario',
  `correo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Correo electrónico único para login',
  `hash_contrasena` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Hash de la contraseña',
  `fecha_cambio_contraseña` datetime DEFAULT NULL,
  `id_tipo_usuario` int NOT NULL COMMENT 'Tipo de usuario',
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
  `fecha_actualizacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
  `id_estado` int DEFAULT '1' COMMENT 'Estado del usuario',
  `img` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `correo` (`correo`),
  KEY `id_tipo_usuario` (`id_tipo_usuario`),
  KEY `fk_usuario_estado` (`id_estado`),
  CONSTRAINT `adm_usuarios_ibfk_1` FOREIGN KEY (`id_tipo_usuario`) REFERENCES `adm_tipos_usuario` (`id_tipo_usuario`),
  CONSTRAINT `fk_usuario_estado` FOREIGN KEY (`id_estado`) REFERENCES `adm_estados` (`id_estado`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Usuarios registrados en el sistema';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adm_usuarios`
--

LOCK TABLES `adm_usuarios` WRITE;
/*!40000 ALTER TABLE `adm_usuarios` DISABLE KEYS */;
INSERT INTO `adm_usuarios` VALUES (1,'Gerardo Paiva','gjpierp@gmail.com','$2b$10$l.Pt1Lwaw1EIT9vDBzSfzeG2vfBSU5UcU7J2zDwnBF59GM3m9AL4.','2025-12-26 14:34:15',1,'2025-12-25 17:35:40','2025-12-26 18:12:30',1,'4fe4a85a-4c6d-4615-9d1c-50d9d4227bf6.jpg'),(2,'Gerardo Paiva','gjpierpspam@gmail.com','$2b$10$kmhsbyRkFT7NcbNCzEvFaOUFQwHleU4YaJ/m7FDUzmgSUBx0dy8iS',NULL,2,'2025-12-26 09:24:32','2025-12-26 10:25:11',1,NULL),(3,'gjpierpspam2','gjpierpspam2@gmail.com','$2b$10$s/dKwY9BsQbXeBayVhB1e.UybproNaRodSvQuu9v3UAXUWO073eVi',NULL,1,'2025-12-26 09:24:46','2025-12-26 09:24:46',1,NULL);
/*!40000 ALTER TABLE `adm_usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-29 11:38:10
