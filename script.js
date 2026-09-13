let buttons = document.querySelectorAll(".button");

let TurnX = true;
let gameOver = false;
let count = 0;

const defaultX = "Player X";
const defaultO = "Player O";

const p1Input = document.querySelector("#player1");
const p2Input = document.querySelector("#player2");
const gameSelection = document.querySelector("#mode");


// =========================
// PLAYER NAME VOICE
// =========================

p1Input.addEventListener("change", () => {
    const name = p1Input.value.trim();

    if (name) {
        speechSynthesis.speak(
            new SpeechSynthesisUtterance(`Player X is now ${name}`)
        );
    }
});

p2Input.addEventListener("change", () => {
    const name = p2Input.value.trim();

    if (name) {
        speechSynthesis.speak(
            new SpeechSynthesisUtterance(`Player O is now ${name}`)
        );
    }
});


// =========================
// WINNING PATTERNS
// =========================

const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    [0, 4, 8],
    [2, 4, 6]
];


// =========================
// MAKE MOVE
// =========================

const makeMove = (idx) => {

    // Don't allow move if game is over
    // or cell is already occupied
    if (buttons[idx].textContent !== "" || gameOver) {
        return;
    }

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
};


// =========================
// NORMAL CLICK
// =========================

buttons.forEach((button, idx) => {

    button.addEventListener("click", () => {
        makeMove(idx);
    });

});


// =========================
// CHECK WINNER
// =========================

const checkWinner = () => {

    for (const patt of winPatterns) {

        const x = patt[0];
        const y = patt[1];
        const z = patt[2];

        const valueX = buttons[x].textContent;
        const valueY = buttons[y].textContent;
        const valueZ = buttons[z].textContent;

        // Check winning combination
        if (
            valueX !== "" &&
            valueX === valueY &&
            valueY === valueZ
        ) {

            // Highlight winning boxes
            buttons[x].classList.add("win");
            buttons[y].classList.add("win");
            buttons[z].classList.add("win");


            // Get player names
            const nameX = p1Input.value.trim() || defaultX;
            const nameO = p2Input.value.trim() || defaultO;


            // Determine winner
            const winner = valueX === "X" ? nameX : nameO;

            const message = `${winner} Won The Game`;

            gameOver = true;


            // Speak winner
            setTimeout(() => {

                const speak = new SpeechSynthesisUtterance(message);
                speechSynthesis.speak(speak);

                alert(message);

            }, 100);

            return;
        }
    }


    // =========================
    // DRAW
    // =========================

    if (count === 9 && !gameOver) {

        const message = "Game is Draw";

        gameOver = true;

        const speak = new SpeechSynthesisUtterance(message);
        speechSynthesis.speak(speak);

        setTimeout(() => {
            alert(message);
        }, 200);

        return;
    }
};


// =========================
// RESET GAME
// =========================

const reset = document.querySelector(".reset");

reset.addEventListener("click", () => {

    buttons.forEach((button) => {

        button.textContent = "";

        button.classList.remove("x-style");
        button.classList.remove("o-style");
        button.classList.remove("win");

    });

    gameOver = false;
    count = 0;
    TurnX = true;

    p1Input.value = "";
    p2Input.value = "";

    // Stop any current speech
    speechSynthesis.cancel();
});


// =========================
// VOICE INPUT
// =========================

const voiceBtn = document.querySelector("#voiceBtn");

const SpeechRec =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


// Only setup voice recognition if browser supports it
if (SpeechRec && voiceBtn) {

    const recognizer = new SpeechRec();

    recognizer.lang = "en-US";
    recognizer.interimResults = false;
    recognizer.maxAlternatives = 1;

    let isListening = false;


    // =========================
    // VOICE BUTTON
    // =========================

    voiceBtn.addEventListener("click", () => {

        // Don't listen after game is over
        if (gameOver || isListening) {
            return;
        }

        try {
            recognizer.start();
        } catch (error) {
            console.log("Speech recognition error:", error);
        }
    });


    // =========================
    // START LISTENING
    // =========================

    recognizer.addEventListener("start", () => {
        isListening = true;
        console.log("Listening...");
    });


    // =========================
    // STOP LISTENING
    // =========================

    recognizer.addEventListener("end", () => {
        isListening = false;
        console.log("Stopped listening");
    });


    // =========================
    // VOICE RESULT
    // =========================

    recognizer.addEventListener("result", (e) => {

        const spoken = e.results[0][0].transcript
            .trim()
            .toLowerCase();

        console.log("You said:", spoken);


        // Map voice commands to board positions
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


        // =========================
        // INVALID VOICE COMMAND
        // =========================

        if (idx === undefined) {

            const message =
                `I heard "${spoken}", but that's not a valid move`;

            speechSynthesis.speak(
                new SpeechSynthesisUtterance(message)
            );

            return;
        }


        // =========================
        // OCCUPIED CELL
        // =========================

        if (buttons[idx].textContent !== "" || gameOver) {

            const message =
                `Can't move to ${spoken}, try another`;

            speechSynthesis.speak(
                new SpeechSynthesisUtterance(message)
            );

            return;
        }


        // =========================
        // MAKE VOICE MOVE
        // =========================

        makeMove(idx);
    });


    // =========================
    // SPEECH ERROR
    // =========================

    recognizer.addEventListener("error", (e) => {

        isListening = false;

        console.log("Speech recognition error:", e.error);

    });

} else {

    // Browser doesn't support speech recognition
    console.log("Speech Recognition is not supported in this browser.");

    if (voiceBtn) {
        voiceBtn.disabled = true;
    }
}
