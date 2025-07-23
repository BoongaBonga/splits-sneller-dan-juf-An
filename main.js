let totalTime = 4000;
let timeLeft = totalTime;
let paused = false;
const timeBar = document.getElementById("timeBar");
let loopID = undefined;
let delay = 20;
let input = "";
let difficult = false;
let choices = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
let sum = 1;
let num1 = 1;
let num2 = 0;
let wrongExcersizes = [];
let randIndex;
let randMistake;
let timeout = undefined;

//function for splitting
function splitSum(difficulty, sum) {
    let num1 = Math.round(Math.random() * (sum - 2 * difficulty)) + 1 * difficulty;
    let num2 = sum - num1;
    return [num1, num2];
}

//function for choosing from an array
function generateSum(acceptedSums, difficulty) {
    let randomSum = acceptedSums[Math.round(Math.random() * (acceptedSums.length - 1))];
    let [num1, num2] = splitSum(difficulty, randomSum);
    return [randomSum, num1, num2];
}

//function for resetting current field and making new excersize
function newSum(acceptedSums, difficulty) {
    //choose between a random new sum or a previously seen wrong one
    if (wrongExcersizes.length > 0 && Math.random() < 0.15) {
        randIndex = Math.round(Math.random() * (wrongExcersizes.length - 1));
        randMistake = wrongExcersizes[randIndex];
        sum = randMistake.sum;
        num1 = randMistake.num1;
        num2 = randMistake.num2;
        if (randMistake.correctNr > 2) {
            wrongExcersizes.splice(randIndex, 1);
            randIndex = undefined;
            randMistake = {};
            [sum, num1, num2] = generateSum(acceptedSums, difficulty);
        }
    } else {
        randIndex = undefined;
        randMistake = {};
        [sum, num1, num2] = generateSum(acceptedSums, difficulty);
    }
    document.getElementById("sumId").innerHTML = sum;
    document.getElementById("splitLeft").innerHTML = num1;
    input = "_";
    updateInput();
    timeLeft = totalTime;
}

//function for checking input. if correct: new sum. if incorrect and time left: ignore
//if incorrect and no time left, save excersize and generate new sum.
function checkInput() {
    if (timeout === undefined) {
        const flash = document.getElementById("flash");
        const inputNr = document.getElementById("splitRight");
        //is input correct
        if (parseInt(input) === num2 && timeLeft >= 0) {
            flash.classList.add("correct");
            inputNr.style.color = "green";
            if (randIndex !== undefined) {
                wrongExcersizes[randIndex].correctNr += 1;
            }
            timeout = window.setTimeout(() => {
                document.getElementById("splitRight").style.color = "";
                document.getElementById("flash").classList.remove("correct");
                newSum(choices, difficult);
                timeout = undefined;
            }, 3000);
        } else if (timeLeft < 0) {
            //is input incorrect & time up
            flash.classList.add("wrong");
            inputNr.style.color = "blue";
            input = num2;
            updateInput();
            if (randIndex !== undefined) {
                wrongExcersizes[randIndex].correctNr -= 1;
            } else {
                wrongExcersizes.push({
                    correctNr: 0,
                    sum: sum,
                    num1: num1,
                    num2: num2,
                });
            }
            timeout = window.setTimeout(() => {
                document.getElementById("splitRight").style.color = "";
                document.getElementById("flash").classList.remove("wrong");
                newSum(choices, difficult);
                timeout = undefined;
            }, 4000);
        }
        //start checking again when waiting is done
    }
}

//change layout on load
function load() {
    const sumContainer = document.getElementById("sumContainer");
    const topMsg = sumContainer.getBoundingClientRect();
    const leftLine = document.getElementById("leftLine");
    const rightLine = document.getElementById("rightLine");
    const windowHeight = document.documentElement.scrollHeight;
    const splitContainer = document.getElementById("splitContainer").getBoundingClientRect();
    const hardLower = document.getElementById("hard").getBoundingClientRect();

    document.getElementById("choiceContainer").style.top =
        "calc(" + hardLower.bottom + "px - clamp(0.15rem, 0.5vw, 0.3rem))";
    //sumContainer.style.fontSize = windowHeight * 0.2;
    leftLine.y1.baseVal.value = rightLine.y1.baseVal.value = topMsg.bottom;
    leftLine.y2.baseVal.value = rightLine.y2.baseVal.value = splitContainer.top;
}
window.setInterval(() => {
    load();
}, 100);

//disable scrolling on mobile
window.addEventListener(
    "touchmove",
    function (e) {
        e.preventDefault();
    },
    {passive: false}
);

//register input nrs
document.getElementById("inputContainer").addEventListener("click", () => {
    let clicked = Number(document.querySelector(".digit:hover").innerHTML);
    input = input.replaceAll("_", "");
    input = input + clicked;
    updateInput();
});

//why did i make this this is not needed 😭😭😭
document.getElementById("delete").addEventListener("click", () => {
    input.replaceAll("_", "");
    let inputSplit = input.split("");
    inputSplit.pop();
    if (inputSplit.length === 0) {
        inputSplit.push("_");
    }
    input = inputSplit.join("");
    updateInput();
});

//difficulty
document.getElementById("easy").addEventListener("click", () => {
    difficult = false;
    document.getElementById("easy").style.boxShadow = "white 0 0 0 4px inset";
    document.getElementById("hard").style.boxShadow = "none";
});
document.getElementById("hard").addEventListener("click", () => {
    difficult = true;
    document.getElementById("hard").style.boxShadow = "white 0 0 0 4px inset";
    document.getElementById("easy").style.boxShadow = "none";
});

//show input
function updateInput() {
    document.getElementById("splitRight").innerHTML = input;
}

//update accepted sums
document.getElementById("choiceContainer").addEventListener("click", () => {
    const selectedDigit = document.querySelector(".choiceDigit:hover");
    const selectedNum = Number(selectedDigit.innerHTML);
    if (choices.includes(selectedNum)) {
        choices = choices.filter((e) => e !== Number(selectedDigit.innerHTML));
        selectedDigit.style.backgroundColor = "red";
    } else {
        choices.push(selectedNum);
        selectedDigit.style.backgroundColor = "#00c600";
    }
});

//the loop that loops
window.addEventListener("click", () => {
    if (loopID === undefined) {
        loopID = window.setInterval(() => {
            checkInput();
            timeLeft -= delay;
            document.getElementById("timeBar").style.width = (timeLeft / totalTime) * 100 + "%";
        }, delay);
    }
});
