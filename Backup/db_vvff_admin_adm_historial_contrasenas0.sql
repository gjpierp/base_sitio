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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-29 11:38:08
