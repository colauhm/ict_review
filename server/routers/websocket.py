from fastapi import APIRouter, WebSocket
router = APIRouter(prefix="/api")

# 연결된 웹소켓들을 저장할 딕셔너리
websockets = {}


@router.websocket("/ws")
async def websocket_endpoint(websocket:WebSocket):
    await websocket.accept()


