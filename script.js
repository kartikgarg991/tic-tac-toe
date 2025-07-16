let buttons = document.querySelectorAll(".button");

let TurnX = true ;
let gameOver = false ;
let count = 0 ;

let defaultX = "Player X";
let defaultO = "Player O";


const p1Input   = document.querySelector("#player1");
p1Input.addEventListener("change" , ()=>{
    const name = p1Input.value.trim();
    if( name ){
        speechSynthesis.speak(
            new SpeechSynthesisUtterance(`Player X is now ${name}`)
        );
    } 
});

const p2Input   = document.querySelector("#player2");
p2Input.addEventListener("change", () => {
  const name = p2Input.value.trim();
  if (name) {
    speechSynthesis.speak(
      new SpeechSynthesisUtterance(`Player O is now ${name}`)
    );
  }
});



let gameSelection = document.querySelector("#mode");

// listen to voice 
let voiceBtn = document.querySelector("#voiceBtn")
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognizer = new SpeechRec();
recognizer.lang = "en-US";
recognizer.interimResults = false;
recognizer.maxAlternatives = 1;

voiceBtn.addEventListener("click", () => {
  // don’t start if the game is already over
  if (gameOver) return;
  recognizer.start();
});

recognizer.addEventListener("result", (e) => {
  const spoken = e.results[0][0].transcript.trim().toLowerCase();
  console.log("You said:", spoken);

  const moveMap = {
    "top left": 0,
    "top middle": 1,
    "top right": 2,
    "middle left": 3,
    "middle": 4,
    "middle right": 5,
    "bottom left": 6,
    "bottom middle": 7,
    "bottom right": 8
  };

  const idx = moveMap[spoken];

  // ❌ Invalid move? Speak back error
  if (idx === undefined) {
    speechSynthesis.speak(
      new SpeechSynthesisUtterance(`I heard "${spoken}", but that's not a valid move`)
    );
    return;
  }

  // ❌ Cell already filled or game over? Say so
  if (buttons[idx].textContent !== "" || gameOver) {
    speechSynthesis.speak(
      new SpeechSynthesisUtterance(`Can't move to ${spoken}, try another`)
    );
    return;
  }

  // ✅ Valid move → simulate click logic
  if (TurnX) {
    buttons[idx].textContent = "X";
    buttons[idx].classList.add("x-style");
  } else {
    buttons[idx].textContent = "O";
    buttons[idx].classList.add("o-style");
  }

  TurnX = !TurnX;
  count++;
  checkWinner();
});




buttons.forEach((button) => {
    button.addEventListener
    ("click", () => 
        {
            if( button.textContent != "" || gameOver ) return ;
            if( TurnX  ){
                button.textContent = "X";
                button.classList.add("x-style");
            }
            else{
                button.classList.add("o-style");
                button.textContent = "O";
            }

            TurnX = !TurnX;
            count++;
            checkWinner();

        }
    );
});


let reset = document.querySelector(".reset");
reset.addEventListener( "click" , ()=>{

    buttons.forEach((button) => {
        button.textContent = "";
        button.classList.remove("x-style");
        button.classList.remove("o-style");
        button.classList.remove("win");
    });

    gameOver = false ;
    count = 0 ;
    TurnX = true;
    p1Input.value = "";
    p2Input.value = "";
});

const winPatterns = [
    [0,1,2],
    [3,4,5],
    [6,7,8],

    [0,3,6],
    [1,4,7],
    [2,5,8],

    [0,4,8],
    [2,4,6],
];



const checkWinner = () => {
    for( patt of winPatterns )
    {
        let x = patt[0] , y = patt[1] , z = patt[2];
        if( buttons[x].textContent != "" &&
            buttons[x].textContent === buttons[y].textContent && 
            buttons[y].textContent === buttons[z].textContent) 
        {
            
            // make animation to wininng boxes
            buttons[x].classList.add("win");
            buttons[y].classList.add("win");
            buttons[z].classList.add("win");

            // pick names 
            const nameX = p1Input.value.trim() || defaultX;
            const nameO = p2Input.value.trim() || defaultO;

            const winner = buttons[x].textContent == "X" ? nameX : nameO ;

            const message = `${winner} Won The Game`;
            
            setTimeout(() => {
                let speak = new SpeechSynthesisUtterance(message);
                speechSynthesis.speak(speak);
                alert(message);
            }, 100);
            
            gameOver = true ;
            return ;
         }
    }
        // for draw 
        if( count == 9 && !gameOver){
            let message = "Game is Draw";
            let speak = new SpeechSynthesisUtterance(message);
            speechSynthesis.speak(speak);

            setTimeout(() => {
                alert(message);
            }, 200);

            gameOver = true ;
            return ;
        }
    }
