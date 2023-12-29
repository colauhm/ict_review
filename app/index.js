import { checkInfo, authCheck, ServerUrl, serverSessionCheck, deleteCookie } from './utils/function.js';
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

const secretQnABoardSelector = document.querySelector('.secretQnABoardSelector');
const secretTypeButton = document.getElementById('secretTypeButton');
const secretCheckBox = document.getElementById('secretCheckBox');

const myInfo = await checkInfo(requestBoardListType.category);
const boardList = await boardListLoad();
console.log(boardList);
//--------------------버튼 선택시 다른 버튼은 선택버튼 활성화 나머지버튼 활성화 기능-----------//

async function newSetboards(){
    const newBoardList = await boardListLoad();
    console.log(newBoardList);
    await setBoardItem(newBoardList);
}

async function setDisabledButton(){
    secretTypeButton.disabled = true;
    sortTypebutton.recentSorter.click();
    searchTypeButton.all.click();
    boardCategory.noticeSelector.click();
    searchDetailTypebutton.title.click();
}

function setupButtons(typeButton, listType, methodKey) {
    Object.values(typeButton).forEach(button => {
        button.addEventListener('click', async () => {
            const selectedButtonName = await typeChoice(button, typeButton);

            listType[methodKey] = secretCheckBox.checked && selectedButtonName =='QnA' ? 'secretQnA':selectedButtonName;
            secretCheckBox.checked = listType[methodKey] == 'secretQnA' ?  secretCheckBox.checked:false;
            
            await setSortButton();
            await newSetboards();
        });
    });
}

async function typeChoice(clickedButton, allButtons) {
    const buttonName = clickedButton.name;
    // 클릭된 버튼을 제외한 나머지 버튼들을 활성화(disabled=false)로 설정
    Object.values(allButtons).forEach(button => {
        button.disabled = (button === clickedButton) ? true : false;
    });
    if (clickedButton.classList.contains('selectBoardButton')){
        if (buttonName != 'notice'){
            await authCheck();
        }
        secretQnABoardSelector.style.display = buttonName == 'QnA'?'block':'none'; 
        sortTypebutton.recentSorter.click();
    }
    return buttonName;
}

//-------------------------------게시판 선택 버튼 및 기능-----------------------------------//

document.getElementById('writePost').addEventListener('click', function (){
    window.location.href = "/boardwrite.html";
})

secretCheckBox.addEventListener('click', async () => {
    requestBoardListType.category = secretCheckBox.checked ? 'secretQnA':'QnA';
    await newSetboards();
});

async function setSortButton(){
    const boardType = requestBoardListType.category;
    sortTypebutton.recommendSorter.style.display = boardType == 'free'?'block':'none';
}

//---------------------------------------요소 선택 부분----------------------------------------//

setupButtons(boardCategory, requestBoardListType, 'category');
setupButtons(sortTypebutton, requestBoardListType, 'sortMethod');
setupButtons(searchTypeButton, searchBoardListType, 'category');
setupButtons(searchDetailTypebutton, searchBoardListType, 'datailCategory');

//--------------------------------------보드 요소 불러오기---------------------------------------//

async function boardListLoad(){
    const {category, sortMethod} = requestBoardListType;
    //console.log(requestBoardListType, searchBoardListType);
    const boardList = await fetch(ServerUrl() + '/boards' + `?category=${category}` + `&sortType=${sortMethod}`, {noCORS: true });
    const data = await boardList.json();
    console.log(data);
    return data;
}
const setBoardItem = async (boardData) => {
    const boardList = document.querySelector('.boardList');
    if (boardList && boardData) {
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

setBoardItem(boardList);
changeStatus(statusButton);
setStatusButton(myInfo);
await setDisabledButton();
