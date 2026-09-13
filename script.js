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
// PLAYER NAME
// =====================================================

p1Input.addEventListener("change", () => {
    const name = p1Input.value.trim();

    if (name) {
        speechSynthesis.cancel();

        speechSynthesis.speak(
            new SpeechSynthesisUtterance(
                `Player X is now ${name}`
            )
        );
    }
});


p2Input.addEventListener("change", () => {
    const name = p2Input.value.trim();

    if (name) {
        speechSynthesis.cancel();

        speechSynthesis.speak(
            new SpeechSynthesisUtterance(
                `Player O is now ${name}`
            )
        );
    }
});


// =====================================================
// WIN PATTERNS
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

    for (const pattern of winPatterns) {

        const [a, b, c] = pattern;

        const valueA = buttons[a].textContent;
        const valueB = buttons[b].textContent;
        const valueC = buttons[c].textContent;

        if (
            valueA !== "" &&
            valueA === valueB &&
            valueB === valueC
        ) {

            buttons[a].classList.add("win");
            buttons[b].classList.add("win");
            buttons[c].classList.add("win");

            const nameX =
                p1Input.value.trim() || defaultX;

            const nameO =
                p2Input.value.trim() || defaultO;

            const winner =
                valueA === "X" ? nameX : nameO;

            const message =
                `${winner} Won The Game`;

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


    // DRAW

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

const makeMove = (index) => {

    if (gameOver) {
        return;
    }

    if (buttons[index].textContent !== "") {
        return;
    }


    if (TurnX) {

        buttons[index].textContent = "X";
        buttons[index].classList.add("x-style");

    } else {

        buttons[index].textContent = "O";
        buttons[index].classList.add("o-style");

    }


    TurnX = !TurnX;

    count++;

    checkWinner();
};


// =====================================================
// NORMAL CLICK
// =====================================================

buttons.forEach((button, index) => {

    button.addEventListener("click", () => {

        makeMove(index);

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

    TurnX = true;
    gameOver = false;
    count = 0;

    p1Input.value = "";
    p2Input.value = "";

    speechSynthesis.cancel();
});


// =====================================================
// SPEECH RECOGNITION
// =====================================================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


if (!SpeechRecognition) {

    console.error(
        "Speech Recognition is NOT supported."
    );

    if (voiceBtn) {
        voiceBtn.disabled = true;
    }

} else {

    const recognizer = new SpeechRecognition();

    recognizer.lang = "en-US";

    recognizer.continuous = false;

    recognizer.interimResults = false;

    recognizer.maxAlternatives = 5;

    let isListening = false;


    // =================================================
    // START
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

            console.error(
                "Recognition start error:",
                error
            );

        }

    });


    // =================================================
    // START EVENT
    // =================================================

    recognizer.addEventListener("start", () => {

        isListening = true;

        console.log("🎤 LISTENING...");

    });


    // =================================================
    // END EVENT
    // =================================================

    recognizer.addEventListener("end", () => {

        isListening = false;

        console.log("🎤 STOPPED");

    });


    // =================================================
    // RESULT
    // =================================================

    recognizer.addEventListener("result", (event) => {

        console.log("================================");
        console.log("🎤 SPEECH RESULT");
        console.log("================================");


        // ---------------------------------------------
        // GET ALL ALTERNATIVES
        // ---------------------------------------------

        const alternatives = [];

        const results =
            event.results[0];

        for (
            let i = 0;
            i < results.length;
            i++
        ) {

            const text =
                results[i].transcript
                    .toLowerCase()
                    .trim();

            alternatives.push(text);

            console.log(
                `Alternative ${i + 1}:`,
                text,
                "confidence:",
                results[i].confidence
            );
        }


        // ---------------------------------------------
        // NORMALIZE
        // ---------------------------------------------

        const normalized = alternatives.map(text => {

            return text
                .replace(/[.,!?]/g, "")
                .replace(/-/g, " ")
                .replace(/\s+/g, " ")
                .trim();

        });


        console.log(
            "Normalized:",
            normalized
        );


        // ---------------------------------------------
        // DETECT MOVE
        // ---------------------------------------------

        let index = null;


        for (const text of normalized) {

            index = detectMove(text);

            if (index !== null) {
                break;
            }

        }


        // ---------------------------------------------
        // INVALID
        // ---------------------------------------------

        if (index === null) {

            console.log(
                "❌ MOVE NOT DETECTED"
            );

            speechSynthesis.speak(
                new SpeechSynthesisUtterance(
                    "I couldn't understand the position. Please say top left, top middle, or top right."
                )
            );

            return;
        }


        // ---------------------------------------------
        // CELL OCCUPIED
        // ---------------------------------------------

        if (buttons[index].textContent !== "") {

            console.log(
                "❌ CELL ALREADY OCCUPIED:",
                index
            );

            speechSynthesis.speak(
                new SpeechSynthesisUtterance(
                    "That cell is already occupied. Try another."
                )
            );

            return;
        }


        // ---------------------------------------------
        // MAKE MOVE
        // ---------------------------------------------

        console.log(
            "✅ MOVE DETECTED:",
            index
        );

        makeMove(index);

    });


    // =================================================
    // SPEECH ERROR
    // =================================================

    recognizer.addEventListener("error", (event) => {

        isListening = false;

        console.error(
            "❌ SPEECH ERROR:",
            event.error
        );


        if (event.error === "not-allowed") {

            alert(
                "Microphone permission denied. Allow microphone access in Chrome."
            );

        } else if (event.error === "no-speech") {

            console.log(
                "No speech detected."
            );

        }

    });

}


// =====================================================
// MOVE DETECTOR
// =====================================================

function detectMove(text) {

    // ---------------------------------------------
    // EXACT / NORMAL COMMANDS
    // ---------------------------------------------

    const moveMap = {

        "top left": 0,
        "top middle": 1,
        "top center": 1,
        "top centre": 1,
        "top right": 2,

        "middle left": 3,
        "middle": 4,
        "center": 4,
        "centre": 4,
        "middle center": 4,
        "middle centre": 4,
        "middle right": 5,

        "bottom left": 6,
        "bottom middle": 7,
        "bottom center": 7,
        "bottom centre": 7,
        "bottom right": 8,

        "upper left": 0,
        "upper middle": 1,
        "upper center": 1,
        "upper right": 2,

        "lower left": 6,
        "lower middle": 7,
        "lower center": 7,
        "lower right": 8
    };


    if (moveMap[text] !== undefined) {
        return moveMap[text];
    }


    // ---------------------------------------------
    // EXTRA WORDS
    // ---------------------------------------------

    if (
        text.includes("top") &&
        text.includes("left")
    ) {
        return 0;
    }


    if (
        text.includes("top") &&
        text.includes("right")
    ) {
        return 2;
    }


    if (
        text.includes("top") &&
        (
            text.includes("middle") ||
            text.includes("center") ||
            text.includes("centre")
        )
    ) {
        return 1;
    }


    if (
        text.includes("middle") &&
        text.includes("left")
    ) {
        return 3;
    }


    if (
        text.includes("middle") &&
        text.includes("right")
    ) {
        return 5;
    }


    if (
        text.includes("bottom") &&
        text.includes("left")
    ) {
        return 6;
    }


    if (
        text.includes("bottom") &&
        text.includes("right")
    ) {
        return 8;
    }


    if (
        text.includes("bottom") &&
        (
            text.includes("middle") ||
            text.includes("center") ||
            text.includes("centre")
        )
    ) {
        return 7;
    }


    // ---------------------------------------------
    // COMMON SPEECH RECOGNITION MISTAKES
    // ---------------------------------------------

    const aliases = {

        // "top left" commonly misheard
        "top light": 0,
        "top lite": 0,
        "toplet": 0,
        "top led": 0,
        "stop left": 0,
        "stop light": 0,

        // top right
        "top write": 2,
        "top rite": 2,
        "stop right": 2,

        // top middle
        "top metal": 1,
        "top little": 1,

        // middle left
        "middle light": 3,
        "middle lite": 3,

        // middle right
        "middle write": 5,
        "middle rite": 5,

        // bottom left
        "bottom light": 6,
        "bottom lite": 6,

        // bottom right
        "bottom write": 8,
        "bottom rite": 8
    };


    if (aliases[text] !== undefined) {
        return aliases[text];
    }


    return null;
}
