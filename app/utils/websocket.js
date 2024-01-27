import { ServerUrl } from "./function.js";

export function  setupWebSocket(userNickname) {
    const socket = new WebSocket("ws://localhost:8088/api/ws/" + `${userNickname}`); // 포트 번호를 FastAPI 서버의 포트에 맞게 변경해주세요.
    const messageContainer = document.getElementById("messageContainer");
    const visitorList = document.getElementById("visitorList");
    socket.onopen = (event) => {
        console.log("WebSocket connection opened:", event);
    };
    socket.onmessage = async (event) => {
        console.log("Message received:", event.data);
        if(event.data.includes("인원수")){
            messageContainer.innerHTML = "현재 온라인 " + event.data;
        }
        else{
            visitorList.innerHTML = "";
            const visitor = await getVisitor();
            visitor.forEach(async item => {
                const visitorName = item.visitorName
                const liElement = document.createElement('li');
                const visitTime = item.visitTime;
                const quitTime = item.quitTime;
                liElement.innerHTML = visitorName;
                console.log(await visitQuitDifference(visitTime, quitTime));
                if (!visitorName.includes("방문자")){
                    if (await visitQuitDifference(visitTime, quitTime) > 0){
                        liElement.innerHTML += await formatTimeDifference(item.visitTime);
                    }else{
                        liElement.innerHTML += await formatTimeDifference(item.quitTime) + "방문";
                    }
                }
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
async function formatTimeDifference(targetTime) {
    console.log(targetTime);
    // 주어진 시간을 Date 객체로 변환
    const targetDate = new Date(targetTime);

    // 현재 시간을 얻기
    const currentDate = new Date();

    // 두 날짜 간의 차이 계산 (밀리초 단위)
    const timeDifference = currentDate - targetDate;

    // 차이를 분 단위로 변환
    const minutesDifference = Math.floor(timeDifference / (1000 * 60));

    // 분 단위를 시간과 분으로 나누기
    const hours = Math.floor(minutesDifference / 60);
    const minutes = minutesDifference % 60;

    // 결과 문자열 생성
    let result = '';

    if (hours > 0) {
        result += hours + '시간';
    }

    if (minutes > 0) {
        result += ' ' + minutes + '분';
    }
    else if(hours == 0 && minutes == 0){
        result = "방금";
    }
    console.log(result)
    // 결과 반환
    return result + ' 전';
}
async function visitQuitDifference(visitTime, quitTime) {

    // 주어진 시간을 Date 객체로 변환
    const visit = new Date(visitTime);

    // 현재 시간을 얻기
    const quit = new Date(quitTime);

    // 두 날짜 간의 차이 계산 (밀리초 단위)
    const timeDifference = visit - quit;
    return timeDifference

}