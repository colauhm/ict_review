
export function setupWebSocket() {
    const socket = new WebSocket("ws://localhost:8088/api/ws"); // 포트 번호를 FastAPI 서버의 포트에 맞게 변경해주세요.
    socket.onopen = (event) => {
        console.log("WebSocket connection opened:", event);
    };

    socket.onmessage = (event) => {
        console.log("Message received:", event.data);
    };

    socket.onclose = (event) => {
        console.log("WebSocket connection closed:", event);
    };
}
