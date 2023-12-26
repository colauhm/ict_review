export const BoardItem = (id, date, title, views, recommeds, writer, boardType) => {
    // 파라미터 값이 없으면 리턴
    if (!date || !title || views == undefined || recommeds == undefined || !writer) {
        // 없는 데이터 콘솔로 출력
        // console.log(date, title, views, imgUrl, writer);
    }

    // 날짜 포맷 변경 YYYY-MM-DD hh:mm:ss
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
    if (boardType == 'free'){
        return `
        <a href="/board.html?id=${id}">
            <div class="boardItem">
                <h2 class="title">${title}</h2>
                <div class="info">
                    <h3 class="views">조회수 <b>${views}</b></h3>
                    <h3 class="commends">추천수 <b>${recommeds}</b></h3>
                    <p class="date">${dateTimeStr}</p>
                </div>
                <div class="writerInfo">
                    <h2 class="writer">${writer}</h2>
                </div>
            </div>
        </a>
    `;
    } else{
        return `
        <a href="/board.html?id=${id}">
            <div class="boardItem">
                <h2 class="title">${title}</h2>
                <div class="info">
                    <h3 class="views">조회수 <b>${views}</b></h3>
                    <p class="date">${dateTimeStr}</p>
                </div>
                <div class="writerInfo">
                    <h2 class="writer">${writer}</h2>
                </div>
            </div>
        </a>
    `;
    }


};
