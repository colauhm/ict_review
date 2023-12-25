import { authCheck, ServerUrl, getCookie, getUrlId } from './utils/function.js';
import { commentItem } from './components/commentItem.js';

const addCommentButton = document.getElementById('addComment');
const comment = document.getElementById('comment');
const myInfo = await authCheck();

const boardCommponent = {
    title: document.getElementById('title'),
    content: document.getElementById('content'),
    writerNickname: document.getElementById('writerNickname'),
    createdAt: document.getElementById('createdAt'),
    viewCount: document.getElementById('viewCount'),
    recommendCount: document.getElementById('recommedCount'),
    commentCount: document.getElementById('commentCount')
};
const boardId = getUrlId();
const data = await getBoard(boardId);

Object.entries(boardCommponent).forEach(([key, element]) => {
    const detail = data[0][key];
    //console.log(data[0][key], key);
    element.innerHTML += detail;
});

async function getBoard(id) {
    const components = await fetch(ServerUrl() + '/board' + `?id=${id}`, { noCORS: true });
    const data = await components.json();
    return data;
}

addCommentButton.addEventListener('click', async () => {
    await addComment();
    const newCommentList = await getComment(true);
    addNewComment(newCommentList);
});

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
                return commentItem(data.idx, data.createdAt, data.writerNickname, data.content, myInfo);
            })
            .join('');
    }
};

const addNewComment = (newCommentData) => {
    const commentList = document.querySelector('.commentList');
    const addCommentData = commentItem(newCommentData.idx, newCommentData.createdAt, newCommentData.writerNickname, newCommentData.content, myInfo);
    commentList.insertAdjacentHTML('afterbegin', addCommentData);
};

const delectComment = async (commentId) => {
    const response = await fetch(ServerUrl() + `/comment/${commentId}`, {
        method: 'DELETE',
        headers: { session: getCookie('session') }
    });
    console.log(await response.json());
};

const commentList = await getComment(false);

await setComment(commentList);
async function getSelectButton(){
    return document.querySelectorAll('.edit');
}

const selectButton = await getSelectButton();
Object.values(selectButton).forEach(button => {
    button.addEventListener('click', function () {
        const buttonName = button.getAttribute('name');
        if (buttonName == 'commentDelect'){
            delectComment(button.id);
            alert('댓글이 삭제되었습니다.')
            window.location.href = (`/board.html?id=${boardId}`);
        }
    });
});
