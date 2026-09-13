const buttons = document.querySelectorAll(".button");

let TurnX = true;
let gameOver = false;
let count = 0;

const defaultX = "Player X";
const defaultO = "Player O";

const p1Input = document.querySelector("#player1");
const p2Input = document.querySelector("#player2");
const voiceBtn = document.querySelector("#voiceBtn");
const reset = document.querySelector(".reset");


// =====================================================
// PLAYER NAME VOICE
// =====================================================

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


// =====================================================
// WINNING PATTERNS
// =====================================================

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


// =====================================================
// CHECK WINNER
// =====================================================

const checkWinner = () => {

    for (const patt of winPatterns) {

        const x = patt[0];
        const y = patt[1];
        const z = patt[2];

        const valueX = buttons[x].textContent;
        const valueY = buttons[y].textContent;
        const valueZ = buttons[z].textContent;

        if (
            valueX !== "" &&
            valueX === valueY &&
            valueY === valueZ
        ) {

            // Highlight winning boxes
            buttons[x].classList.add("win");
            buttons[y].classList.add("win");
            buttons[z].classList.add("win");

            // Player names
            const nameX = p1Input.value.trim() || defaultX;
            const nameO = p2Input.value.trim() || defaultO;

            // Find winner
            const winner = valueX === "X" ? nameX : nameO;

            const message = `${winner} Won The Game`;

            gameOver = true;

            setTimeout(() => {

                speechSynthesis.speak(
                    new SpeechSynthesisUtterance(message)
                );

                alert(message);

            }, 100);

            return;
        }
    }


    // =================================================
    // DRAW
    // =================================================

    if (count === 9 && !gameOver) {

        const message = "Game is Draw";

        gameOver = true;

        speechSynthesis.speak(
            new SpeechSynthesisUtterance(message)
        );

        setTimeout(() => {
            alert(message);
        }, 200);
    }
};


// =====================================================
// MAKE MOVE
// =====================================================

const makeMove = (idx) => {

    // Game over or cell already occupied
    if (
        gameOver ||
        buttons[idx].textContent !== ""
    ) {
        return false;
    }


    // Player X
    if (TurnX) {

        buttons[idx].textContent = "X";
        buttons[idx].classList.add("x-style");

    }

    // Player O
    else {

        buttons[idx].textContent = "O";
        buttons[idx].classList.add("o-style");

    }


    // Change turn
    TurnX = !TurnX;

    count++;

    checkWinner();

    return true;
};


// =====================================================
// NORMAL CLICK
// =====================================================

buttons.forEach((button, idx) => {

    button.addEventListener("click", () => {

        makeMove(idx);

    });

});


// =====================================================
// RESET
// =====================================================

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

    // Stop speech
    speechSynthesis.cancel();
});


// =====================================================
// VOICE RECOGNITION
// =====================================================

const SpeechRec =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


if (SpeechRec && voiceBtn) {

    const recognizer = new SpeechRec();

    recognizer.lang = "en-US";

    recognizer.interimResults = false;

    recognizer.maxAlternatives = 5;

    let isListening = false;


    // =================================================
    // VOICE BUTTON
    // =================================================

    voiceBtn.addEventListener("click", () => {

        if (gameOver) {
            return;
        }

        if (isListening) {
            return;
        }

        try {

            recognizer.start();

        } catch (error) {

            console.log(
                "Could not start speech recognition:",
                error
            );

        }
    });


    // =================================================
    // RECOGNITION START
    // =================================================

    recognizer.addEventListener("start", () => {

        isListening = true;

        console.log("🎤 Listening...");

    });


    // =================================================
    // RECOGNITION END
    // =================================================

    recognizer.addEventListener("end", () => {

        isListening = false;

        console.log("🎤 Stopped listening");

    });


    // =================================================
    // VOICE RESULT
    // =================================================

    recognizer.addEventListener("result", (e) => {

        // Get what browser heard
        let spoken = e.results[0][0].transcript;

        console.log("RAW SPEECH:", spoken);


        // =================================================
        // NORMALIZE SPEECH
        // =================================================

        spoken = spoken
            .toLowerCase()
            .trim()
            .replace(/[.,!?]/g, "")
            .replace(/-/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        console.log("NORMALIZED SPEECH:", spoken);


        // =================================================
        // DIRECT COMMANDS
        // =================================================

        const moveMap = {

            // Top row
            "top left": 0,
            "top middle": 1,
            "top center": 1,
            "top right": 2,

            // Middle row
            "middle left": 3,
            "middle": 4,
            "center": 4,
            "middle center": 4,
            "middle right": 5,

            // Bottom row
            "bottom left": 6,
            "bottom middle": 7,
            "bottom center": 7,
            "bottom right": 8,

            // Alternative wording
            "upper left": 0,
            "upper middle": 1,
            "upper center": 1,
            "upper right": 2,

            "lower left": 6,
            "lower middle": 7,
            "lower center": 7,
            "lower right": 8
        };


        // =================================================
        // EXACT MATCH
        // =================================================

        let idx = moveMap[spoken];


        // =================================================
        // HANDLE EXTRA WORDS
        // =================================================

        if (idx === undefined) {

            if (
                spoken.includes("top") &&
                spoken.includes("left")
            ) {
                idx = 0;
            }

            else if (
                spoken.includes("top") &&
                (
                    spoken.includes("middle") ||
                    spoken.includes("center") ||
                    spoken.includes("centre")
                )
            ) {
                idx = 1;
            }

            else if (
                spoken.includes("top") &&
                spoken.includes("right")
            ) {
                idx = 2;
            }

            else if (
                spoken.includes("middle") &&
                spoken.includes("left")
            ) {
                idx = 3;
            }

            else if (
                (
                    spoken.includes("middle") ||
                    spoken.includes("center") ||
                    spoken.includes("centre")
                ) &&
                !spoken.includes("left") &&
                !spoken.includes("right")
            ) {
                idx = 4;
            }

            else if (
                spoken.includes("middle") &&
                spoken.includes("right")
            ) {
                idx = 5;
            }

            else if (
                spoken.includes("bottom") &&
                spoken.includes("left")
            ) {
                idx = 6;
            }

            else if (
                spoken.includes("bottom") &&
                (
                    spoken.includes("middle") ||
                    spoken.includes("center") ||
                    spoken.includes("centre")
                )
            ) {
                idx = 7;
            }

            else if (
                spoken.includes("bottom") &&
                spoken.includes("right")
            ) {
                idx = 8;
            }

            else if (
                spoken.includes("upper") &&
                spoken.includes("left")
            ) {
                idx = 0;
            }

            else if (
                spoken.includes("upper") &&
                spoken.includes("right")
            ) {
                idx = 2;
            }

            else if (
                spoken.includes("lower") &&
                spoken.includes("left")
            ) {
                idx = 6;
            }

            else if (
                spoken.includes("lower") &&
                spoken.includes("right")
            ) {
                idx = 8;
            }
        }


        // =================================================
        // INVALID COMMAND
        // =================================================

        if (idx === undefined) {

            console.log(
                "❌ Invalid voice command:",
                spoken
            );

            speechSynthesis.speak(
                new SpeechSynthesisUtterance(
                    `I heard ${spoken}, but that's not a valid move`
                )
            );

            return;
        }


        // =================================================
        // CELL ALREADY FILLED
        // =================================================

        if (buttons[idx].textContent !== "") {

            speechSynthesis.speak(
                new SpeechSynthesisUtterance(
                    "That cell is already occupied. Try another."
                )
            );

            return;
        }


        // =================================================
        // GAME OVER
        // =================================================

        if (gameOver) {
            return;
        }


        // =================================================
        // MAKE VOICE MOVE
        // =================================================

        console.log(
            "✅ Voice move:",
            spoken,
            "=> cell",
            idx
        );

        makeMove(idx);

    });


    // =================================================
    // VOICE ERROR
    // =================================================

    recognizer.addEventListener("error", (e) => {

        isListening = false;

        console.log(
            "❌ Speech recognition error:",
            e.error
        );

        if (e.error === "not-allowed") {

            alert(
                "Microphone permission is blocked. Please allow microphone access in Chrome."
            );

        }

    });

}


// =====================================================
// BROWSER DOES NOT SUPPORT SPEECH RECOGNITION
// =====================================================

else {

    console.log(
        "Speech Recognition is not supported in this browser."
    );

    if (voiceBtn) {
        voiceBtn.disabled = true;
    }
}
