import { authCheck, getCookie, getQueryString, ServerUrl } from './utils/function.js';

const boardInputdata = {
    title :  document.getElementById('title'),
    content : document.getElementById('content')
}

const boardComponent = {
    title :'',
    content : '',
    type : '',
    fileName: '',
    filePath: '',
}

const selectBoardButton = document.querySelector('.selectBoardButton');
const secretQnABoardSelector = document.querySelector('.secretQnABoardSelector');
const secretTypeButton = document.getElementById('secretTypeButton');
const secretCheckBox = document.getElementById('secretCheckBox');

const boardCategory = {
    noticeSelector : document.getElementById('noticeSelector'),
    freeBoardSelector :  document.getElementById('freeBoardSelector'),
    QnABoardSelector :  document.getElementById('QnABoardSelector'),
}

const req = await fetch(ServerUrl() + '/checkSession', { headers: { session: getCookie('session') } });
const myInfo = await req.json();
const managerCheck = myInfo.power ? false : true;
console.log(managerCheck);
console.log(myInfo.power);


async function setupNoticeButton(){
    boardComponent.type = managerCheck ? 'free':'notice';
    boardCategory.freeBoardSelector.disabled = managerCheck;
    boardCategory.noticeSelector.disabled = true;
}



function setupButtons(typeButton, listType, methodKey) {
    Object.values(typeButton).forEach(button => {
        button.addEventListener('click', async () => {
            const selectedButtonName = await typeChoice(button, typeButton);
            listType[methodKey] = selectedButtonName;
        });
    });
}

async function typeChoice(clickedButton, allButtons) {
    // 클릭된 버튼을 제외한 나머지 버튼들을 활성화(disabled=false)로 설정
    Object.values(allButtons).forEach(button => {
        button.disabled = (button === clickedButton) ? true : false;
    });
    if (managerCheck){
        boardCategory.noticeSelector.disabled = managerCheck;
    }
    return clickedButton.name;
}

selectBoardButton.addEventListener('click', async () => {
    QnAcheck(boardComponent.type);
});

function QnAcheck(boardType){
    if (boardType == 'QnA' || boardType == 'secretQnA'){
        secretQnABoardSelector.style.display = 'block';
        boardComponent.type = secretCheckBox.checked ? 'secretQnA':'QnA';
        
    } else {
        secretQnABoardSelector.style.display = 'none';
    }

    
}
//-----------------------------------게시글 유형 선택-------------------------------------------//

setupButtons(boardCategory, boardComponent, 'type');
secretTypeButton.disabled = true;


//------------------------------------게시글 작성 요청---------------------------------------//

const writerRquest = {
    completed : document.getElementById('completed'),
    cancel : document.getElementById('cancel')
}

Object.values(writerRquest).forEach(buttonElement => {
    buttonElement.addEventListener('click',postOrCancel);
});


async function postOrCancel(){
    getWriteData();
    const currentbuttonId = this.id;
    if (currentbuttonId == 'cancel'){
        alert('작성취소 메인페이지로 이동합니다.')
        window.location.href = "/";
    } else if (boardComponent.title && boardComponent.content) {
        
        postWriteData();
        alert('작성완료 메인페이지로 이동합니다.');
        window.location.href = "/";
    } else {
        alert('필요내용을 전부 작성하지 않았습니다.');
    }
}
function getWriteData() {
    boardComponent.title = boardInputdata.title.value;
    boardComponent.content = boardInputdata.content.value;
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
        const response = await fetch(ServerUrl() + '/upload', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        boardComponent.fileName = result.fileName;
        boardComponent.filePath = result.filePath;

        // 업로드 성공 시 추가 작업 수행
        alert('파일이 업로드되었습니다.');
    } catch (error) {
        console.error('파일 업로드 오류:', error);
        alert('파일 업로드에 실패했습니다.');
    }
}
async function postWriteData(){
    const {...props} = boardComponent;
    console.log(props);
    const response = await fetch(ServerUrl() + '/postBoard', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            session: getCookie('session')
        },
        body: JSON.stringify(props)
    });

    // 서버로부터 응답을 받음
    const result = await response.json();
    console.log(result);

}
//-----------------------------------------------------------------------------//




await authCheck();
await setupNoticeButton();

