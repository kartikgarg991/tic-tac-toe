let buttons = document.querySelectorAll(".button");

let TurnX = true ;
let gameOver = false ;
let count = 0 ;

let playerX = prompt("Enter X Player name : ");
let playerO = prompt("Enter O Player name : ");


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

    playerX = prompt("Enter X Player name : ");
    playerO = prompt("Enter O Player name : ");

    gameOver = false ;
    count = 0 ;
    TurnX = true;
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

            let winner = playerX;
            if( buttons[x].textContent == "O" ) winner = playerO;

            let message = `${winner} Won The Game`;
            
            setTimeout(() => {
                let speak = new SpeechSynthesisUtterance(message);
                speechSynthesis.speak(speak);
                alert(message);
            }, 100);
            
            gameOver = true ;
            return ;
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
}  