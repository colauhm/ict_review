export const BoardItem = (id, date, title, views, recommeds, writerNickname, boardType,  userPower, userNickname) => {
    // 파라미터 값이 없으면 리턴
    // 날짜 포맷 변경 YYYY-MM-DD hh:mm:ss

    const checkPower = userPower ? true: false;
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const seconds = dateObj.getSeconds();

    // 날짜 포맷 변경 YYYY-MM-DD
    const dateStr = `${year}-${month}-${day}`;
    // 시간 포맷 변경 hh:mm:ss
    const timeStr = `${hours}:${minutes}:${seconds}`;

    // 날짜와 시간을 합쳐서 YYYY-MM-DD hh:mm:ss
    const dateTimeStr = `${dateStr} ${timeStr}`;
    if (boardType == 'secretQnA' && !checkPower && writerNickname != userNickname){
        return `
            <a>
                <div class="boardItem">
                    <h2 class="title">비밀글 입니다.</h2>
                </div>
                <ol id="answer${id}">
                </ol>
            </a>
        `;
    }
    if (boardType == 'free'){
        return `
        <a href="/board.html?id=${id}" class="boardLink">
            <div class="boardItem">
                <h2 class="title">${title}</h2>
                <div class="info">
                    <h3 class="date">${dateTimeStr}</h3>
                    <h3 class="views">조회수 <b>${views}</b></h3>
                    <h3 class="recommends">추천수 <b>${recommeds}</b></h3>
                </div>
            </div>
            <div class="writerInfo">
            <h2 class="writer">🧑${writerNickname}</h2>
            </div>
        </a>
    `;
    } else{
        return `
        <a href="/board.html?id=${id}" class="boardLink">
            <div class="boardItem">
                <h2 class="title">${title}</h2>              
                <div class="info">
                    <h3 class="date">${dateTimeStr}</h3>
                    <h3 class="views">조회수 <b>${views}</b></h3>
                </div>   
            </div>
            <div class="writerInfo">
            <h2 class="writer">🧑${writerNickname}</h2>
            </div>
            <ol id="answer${id}">
            </ol>
        </a>
    `;
    }


};

export const AnswerItem = (id, date, title, views, writerNickname, boardType,  userPower, userNickname) => {
    //console.log(id, date, title, views, writerNickname, boardType,  userPower, userNickname);
    const checkPower = userPower ? true: false;
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const seconds = dateObj.getSeconds();

    // 날짜 포맷 변경 YYYY-MM-DD
    const dateStr = `${year}-${month}-${day}`;
    // 시간 포맷 변경 hh:mm:ss
    const timeStr = `${hours}:${minutes}:${seconds}`;
    // 날짜와 시간을 합쳐서 YYYY-MM-DD hh:mm:ss
    const dateTimeStr = `${dateStr} ${timeStr}`;
    if (boardType == 'secretQnA' && !checkPower && writerNickname != userNickname){
        return `
            <a>
                <div class="boardItem">
                    <h2 class="title">비밀글 입니다.</h2>
                </div>
            </a>
        `;
    } else{
        return `
        <a class = "answer" href="/board.html?id=${id}" class="boardLink">
            <div class="boardItem">
                <h2 class="title">${title}</h2>
                <div class="info">
                <h3 class="date">${dateTimeStr}</h3>
                    <h3 class="views">조회수 <b>${views}</b></h3>                  
                </div>
            </div>
            <div class="writerInfo">
            <h2 class="writer">🧑${writerNickname}</h2>
            </div>
        </a>
    `;  
    }
};