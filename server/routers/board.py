from fastapi import APIRouter, Cookie, Header
from typing import Annotated
from pydantic import BaseModel
from typing import Optional
from ..database.query import execute_sql_query
from ..controllers.session import getSessionData
from datetime import datetime

class AddBoard(BaseModel):
    title : str
    content : str
    type : str
    fileName : Optional[str]
    filePath : Optional[str]

class modifyBoard(BaseModel):
    id: int
    title: str
    content: str
    fileName : Optional[str]
    filePath : Optional[str]


router = APIRouter(prefix="/api")

@router.post("/postBoard")
async def addBoard(data: AddBoard, session: Annotated[str, Header()] = None):
    

    info = await getSessionData(session)
    
    today = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    #print(data.title, data.content, today, 0, 0, 0, data.fileName, data.filePath, data.type)
    # 게시글 추가 로직 board 테이블에 게시글을 추가한다.
    res = await execute_sql_query("""INSERT INTO board (title, content, createdAt, viewCount, recommendCount, commentCount, fileName, filePath, type, writerId) 
                                                                                                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""", 
                                                                            (data.title, data.content, today, 0, 0, 0, data.fileName, data.filePath, data.type, info.idx,))
    # 게시글 마지막 idx 조회
    res = await execute_sql_query("SELECT MAX(id) AS id FROM board")

    # print(res)
    return 200, {'message': res[0]['id']}

@router.get("/boards")
async def getBoards(category:str, sortType:str):
    boards = await execute_sql_query("""
        SELECT
            b.id AS boardId,
            b.title AS boardTitle,
            b.createdAt AS boardCreatedAt,
            b.writerId AS boardWriterId,
            b.viewCount AS boardViewCount,
            b.recommendCount AS boardRecommendCount,
            b.commentCount AS boardcommentCount,   
            b.type AS boardType,                      
            u.nickname AS userNickname
        FROM
            board AS b
        LEFT JOIN
            user AS u
        ON
            b.writerId = u.idx
        WHERE
            b.type = %s
        ORDER BY
            %s DESC;
        """,(category,sortType,))
    return boards

@router.get("/board")
async def getBoard(id:int):
    board = await execute_sql_query("""
       SELECT 
            b.title,
            b.content,
            b.createdAt,
            b.viewCount,
            b.recommendCount,
            b.commentCount,
            b.fileName,
            b.filePath,
            u.nickname AS writerNickname,
            b.type,
            b.writerId
        FROM 
            board AS b
        JOIN 
            user AS u ON b.writerId = u.idx
        WHERE 
            b.id = %s;
        """, (id,))
    return board
