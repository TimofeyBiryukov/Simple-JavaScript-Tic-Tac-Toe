

class Game {
  constructor() {
    this.width = 3;
    this.heigh = 3;
    this.winCondition = 3;
    this.gameState = 0;

    this.tileSize = 50;
    this.gridSize = 5;

    this.playerTurn = 1;

    document.getElementById('gameBoard')
      .addEventListener('click', e => this.click(e));
  }

  start() {
    if (this.gameState === 1) {
      return;
    }
    this.gameState = 1;
    this.createField();
    this.render();
  }

  stop() {
    this.gameState = 0;
  }

  gameOver(player) {
    if (this.gameState !== 2) {
      this.gameState = 2;
      console.log('Player ' + player + ' won!');
      alert('Player ' + player + ' won!');
    } else {
      console.log('Game Over');
    }
  }

  createField() {
    this.field = new Array(this.width);
    for (let i = 0; i < this.heigh; i++) {
      this.field[i] = new Array(this.heigh).fill(0);
    }
  }

  click(e) {
    // TODO: not precise
    let x = Math.round(e.x / (this.tileSize - this.gridSize)) - 1;
    let y = Math.round(e.y / (this.tileSize - this.gridSize)) - 1;
    this.move(x, y, this.playerTurn);
    if (this.playerTurn === 1) {
      this.playerTurn = 2;
    } else {
      this.playerTurn = 1;
    }
  }

  move(x, y, player) {
    if (this.gameState !== 1) {
      return;
    }
    let cell = this.getFieldCell(x, y);
    if (cell !== 0 || cell === player) {
      return;
    }
    this.setFieldCell(x, y, player);
    this.render();
    this.saveState();
    this.checkWinningCondition(player);
  }

  render() {
    let canvas = document.getElementById('gameBoard');
    let ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.heigh);
    ctx.fillStyle = 'black';

    this.field.forEach((row, x) => {
      row.forEach((cell, y) => {
        // TODO: random colors for N amount of players
        if (cell === 0) {
          ctx.fillStyle = 'black';
        } else if (cell === 1) {
          ctx.fillStyle = 'green';
        } else if (cell === 2) {
          ctx.fillStyle = 'red';
        }
        ctx.fillRect(x * this.tileSize, y * this.tileSize,
            this.tileSize - this.gridSize, this.tileSize - this.gridSize);
      });
    });
  }

  checkWinningCondition(player) {
    let winCount = 0;

    let checkWinCount = () => {
      winCount++;

      if (winCount >= this.winCondition) {
        this.gameOver(player);
        return true;
      }

      return false;
    };

    let getCheckList = (x, y) => {
      return [
        [x - 1, y - 1], // lu
        [x, y + 1], // u
        [x + 1, y + 1], // ru
        [x + 1, y], // r
        [x + 1, y + 1], // rb
        [x, y - 1], // b
        [x - 1, y + 1], // lb
        [x - 1, y] // l
      ];
    };

    let checkCircular = (x, y) => {
      let checkList = getCheckList(x, y);

      checkList.forEach((c, ci) => {
        let x = c[0];
        let y = c[1];
        if (x < 0 || y < 0 || x >= this.width || y >= this.heigh) {
          return false;
        }
        let cell = this.getFieldCell(x, y);
        if (cell === player) {
          checkWinCount();
          let result = checkLinear(x, y, ci);
          if (!result) {
            winCount = 1;
          }
        }
      });
    };

    let checkLinear = (_x, _y, checkListIndex) => {
      let checkList = getCheckList(_x, _y);
      let x = checkList[checkListIndex][0];
      let y = checkList[checkListIndex][1];
      if (x < 0 || y < 0 || x >= this.width || y >= this.heigh) {
        return false;
      }
      let cell = this.getFieldCell(x, y);
      if (cell === player) {
        checkWinCount();
        return checkLinear(x, y, checkListIndex);
      } else {
        return false;
      }
    };

    this.field.forEach((row, x) => {
      row.forEach((cell, y) => {
        if (cell === player) {
          winCount = 0;
          checkWinCount();
          checkCircular(x, y);
        }
      });
    });
  }

  saveState() {
    localStorage['game'] = JSON.stringify(this);
  }

  restoreState() {
    let restoredState = JSON.parse(localStorage['game']);

    this.width = restoredState.width;
    this.heigh = restoredState.heigh;
    this.winCondition = restoredState.winCondition;
    this.gameState = restoredState.gameState;
    this.tileSize = restoredState.tileSize;
    this.gridSize = restoredState.gridSize;
    this.playerTurn = restoredState.playerTurn;
    this.field = restoredState.field;

    this.render();
    this.checkWinningCondition(this.playerTurn);
  }

  getFieldCell(x, y) {
    return this.field[x][y];
  }

  setFieldCell(x, y, value = null) {
    this.field[x][y] = value;
  }
}
