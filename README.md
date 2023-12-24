# 프로젝트 목적
     fastapi로 웹 사이트를 혼자 만들어 보며 복습

# 프로젝트 추가기능
     1. 회원등급
     2. 회원가입 시 이메일 인증
     3. 댓글 추천기능
     4. 게시판 분할

# 실행 명령어
     uvicorn server.main:app --reload --host=0.0.0.0 --port=8088
     python -m http.server 80 -d ./app

## 유저 테이블
### CREATE TABLE user

     email     VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
     id        VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
     password  VARCHAR(255) DEFAULT NULL,
     nickname  VARCHAR(255) DEFAULT NULL,
     createdAt DATETIME DEFAULT NULL,
     idx       BIGINT UNSIGNED NOT NULL auto_increment comment '사용자 인덱스',
     power 	   INT DEFAULT NULL,
     PRIMARY KEY (idx)


## 보드 테이블 
### CREATE TABLE board
    id             INT NOT NULL auto_increment,
    title          VARCHAR(255) DEFAULT NULL,
    content        TEXT,
    createdAt      DATETIME DEFAULT NULL,
    updatedAt      DATETIME DEFAULT NULL,
    writerId       INT DEFAULT NULL,
    viewCount      INT DEFAULT NULL,
    recommendCount INT DEFAULT NULL,
    commentCount   INT DEFAULT NULL,
    type           VARCHAR(255) DEFAULT NULL,
    fileName       VARCHAR(255) DEFAULT NULL,
    filePath       VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY (id)

## 댓글 테이블
### CREATE TABLE comment  
	idx       int NOT NULL AUTO_INCREMENT,
	boardId   int DEFAULT NULL,
	writerId  int DEFAULT NULL,
	content   text,
	createdAt datetime DEFAULT NULL,
	PRIMARY KEY (idx) 

## 최근조회 시각 및 추천여부 테이블
### CREATE TABLE status
     userId     		INT DEFAULT NULL,
     boardId    		INT DEFAULT NULL,
     recommendStatus        BOOLEAN DEFAULT NULL,
     viewStatus 		DATETIME DEFAULT NULL

## groom