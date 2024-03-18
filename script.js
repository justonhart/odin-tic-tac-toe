const displayController = (() => {
	let activeGame;
	const gameContainer = document.getElementById('gameContainer');
	const renderGameState = (gameState) => {
		//reset container
		gameContainer.innerHTML = "";

		//render player scores / end message
		const scoreDisplay = document.createElement('div');
		scoreDisplay.id = 'scoreDisplay';

		const playerOneDisplay = document.createElement('span');
		playerOneDisplay.textContent = `${gameState.playerOne.getName()}: ${gameState.playerOne.getScore()}`;
		scoreDisplay.appendChild(playerOneDisplay);

		if(gameState.roundOver){
			const message = document.createElement('span');
			message.textContent = gameState.roundWinner ? `${gameState.roundWinner} wins!` : 'Tie game!';
			scoreDisplay.appendChild(message);
		}

		const playerTwoDisplay = document.createElement('span');
		playerTwoDisplay.textContent = `${gameState.playerTwo.getName()}: ${gameState.playerTwo.getScore()}`;
		scoreDisplay.appendChild(playerTwoDisplay);

		gameContainer.appendChild(scoreDisplay);
		const gameBoard = document.createElement('div');
		gameBoard.id = 'gameBoard';
		for(let i = 0; i < 9; i++){
			const space = document.createElement('div');
			space.classList.add('space');
			space.dataset.index = i;
			space.innerText = gameState.boardState[i] || "";

			if(!gameState.roundOver){
				space.addEventListener('click',gameSpaceClickHandler);
			} else if(gameState.winningLine?.indices.includes(i) ){
				space.classList.add('winner');
			}
			
			gameBoard.appendChild(space);
		}
		gameContainer.appendChild(gameBoard);

		if(gameState.roundOver){
			const restartButton = document.createElement('button');
			restartButton.textContent = "Start new round!";
			restartButton.addEventListener('click', restartButtonClickHandler);
			gameContainer.appendChild(restartButton);
		}
	};

	function gameSpaceClickHandler(event){
		if(event.target.dataset.index !== undefined){
			activeGame.makeMove(event.target.dataset.index);
			displayController.renderGameState(activeGame.getGameState());
			return;
		}
	}

	function restartButtonClickHandler(event){
		activeGame.startNextRound();
		displayController.renderGameState(activeGame.getGameState());
	}

	const setActiveGame = (game) => activeGame = game;

	return {renderGameState, setActiveGame};
})();

addEventListener('submit', (event) => {
	event.preventDefault();
	const playerOneName = document.getElementById('playerOne').value;
	const playerTwoName = document.getElementById('playerTwo').value;
	let game = createGame(playerOneName, playerTwoName);
	displayController.setActiveGame(game);
	displayController.renderGameState(game.getGameState());
});

const createGame = (playerOneName, playerTwoName) => {
	let createPlayer = (playerName, playerSymbol) => {
		const name = playerName;
		let symbol = playerSymbol;
		let score = 0;

		let incrementScore = () => { score++ };
		let getScore = () => score;
		let getName = () => name;
		let getSymbol = () => symbol;
		let changeSymbol = (newSymbol) => symbol = newSymbol;
		return {getName, getScore, getSymbol, changeSymbol, incrementScore};
	};

	const [playerOne, playerTwo] = [[playerOneName, "x"], [playerTwoName, "o"]].map(p => createPlayer(p[0], p[1]));

	let playerOneTurn = true;
	let roundWinner;
	let roundOver = false;
	let winningLine;

	const gameBoard = (() => {
		let boardState = [];
		const getBoardState = () => boardState;
		const tryUpdateSpace = (index, value) => boardState[index] == undefined ? boardState[index] = value : false;
		function checkForWin(indices){
			if(indices.some(i => boardState[i] == undefined || boardState[i] !== boardState[indices[0]])){
				return false;
			}
			return true;
		};
		function getWinningLine(){
			let winningLine;
			//check each possible winning combination
			let combinations = [
				[0, 1, 2],
				[0, 4, 8],
				[0, 3, 6],
				[3, 4, 5],
				[6, 7, 8],
				[1, 4, 7],
				[2, 5, 8],
				[2, 4, 6]
			];
			let winningCombination = combinations.find(combination => checkForWin(combination)); 
			if(winningCombination){
				return {symbol: boardState[winningCombination[0]], indices: winningCombination};
			}
		};

		const resetBoard = () => boardState = [];

		return {getBoardState, tryUpdateSpace, getWinningLine, resetBoard};
	})();

	function makeMove(index){
		const symbol = playerOneTurn ? playerOne.getSymbol() : playerTwo.getSymbol();
		const result = gameBoard.tryUpdateSpace(index, symbol);
		if(result !== false){
			playerOneTurn = !playerOneTurn;
		}
		checkGameState();
	}

	function checkGameState(){
		winningLine = gameBoard.getWinningLine();
		if(winningLine !== undefined){
			console.log(gameBoard.getWinningLine());
			if(playerOne.getSymbol() == winningLine.symbol){
				roundWinner = playerOne.getName();
				playerOne.incrementScore();
			} else {
				roundWinner = playerTwo.getName();
				playerTwo.incrementScore();
			}
			roundOver = true;
		} else if(gameBoard.getBoardState().length == 9 && !gameBoard.getBoardState().includes(undefined)){
			roundOver = true;
		}
	}

	function getGameState(){
		return {
			boardState: gameBoard.getBoardState(), 
			playerOne: playerOne,
			playerTwo: playerTwo,
			roundOver, 
			roundWinner, 
			winningLine
		};
	}

	function startNextRound(){
		roundWinner = undefined;
		roundOver = false;
		winningLine = undefined;
		gameBoard.resetBoard();
	}

	return {makeMove, getGameState, startNextRound, checkGameState};
};
