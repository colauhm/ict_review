CREATE DATABASE connection default CHARACTER SET UTF8;
USE connection;

CREATE TABLE user (
 email     VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
 id        VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
 password  VARCHAR(255) DEFAULT NULL,
 nickname  VARCHAR(255) DEFAULT NULL,
 createdAt DATETIME DEFAULT NULL,
 idx       BIGINT UNSIGNED NOT NULL auto_increment comment '사용자 인덱스',
 power 	   INT DEFAULT NULL,
 PRIMARY KEY (idx)
);
CREATE TABLE board (
	id        		INT NOT NULL auto_increment,
	title     		VARCHAR(255) DEFAULT NULL,
	content   		TEXT,
	createdAt 		DATETIME DEFAULT NULL,
	updatedAt 		DATETIME DEFAULT NULL,
	writerId  		INT DEFAULT NULL,
	viewCount 		INT DEFAULT NULL,
	recommendCount  INT DEFAULT NULL,
	commentCount    INT DEFAULT NULL,
	type      		VARCHAR(255) DEFAULT NULL,
	fileName  		VARCHAR(255) DEFAULT NULL,
	filePath  		VARCHAR(255) DEFAULT NULL,
    answer VARCHAR(255) DEFAULT NULL,
	answerCount		INT DEFAULT NULL,
	PRIMARY KEY (id)
);
CREATE TABLE comment ( 
	idx int NOT NULL AUTO_INCREMENT,
	boardId int DEFAULT NULL,
	writerId int DEFAULT NULL,
	content text,
	createdAt datetime DEFAULT NULL,
	PRIMARY KEY (idx) 
);
CREATE TABLE status (
	userId     		INT DEFAULT NULL,
    boardId    		INT DEFAULT NULL,
	recommendStatus BOOLEAN DEFAULT NULL,
	viewStatus 		DATETIME DEFAULT NULL,
    viewCount 		INT DEFAULT 0
);