// Game variables
let countriesData = [];
let currentQuestion = 0;
let score = 0;
let correctAnswers = 0;
let incorrectAnswers = 0;
let timer;
let timeLeft = 15;
let playerInitials = '';
let questionsPerGame = 100;

// DOM Elements
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const resultsScreen = document.getElementById('results-screen');
const leaderboardScreen = document.getElementById('leaderboard-screen');

const startBtn = document.getElementById('start-btn');
const leaderboardBtn = document.getElementById('leaderboard-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const viewLeaderboardBtn = document.getElementById('view-leaderboard-btn');
const backBtn = document.getElementById('back-btn');

const playerInitialsInput = document.getElementById('player-initials');
const questionNumberEl = document.getElementById('question-number');
const scoreEl = document.getElementById('score');
const timeRemainingEl = document.getElementById('time-remaining');
const questionEl = document.getElementById('question');
const optionsContainerEl = document.getElementById('options-container');
const feedbackEl = document.getElementById('feedback');
const feedbackTextEl = document.getElementById('feedback-text');

const playerResultEl = document.getElementById('player-result');
const finalScoreEl = document.getElementById('final-score');
const correctAnswersEl = document.getElementById('correct-answers');
const incorrectAnswersEl = document.getElementById('incorrect-answers');
const leaderboardBodyEl = document.getElementById('leaderboard-body');

// Event Listeners
document.addEventListener('DOMContentLoaded', initializeGame);
startBtn.addEventListener('click', startGame);
leaderboardBtn.addEventListener('click', showLeaderboard);
playAgainBtn.addEventListener('click', resetGame);
viewLeaderboardBtn.addEventListener('click', showLeaderboard);
backBtn.addEventListener('click', showStartScreen);

// Initialize the game
async function initializeGame() {
    try {
        const response = await fetch('game_countries_capitals.json');
        if (!response.ok) {
            throw new Error('Failed to load countries data');
        }
        countriesData = await response.json();
        console.log(`Loaded ${countriesData.length} countries for the game`);
    } catch (error) {
        console.error('Error initializing game:', error);
        alert('Failed to load game data. Please refresh the page.');
    }
}

// Start the game
function startGame() {
    playerInitials = playerInitialsInput.value.trim().toUpperCase();
    
    if (playerInitials.length < 2 || playerInitials.length > 3) {
        alert('Please enter 2-3 letters for your initials.');
        return;
    }
    
    // Shuffle the countries data
    shuffleArray(countriesData);
    
    // Reset game variables
    currentQuestion = 0;
    score = 0;
    correctAnswers = 0;
    incorrectAnswers = 0;
    
    // Show game screen
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    
    // Start the first question
    loadQuestion();
}

// Load a question
function loadQuestion() {
    // Clear any existing timer
    clearInterval(timer);
    
    // Reset timer
    timeLeft = 15;
    updateTimer();
    
    // Start timer
    timer = setInterval(() => {
        timeLeft--;
        updateTimer();
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            handleTimeout();
        }
    }, 1000);
    
    // Update question number
    questionNumberEl.textContent = `Question: ${currentQuestion + 1}/${questionsPerGame}`;
    
    // Update score
    scoreEl.textContent = `Score: ${score}`;
    
    // Hide feedback
    feedbackEl.classList.add('hidden');
    
    // Get current country
    const currentCountry = countriesData[currentQuestion];
    
    // Set question text
    questionEl.textContent = `What is the capital of ${currentCountry.country}?`;
    
    // Generate options
    generateOptions(currentCountry);
}

// Generate multiple choice options
function generateOptions(currentCountry) {
    // Clear previous options
    optionsContainerEl.innerHTML = '';
    
    // Get correct answer
    const correctAnswer = currentCountry.capital;
    
    // Get 3 random incorrect options
    const incorrectOptions = getRandomIncorrectOptions(correctAnswer, 3);
    
    // Combine all options and shuffle
    const allOptions = [correctAnswer, ...incorrectOptions];
    shuffleArray(allOptions);
    
    // Create option elements
    allOptions.forEach(option => {
        const optionEl = document.createElement('div');
        optionEl.classList.add('option');
        optionEl.textContent = option;
        optionEl.addEventListener('click', () => checkAnswer(option, correctAnswer));
        optionsContainerEl.appendChild(optionEl);
    });
}

// Get random incorrect options
function getRandomIncorrectOptions(correctAnswer, count) {
    const incorrectOptions = [];
    const allCapitals = countriesData.map(country => country.capital);
    
    // Filter out the correct answer
    const availableOptions = allCapitals.filter(capital => capital !== correctAnswer);
    
    // Shuffle available options
    shuffleArray(availableOptions);
    
    // Take the first 'count' options
    return availableOptions.slice(0, count);
}

// Check the selected answer
function checkAnswer(selectedAnswer, correctAnswer) {
    // Clear timer
    clearInterval(timer);
    
    // Disable all options
    const options = document.querySelectorAll('.option');
    options.forEach(option => {
        option.classList.add('disabled');
        
        // Highlight correct and incorrect options
        if (option.textContent === correctAnswer) {
            option.classList.add('correct');
        } else if (option.textContent === selectedAnswer && selectedAnswer !== correctAnswer) {
            option.classList.add('incorrect');
        }
    });
    
    // Show feedback
    feedbackEl.classList.remove('hidden');
    
    if (selectedAnswer === correctAnswer) {
        // Correct answer
        feedbackEl.classList.add('correct');
        feedbackEl.classList.remove('incorrect');
        feedbackTextEl.textContent = 'Correct!';
        
        // Update score and correct answers count
        const pointsEarned = Math.max(5, timeLeft);
        score += pointsEarned;
        correctAnswers++;
        
        // Update score display
        scoreEl.textContent = `Score: ${score}`;
    } else {
        // Incorrect answer
        feedbackEl.classList.add('incorrect');
        feedbackEl.classList.remove('correct');
        feedbackTextEl.textContent = `Incorrect! The correct answer is ${correctAnswer}.`;
        
        // Update incorrect answers count
        incorrectAnswers++;
    }
    
    // Move to next question after delay
    setTimeout(() => {
        currentQuestion++;
        
        if (currentQuestion < questionsPerGame) {
            loadQuestion();
        } else {
            endGame();
        }
    }, 2000);
}

// Handle timeout (no answer selected)
function handleTimeout() {
    // Get correct answer
    const correctAnswer = countriesData[currentQuestion].capital;
    
    // Disable all options
    const options = document.querySelectorAll('.option');
    options.forEach(option => {
        option.classList.add('disabled');
        
        // Highlight correct option
        if (option.textContent === correctAnswer) {
            option.classList.add('correct');
        }
    });
    
    // Show feedback
    feedbackEl.classList.remove('hidden');
    feedbackEl.classList.add('incorrect');
    feedbackEl.classList.remove('correct');
    feedbackTextEl.textContent = `Time's up! The correct answer is ${correctAnswer}.`;
    
    // Update incorrect answers count
    incorrectAnswers++;
    
    // Move to next question after delay
    setTimeout(() => {
        currentQuestion++;
        
        if (currentQuestion < questionsPerGame) {
            loadQuestion();
        } else {
            endGame();
        }
    }, 2000);
}

// Update timer display
function updateTimer() {
    timeRemainingEl.textContent = `Time: ${timeLeft}s`;
    
    if (timeLeft <= 5) {
        timeRemainingEl.style.color = '#e74c3c';
    } else {
        timeRemainingEl.style.color = '';
    }
}

// End the game
function endGame() {
    // Save score to leaderboard
    saveScore();
    
    // Show results screen
    gameScreen.classList.add('hidden');
    resultsScreen.classList.remove('hidden');
    
    // Update results
    playerResultEl.textContent = playerInitials;
    finalScoreEl.textContent = score;
    correctAnswersEl.textContent = correctAnswers;
    incorrectAnswersEl.textContent = incorrectAnswers;
}

// Save score to leaderboard
function saveScore() {
    // Get existing leaderboard
    let leaderboard = JSON.parse(localStorage.getItem('capitalQuizLeaderboard')) || [];
    
    // Add new score
    leaderboard.push({
        player: playerInitials,
        score: score,
        correct: correctAnswers,
        date: new Date().toLocaleDateString()
    });
    
    // Sort leaderboard by score (highest first)
    leaderboard.sort((a, b) => b.score - a.score);
    
    // Keep only top 10 scores
    leaderboard = leaderboard.slice(0, 10);
    
    // Save to localStorage
    localStorage.setItem('capitalQuizLeaderboard', JSON.stringify(leaderboard));
}

// Show leaderboard
function showLeaderboard() {
    // Hide other screens
    startScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    resultsScreen.classList.add('hidden');
    leaderboardScreen.classList.remove('hidden');
    
    // Get leaderboard data
    const leaderboard = JSON.parse(localStorage.getItem('capitalQuizLeaderboard')) || [];
    
    // Clear existing entries
    leaderboardBodyEl.innerHTML = '';
    
    // Add entries
    leaderboard.forEach((entry, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${entry.player}</td>
            <td>${entry.score}</td>
            <td>${entry.correct}/${questionsPerGame}</td>
            <td>${entry.date}</td>
        `;
        
        leaderboardBodyEl.appendChild(row);
    });
    
    // If no entries, show message
    if (leaderboard.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="5">No scores yet. Be the first to play!</td>';
        leaderboardBodyEl.appendChild(row);
    }
}

// Reset game to play again
function resetGame() {
    // Show start screen
    resultsScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
}

// Show start screen
function showStartScreen() {
    leaderboardScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
}

// Utility function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
