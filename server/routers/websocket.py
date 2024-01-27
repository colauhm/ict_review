from datetime import datetime, timedelta
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Optional

from server.database.query import execute_sql_query

router = APIRouter(prefix="/api")

# 연결된 웹소켓들을 저장할 딕셔너리
websockets = {}

@router.get("/visitor")
async def getVisitor():
    visitor = await execute_sql_query("SELECT * FROM visitor")
    return visitor
@router.websocket("/ws/{userNickname}")
async def websocket_endpoint(websocket: WebSocket, userNickname: Optional[str]):
    today = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    await websocket.accept()
    userNum = 1

    if userNickname != 'visit':
        client_id = userNickname    
    else:
        while True:
            client_id = f"방문자 {userNum}"
            try:
                print(websockets[client_id])
                userNum += 1
            except KeyError:
                break

    websockets[client_id] = websocket
    
    visitor = await execute_sql_query("""SELECT visitorName FROM visitor WHERE visitorName = %s""", (client_id,))
    if len(visitor) == 0:
        await execute_sql_query("""INSERT INTO visitor (visitorName, visitTime) VALUES (%s, %s)""", (client_id, today,))
    else:
        await execute_sql_query("""UPDATE visitor SET visitTime = %s WHERE visitorName = %s""", (today, client_id,))

    currentVisitor = len(websockets)
    clients = list(websockets.keys())
    print(clients)

    try:
        # 인원수 메시지 전송
        count_message = f"인원수: {currentVisitor}"
        for ws_id, ws in websockets.items():
            await ws.send_text(count_message)

        # ID 리스트 전송
        for ws_id, ws in websockets.items():
            await ws.send_text("test")

        while True:
            # 여기에서 클라이언트 수를 출력하거나 활용할 수 있습니다.
            print(f"Current connected clients: {currentVisitor}")

            # 클라이언트로부터 데이터 수신
            data = await websocket.receive_text()
            message = f"Message from {client_id}: {data}"

            # 연결된 모든 웹소켓에 메시지 전송
            for ws_id, ws in websockets.items():
                await ws.send_text(message)

    except WebSocketDisconnect:
        # 연결이 끊어진 경우 딕셔너리에서 제거
        if userNickname == 'visit':
            await execute_sql_query("DELETE FROM visitor WHERE visitorName = %s", (client_id,))
        else:
            quit_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            await execute_sql_query("UPDATE visitor SET quitTime = %s WHERE visitorName = %s", (quit_time, client_id,))

        websockets.pop(client_id, None)
        # 인원수 및 ID 리스트 메시지 전송
        count_message = f"인원수: {len(websockets)}"
        for ws_id, ws in websockets.items():
            await ws.send_text("test")
        for ws_id, ws in websockets.items():
            await ws.send_text(count_message)

        print(f"Client {client_id} disconnected. Current connected clients: {currentVisitor}")
        print(websockets)
