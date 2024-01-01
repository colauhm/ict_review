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
    type : Optional[str]
    fileName : Optional[str]
    filePath : Optional[str]
    updateType : Optional[str]
    boardId : Optional[int]


class RecordData(BaseModel):
    recordType : str
    boardId : int
    recommend :Optional[bool]

router = APIRouter(prefix="/api")

@router.post("/recordData")
async def recordData(data:RecordData, session: Annotated[str, Header()] = None):
    info = await getSessionData(session)    
    print(data)
    if data.recordType == 'time':
        today = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        res = await execute_sql_query("""
        SELECT viewStatus FROM status WHERE userId = %s AND boardId = %s;
        """,(info.idx, data.boardId,))
        print('분기 1')
        if len(res) == 0:
            await execute_sql_query("""
                INSERT INTO status (userId, boardId, recommendStatus, viewStatus, viewCount) 
                VALUES (%s, %s, %s, %s, %s)
            """, (info.idx, data.boardId, False, today, 1,))
            test = await execute_sql_query("SELECT * FROM status")
            print(test[0])
            print('분기 2   ')
            return 200, "firstUpdate", "first"
        if res[0]['viewStatus'] + timedelta(hours=1) < datetime.now():
            await execute_sql_query("""
                UPDATE status
                SET viewStatus = %s
                WHERE userId = %s AND boardId = %s;
            """, (today, info.idx, data.boardId,))
            await execute_sql_query("""
                UPDATE status
                SET viewCount = viewCount + 1
                WHERE userId = %s AND boardId = %s;
            """, (info.idx, data.boardId,))
            return 200, "timeUpdate"
        return 200, "viewed within 1 hour"
    await execute_sql_query("""
            UPDATE status
            SET recommendStatus = %s
            WHERE userId = %s AND boardId = %s;
        """, (data.recommend, info.idx, data.boardId,))
    
    return 200


@router.post("/board")
async def addBoard(data: AddBoard, session: Annotated[str, Header()] = None):
    info = await getSessionData(session)
    today = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(data)
    if data.updateType == 'modify':
        await execute_sql_query("""
                UPDATE board
                SET title = %s, content = %s, updatedAt = %s, fileName = %s, filePath = %s
                WHERE id = %s;
            """, (data.title, data.content, today, data.fileName, data.filePath, data.boardId,))
        return
    elif data.updateType == 'answer':
        await execute_sql_query("""INSERT INTO board (title, content, createdAt, viewCount, fileName, filePath, type, writerId, answer) 
                                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""", 
                                    (data.title, data.content, today, 0, data.fileName, data.filePath, data.type, info.idx, data.boardId,))
        answerCount =  await execute_sql_query("""
                            SELECT COUNT(*) AS answerCount
                            FROM board
                            WHERE answer IS NOT NULL AND answer <> '';
                            """)
        print(answerCount)
        await execute_sql_query("""
                UPDATE board
                SET answerCount = %s
                WHERE id = %s;""", (answerCount[0]['answerCount'],data.boardId,))
       
        return
    res = await execute_sql_query("""INSERT INTO board (title, content, createdAt, viewCount, recommendCount, commentCount, fileName, filePath, type, writerId) 
                                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""", 
                                    (data.title, data.content, today, 0, 0, 0, data.fileName, data.filePath, data.type, info.idx,))
    res = await execute_sql_query("SELECT MAX(id) AS id FROM board")
    # print(res)
    return 200, {'message': res[0]['id']}

@router.get("/boards")
async def getBoards(category:str, detail:str, type:str, searchContent:Optional[str]):
    if type == 'sort':
        boards = await execute_sql_query(f"""
            SELECT
                b.id AS boardId,
                b.title AS boardTitle,
                b.createdAt AS boardCreatedAt,
                b.writerId AS boardWriterId,
                b.viewCount AS boardViewCount,
                b.recommendCount AS boardRecommendCount,
                b.commentCount AS boardcommentCount,   
                b.type AS boardType,                      
                u.nickname AS userNickname,
                b.answer
            FROM
                board AS b
            LEFT JOIN
                user AS u
            ON
                b.writerId = u.idx
            WHERE
                b.type = %s
            ORDER BY
                {detail} DESC;
            """,(category,))
    else:
        if len(searchContent) == 0:
            return []
        if category == 'all':
            boards = await execute_sql_query(f"""
                SELECT
                    b.id AS boardId,
                    b.title AS boardTitle,
                    b.content AS boardContent,
                    b.createdAt AS boardCreatedAt,
                    b.writerId AS boardWriterId,
                    b.viewCount AS boardViewCount,
                    b.recommendCount AS boardRecommendCount,
                    b.commentCount AS boardcommentCount,   
                    b.type AS boardType,                      
                    u.nickname AS userNickname,
                    b.answer
                FROM
                    board AS b
                LEFT JOIN
                    user AS u 
                ON
                    b.writerId = u.idx
                WHERE
                    {detail} LIKE CONCAT('%%', %s ,'%%')
                    AND b.type <> 'secretQnA'
                ORDER BY
                    boardCreatedAt DESC;
                """,(searchContent,))
        else:
            boards = await execute_sql_query(f"""
                SELECT
                    b.id AS boardId,
                    b.title AS boardTitle,
                    b.content AS boardContent,
                    b.createdAt AS boardCreatedAt,
                    b.writerId AS boardWriterId,
                    b.viewCount AS boardViewCount,
                    b.recommendCount AS boardRecommendCount,
                    b.commentCount AS boardcommentCount,   
                    b.type AS boardType,                      
                    u.nickname AS userNickname,
                    b.answer
                FROM
                    board AS b
                LEFT JOIN
                    user AS u 
                ON
                    b.writerId = u.idx
                WHERE
                    b.type = %s AND {detail} LIKE CONCAT('%%', %s ,'%%') 
                    AND b.type <> 'secretQnA'
                ORDER BY
                    boardCreatedAt DESC;
                """, (category, searchContent,))

    return boards

@router.get("/board")
async def getBoard(boardId: int,answer:bool, session: str = Header(default=None)):
    info = await getSessionData(session)
    if (info):
        
        viewCount = await execute_sql_query("SELECT SUM(viewCount) FROM status WHERE boardId = %s;",(boardId,))
        commentCount = await execute_sql_query("SELECT COUNT(*) FROM comment WHERE boardId = %s;",(boardId,))
        recommendCount = await execute_sql_query("SELECT COUNT(*) FROM status WHERE boardId = %s AND recommendStatus = 1;",(boardId,))
        await execute_sql_query("""
                UPDATE board
                SET commentCount = %s
                WHERE id = %s;
            """, (commentCount[0]['COUNT(*)'],boardId,))
        await execute_sql_query("""
                UPDATE board
                SET recommendCount = %s
                WHERE id = %s;
            """, (recommendCount[0]['COUNT(*)'],boardId,))    
        await execute_sql_query("""
                UPDATE board
                SET viewCount = %s
                WHERE id = %s;
            """, (viewCount[0]['SUM(viewCount)'],boardId,))
        if(answer):
            board = await execute_sql_query("""
            SELECT 
                    b.title,
                    b.id AS boardId,
                    b.content,
                    b.createdAt,
                    b.viewCount,
                    b.recommendCount,
                    b.commentCount,
                    b.fileName,
                    b.filePath,
                    u.nickname AS writerNickname,
                    b.type,
                    b.writerId,
                    s.recommendStatus,
                    b.answer
                FROM 
                    board AS b
                JOIN 
                    user AS u ON b.writerId = u.idx
                LEFT JOIN
                    status AS s ON b.id = s.boardId
                WHERE 
                    b.answer = %s AND s.userId = %s;
                """, (boardId, info.idx,))
        else:
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
                    b.writerId,
                    s.recommendStatus,
                    b.answer
                FROM 
                    board AS b
                JOIN 
                    user AS u ON b.writerId = u.idx
                LEFT JOIN
                    status AS s ON b.id = s.boardId
                WHERE 
                    b.id = %s AND s.userId = %s;
                """, (boardId, info.idx,))
    else:
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
            b.writerId,
            b.answer
        FROM 
            board AS b
        JOIN 
            user AS u ON b.writerId = u.idx
        LEFT JOIN
            status AS s ON b.id = s.boardId
        WHERE 
            b.id = %s;
            """, (boardId,))
    return board


@router.delete("/board/{id}")
async def deleteBoard(id: str, session: Annotated[str, Header()] = None):

    info = await getSessionData(session)
    # 게시글 삭제 로직
    res = await execute_sql_query("DELETE FROM board WHERE id = %s AND writerId = %s", (id, info.idx,))
    res = await execute_sql_query("DELETE FROM status WHERE boardId = %s AND UserId = %s", (id, info.idx,))
    # print(res)
    if (res == 0):
        return 401, {'message': '삭제 권한이 없습니다.'}
    else:
        return 200, {'message': '삭제되었습니다.'}
    
@router.get("/boardNum")
async def getBoardNum():
    res = await execute_sql_query("SELECT MAX(id) FROM board;")
    print(res)
    return res[0]["MAX(id)"] 