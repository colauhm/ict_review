import { checkInfo, authCheck, ServerUrl, deleteCookie } from './utils/function.js';
import { BoardItem, AnswerItem } from './components/boardItem.js';
import { setupWebSocket } from './utils/websocket.js';
const searchButtons = document.querySelector('.searchButtons');
const searchCheck = document.getElementById('searchCheck');
const selectButtons = document.querySelector('.seclectButtons');
const searchType = document.querySelector('.searchType');
const visitorCheckBox = document.getElementById("visitorCheck");
const visitorList = document.getElementById("visitorList");

const requestBoardListType = {
    category : 'notice',
    sortMethod : 'boardCreatedAt'
}


const searchBoardListType = {
    category : 'all',
    datailCategory : 'b.title',
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
    nickname : document.getElementById('writerSearchButton')
}

const statusButton = {
    login : document.getElementById('login'),
    signup : document.getElementById('signup'),
    logout : document.getElementById('logout')
}

const secretQnABoardSelector = document.querySelector('.secretQnABoardSelector');
const secretCheckBox = document.getElementById('secretCheckBox');

const myInfo = await checkInfo(requestBoardListType.category);
const userNickname = myInfo.nickname ? myInfo.nickname : 'visit'
const boardList = await boardListLoad();
console.log(myInfo.nickname);
//--------------------버튼 선택시 다른 버튼은 선택버튼 활성화 나머지버튼 활성화 기능-----------//

async function newSetboards(){
    const newBoardList = await boardListLoad();
    await setBoardItem(newBoardList);
    answerCheck(newBoardList);
    //console.log(newBoardList);
}

async function setDisabledButton(){
    //secretTypeButton.disabled = true;
    sortTypebutton.recentSorter.click();
    searchTypeButton.all.click();
    boardCategory.noticeSelector.click();
    searchDetailTypebutton.title.click();
}

function setupButtons(typeButton, listType, methodKey) {
    Object.values(typeButton).forEach(button => {
        button.addEventListener('click', async () => {
            const selectedButtonName = await typeChoice(button, typeButton);
            
            console.log(selectedButtonName, searchCheck.checked);
            if(searchCheck.checked){
                if (typeButton == searchDetailTypebutton){
                    const detail = selectedButtonName == 'nickname' ? 'u.':'b.';
                    listType[methodKey] = detail + selectedButtonName;
                } else {
                    listType[methodKey] = selectedButtonName;
                }
                await setSearchboard();
            }else {

                listType[methodKey] = secretCheckBox.checked && selectedButtonName =='QnA' ? 'secretQnA':selectedButtonName;
                secretCheckBox.checked = listType[methodKey] == 'secretQnA' ?  secretCheckBox.checked:false;
                console.log(listType);
                await setSortButton();
                await newSetboards();
            }
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
        secretQnABoardSelector.style.display = buttonName == 'QnA'?'flex':'none'; 
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
    const boardList = await fetch(ServerUrl() + '/boards' + `?category=${category}` + `&detail=${sortMethod}` + '&type=sort' + '&searchContent=', {noCORS: true });
    const data = await boardList.json();
    //console.log(data);
    return data;
}

async function searchListLoad(){
    const boardList = await fetch(ServerUrl() + '/boards' + `?category=${searchBoardListType.category}` + `&detail=${searchBoardListType.datailCategory}` + '&type=search' + `&searchContent=${searchBoardListType.searchContent}`, {noCORS: true });
    const data = await boardList.json();
   
    return data;
}

const setBoardItem = async (boardData) => {
    const boardList = document.querySelector('.boardList');
    if (boardList && boardData) {
        boardList.innerHTML = boardData
            .map((data) => {
                if(!data.answer){

                    return BoardItem(data.boardId, data.boardCreatedAt, data.boardTitle, data.boardViewCount, data.boardRecommendCount, data.userNickname, data.boardType, myInfo.power, myInfo.nickname);
                }
            })
            .join('');
    }
      // 모든 a 태그에 이벤트 리스너 등록
    const links = document.querySelectorAll('.boardLink');
        links.forEach(function(link) {
        link.addEventListener('click', handlePageTransition);
    });
    
};

function setAnswerItem(boardData, id) {
    console.log(boardData);
    const answerList = document.getElementById(`answer${id}`);
    console.log(answerList);
    if (answerList && boardData) {
        console.log(boardData);
        answerList.innerHTML += AnswerItem(boardData.boardId, boardData.boardCreatedAt, boardData.boardTitle, boardData.boardViewCount, boardData.userNickname, boardData.boardType, myInfo.power, myInfo.nickname);
    }
}
function answerCheck(boardData){
    //console.log(boardData);
    boardData.forEach(function(data) {
        if (data.answer) {
            console.log(data.answer)
            setAnswerItem(data, data.answer);
        }
    });
}

//----------------------------------검색기능 구현--------------------------------------------------//

async function setSearchboard(){
    searchBoardListType.searchContent = searchContent.value;
    const searchList = await searchListLoad();
    console.log(searchList);
    await setBoardItem(searchList);
    answerCheck(searchList);
}

const searchContent = document.querySelector('.searchInput');
searchCheck.addEventListener("change", async() => {
    searchType.style.display = searchCheck.checked?'flex':'none';
    selectButtons.disabled = searchCheck.checked ? true:false;
    selectButtons.style.display = searchCheck.checked ? "none":"flex";
    if (searchCheck.checked){
        await setSearchboard();
    } else{
        await newSetboards();
    }
});

searchContent.addEventListener("input", async() => {
    if (searchCheck.checked){
        await setSearchboard();
    }
});

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
function visitorListShowCheck(){
    visitorList.style.display = "none";
    visitorCheckBox.addEventListener("change" ,() => {
        console.log(visitorCheckBox.checked)
        if(visitorCheckBox.checked){
            visitorList.style.display = "block";
        } else{
            visitorList.style.display = "none";
        }
    });
    
    
}
function setShowButton(data){
    //console.log(data);
    searchType.style.display = searchCheck.checked?'flex':'none';
    statusButton.login.style.display = data? 'none':'block';
    statusButton.signup.style.display = data? 'none':'block';
    statusButton.logout.style.display = data? 'block':'none';
    if (!data){
        searchButtons.innerHTML = "";
    }
    document.querySelector('.changeStatus').style.display = 'flex';
}

function handlePageTransition(event) {
    event.preventDefault();
    
    const targetPage = event.target.closest('a');
    targetPage.style.opacity = 1;
    targetPage.classList.remove('fade-in-animation');
    // 현재 페이지에 애니메이션 클래스 추가
    targetPage.classList.add('fade-out-animation');
  
    // // // // 애니메이션이 완료되면 페이지 이동
    targetPage.addEventListener('animationend', function() {
        targetPage.classList.remove('fade-out-animation');
        targetPage.classList.add('fade-in-animation');
    window.location.href = targetPage;
   }, { once: true });
}
function applySequentialAnimation() {
    const boardListItems = document.querySelector('.boardList');
    const listItems = boardListItems.querySelectorAll('a');
    listItems.forEach(function (item, index) {
    setTimeout(function () {
        console.log(item);
        item.classList.add('fade-in-animation');
        console.log(index)
    }, index * 500); // 각 항목마다 0.5초 간격으로 순차 적용
    });
}

setBoardItem(boardList);
changeStatus(statusButton);
setShowButton(myInfo);
await setDisabledButton();

visitorListShowCheck();
setTimeout(() => {
    applySequentialAnimation();
}, 3000);
setupWebSocket(userNickname);
