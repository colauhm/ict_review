export const commentItem = (commentIdx, date, commentWriter, content, commentWriterInfo, checkBoardWriter) =>{
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const seconds = dateObj.getSeconds();
    //info는 댓글 작성자 정보
    // 날짜 포맷 변경 YYYY-MM-DD
    const dateStr = `${year}-${month}-${day}`;
    // 시간 포맷 변경 hh:mm:ss
    const timeStr = `${hours}:${minutes}:${seconds}`;
    console.log(checkBoardWriter);
    // 날짜와 시간을 합쳐서 YYYY-MM-DD hh:mm:ss
    const dateTimeStr = `${dateStr} ${timeStr}`;
    if (commentWriterInfo.id != commentWriter && commentWriterInfo.power == null && !checkBoardWriter){
        return`
        <div class="commentItem" id=${commentIdx}> 
            <div class="info">
                <h2 class="writer">${commentWriter}</h2>
                <p class="content">${content}</p>
                <p class="date">${dateTimeStr}</p>
            </div>
        </div>
        `;
    } else{
        return`
        <div class="commentItem" id=${commentIdx}>
            <div class="info">
                <h2 class="writer">${commentWriter}</h2>
                <p class="content">${content}</p>
                <p class="date">${dateTimeStr}</p>
            </div>
            <div>
                <button class="edit" name="commentDelect" id ="${commentIdx}">삭제</button>
            </div>
        </div>
        `;
    }    
};