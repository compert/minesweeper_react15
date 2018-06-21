import React from "react";
import ReactDOM from "react-dom";

class Box extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      display: this.props.step1Value,
      style: 'square'
    }
    this.step = 0;
    this.onClick = this.onClick.bind(this);
  }
  init() {
    this.step = 0;
    this.setState({
      display: this.props.step1Value
    });
  }
  onClick(e) {
    let currentStep = this.props.getCurrentStep();
    if (currentStep == 0) {
      return;
    }
    if (this.step == 0 && this.props.step1Value == currentStep) {
      this.step = 1;
      if (this.props.level == 3) {
        this.setState({
          display: this.props.step2Value,
          style: 'square red'
        });
      } else if (this.props.level == 4) {
        this.setState({
          display: this.props.step2Value,
          style: 'square red'
        });
      } else if (this.props.level == 5) {
        this.setState({
          display: this.props.step2Value,
          style: 'square'
        });
      }
      this.props.stepForward();
    } else if (this.step == 1 && this.props.step2Value == currentStep) {
      this.step = 2;
      if (this.props.level == 3) {
        this.setState({
          display: '',
          style: 'square'
        });
      } else if (this.props.level == 4) {
        this.setState({
          display: this.props.step2Value,
          style: 'square green'
        });
      } else if (this.props.level == 5) {
        this.setState({
          display: this.props.step2Value,
          style: 'square red'
        });
      }
      this.props.stepForward();
    } else {
      this.props.stepWrong();
    }
  }
  render() {
    return (
      <button className={this.state.style} onClick={this.onClick}>
        {this.state.display}
      </button>
    );
  }
}

Array.prototype.shuffle = function(size, diff) {
  let input = this;
  for (let i = 0; i < size*size; i++) {
    input[i] = i + 1 + diff;
  }
  for (let i = input.length; i > 0; i--) {
    let r = Math.floor(Math.random() * i);
    let tempValue = input[i-1];
    input[i-1] = input[r];
    input[r] = tempValue;
  }
  return input;
}

class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      step1Array: [],
      step2Array: []
    }
    this.refBoxes = Array(this.props.size*this.props.size).fill(null);
    this.currentStep = 1;
    this.state.step1Array.shuffle(this.props.size, 0);
    this.state.step2Array.shuffle(this.props.size, this.props.size*this.props.size);
    this.getCurrentStep = this.getCurrentStep.bind(this);
    this.stepForward = this.stepForward.bind(this);
    this.stepWrong = this.stepWrong.bind(this);
  }
  initAll() {
    this.setState({
      step1Array: [],
      step2Array: []
    })
    this.state.step1Array.shuffle(this.props.size, 0);
    this.state.step2Array.shuffle(this.props.size, this.props.size*this.props.size);
    for (let i = 0; i < this.props.size*this.props.size; i++) {
      this.refBoxes[i].current.init();
    }
  }
  getCurrentStep() {
    return this.currentStep;
  }
  stepForward() {
    this.currentStep += 1;
    if (this.currentStep == 2) {
      this.props.startGame();
    }
    if (this.currentStep >= this.props.size*this.props.size*2+1) {
      this.props.endGame();
      setTimeout(() => alert('You Win!'), 200);
    }
  }
  stepWrong() {
    this.props.endGame();
    this.currentStep = 0;
    setTimeout(() => alert('You Lose!'), 200);
  }
  render() {
    let rows = [];
    let size = this.props.size;
    for (let i = 0; i < size; i++) {
      let boxes = [];
      for (let j = 0; j < size; j++) {
        let pos = i*size+j;
        this.refBoxes[pos] = React.createRef();
        boxes.push(
          <Box
            key={pos}
            ref={this.refBoxes[pos]}
            step1Value={this.state.step1Array[pos]}
            step2Value={this.state.step2Array[pos]}
            getCurrentStep={this.getCurrentStep}
            stepForward={this.stepForward}
            stepWrong={this.stepWrong}
            level={this.props.level}
          />
        );
      }
      rows.push(<div key={i} className="board-row">{boxes}</div>);
    }
    return (
      <div>{rows}</div>
    );
  }
}

class StopWatch extends React.Component {
  constructor(props) {
    super(props);
    this.clock = 0;
    this.state = {
      display: '000.00'
    }
    this.init = this.init.bind(this);
    this.start = this.start.bind(this);
    this.tick = this.tick.bind(this);
    this.stop = this.stop.bind(this);
  }
  init() {
    this.clock = 0;
    this.setState({display: '000.00'});
    this.stop();
  }
  start() {
    this.timerID = setInterval(() => this.tick(), 10);
  }
  tick() {
    this.clock += 1;
    let milSec;
    if (this.clock%100 < 10) {
      milSec = '.0' + this.clock%100;
    } else {
      milSec = '.' + this.clock%100;
    }
    if (this.clock < 100) {
      this.setState({display: '000' + milSec});
    } else if (this.clock < 1000) {
      this.setState({display: '00' + Math.floor(this.clock/100).toString() + milSec});
    } else if (this.clock < 10000) {
      this.setState({display: '0' + Math.floor(this.clock/100).toString() + milSec});
    } else {
      this.setState({display: Math.floor(this.clock/100).toString() + milSec});
    }
  }
  stop() {
    clearInterval(this.timerID);
  }
  render() {
    return (
      <div className="stop-watch">{this.state.display}</div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      boardId: 1,
      level: 3
    }
    this.refTimer = React.createRef();
    this.refBoard = React.createRef();
    this.init = this.init.bind(this);
    this.changeLevel = this.changeLevel.bind(this);
    this.startGame = this.startGame.bind(this);
    this.endGame = this.endGame.bind(this);
  }
  init() {
    this.setState(prevState => ({boardId: prevState.boardId + 1}));
    this.refBoard.current.initAll();
    this.refTimer.current.init();
  }
  changeLevel(e) {
    this.setState({level: e.target.value});
    this.init();
  }
  startGame() {
    this.refTimer.current.start();
  }
  endGame() {
    this.refTimer.current.stop();
  }
  render() {
    return (
      <React.Fragment>
        <StopWatch ref={this.refTimer} />
        <div className="game">
          <div className="game-board">
            <Board
              key={this.state.boardId}
              ref={this.refBoard}
              level={this.state.level}
              size={this.state.level}
              startGame={this.startGame}
              endGame={this.endGame}
            />
          </div>
          <div className="game-info">
            <div>
              <select onChange={this.changeLevel}>
                <option value="3">초급</option>
                <option value="4">중급</option>
                <option value="5">고급</option>
              </select>
            </div>
            <div><button onClick={this.init}>재시작</button></div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

ReactDOM.render(<Game />, document.getElementById("root"));
