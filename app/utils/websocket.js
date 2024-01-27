import { ServerUrl } from "./function.js";

export function  setupWebSocket(userNickname) {
    const socket = new WebSocket("wss://server-8088.run.goorm.io/api/ws/" + `${userNickname}`); // 포트 번호를 FastAPI 서버의 포트에 맞게 변경해주세요.
    const messageContainer = document.getElementById("messageContainer");
    const visitorList = document.getElementById("visitorList");
    socket.onopen = (event) => {
        console.log("WebSocket connection opened:", event);
    };
    socket.onmessage = async (event) => {
        console.log("Message received:", event.data);
        if(event.data.includes("인원수")){
            messageContainer.innerHTML = "현재 페이지 " + event.data;
        }
        else{
            visitorList.innerHTML = "";
            const visitor = await getVisitor();
            visitor.forEach(item => {
                const liElement = document.createElement('li');
                liElement.innerHTML = item.visitorName;
                visitorList.appendChild(liElement);
              });
            console.log(visitor)
        }
    };
    socket.onclose = (event) => {
        console.log("WebSocket connection closed:", event);
    };
}

async function getVisitor(){
    const visitor = await fetch(ServerUrl() + '/visitor', {noCORS: true });
    const data = await visitor.json();
    return data;
}