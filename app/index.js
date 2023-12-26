import { authCheck, ServerUrl, serverSessionCheck, deleteCookie } from './utils/function.js';
import { BoardItem } from './components/boardItem.js';
const requestBoardListType = {
    category : 'notice',
    sortMethod : 'boardCreatedAt'
}

const searchBoardListType = {
    category : 'all',
    datailCategory : 'title',
    searchContent : ''
}

const sortTypebutton = {
    recentSorter: document.getElementById('recentSorter'),
    viewSorter: document.getElementById('viewSorter'),
    recommendSorter: document.getElementById('recommendSorter')
};

const boardCategory = {
    noticeSelector :  document.getElementById('noticeSelector'),
    freeBoardSelector :  document.getElementById('freeBoardSelector'),
    QnABoardSelector :  document.getElementById('QnABoardSelector'),
}

const searchTypeButton = {
    all : document.getElementById('allSerchButton'),
    notice : document.getElementById('noticeSearchButton'),
    free : document.getElementById('freeBoardSearchButton'),
    QnA : document.getElementById('QnABoardSearchButton')
}

const searchDetailTypebutton = {
    title : document.getElementById('titleSearchButton'),
    content : document.getElementById('contentSearchButton'),
    writer : document.getElementById('writerSearchButton')
}

const statusButton = {
    login : document.getElementById('login'),
    signup : document.getElementById('signup'),
    logout : document.getElementById('logout')
}

const selectBoardButtons = document.querySelector('.selectBoardButtons');
const secretQnABoardSelector = document.querySelector('.secretQnABoardSelector');
const secretTypeButton = document.getElementById('secretTypeButton');
const secretCheckBox = document.getElementById('secretCheckBox');

const myInfo = requestBoardListType.category == 'notice'? await serverSessionCheck():await authCheck();
console.log(myInfo);

//--------------------버튼 선택시 다른 버튼은 선택버튼 활성화 나머지버튼 활성화 기능-----------//

function setupButtons(firstButton, typeButton, listType, methodKey) {
    firstButton.disabled = true;
    Object.values(typeButton).forEach(button => {
        button.addEventListener('click', async () => {
            console.log(button, typeButton);
            const selectedButtonName = await typeChoice(button, typeButton);
            listType[methodKey] = selectedButtonName;
            const newBoardList = await boardListLoad();
            setBoardItem(newBoardList);
            //console.log(requestBoardListType);
            //console.log(searchBoardListType);
        });
    });
}

async function typeChoice(clickedButton, allButtons) {
    // 클릭된 버튼을 제외한 나머지 버튼들을 활성화(disabled=false)로 설정
    Object.values(allButtons).forEach(button => {
        button.disabled = (button === clickedButton) ? true : false;
    });
    //console.log(clickedButton.name);
    return clickedButton.name;
}

//-------------------------------게시판 선택 버튼 및 기능-----------------------------------//

document.getElementById('writePost').addEventListener('click', function (){
    window.location.href = "/boardwrite.html";
})

secretTypeButton.disabled = true;

setupButtons(boardCategory.noticeSelector, boardCategory, requestBoardListType, 'category');

selectBoardButtons.addEventListener('click', async () => {
    const boardType = requestBoardListType.category
    QnAcheck(boardType);
    typeChoice(sortTypebutton.recentSorter, sortTypebutton)
    if (boardType != 'notice'){
        await authCheck();
    }

});
QnAcheck(requestBoardListType.category);

function QnAcheck(boardType){
    if (boardType == 'QnA' || boardType == 'secretQnA'){
        secretQnABoardSelector.style.display = 'block';
        sortTypebutton.recommendSorter.style.display = 'none';
        secretQnAcheck();
        
    } else {
        secretQnABoardSelector.style.display = 'none';
        sortTypebutton.recommendSorter.style.display = boardType == 'notice'? 'none':'block';
    }
    
}

async function secretQnAcheck(){
    requestBoardListType.category = secretCheckBox.checked ? 'secretQnA':'QnA';
    //console.log( requestBoardListType.category);
    sortTypebutton.viewSorter.style.display = requestBoardListType.category == 'secretQnA'?'none':'block';
    const newBoardList = await boardListLoad();
    setBoardItem(newBoardList);
}

//---------------------------------------정렬 선택 부분----------------------------------------//


setupButtons(sortTypebutton.recentSorter, sortTypebutton, requestBoardListType, 'sortMethod');

//-------------------------------------검색 기준 선택 부분-------------------------------------//


setupButtons(searchTypeButton.all, searchTypeButton, searchBoardListType, 'category');
setupButtons(searchDetailTypebutton.title, searchDetailTypebutton, searchBoardListType, 'datailCategory');

//--------------------------------------보드 요소 불러오기---------------------------------------//

async function boardListLoad(){
    const {category, sortMethod} = requestBoardListType;
    //console.log(requestBoardListType, searchBoardListType);
    const boardList = await fetch(ServerUrl() + '/boards' + `?category=${category}` + `&sortType=${sortMethod}`, {noCORS: true });
    const data = await boardList.json();
    //console.log(data);
    return data;
}
const setBoardItem = async (boardData) => {
    const boardList = document.querySelector('.boardList');
    if (boardList && boardData) {
        //
        //console.log(boardData);
        boardList.innerHTML = '';
        boardList.innerHTML = boardData
            .map((data) => {
                return BoardItem(data.boardId, data.boardCreatedAt, data.boardTitle, data.boardViewCount, data.boardRecommendCount, data.userNickname, data.boardType, myInfo.power, myInfo.nickname);
            })
            .join('');
    }
};

//--------------------------------세션 유무에 따라 보이는 버튼 다르게-----------------------------//

function changeStatus(allButtons){
    Object.values(allButtons).forEach(button => {
        button.addEventListener('click', () =>{
            if (button.id == 'logout'){
                deleteCookie('session');
                alert('logout 됩니다.')
                window.location.href = '/';
            } else {
                window.location.href = `${button.id}.html`;
            }
        });
    });
}


function setStatusButton(data){
    console.log(data);
    statusButton.login.style.display = data? 'none':'block';
    statusButton.signup.style.display = data? 'none':'block';
    statusButton.logout.style.display = data? 'block':'none';
    document.querySelector('.changeStatus').style.display = 'flex';
}


changeStatus(statusButton);
setStatusButton(myInfo);
const boardList = await boardListLoad();
setBoardItem(boardList);

