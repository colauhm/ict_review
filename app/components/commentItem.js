export const commentItem = (idx, date, writer, content, info) =>{
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
    if (info.id != writer && info.power == null){
        return`
        <div class="commentItem" id=${idx}> 
            <div class="info">
                <h2 class="writer">${writer}</h2>
                <p class="content">${content}</p>
                <p class="date">${dateTimeStr}</p>
            </div>
        </div>
        `;
    } else{
        return`
        <div class="commentItem" id=${idx}>
            <div class="info">
                <h2 class="writer">${writer}</h2>
                <p class="content">${content}</p>
                <p class="date">${dateTimeStr}</p>
            </div>
            <div>
                <button class="edit" name="commentChange" id="${idx}">수정</button>
                <button class="edit" name="commentDelect" id ="${idx}">삭제</button>
            </div>
        </div>
        `;
    }    
};