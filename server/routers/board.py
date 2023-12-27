from fastapi import APIRouter, Cookie, Header
from typing import Annotated
from pydantic import BaseModel
from typing import Optional
from ..database.query import execute_sql_query
from ..controllers.session import getSessionData
from datetime import datetime, timedelta

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

class RecordData(BaseModel):
    boardId : int
    recommend :Optional[bool]

router = APIRouter(prefix="/api")

@router.post("/recordTimeData")
async def recordTimeData(boardId : int, session: Annotated[str, Header()] = None):
    info = await getSessionData(session)
    today = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    res = await execute_sql_query("""
        SELECT viewStatus FROM status WHERE userId = %s AND boardId = %s;
    """,(info.idx, boardId,))
    
    if len(res) == 0:
        await execute_sql_query("""
            INSERT INTO status (userId, boardId, recommendStatus, viewStatus) 
            VALUES (%s, %s, %s, %s)
        """, (info.idx, boardId, False, today,))
        await execute_sql_query("""
            UPDATE board
            SET viewCount = viewCount + 1
            WHERE id = %s;
        """, (boardId,))
        return 200, "firstUpdate", "first"
    if res[0]['viewStatus'] + timedelta(hours=1) < datetime.now():
        await execute_sql_query("""
            UPDATE status
            SET viewStatus = %s
            WHERE userId = %s AND boardId = %s;
        """, (today, info.idx, boardId,))
        await execute_sql_query("""
            UPDATE board
            SET viewCount = viewCount + 1
            WHERE id = %s;
        """, (boardId,))
        return 200, "timeUpdate"
    return 200, "viewed within 1 hour"
    
@router.post("/recordRecommendData")
async def recordRecommendData(data:RecordData, session: Annotated[str, Header()] = None):
    print(data)
    info = await getSessionData(session)
    await execute_sql_query("""
            UPDATE status
            SET recommendStatus = %s
            WHERE userId = %s AND boardId = %s;
        """, (data.recommend, info.idx, data.boardId,))
    if data.recommend:
        await execute_sql_query("""
        UPDATE board
        SET recommendCount = recommendCount + 1
        WHERE id = %s;
        """, (data.boardId,))
    else:
        await execute_sql_query("""
        UPDATE board
        SET recommendCount = recommendCount - 1
        WHERE id = %s;
        """, (data.boardId,))
    return 200

    
@router.get("/recommendData")
async def recommendData(boardId, session: Annotated[str, Header()] = None):
    info = await getSessionData(session)
    recommendStatus = await execute_sql_query("""
        SELECT recommendStatus FROM status WHERE userId = %s AND boardId = %s;
    """,(info.idx, boardId,))
    return recommendStatus[0]


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

@router.get("/boardCommentCount")
async def boardCommentCount(id:int):
    res = await execute_sql_query("SELECT COUNT(*) FROM comment WHERE boardId = %s;",(id,))
    commentCount = res[0]['COUNT(*)']
    return commentCount

@router.get("/boardRecommendCount")
async def boardRecommendCount(id:int):
    res = await execute_sql_query("SELECT COUNT(*) FROM status WHERE boardId = %s AND recommendStatus = 1;",(id,))
    recommendCount = res[0]['COUNT(*)']
    return recommendCount