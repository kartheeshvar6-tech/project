const board = document.getElementById("board");
const statusText = document.getElementById("status");
const historyList = document.getElementById("historyList");

const modeSelect = document.getElementById("mode");
const boardSizeSelect = document.getElementById("boardSize");

const restartBtn = document.getElementById("restartBtn");
const newGameBtn = document.getElementById("newGameBtn");

const timerDisplay = document.getElementById("timer");

const winSound = document.getElementById("winSound");
const loseSound = document.getElementById("loseSound");

let currentPlayer = "X";
let gameActive = true;
let gameState = [];
let boardSize = 3;
let timer = 0;
let timerInterval;

let scores = JSON.parse(localStorage.getItem("tttScores")) || {
    x:0,
    o:0,
    draw:0
};

function updateScoreboard(){
    document.getElementById("xScore").textContent = scores.x;
    document.getElementById("oScore").textContent = scores.o;
    document.getElementById("drawScore").textContent = scores.draw;

    localStorage.setItem("tttScores", JSON.stringify(scores));
}

function startTimer(){
    clearInterval(timerInterval);
    timer = 0;

    timerInterval = setInterval(()=>{
        timer++;
        timerDisplay.textContent = timer;
    },1000);
}

function createBoard(){

    boardSize = parseInt(boardSizeSelect.value);

    gameState = Array(boardSize * boardSize).fill("");

    board.innerHTML = "";

    board.style.gridTemplateColumns =
        `repeat(${boardSize}, 1fr)`;

    for(let i=0;i<gameState.length;i++){

        const cell = document.createElement("div");

        cell.classList.add("cell");

        cell.dataset.index = i;

        cell.addEventListener("click", handleCellClick);

        board.appendChild(cell);
    }

    currentPlayer = "X";
    gameActive = true;

    historyList.innerHTML = "";

    statusText.textContent =
        `Player ${currentPlayer} Turn`;

    startTimer();
}

function handleCellClick(){

    const index = this.dataset.index;

    if(gameState[index] !== "" || !gameActive){
        return;
    }

    makeMove(index,currentPlayer);

    if(checkWinner()){
        return;
    }

    currentPlayer =
        currentPlayer === "X" ? "O" : "X";

    statusText.textContent =
        `Player ${currentPlayer} Turn`;

    if(
        modeSelect.value === "ai" &&
        currentPlayer === "O" &&
        gameActive
    ){
        setTimeout(aiMove,500);
    }
}

function makeMove(index,player){

    gameState[index] = player;

    const cell =
        document.querySelector(
            `[data-index="${index}"]`
        );

    cell.textContent = player;

    cell.classList.add(
        player.toLowerCase()
    );

    const move =
        document.createElement("li");

    move.textContent =
        `Player ${player} → Cell ${parseInt(index)+1}`;

    historyList.appendChild(move);
}

function aiMove(){

    let emptyCells =
        gameState
        .map((v,i)=>v===""?i:null)
        .filter(v=>v!==null);

    if(emptyCells.length===0) return;

    let randomIndex =
        emptyCells[
            Math.floor(
                Math.random()*emptyCells.length
            )
        ];

    makeMove(randomIndex,"O");

    if(checkWinner()){
        return;
    }

    currentPlayer="X";

    statusText.textContent =
        `Player X Turn`;
}

function checkWinner(){

    let winPatterns = [];

    for(let r=0;r<boardSize;r++){

        let row=[];

        for(let c=0;c<boardSize;c++){
            row.push(r*boardSize+c);
        }

        winPatterns.push(row);
    }

    for(let c=0;c<boardSize;c++){

        let col=[];

        for(let r=0;r<boardSize;r++){
            col.push(r*boardSize+c);
        }

        winPatterns.push(col);
    }

    let diag1=[];
    let diag2=[];

    for(let i=0;i<boardSize;i++){

        diag1.push(
            i*boardSize+i
        );

        diag2.push(
            i*boardSize+
            (boardSize-1-i)
        );
    }

    winPatterns.push(diag1);
    winPatterns.push(diag2);

    for(let pattern of winPatterns){

        const first =
            gameState[pattern[0]];

        if(first==="") continue;

        let won =
            pattern.every(
                index =>
                gameState[index]===first
            );

        if(won){

            gameActive=false;

            clearInterval(timerInterval);

            pattern.forEach(index=>{
                document
                .querySelector(
                    `[data-index="${index}"]`
                )
                .classList.add("winner");
            });

            statusText.textContent =
                `Player ${first} Wins!`;

            if(first==="X"){
                scores.x++;
            }else{
                scores.o++;
            }

            updateScoreboard();

            winSound.play();

            return true;
        }
    }

    if(!gameState.includes("")){

        gameActive=false;

        clearInterval(timerInterval);

        statusText.textContent =
            "Match Draw!";

        scores.draw++;

        updateScoreboard();

        loseSound.play();

        return true;
    }

    return false;
}

restartBtn.addEventListener(
    "click",
    createBoard
);

newGameBtn.addEventListener(
    "click",
    ()=>{
        scores={
            x:0,
            o:0,
            draw:0
        };

        updateScoreboard();

        createBoard();
    }
);

boardSizeSelect.addEventListener(
    "change",
    createBoard
);

updateScoreboard();
createBoard();
