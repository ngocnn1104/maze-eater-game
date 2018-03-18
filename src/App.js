import React, { Component } from 'react';
import './App.css';
import monster from './img/monster.png';
import apple from './img/apple.png';
import iceCream from './img/icecream.png';
import pizza from './img/pizza.png';
import turkey from './img/turkey.png';
import spoon from './img/spoon.png';
import spatula from './img/spatula.png';
import knife from './img/knife.png';
import pillsrc from './img/pill.png';
import doorsrc from './img/door.png';
import wallsrc from './img/green.png';
import bite from './sound/bite.mp3';

const player = document.createElement("img");
player.id = "player";
player.src = monster;

const door = document.createElement("img");
door.id = "door";
door.src = doorsrc;

let whiteCells; let foodCells; let weaponCells; let pillCells; let playerCell; let doorCell;
const sound = new Audio(bite); sound.playbackRate = 2;

class Cell extends Component {
  render() {
    return(<div className="cell" id={this.props.id}><img src={wallsrc} className="wall" alt="wall" /></div>);
  }
}

class Row extends Component {
  render() {
    return(<div className="row">{this.props.cells}</div>)
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {start: false,
                  level: 1,
                  totalHealth: 50,
                  healthLv: 50,
                  foodHealth: 20,
                  equipped: "None",
                  strength: 5,
                  totalExp: 50,
                  exp: 0,
                  room: 1,
                  turkey: 200};
    this.start = this.start.bind(this);
    this.restart = this.restart.bind(this);
    this.movePlayer = this.movePlayer.bind(this);
  }

  keypressEvent(event) {
    let keyName = event.key;
    if (keyNames.indexOf(keyName) >= 0) {
      let thisCell = playerCell.id;
      let thisRow = Number(thisCell.split("-")[1]); let thisCol = Number(thisCell.split("-")[2]);
      let upCell = "cell-"+ String(thisRow-1) + "-" + thisCol;
      let downCell = "cell-" + String(thisRow+1) + "-" + thisCol;
      let leftCell = "cell-" + thisRow + "-" + String(thisCol-1);
      let rightCell = "cell-" + thisRow + "-" + String(thisCol+1);

      switch (keyName) {
        case 'Enter':
          event.preventDefault();
          break;
        case 'ArrowUp':
          if (whiteCells.indexOf(upCell) >= 0) {
            this.movePlayer(upCell);
          }
          break;
        case 'ArrowDown':
          if (whiteCells.indexOf(downCell) >= 0) {
            this.movePlayer(downCell);
          }
          break;
        case 'ArrowLeft':
          if (whiteCells.indexOf(leftCell) >= 0) {
            this.movePlayer(leftCell);
          }
          player.style.transform = "scaleX(-1)";
          break;
        case 'ArrowRight':
          if (whiteCells.indexOf(rightCell) >= 0) {
            this.movePlayer(rightCell);
          }
          player.style.transform = "scaleX(1)";
          break;
      }
    }
  }

  movePlayer(nextCell) {
    if (nextCell !== doorCell.id && foodCells.indexOf(nextCell) < 0) {
      playerCell.removeChild(playerCell.childNodes[0]);
      let next = document.getElementById(nextCell);
      if (next.hasChildNodes()) {
        next.removeChild(next.childNodes[0]);
      }
      next.appendChild(player);
      playerCell = next;

      // if run into a cell with weapon
      if (weaponCells.indexOf(nextCell) >= 0) {
        switch (this.state.room) {
          case 1:
            this.setState({equipped: "Dirty Spoon", strength: this.state.strength+5});
            break;
          case 2:
            this.setState({equipped: "Plastic Spatula", strength: this.state.strength+10});
            break;
          case 3:
            this.setState({equipped: "Rusty Knife", strength: this.state.strength+15});
            break;
        }
        weaponCells.splice(weaponCells.indexOf(nextCell),1);
      }

      // if run into a cell with pill
      if (pillCells.indexOf(nextCell) >= 0) {
        let currentHealth = this.state.healthLv;
        if (currentHealth < this.state.totalHealth) {
          this.setState({healthLv: this.state.totalHealth});
        }
        pillCells.splice(pillCells.indexOf(nextCell),1);
      }

    // if run into a cell with door to next level
    } else if (nextCell === doorCell.id) {
      // reset the style of all cells
      for (let i = 0; i < this.arr.length; i++) {
        let thisCell = document.getElementById(this.arr[i]);
        if (thisCell.hasChildNodes()) {
          thisCell.removeChild(thisCell.childNodes[0]);
        }
        let wall = document.createElement("img");
        wall.className = "wall";
        wall.src = wallsrc;
        thisCell.appendChild(wall);
        thisCell.style.background = "none";
      }
      this.setState({room: this.state.room + 1, foodHealth: this.state.foodHealth*3});
      this.start();

    // if run into a cell with food
    } else if (foodCells.indexOf(nextCell) >= 0) {
      // play biting sound
      sound.play();

      // randomly decide the attack power
      let attack = Math.round(Math.random()*this.state.strength);
      let foodCell = document.getElementById(nextCell);

      let currentHealth = this.state.healthLv;

      // normal food
      if (foodCell.childNodes[0].id !== "turkey") {
        let foodCellCurrentHealth = foodCell.childNodes[0].style.opacity*this.state.foodHealth;
        if (attack < foodCellCurrentHealth) {
          foodCell.childNodes[0].style.opacity = (foodCellCurrentHealth-attack)/this.state.foodHealth;

        // if food dies, remove it and add exp + healthLv + totalHealth + strength
        } else {
          foodCell.removeChild(foodCell.childNodes[0]);
          foodCells.splice(foodCells.indexOf(nextCell),1);
          let currentExp = this.state.exp;
          let addedExp = currentExp + this.state.foodHealth;
          if (addedExp < this.state.totalExp) {
            this.setState({exp: addedExp});
          } else {
            let newExp = addedExp - this.state.totalExp;
            let newLevel = this.state.level + 1;
            let newTotalExp = newLevel * 20 + this.state.totalExp;
            let newStrength = this.state.strength + 5;
            this.setState({level: newLevel, exp: newExp, totalExp: newTotalExp, totalHealth: newTotalExp, healthLv: newTotalExp, strength: newStrength });
          }
        }

        // randomly decide the damage on player's health
        let damage = Math.round(Math.random()*(this.state.totalHealth/(this.state.level * 3)));
        if (damage < currentHealth) {
          this.setState({healthLv: currentHealth-damage});
        } else {
          this.setState({healthLv: 0});
          alert("Ouch!!! Your stomach burst due to overeating o_O");
          this.restart();
        }

      // turkey
      } else {
        let turkeyCurrentHealth = this.state.turkey;
        if (attack < turkeyCurrentHealth) {
          foodCell.childNodes[0].style.opacity = (turkeyCurrentHealth-attack)/this.state.turkey;
          this.setState({turkey: turkeyCurrentHealth-attack});
        } else {
          alert("Wutttttt?! You are the officialy the new MAZE EATING CHAMPION!!!");
          this.restart();
        }

        let damage = Math.round(Math.random()*this.state.turkey);
        if (damage < currentHealth) {
          this.setState({healthLv: currentHealth-damage});
        } else {
          alert("Ouch!!! Your stomach burst from overeating :(");
          this.restart();
        }
      }

    }

    viewPlayerPosition();
  }

  // create a table without any special designs before starting game
  componentWillMount() {
    this.rows = []; this.arr = [];

    for (let i = 1; i < 31; i++) {
      let cells = [];
      for (let j = 1; j < 21; j++) {
        cells.push(<Cell id={"cell-" + i + "-" + j} key={"cell-" + i + "-" + j}/>);
        this.arr.push("cell-" + i + "-" + j);
      }
      this.rows.push(<Row cells={cells} key={"row" + i} />);
    }
    //

    // keypress event listener
    document.addEventListener('keypress', this.keypressEvent.bind(this));
  }

  // create a random map
  start() {
    this.setState({start: true});

    let roomCells = []; // later will include cells picked randomly from each room (1 cell per room)
    whiteCells = []; // later will include all cells with white background

    // each loop creates one room with random width and height
    for (let i = 1; i < 11; i++) {
      let thisRoomCells = []; // later will include every cells in this room

      // pick a random cell to start creating the room
      let startCell = Math.floor(Math.random()*this.arr.length);
      let splitStartCell = this.arr[startCell].split("-");
      //

      let startRow = splitStartCell[1]; // the row number of the starting cell
      let startCol = splitStartCell[2]; // the col number of the starting cell

      let roomWidth; let roomHeight;

      // randomly pick room width using math.random
      if (20 - startCol > 7) {
        roomWidth = Math.round(Math.random()*8);
      } else {
        roomWidth = Math.round(Math.random()*(20 - startCol + 1));
      }
      if (roomWidth===0) {roomWidth++;}
      //

      // randomly pick room height using math.random
      if (30 - startRow > 7) {
        roomHeight = Math.round(Math.random()*8);
      } else {
        roomHeight = Math.round(Math.random()*(30 - startRow + 1));
      }
      if (roomHeight===0) {roomHeight++;}
      //

      // create a new room by changing each cell's background to white
      for (let h = 0; h <roomHeight; h++) {
        for (let w = 0; w < roomWidth; w++) {
          let x = h+Number(startRow); let y = w+Number(startCol);
          let thisCell = document.getElementById("cell-"+x+"-"+y);
          thisCell.style.background = "white";
          if (thisCell.hasChildNodes()) {
            thisCell.removeChild(thisCell.childNodes[0]);
          }

          if (thisRoomCells.indexOf("cell-"+x+"-"+y) < 0) {
            thisRoomCells.push("cell-"+x+"-"+y); // add cell to the room's array
          }

          if (whiteCells.indexOf("cell-"+x+"-"+y) < 0) {
            whiteCells.push("cell-"+x+"-"+y);
          }

          // when reaching the last cell of the room, randomly push one cell of the room to the roomCells array
          if (h === roomHeight-1 && w === roomWidth-1) {
            roomCells.push(thisRoomCells[Math.floor(Math.random()*thisRoomCells.length)]);
          }
          //

        }
      }
      //

    }
    //

    // each loop creates a bridge between two cells (current and next cells) in the array
    for (let i = 0; i < roomCells.length-1; i++) {
      let room1 = roomCells[i].split("-"); let room2 = roomCells[i+1].split("-");
      let room1Row = Number(room1[1]); let room1Col = Number(room1[2]);
      let room2Row = Number(room2[1]); let room2Col = Number(room2[2]);

      // create a bridge from the 1st room's row to the 2nd room's row, keeping the 1st room's col
      if (room1Row !== room2Row) {
        for (let j = 1; j <= Math.abs(room1Row-room2Row); j++) {
          let row;
          if (room1Row < room2Row) {
            row = room1Row + j;
          } else {
            row = room1Row - j;
          }
          let thisCell = document.getElementById("cell-"+row+"-"+room1Col);
          thisCell.style.background="white";
          if (thisCell.hasChildNodes()) {
            thisCell.removeChild(thisCell.childNodes[0]);
          }
          if (whiteCells.indexOf("cell-"+row+"-"+room1Col) < 0) {
            whiteCells.push("cell-"+row+"-"+room1Col);
          }
        }
      }
      //

      // create a bridge from the 1st room's col to the 2nd room's col, keeping the 2nd room's row
      if (room1Col !== room2Col) {
        for (let k = 1; k <= Math.abs(room1Col-room2Col); k++) {
          let col;
          if (room1Col < room2Col) {
            col = room1Col + k;
          } else {
            col = room1Col - k;
          }
          let thisCell = document.getElementById("cell-"+room2Row+"-"+col);
          thisCell.style.background="white";
          if (thisCell.hasChildNodes()) {
            thisCell.removeChild(thisCell.childNodes[0]);
          }
          if (whiteCells.indexOf("cell-"+room2Row+"-"+col) < 0) {
            whiteCells.push("cell-"+room2Row+"-"+col);
          }
        }
      }
    }
    //

    // place player on the first cell
    playerCell = document.getElementById(whiteCells[0]);
    playerCell.appendChild(player);
    //

    // place door on the last cell
    if (this.state.room !== 3) {
      doorCell = document.getElementById(whiteCells[whiteCells.length-1]);
      doorCell.appendChild(door);
    }

    // randomly place the food on the map
    foodCells = [];
    for (let i = 1; i <= 10; i++) {
      let food = document.createElement("img");
      food.className = "food";
      switch (this.state.room) {
        case 1:
          food.src = apple;
          break;
        case 2:
          food.src = iceCream;
          break;
        case 3:
          food.src = pizza;
          break;
      }
      food.style.opacity = "1";
      let x = Math.floor(Math.random() * whiteCells.length);
      if (foodCells.indexOf(whiteCells[x]) < 0 && document.getElementById(whiteCells[x]) !== playerCell && document.getElementById(whiteCells[x]) !== doorCell) {
        foodCells.push(whiteCells[x]);
        document.getElementById(whiteCells[x]).appendChild(food);
      }
    }
    //

    // randomly place the pills on the map
    pillCells = [];
    for (let i = 1; i <= 15; i++) {
      let pill = document.createElement("img");
      pill.className = "pill";
      pill.src = pillsrc ;
      let x = Math.floor(Math.random() * whiteCells.length);
      if (foodCells.indexOf(whiteCells[x]) < 0 && pillCells.indexOf(whiteCells[x]) < 0 && document.getElementById(whiteCells[x]) !== playerCell && document.getElementById(whiteCells[x]) !== doorCell) {
        pillCells.push(whiteCells[x]);
        document.getElementById(whiteCells[x]).appendChild(pill);
      }
    }

    // randomly place the weapon on the map
    weaponCells = [];
    for (let i = 1; i <= 5; i++) {
      let weapon = document.createElement("img");
      weapon.className = "weapon";
      switch (this.state.room) {
        case 1:
          weapon.src = spoon;
          break;
        case 2:
          weapon.src = spatula;
          break;
        case 3:
          weapon.src = knife;
          break;
      }
      let x = Math.floor(Math.random() * whiteCells.length);
      if (foodCells.indexOf(whiteCells[x]) < 0 && pillCells.indexOf(whiteCells[x]) < 0 && weaponCells.indexOf(whiteCells[x]) < 0 && document.getElementById(whiteCells[x]) !== playerCell && document.getElementById(whiteCells[x]) !== doorCell) {
        weaponCells.push(whiteCells[x]);
        document.getElementById(whiteCells[x]).appendChild(weapon);
      }
    }
    //

    // randomly place the turkey on the map in the 3rd room
    if (this.state.room === 3) {
      let food = document.createElement("img");
      food.id = "turkey";
      food.src = turkey;
      food.style.opacity = "1";
      let x = Math.floor(Math.random() * whiteCells.length);
      if (foodCells.indexOf(whiteCells[x]) < 0 && document.getElementById(whiteCells[x]) !== playerCell && document.getElementById(whiteCells[x]) !== doorCell && pillCells.indexOf(whiteCells[x]) < 0 && weaponCells.indexOf(whiteCells[x]) < 0) {
        foodCells.push(whiteCells[x]);
        document.getElementById(whiteCells[x]).appendChild(food);
      }
    }

    viewPlayerPosition(); // scroll into view the position of player on the map
  }

  restart() {
    // reset the style of all cells
    for (let i = 0; i < this.arr.length; i++) {
      let thisCell = document.getElementById(this.arr[i]);
      if (thisCell.hasChildNodes()) {
        thisCell.removeChild(thisCell.childNodes[0]);
      }
      let wall = document.createElement("img");
      wall.className = "wall";
      wall.src = wallsrc;
      thisCell.appendChild(wall);
      thisCell.style.background = "none";
    }

    // set state to hide the restart button and show the start button
    this.setState({start: false,
                  level: 1,
                  totalHealth: 50,
                  healthLv: 50,
                  foodHealth: 20,
                  equipped: "None",
                  strength: 5,
                  totalExp: 50,
                  exp: 0,
                  room: 1,
                  turkey: 200});
  }

  render() {
    let healthPercent = String(Math.round((this.state.healthLv/this.state.totalHealth)*100))+"%";
    let expPercent = String(Math.round((this.state.exp/this.state.totalExp)*100))+"%";

    return (
      <div className="App">
        <h1>THE MAZE EATER</h1>
        <div className="header">
          <table>
            <tbody>
              <tr>
                <td>Equipped:</td>
                {this.state.start ? (
                  <td>{this.state.equipped}</td>
                ) : (
                  <td>--</td>
                )}
                <td className="right-col">Health:</td>
                {this.state.start ? (
                  <td>
                    <div style={{background: "gray", height: "15px"}} className="gray-bar">
                      <div style={{width: healthPercent, background: "red", height: "15px"}}></div>
                    </div>
                  </td>
                ) : (
                  <td>--</td>
                )}
              </tr>
              <tr>
                <td>Strength:</td>
                {this.state.start ? (
                  <td>{this.state.strength}</td>
                ) : (
                  <td>--</td>
                )}
                <td className="right-col">EXP:</td>
                {this.state.start ? (
                  <td>
                    <div style={{background: "gray", height: "15px"}} className="gray-bar">
                      <div style={{width: expPercent, background: "blue", height: "15px"}}></div>
                    </div>
                  </td>
                ) : (
                  <td>--</td>
                )}
              </tr>
              <tr>
                <td>Room level:</td>
                {this.state.start ? (
                  <td>{this.state.room}</td>
                ) : (
                  <td>--</td>
                )}
                <td className="right-col">Player level:</td>
                {this.state.start ? (
                  <td>{this.state.level}</td>
                ) : (
                  <td>--</td>
                )}
              </tr>
            </tbody>
          </table>
          {this.state.start ? (
            <button onClick={this.restart}>Restart</button>
          ) : (
            <button onClick={this.start}>Start</button>
          )}
        </div>

        {!this.state.start &&
          <div id="instructions">
            <h3>Welcome to The Maze Eater Game!</h3>
            <p>Your main task is to EAT all the way through 3 levels and swallow up the Turkey feast <img src={turkey} style={{width: '30px'}} alt="turkey"/> in the final room.</p>
            <ul>
              <li>Use your arrow keys on your keyboard to move around.</li>
              <li>Eat <img src={apple} style={{width: '20px'}} alt="apple"/> <img src={iceCream} style={{width: '20px'}} alt="ice cream" /> <img src={pizza} style={{width: '20px'}} alt="pizza"/> to gain more experience.</li>
              <li>Collect <img src={spoon} style={{width: '20px'}} alt="spoon"/> <img src={spatula} style={{width: '20px'}} alt="spatula" /> <img src={knife} style={{width: '20px'}} alt="knife" /> to gain more strength.</li>
              <li>Stomach feeling unwell? Find these digestive pills <img src={pillsrc} style={{width: '20px'}} alt="pill" /> to boost your health up.</li>
              <li>Move to <img src={doorsrc} style={{width: '20px'}} alt="door" /> to enter the next room. Once you get in, there&apos;s no way turning back.</li>
            </ul>
            <h3>Now let&apos;s get this party started!</h3>
          </div>
        }

        <div className="game-map">
          {this.rows}
        </div>

        <footer>Coded by Ngoc Nguyen &copy; 2018</footer>
      </div>
    );
  }
}

export default App;

function viewPlayerPosition() {
  let gameMap = playerCell.parentElement.parentElement;
  let rectMap = gameMap.getBoundingClientRect();
  if (player.offsetTop < 500) {
    if (player.offsetLeft < 300) {
      gameMap.scrollTo(Math.abs(player.offsetLeft - rectMap.x)*0.5, Math.abs(player.offsetTop - rectMap.y)*0.5);
    } else {
      gameMap.scrollTo(Math.abs(player.offsetLeft - rectMap.x)*0.8, Math.abs(player.offsetTop - rectMap.y)*0.5);
    }
  } else if (player.offsetTop < 800) {
    if (player.offsetLeft < 300) {
      gameMap.scrollTo(Math.abs(player.offsetLeft - rectMap.x)*0.5, Math.abs(player.offsetTop - rectMap.y)*0.7);
    } else {
      gameMap.scrollTo(Math.abs(player.offsetLeft - rectMap.x)*0.8, Math.abs(player.offsetTop - rectMap.y)*0.7);
    }
  } else if (player.offsetTop < 1100) {
    if (player.offsetLeft < 300) {
      gameMap.scrollTo(Math.abs(player.offsetLeft - rectMap.x)*0.5, Math.abs(player.offsetTop - rectMap.y)*0.8);
    } else {
      gameMap.scrollTo(Math.abs(player.offsetLeft - rectMap.x)*0.8, Math.abs(player.offsetTop - rectMap.y)*0.8);
    }
  } else {
    if (player.offsetLeft < 300) {
      gameMap.scrollTo(Math.abs(player.offsetLeft - rectMap.x)*0.5, Math.abs(player.offsetTop - rectMap.y)*0.9);
    } else {
      gameMap.scrollTo(Math.abs(player.offsetLeft - rectMap.x)*0.8, Math.abs(player.offsetTop - rectMap.y)*0.9);
    }
  }
}

const keyNames = ["Enter", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
