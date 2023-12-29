import { checkInfo, ServerUrl, getCookie, getUrlId, serverSessionCheck} from './utils/function.js';
import { commentItem } from './components/commentItem.js';


const boardId = getUrlId();

const showElement = {

    addCommentButton : document.getElementById('addComment'),
    recommendCheckBox : document.getElementById('recommendCheckBox'),
    commentCountData : document.getElementById('commentCountData'),
    recommendCountData : document.getElementById('recommendCountData'),
    viewCountData : document.getElementById('viewCountData'),
    wirteComment : document.querySelector('.writeComment'),
    commentCount : document.querySelector('.commentCount'),
    recommendCount : document.querySelector('.recommendCount'),
    recommend : document.querySelector('.recommend')
    
}

const boardCommponent = {
    title: document.getElementById('title'),
    content: document.getElementById('content'),
    writerNickname: document.getElementById('writerNickname'),
    createdAt: document.getElementById('createdAt'),

};

const boardEdit = {
    boardChangeButtons : document.querySelector('.boardChangeButtons'),
    boardEditButton :document.getElementById('editButton'),
    boardDeleteButton :document.getElementById('deleteButton')
}

if (await serverSessionCheck()){recordStatus(boardId, 'time', null);}

const boardData = await getBoard(boardId);
const boardType = boardData[0]['type'];
const myInfo = await checkInfo(boardType)
const checkBoardWriter = myInfo.idx == boardData[0]['writerId'];
const commentList = await getComment(false);


async function setNewRecommendCountData(){
    const newBoardData =  await getBoard(boardId);
    showElement.recommendCountData.innerHTML = newBoardData[0]['recommendCount']; 
} 

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
    await fetch(ServerUrl() + '/recordData' , {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            session: getCookie('session')
        },
        body: JSON.stringify(recordData)
    });
}

async function getBoard(boardId) {
    //console.log(boardId);
    const components = await fetch(ServerUrl() + '/board' + `?boardId=${boardId}`, { headers: {session: getCookie('session')}});
    const data = await components.json();
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

const delectComment = async (commentId) => {
    const response = await fetch(ServerUrl() + `/comment/${commentId}`, {
        method: 'DELETE',
        headers: { session: getCookie('session') }
    });
    console.log(await response.json());
};

const delectBoard = async (boardId) => {
    const response = await fetch(ServerUrl() + `/board/${boardId}`, {
        method: 'DELETE',
        headers: { session: getCookie('session') }
    });
    console.log(await response.json());
}

async function getSelectButton(){
    return document.querySelectorAll('.edit');
}

showElement.addCommentButton.addEventListener('click', async () => {
    await addComment();
    alert('댓글이 작성되었습니다.');
    window.location.href = `/board.html?id=${boardId}`;
});

async function commentEditButton(){
    getSelectButton()
    .then((selectButton) => {
        Object.values(selectButton).forEach(button => {
            button.addEventListener('click', function () {
                const buttonName = button.getAttribute('name');
                console.log(buttonName);
                if (buttonName === 'commentDelect') {
                    const result = window.confirm("댓글을 삭제하시겠습니까?");
                    if(result){
                        delectComment(button.id);
                        alert('댓글이 삭제되었습니다.');
                        window.location.href = `/board.html?id=${boardId}`;
                    } else {
                        alert('삭제가 취소되었습니다.');
                    }
                }
            });
        });

    })
}

async function displayElement(boardType){
    Object.values(showElement).forEach(element => {
        if (element instanceof Node && boardType != 'free'){
            element.innerHTML = "";
        }
    });
    if (checkBoardWriter){
        showElement.recommend.innerHTML = "";

    } else {
        showElement.recommendCheckBox.checked = boardData[0]['recommendStatus'];  
    }
}

async function showElementCheck(boardType){ 
    displayElement(boardType);
    showElement.viewCountData.innerHTML = boardData[0]['viewCount']; 
    showElement.commentCountData.innerHTML = boardData[0]['commentCount'];
    showElement.recommendCountData.innerHTML = boardData[0]['recommendCount']; 
}

showElement.recommendCheckBox.addEventListener('change', async () => {
    const isChecked = showElement.recommendCheckBox.checked;
    const recommendValue = isChecked ? true : false;
    console.log(recommendValue);
    await recordStatus(boardId, 'recommend', recommendValue);
    await setNewRecommendCountData();
});

boardEdit.boardDeleteButton.addEventListener('click', () => {
    const result = window.confirm('게시글을 삭제하시겟습니까?');
    if (result){
        delectBoard(boardId);
        alert('게시글이 삭제되었습니다.');
        window.location.href = '/';
    } else {
        alert('게시글 삭제가 취소되었습니다.');
    }
});

async function boardEditButtonSet(){
    if (!(checkBoardWriter /*&&답글이 안달렸다면*/)){
        boardEdit.boardChangeButtons.innerHTML = ""
    }
}


await showElementCheck(boardType);
await setComment(commentList);
await commentEditButton();
await boardEditButtonSet();
