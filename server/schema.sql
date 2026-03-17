-- Optional manual schema for SnipChat (oxmysql)
-- The resource also creates these tables automatically at startup.

CREATE TABLE IF NOT EXISTS `snipchat_accounts` (
  `identifier` VARCHAR(80) NOT NULL,
  `username` VARCHAR(32) NOT NULL,
  `display_name` VARCHAR(64) NOT NULL,
  `bio` VARCHAR(255) NOT NULL DEFAULT '',
  `avatar` VARCHAR(8) NOT NULL DEFAULT 'SC',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`identifier`),
  UNIQUE KEY `uniq_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `snipchat_friends` (
  `user_a` VARCHAR(80) NOT NULL,
  `user_b` VARCHAR(80) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_a`, `user_b`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `snipchat_friend_requests` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `sender_identifier` VARCHAR(80) NOT NULL,
  `receiver_identifier` VARCHAR(80) NOT NULL,
  `status` ENUM('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_pending_pair` (`sender_identifier`, `receiver_identifier`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `snipchat_conversations` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_a` VARCHAR(80) NOT NULL,
  `user_b` VARCHAR(80) NOT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_pair` (`user_a`, `user_b`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `snipchat_messages` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `conversation_id` BIGINT NOT NULL,
  `sender_identifier` VARCHAR(80) NOT NULL,
  `message_type` ENUM('text', 'snap') NOT NULL DEFAULT 'text',
  `content` VARCHAR(512) NOT NULL,
  `media_url` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_conversation` (`conversation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `snipchat_stories` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `owner_identifier` VARCHAR(80) NOT NULL,
  `caption` VARCHAR(120) NOT NULL,
  `media_url` TEXT NULL,
  `posted_at` VARCHAR(16) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_owner` (`owner_identifier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
