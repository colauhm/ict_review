import { authCheck, ServerUrl, getCookie, getUrlId, serverSessionCheck } from './utils/function.js';
import { commentItem } from './components/commentItem.js';


const wirteComment = document.querySelector('.writeComment');

const boardCommponent = {
    title: document.getElementById('title'),
    content: document.getElementById('content'),
    writerNickname: document.getElementById('writerNickname'),
    createdAt: document.getElementById('createdAt'),
    viewCount: document.getElementById('viewCount'),
    recommendCount: document.getElementById('recommedCount'),
};
const boardId = getUrlId();
const data = await getBoard(boardId);
const boardType = data[0]['type'];
const myInfo = boardType == 'notice'? await serverSessionCheck():await authCheck();
console.log(data);

const commentList = await getComment(false);

Object.entries(boardCommponent).forEach(([key, element]) => {
    const detail = data[0][key];
    element.innerHTML += detail;
});

async function getBoard(id) {
    const components = await fetch(ServerUrl() + '/board' + `?id=${id}`, { noCORS: true });
    const data = await components.json();
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
        //console.log(commentData);
        commentList.innerHTML = '';
        commentList.innerHTML = commentData
            .map((data) => {
                return commentItem(data.idx, data.createdAt, data.writerNickname, data.content, myInfo);
            })
            .join('');
    }
};

const addNewComment = (newCommentData) => {
    const commentList = document.querySelector('.commentList');
    const addCommentData = commentItem(newCommentData.idx, newCommentData.createdAt, newCommentData.writerNickname, newCommentData.content, myInfo, data.writerId);
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

async function showElementCheck(boardType){
    
    if (boardType == 'free'){
        
        const commentCount = document.querySelector('.commentCount');
        //console.log(data[0]['commentCount']);
        commentCount.innerHTML = `댓글 수 ${data[0]['commentCount']}`;
        wirteComment.innerHTML = `
            <textarea placeholder="댓글을 작성해주세요!" id="comment"></textarea>
            <button id="addComment">댓글 작성</button>
            `
        const addCommentButton = document.getElementById('addComment');    
        addCommentButton.addEventListener('click', async () => {
            await addComment();
            const newCommentList = await getComment(true);
            addNewComment(newCommentList);
        });
        await setComment(commentList);
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
        .catch((error) => {
            console.error(error);
        });

    }
}
await showElementCheck(boardType);
