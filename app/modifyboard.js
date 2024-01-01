
import{getUrlId, getBoard, authCheck, ServerUrl, getCookie} from './utils/function.js';

const boardId = getUrlId();
const originalContnet = await getBoard(boardId, false);
const myInfo = await authCheck();
console.log(myInfo)
console.log(originalContnet[0])

function writerCheck (){
    if (myInfo.idx != originalContnet[0]["writerId"]){
        alert("허용되지 않은 접근입니다.");
        window.location.href = "/"
    }
}

const boardComponent = {
    title : document.getElementById('title'),
    content : document.getElementById('content')
}

const modifyRequestButton = {
    modify : document.getElementById('modify'),
    cancel : document.getElementById('cancel')
}

const boardInputdata = {
    title : "",
    content : "",
    type : '',
    fileName : '',
    filePath : '',
    updateType : 'modify',
    boardId : boardId
}

const fileInput = document.getElementById('fileInput');
const fileUploadButton = document.getElementById('fileUpload');
fileUploadButton.addEventListener('click', function() {
    // 파일이 선택되었는지 확인
    if (fileInput.files.length > 0) {
        // FormData 객체 생성
        const formData = new FormData();
        // 파일 추가
        formData.append('file', fileInput.files[0]);
        // 서버로 파일 업로드 요청
        uploadFile(formData);
    } else {
        alert('파일을 선택해주세요.');
    }
});
async function uploadFile(formData) {
    try {
        const response = await fetch(ServerUrl() + '/upload' + `/${boardId}`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        boardInputdata.fileName = result.fileName;
        boardInputdata.filePath = result.filePath;

        // 업로드 성공 시 추가 작업 수행
        alert('파일이 업로드되었습니다.');
    } catch (error) {
        console.error('파일 업로드 오류:', error);
        alert('파일 업로드에 실패했습니다.');
    }
}

function setOriginalContnet(){
    boardComponent.title.value = originalContnet[0]['title'];
    boardComponent.content.value = originalContnet[0]['content'];
}

function getWriteData(){
    boardInputdata.title = boardComponent.title.value;
    boardInputdata.content = boardComponent.content.value;
}

Object.values(modifyRequestButton).forEach(buttonElement => {
    buttonElement.addEventListener('click',modifyOrCancel);
});
function modifyOrCancel(){
    getWriteData();
    const buttonId = this.id;
    if (buttonId == 'cancel'){
        alert('수정취소 이전페이지로 이동합니다.')
        window.location.href = `/board.html?id=${boardId}`;
    } else if (boardInputdata.title && boardInputdata.content) {
        updateBoard();
        alert('수정완료 이전페이지로 이동합니다.');
        window.location.href = `/board.html?id=${boardId}`;
    } else {
        alert('필요내용을 전부 작성하지 않았습니다.');
    }

}

async function updateBoard(){
    const {...props} = boardInputdata;
    console.log(props);
    const response = await fetch(ServerUrl() + '/board', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            session: getCookie('session')
        },
        body: JSON.stringify(props)
    });

    const result = await response.json();
    console.log(result);
}

writerCheck();
setOriginalContnet();
