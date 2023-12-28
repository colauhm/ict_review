import { authCheck, ServerUrl, getCookie, getUrlId, serverSessionCheck } from './utils/function.js';
import { commentItem } from './components/commentItem.js';



const addCommentButton = document.getElementById('addComment');
const recommend = document.querySelector('.recommend');



const boardCommponent = {
    title: document.getElementById('title'),
    content: document.getElementById('content'),
    writerNickname: document.getElementById('writerNickname'),
    createdAt: document.getElementById('createdAt'),

};


const boardId = getUrlId();
const boardData = await getBoard(boardId);
console.log(boardData[0]);
const boardType = boardData[0]['type'];
const myInfo = boardType == 'notice'? await serverSessionCheck():await authCheck();
const checkBoardWriter = myInfo.idx == boardData[0]['writerId'];
const commentList = await getComment(false);
const recommendExist = await recommendData(boardId);

Object.entries(boardCommponent).forEach(([key, element]) => {
    const detail = boardData[0][key];
    element.innerHTML += detail;
});

async function recordStatus(boardId, recordType, recommend){
    const recordData = {
        boardId :boardId,
        recordType : recordType,
        recommend : recommend
    }
    console.log(recordData);
    const response = await fetch(ServerUrl() + '/recordData' , {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            session: getCookie('session')
        },
        body: JSON.stringify(recordData)
    });
}

async function recommendData(boardId){

    const response = await fetch(ServerUrl() + '/recommendData' + `?boardId=${boardId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            session: getCookie('session')
        },
    })
    const data = await response.json();
    console.log(data);  
    return data;
}

async function getBoard(id) {
    const components = await fetch(ServerUrl() + '/board' + `?id=${id}`, { noCORS: true });
    const data = await components.json();
    return data;
}

async function boardCommentCount(id){
    const res = await fetch(ServerUrl() + '/boardCommentCount' + `?id=${id}`, { noCORS: true });
    const data = await res.json();
    console.log(res);
    return data;
}

async function boardRecommendCount(id){
    const res = await fetch(ServerUrl() + '/boardRecommendCount' + `?id=${id}`, { noCORS: true });
    const data = await res.json();
    //console.log(data);
    return data;
}

async function addComment(){
    const content = {
        boardId : getUrlId(),
        content : comment.value
    }
    console.log(content);
    const response = await fetch(ServerUrl() + '/comment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            session: getCookie('session')
        },
        body: JSON.stringify(content)
    });
    const result = await response.json();
    console.log(result);
}

async function getComment(last){
    const boardId = getUrlId();
    const commentElement = await fetch(ServerUrl() + '/comment' + `?id=${boardId}` +`&&last=${last}`, {noCORS: true});
    const data = await commentElement.json();
    return data;
}

const setComment = async (commentData) => {
    const commentList = document.querySelector('.commentList');
    if (commentList && commentData) {
        console.log(commentData);
        commentList.innerHTML = '';
        commentList.innerHTML = commentData
            .map((data) => {
                return commentItem(data.idx, data.createdAt, data.writerNickname, data.content, myInfo, checkBoardWriter);
            })
            .join('');
    }
};

const addNewComment = (newCommentData) => {
    const commentList = document.querySelector('.commentList');
    const addCommentData = commentItem(newCommentData.idx, newCommentData.createdAt, newCommentData.writerNickname, newCommentData.content, myInfo, checkBoardWriter);
    commentList.insertAdjacentHTML('afterbegin', addCommentData);
    comment.value = '';
};

const delectComment = async (commentId) => {
    const response = await fetch(ServerUrl() + `/comment/${commentId}`, {
        method: 'DELETE',
        headers: { session: getCookie('session') }
    });
    console.log(await response.json());
};

async function getSelectButton(){
    return document.querySelectorAll('.edit');
}

addCommentButton.addEventListener('click', async () => {
    await addComment();
    const newCommentList = await getComment(true);
    addNewComment(newCommentList);
});

async function editButton(){
    getSelectButton()
    .then((selectButton) => {
        Object.values(selectButton).forEach(button => {
            button.addEventListener('click', function () {
                const buttonName = button.getAttribute('name');
                console.log(buttonName);
                if (buttonName === 'commentDelect') {
                    delectComment(button.id);
                    alert('댓글이 삭제되었습니다.');
                    window.location.href = `/board.html?id=${boardId}`;
                }
            });
        });

    })
}

async function showElementCheck(boardType){
    const commentCount = document.querySelector('.commentCount');
    const wirteComment = document.querySelector('.writeComment');
    const recommendElement = document.querySelector('.recommedCount');
    const viewCount = document.querySelector('.viewCount');
    viewCount.innerHTML += boardData[0]['viewCount'] ? boardData[0]['viewCount']:0; 
    if (boardType == 'free'){
        recommend.innerHTML = checkBoardWriter ? "":recommend.innerHTML;
        commentCount.innerHTML += boardData[0]['commentCount'];
        recommendElement.innerHTML += boardData[0]['recommendCount']
        const recommendCheckBox = document.getElementById('recommendCheckBox');
        console.log( boardData[0]['viewCount']);
        recommendCheckBox.checked = recommendExist['recommendStatus'];
        recommend.addEventListener('click', async() => {
            console.log(recommendCheckBox.checked);
            await recordStatus(boardId, 'recommend', recommendCheckBox.checked);
        });
    } else {
        recommendElement.innerHTML = "";
        recommend.innerHTML = "";
        commentCount.innerHTML = "";
        wirteComment.innerHTML = "";
    }
}

await recordStatus(boardId, 'time', null);
await showElementCheck(boardType);
await setComment(commentList);
await editButton();
