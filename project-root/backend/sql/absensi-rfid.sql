-- absensi-rfid.sql
-- Database schema + seed untuk project "Absensi RFID + ESP8266"
-- Target: MySQL (XAMPP), Charset utf8mb4
-- Catatan penting:
-- 1. Timezone aplikasi: Asia/Jakarta. MySQL menyimpan TIMESTAMP tanpa offset; konversi zona waktu disarankan di layer backend (PHP) menggunakan SET time_zone atau CONVERT_TZ saat perlu.
-- 2. Import: gunakan phpMyAdmin atau mysql CLI: `mysql -u root -p < absensi-rfid.sql` setelah membuat user DB jika perlu.
-- 3. File ini juga menyertakan sebuah stored procedure `sp_insert_attendance` sebagai contoh logika insert + penentuan status (present/late/holiday/unknown).

CREATE DATABASE IF NOT EXISTS `absensi_rfid` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `absensi_rfid`;

-- -----------------------------
-- Table: app_settings (key/value)
-- -----------------------------
CREATE TABLE IF NOT EXISTS `app_settings` (
  `k` VARCHAR(100) NOT NULL,
  `v` TEXT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`k`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------
-- Table: users (administration)
-- -----------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(191) DEFAULT NULL,
  `role` ENUM('admin','operator') NOT NULL DEFAULT 'operator',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------
-- Table: students
-- -----------------------------
CREATE TABLE IF NOT EXISTS `students` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_number` VARCHAR(50) NOT NULL UNIQUE, -- contoh: NIS/NIM
  `name` VARCHAR(255) NOT NULL,
  `class` VARCHAR(50) DEFAULT NULL,
  `photo` VARCHAR(512) DEFAULT NULL, -- path ke foto
  `status` TINYINT(1) NOT NULL DEFAULT 1, -- 1=active,0=inactive
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------
-- Table: cards
-- -----------------------------
CREATE TABLE IF NOT EXISTS `cards` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `uid` VARCHAR(128) NOT NULL, -- simpan UID RFID sebagai hex string tanpa spasi: contoh '04AABBCC1280'
  `student_id` INT UNSIGNED DEFAULT NULL,
  `assigned_at` TIMESTAMP NULL DEFAULT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uid_idx` (`uid`),
  KEY `student_idx` (`student_id`),
  CONSTRAINT `fk_cards_student` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------
-- Table: devices (ESP nodes)
-- -----------------------------
CREATE TABLE IF NOT EXISTS `devices` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `device_uid` VARCHAR(100) NOT NULL, -- ID unik device yang dikirim ESP (contoh: ESP-GERBANG-01)
  `name` VARCHAR(255) DEFAULT NULL,
  `location` VARCHAR(255) DEFAULT NULL,
  `ip` VARCHAR(45) DEFAULT NULL,
  `last_heartbeat` TIMESTAMP NULL DEFAULT NULL,
  `register_mode` TINYINT(1) NOT NULL DEFAULT 0, -- 0=normal,1=register mode aktif untuk input kartu baru
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `device_uid_idx` (`device_uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------
-- Table: schedule (per hari mingguan)
-- -----------------------------
-- day_of_week: 0=Sunday, 1=Monday, ... 6=Saturday
CREATE TABLE IF NOT EXISTS `schedule` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `day_of_week` TINYINT NOT NULL,
  `time_in` TIME NOT NULL,
  `late_cutoff` TIME NOT NULL,
  `time_out` TIME NULL,
  `note` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `day_idx` (`day_of_week`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------
-- Table: schedule_overrides (tanggal spesifik)
-- -----------------------------
CREATE TABLE IF NOT EXISTS `schedule_overrides` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `override_date` DATE NOT NULL,
  `time_in` TIME NOT NULL,
  `late_cutoff` TIME NOT NULL,
  `time_out` TIME NULL,
  `note` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `override_date_idx` (`override_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------
-- Table: holidays
-- -----------------------------
CREATE TABLE IF NOT EXISTS `holidays` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `holiday_date` DATE NOT NULL,
  `is_half_day` TINYINT(1) NOT NULL DEFAULT 0,
  `description` VARCHAR(255) DEFAULT NULL,
  `recurring` TINYINT(1) NOT NULL DEFAULT 0, -- 1 = berlaku setiap tahun (cek bulan-hari)
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `holiday_date_idx` (`holiday_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------
-- Table: attendance
-- -----------------------------
CREATE TABLE IF NOT EXISTS `attendance` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_id` INT UNSIGNED DEFAULT NULL,
  `card_uid` VARCHAR(128) NOT NULL,
  `device_id` INT UNSIGNED DEFAULT NULL,
  `timestamp` DATETIME NOT NULL,
  `status` ENUM('present','late','holiday','unknown','absent','out') NOT NULL,
  `type` ENUM('in','out') NOT NULL DEFAULT 'in',
  `sync_status` ENUM('synced','queued') NOT NULL DEFAULT 'synced',
  `raw` JSON DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_student_ts` (`student_id`,`timestamp`),
  KEY `idx_card_ts` (`card_uid`,`timestamp`),
  KEY `idx_device_ts` (`device_id`,`timestamp`),
  CONSTRAINT `fk_attendance_student` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_attendance_device` FOREIGN KEY (`device_id`) REFERENCES `devices`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------
-- Table: logs
-- -----------------------------
CREATE TABLE IF NOT EXISTS `logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `level` ENUM('INFO','WARN','ERROR') NOT NULL DEFAULT 'INFO',
  `message` TEXT NOT NULL,
  `meta` JSON DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_level_time` (`level`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------
-- Table: esp_offline_queue (jika ESP kirim batch saat reconnect)
-- -----------------------------
CREATE TABLE IF NOT EXISTS `esp_offline_queue` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `device_id` INT UNSIGNED DEFAULT NULL,
  `payload` JSON NOT NULL, -- array of attendance objects dari ESP
  `status` ENUM('pending','processed','failed') NOT NULL DEFAULT 'pending',
  `received_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_queue_device` FOREIGN KEY (`device_id`) REFERENCES `devices`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Settings Table (pengaturan global sistem)
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,     -- contoh: 'register_mode', 'jam_masuk', 'dark_mode'
    value VARCHAR(255) NOT NULL,          -- bisa simpan angka, string, json pendek
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
               ON UPDATE CURRENT_TIMESTAMP
);

-- -----------------------------
-- Indexing tambahan
-- -----------------------------
ALTER TABLE `cards` ADD INDEX (`uid`(32));
ALTER TABLE `attendance` ADD INDEX (`timestamp`);

-- -----------------------------
-- Seed: app_settings (timezone & register mode)
-- -----------------------------
INSERT INTO `app_settings` (`k`,`v`) VALUES
('timezone','Asia/Jakarta'),
('register_mode_global','0'); -- 0=normal, 1=register-mode global

-- -----------------------------
-- Seed: users (instruksi untuk mengganti password_hash saat setup)
-- -----------------------------
INSERT INTO `users` (`name`,`email`,`password_hash`,`role`) VALUES
('Administrator','admin@example.com', NULL, 'admin');
-- NOTE: Ganti password_hash melalui script setup PHP atau gunakan password_hash('yourpass', PASSWORD_DEFAULT)

-- -----------------------------
-- Seed: students
-- -----------------------------
INSERT INTO `students` (`student_number`,`name`,`class`,`photo`,`status`) VALUES
('S001','Bagus Pratama','10A',NULL,1),
('S002','Siti Aminah','10A',NULL,1),
('S003','Joko Santoso','11B',NULL,1);

-- -----------------------------
-- Seed: cards (contoh UID hex)
-- -----------------------------
INSERT INTO `cards` (`uid`,`student_id`,`assigned_at`,`active`) VALUES
('04AABBCC1280', 1, NOW(), 1),
('04AABBCC1281', 2, NOW(), 1),
('04AABBCC1282', 3, NOW(), 1);

-- -----------------------------
-- Seed: devices
-- -----------------------------
INSERT INTO `devices` (`device_uid`,`name`,`location`,`ip`,`register_mode`) VALUES
('ESP-GERBANG-01','ESP Gerbang Utama','Pintu Utama',NULL,0);

-- -----------------------------
-- Seed: schedule (default Mon-Fri)
-- -----------------------------
-- Asumsi: masuk 07:00, cutoff terlambat 07:15, pulang 15:00
INSERT INTO `schedule` (`day_of_week`,`time_in`,`late_cutoff`,`time_out`,`note`) VALUES
(1,'07:00:00','07:15:00','15:00:00','Senin'),
(2,'07:00:00','07:15:00','15:00:00','Selasa'),
(3,'07:00:00','07:15:00','15:00:00','Rabu'),
(4,'07:00:00','07:15:00','15:00:00','Kamis'),
(5,'07:00:00','07:15:00','15:00:00','Jumat'),
(0,'00:00:00','23:59:59',NULL,'Minggu (libur)'),
(6,'00:00:00','23:59:59',NULL,'Sabtu (libur)');

-- -----------------------------
-- Seed: holidays (contoh)
-- -----------------------------
INSERT INTO `holidays` (`holiday_date`,`is_half_day`,`description`,`recurring`) VALUES
('2025-01-01',0,'Tahun Baru','1');


-- -----------------------------
-- Seed: contoh attendance (demo)
-- -----------------------------
INSERT INTO `attendance` (`student_id`,`card_uid`,`device_id`,`timestamp`,`status`,`type`,`sync_status`) VALUES
(1,'04AABBCC1280',1,'2025-09-23 07:02:00','present','in','synced'),
(3,'04AABBCC1282',1,'2025-09-23 07:20:00','late','in','synced'),
(NULL,'04FFFFFFFFFFFF',1,'2025-09-23 07:25:00','unknown','in','synced');

-- -----------------------------
-- Stored Procedure: sp_insert_attendance
-- Deskripsi: dipanggil oleh backend atau bisa langsung dipanggil oleh admin (jika diizinkan) untuk men-standard-kan logic penentuan status.
-- Input: p_device_uid, p_card_uid, p_ts
-- Output: INSERT ke table attendance + SELECT hasil (student_id, status)
-- Catatan: procedure ini sederhana; logic tambahan (mis. half-day handling) bisa ditambahkan di backend.
-- -----------------------------
DELIMITER $$
CREATE DEFINER=CURRENT_USER PROCEDURE `sp_insert_attendance`(
  IN p_device_uid VARCHAR(100),
  IN p_card_uid VARCHAR(128),
  IN p_ts DATETIME
)
BEGIN
  DECLARE v_student_id INT DEFAULT NULL;
  DECLARE v_device_id INT DEFAULT NULL;
  DECLARE v_is_holiday INT DEFAULT 0;
  DECLARE v_holiday_id INT DEFAULT NULL;
  DECLARE v_recurring INT DEFAULT 0;
  DECLARE v_day_of_week INT;
  DECLARE v_time_in TIME;
  DECLARE v_late_cutoff TIME;
  DECLARE v_status VARCHAR(30) DEFAULT 'unknown';

  -- temukan device id
  SELECT id INTO v_device_id FROM devices WHERE device_uid = p_device_uid LIMIT 1;

  -- update heartbeat (jika ada device)
  IF v_device_id IS NOT NULL THEN
    UPDATE devices SET last_heartbeat = p_ts WHERE id = v_device_id;
  END IF;

  -- cek apakah tanggal p_ts adalah libur (match tanggal or recurring holiday)
  SELECT id, recurring INTO v_holiday_id, v_recurring FROM holidays WHERE holiday_date = DATE(p_ts) LIMIT 1;

  IF v_holiday_id IS NULL THEN
    -- cek recurring (bulan-hari match)
    SELECT id, recurring INTO v_holiday_id, v_recurring FROM holidays
    WHERE recurring = 1 AND DATE_FORMAT(holiday_date, '%m-%d') = DATE_FORMAT(p_ts, '%m-%d') LIMIT 1;
  END IF;

  IF v_holiday_id IS NOT NULL THEN
    SET v_is_holiday = 1;
  END IF;

  -- temukan student bila kartu ter-assign
  SELECT student_id INTO v_student_id FROM cards WHERE uid = p_card_uid AND active = 1 LIMIT 1;

  -- apabila libur -> status = 'holiday' (tetap rekam, tapi status holiday)
  IF v_is_holiday = 1 THEN
    SET v_status = 'holiday';
  ELSE
    -- ambil jadwal override untuk tanggal ts
    SELECT time_in, late_cutoff INTO v_time_in, v_late_cutoff FROM schedule_overrides WHERE override_date = DATE(p_ts) LIMIT 1;

    IF v_time_in IS NULL THEN
      -- jika tidak ada override -> ambil jadwal berdasarkan day_of_week
      SET v_day_of_week = DAYOFWEEK(p_ts) - 1; -- DAYOFWEEK: 1=Sun ... 7=Sat => kita gunakan 0..6
      SELECT time_in, late_cutoff INTO v_time_in, v_late_cutoff FROM schedule WHERE day_of_week = v_day_of_week LIMIT 1;
    END IF;

    -- fallback default jika tidak ada schedule
    IF v_time_in IS NULL THEN
      SET v_time_in = '07:00:00';
      SET v_late_cutoff = '07:15:00';
    END IF;

    IF TIME(p_ts) <= v_late_cutoff THEN
      SET v_status = 'present';
    ELSE
      SET v_status = 'late';
    END IF;

    -- apabila kartu tidak dikenal -> tetap rekam dengan status unknown
    IF v_student_id IS NULL THEN
      SET v_status = 'unknown';
    END IF;
  END IF;

  -- insert attendance
  INSERT INTO attendance (student_id, card_uid, device_id, timestamp, status, type, sync_status)
  VALUES (v_student_id, p_card_uid, v_device_id, p_ts, v_status, 'in', 'synced');

  -- kembalikan hasil ringkas sebagai resultset untuk backend
  SELECT LAST_INSERT_ID() AS attendance_id, v_student_id AS student_id, v_status AS status, v_device_id AS device_id, p_ts AS timestamp;
END$$
DELIMITER ;

-- -----------------------------
-- End of SQL
-- Instruksi singkat setelah import:
-- 1) Periksa tabel `app_settings` dan atur 'timezone' = 'Asia/Jakarta'.
-- 2) Buat akun admin: update users.password_hash menggunakan PHP password_hash().
-- 3) Backend (PHP) harus menggunakan PDO + prepared statements; gunakan stored procedure sp_insert_attendance() atau panggil endpoint yang menerapkan logic serupa.
-- 4) Untuk ESP: gunakan API endpoint POST /api/attendance.php yang menerima JSON { device_uid, uid, timestamp } dan memanggil sp_insert_attendance di backend.
-- 5) Jika ingin menambahkan kolom tambahan (mis. kelas detail, jurusan), tambahkan di table students.

-- Selesai: file absensi-rfid.sql
