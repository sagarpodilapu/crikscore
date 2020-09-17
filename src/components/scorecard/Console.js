import React, { Component } from "react";
import moment from "moment";
import { connect } from "react-redux";
import { Link, Redirect } from "react-router-dom";
import {
  addScoreToMatch,
  getTeamPlayers,
  addBowler,
  updateScore,
  addBatsman,
  addPlayers,
  updateMatch,
  resetScore,
} from "../../store/actions/matches";
import { compose } from "redux";
import { firestoreConnect } from "react-redux-firebase";
import { runsJson, extrasJson, outJson } from "../../config/console";
import {
  calculateOvers,
  calculateEco,
  calculateSR,
  expectedRuns,
  currentRR,
  requiredRR,
  calculateBalls,
} from "../../utils";
import LiveScorecard from "./LiveScorecard";
import BowlerModal from "./BowlerModal";
import BatsmanModal from "./BatsmanModal";
import OutModal from "./OutModal";
import AddPlayerModal from "./AddPlayerModal";
import ConfirmModal from "./ConfirmModal";

import { Container, Row } from "reactstrap";

import {
  find,
  floor,
  isEmpty,
  round,
  map,
  findIndex,
  replace,
  isEqual,
} from "lodash";

class Console extends Component {
  state = {
    whoIsOut: {},
    bowlerModalFlag: false,
    batsmanModal: false,
    outModalFlag: false,
    ER: runsJson,
    EE: extrasJson,
    WK: outJson,
    currentExtraJson: {},
    currentRunJson: {},
    currentOutJson: {},
    battingCollection: "firstInningsBatting",
    bowlingCollection: "firstInningsBowling",
    scoreCollection: "firstInningsScore",
    error: "",
    confirmEndFlag: false,
    confirmHeaderText: "",
    endType: "",
    scoreSubmitted: true,
  };

  componentDidUpdate(prevProps) {
    const { score, currentMatch, previousScore } = this.props;
    if (currentMatch !== prevProps.currentMatch) {
      let battingCollection,
        bowlingCollection,
        scoreCollection,
        battingTeam,
        bowlingTeam,
        battingTeamId,
        bowlingTeamId;
      if (
        currentMatch[0].firstInningsWickets === currentMatch[0].players - 1 &&
        currentMatch[0].currentInnings === "FIRST_INNINGS"
      ) {
        this.handleInnings();
      } else if (
        currentMatch[0].secondInningsWickets === currentMatch[0].players - 1 &&
        currentMatch[0].currentInnings === "SECOND_INNINGS"
      ) {
        this.handleEndMatch();
      }
      if (
        currentMatch[0].secondInningsRuns > currentMatch[0].firstInningsRuns
      ) {
        this.handleEndMatch();
      }
      if (currentMatch[0].currentInnings === "SECOND_INNINGS") {
        battingTeamId = currentMatch[0].secondBattingId;
        bowlingTeamId = currentMatch[0].secondBowlingId;
        battingTeam = currentMatch[0].secondBatting;
        bowlingTeam = currentMatch[0].secondBowling;
        bowlingCollection = "secondInningsBowling";
        battingCollection = "secondInningsBatting";
        scoreCollection = "secondInningsScore";
      } else {
        battingTeamId = currentMatch[0].firstBattingId;
        bowlingTeamId = currentMatch[0].firstBowlingId;
        battingTeam = currentMatch[0].firstBatting;
        bowlingTeam = currentMatch[0].firstBowling;
        bowlingCollection = "firstInningsBowling";
        battingCollection = "firstInningsBatting";
        scoreCollection = "firstInningsScore";
      }
      this.setState({
        battingCollection,
        bowlingCollection,
        scoreCollection,
        battingTeam,
        bowlingTeam,
        battingTeamId,
        bowlingTeamId,
      });
      //8 - update
      this.props.getTeamPlayers(bowlingTeamId, "bowling");
      //9 - update
      this.props.getTeamPlayers(battingTeamId, "batting");
    }
    if (score !== prevProps.score) {
      if (score) {
        this.setState({
          bowlerModalFlag: score.overCompleted && isEmpty(score.newBowler),
          batsmanModal: score.out && isEmpty(score.newBatsman),
        });
      }
    }
    // console.log(previousScore !== prevProps.previousScore);
    if (previousScore !== prevProps.previousScore) {
      let localScoreSubmitted = previousScore && !isEmpty(previousScore);
      this.setState({
        scoreSubmitted: localScoreSubmitted,
      });
    }
  }
  handleWhoIsOut = (player) => {
    if (!isEmpty(player))
      this.setState({ whoIsOut: player, outModalFlag: false });
  };
  handleUIReset = (localVariable) => {
    localVariable = map(localVariable, (l) => {
      l.selected = false;
      return l;
    });
    return localVariable;
  };
  handleRunClick = (eachRun) => {
    this.handleSubmitUI();
    const { ER } = this.state;
    let localEr = this.handleUIReset(ER);
    let localIndex = findIndex(localEr, eachRun);
    localEr[localIndex].selected = true;
    this.setState({
      ER: localEr,
      currentRunJson: eachRun,
      error: "",
      scoreSubmitted: false,
    });
  };
  handleExtra = (eachExtra) => {
    const { EE } = this.state;
    let localEe = this.handleUIReset(EE);
    let localIndex = findIndex(localEe, eachExtra);
    localEe[localIndex].selected = true;

    this.setState({
      EE: localEe,
      currentExtraJson: eachExtra,
    });
  };
  handleOut = (eachWicket) => {
    const { WK } = this.state;
    const { striker } = this.props;
    let localWk = this.handleUIReset(WK);
    let localIndex = findIndex(localWk, eachWicket);
    localWk[localIndex].selected = true;
    this.setState({
      WK: localWk,
      outModalFlag: eachWicket.openModal,
      whoIsOut: striker,
      currentOutJson: eachWicket,
    });
  };
  handleSubmitUI = () => {
    this.setState({
      whoIsOut: {},
      bowlerModalFlag: false,
      batsmanModal: false,
      outModalFlag: false,
      ER: this.handleUIReset(this.state.ER),
      EE: this.handleUIReset(this.state.EE),
      WK: this.handleUIReset(this.state.WK),
      currentExtraJson: {},
      currentRunJson: {},
      currentOutJson: {},
      scoreSubmitted: true,
    });
  };
  handleScore = () => {
    const { score, currentMatch, bowler, striker, nonStriker } = this.props;
    const {
      whoIsOut,
      currentRunJson,
      currentExtraJson,
      currentOutJson,
      scoreCollection,
    } = this.state;
    if (isEmpty(currentRunJson)) {
      this.setState({ error: "Select runs first" });
    } else {
      let localBowler = bowler;
      let localStriker = striker;
      let localNonStriker = nonStriker;
      let currentBall = parseInt(score.ball);
      let nextBallCounted = true;
      let runs = 0;
      let finalRuns = 0;
      let totalWickets = score.totalWickets;
      let currentEvent = "";
      let lastSixBalls = score.lastSixBalls;
      let extra = false;
      let extraType = "";
      let extraRun = 0;
      let out = false;
      let outType = "";
      let batsmanRun = true;
      let batsmanBall = true;
      let bowlerRun = true;
      let bowlerBall = true;
      let bowlerWicket = false;
      let boundary = false;
      let overCompleted = false;
      if (!isEmpty(currentRunJson)) {
        runs = parseInt(currentRunJson.run);
        finalRuns += runs;
        currentEvent += currentRunJson.event;
        if (score.nextBallCounted) {
          currentBall++;
        }
      }
      let currentOver = calculateOvers(currentBall);
      if (!isEmpty(currentExtraJson)) {
        if (currentExtraJson.extra) {
          if (currentExtraJson.extraRun) {
            finalRuns++;
          }
          if (!currentExtraJson.ballCounted) {
            nextBallCounted = false;
          }
          currentEvent += currentExtraJson.event;
          extra = currentExtraJson.extra;
          extraType = currentExtraJson.id;
          extraRun = currentExtraJson.extraRun ? 1 : 0;
          batsmanBall = currentExtraJson.batsmanBall;
          batsmanRun = currentExtraJson.batsmanRun;
          bowlerBall = currentExtraJson.bowlerBall;
          bowlerRun = currentExtraJson.bowlerRun;
        }
      }

      if (!isEmpty(currentOutJson)) {
        out = currentOutJson.out;
        outType = currentOutJson.id;
        currentEvent += currentOutJson.event;
        bowlerWicket = currentOutJson.bowlerWicket;
        if (out) {
          totalWickets++;
        }
      }
      currentEvent =
        currentEvent.length > 1 ? replace(currentEvent, ".", "") : currentEvent;
      if (lastSixBalls.length === 6) {
        lastSixBalls.pop();
      }
      lastSixBalls.unshift({
        over: currentOver,
        event: currentEvent,
      });
      let totalRuns = score.totalRuns + finalRuns;
      let CRR = currentRR(totalRuns, currentBall);
      let EXP = expectedRuns(CRR, currentMatch[0].overs);

      if (batsmanBall) {
        localStriker = { ...localStriker, balls: localStriker.balls + 1 };
      }
      if (batsmanRun) {
        localStriker = { ...localStriker, runs: localStriker.runs + runs };
        if (runs === 0) {
          localStriker = { ...localStriker, dots: localStriker.dots + 1 };
          localBowler = { ...localBowler, dots: localBowler.dots + 1 };
        }
        if (runs === 4) {
          localStriker = { ...localStriker, fours: localStriker.fours + 1 };
          localBowler = { ...localBowler, fours: localBowler.fours + 1 };
          boundary = true;
        }
        if (runs === 6) {
          localStriker = { ...localStriker, sixes: localStriker.sixes + 1 };
          localBowler = { ...localBowler, sixes: localBowler.sixes + 1 };
          boundary = true;
        }
        if (runs % 2 === 1) {
          localStriker = { ...localStriker, onStrike: false };
          localNonStriker = { ...localNonStriker, onStrike: true };
        }
      }
      if (bowlerBall) {
        localBowler = { ...localBowler, balls: localBowler.balls + 1 };
      }
      if (bowlerRun) {
        localBowler = { ...localBowler, runs: localBowler.runs + finalRuns };
      }
      if (bowlerWicket) {
        localBowler = { ...localBowler, wickets: localBowler.wickets + 1 };
      }
      localStriker = {
        ...localStriker,
        sr: calculateSR(localStriker.runs, localStriker.balls),
      };
      localBowler = {
        ...localBowler,
        overs: calculateOvers(localBowler.balls),
      };
      localBowler = {
        ...localBowler,
        eco: calculateEco(localBowler.runs, localBowler.balls),
      };
      if (extraType === "wd") {
        localBowler = { ...localBowler, wides: localBowler.wides + 1 };
      }
      if (extraType === "nb") {
        localBowler = { ...localBowler, noBalls: localBowler.noBalls + 1 };
      }
      if (extraType === "b") {
        localBowler = { ...localBowler, byes: localBowler.byes + 1 };
      }
      if (out && whoIsOut.id === localStriker.id) {
        localStriker = {
          ...localStriker,
          out: true,
          howOut: bowlerWicket ? localBowler.name : "run out",
          onStrike: false,
        };
      }
      if (out && whoIsOut.id === localNonStriker.id) {
        localNonStriker = {
          ...localNonStriker,
          out: true,
          howOut: "run out",
          onStrike: false,
        };
      }

      if (currentBall !== 0 && currentBall % 6 === 0 && !extraRun) {
        overCompleted = true;
      }
      let payload = {
        runs,
        lastSixBalls,
        currentEvent,
        ball: currentBall,
        CRR,
        EXP,
        nextBallCounted,
        currentOver,
        totalRuns,
        totalWickets,
        extra,
        extraType,
        extraRun,
        out,
        outType,
        whoIsOut,
        striker: localStriker,
        nonStriker: localNonStriker,
        bowler: localBowler,
        boundary,
        newBowler: {},
        newBatsman: {},
        overCompleted,
        changeStrike: false,
        changeBowler: false,
        endInnings: false,
        finalRuns,
      };
      //10 - update
      this.props.addScoreToMatch(payload, scoreCollection);
      this.handleSubmitUI();
      if (
        currentBall === parseInt(currentMatch[0].overs) * 6 &&
        !extra &&
        currentMatch[0].currentInnings === "FIRST_INNINGS"
      ) {
        this.handleInnings();
      }
      if (
        currentBall === parseInt(currentMatch[0].overs) * 6 &&
        !extra &&
        currentMatch[0].currentInnings === "SECOND_INNINGS"
      ) {
        this.handleEndMatch();
      }
    }
  };
  handleReset = () => {
    const { score, previousScore } = this.props;
    const { scoreCollection } = this.state;
    console.log(score);
    console.log(previousScore);
    this.props.resetScore(score, previousScore, scoreCollection);
    this.setState({
      scoreSubmitted: false,
    });
  };
  handleStrike = () => {
    const { score } = this.props;
    const { scoreCollection } = this.state;
    let localScore = { ...score, changeStrike: true };
    this.props.updateScore(localScore, scoreCollection);
  };
  handleBowler = () => {
    this.setState({ bowlerModalFlag: true });
  };
  handleChangeBowler = (e, bowler) => {
    e.preventDefault();
    const { currentInningsBowling, score } = this.props;
    const { scoreCollection } = this.state;
    var alreadyExists = find(currentInningsBowling, { id: bowler.id });
    if (alreadyExists === undefined) {
      //1 - update
      this.props.addBowler({
        ...bowler,
        bowlingOrder: currentInningsBowling.length + 1,
      });
    } else {
      this.props.updateScore(
        { ...score, newBowler: alreadyExists },
        scoreCollection
      );
    }
    this.setState((prevState) => ({
      bowlerModalFlag: !prevState.bowlerModalFlag,
    }));
  };
  handleChangeBatsman = (e, batsman) => {
    e.preventDefault();
    const { currentInningsBatting, currentMatch, score } = this.props;
    const { scoreCollection } = this.state;
    var alreadyExists = find(currentInningsBatting, { id: batsman.id });
    if (alreadyExists === undefined) {
      //3 - update
      this.props.addBatsman({
        ...batsman,
        battingOrder: currentInningsBatting.length + 1,
      });
    } else {
      this.props.updateScore(
        { ...score, newBatsman: alreadyExists },
        scoreCollection
      );
    }
    this.setState((prevState) => ({
      batsmanModal: !prevState.batsmanModal,
    }));
  };
  handleInitialPlayers = (e, striker, nonStriker, bowler) => {
    e.preventDefault();
    //5 - update
    this.props.addPlayers(striker, nonStriker, bowler);
  };
  handleInnings = () => {
    const { currentMatch } = this.props;
    let match = {
      ...currentMatch[0],
      status: 3,
      statusType: "INNINGS_BREAK",
      currentInnings: "SECOND_INNINGS",
      initialPlayersNeeded: true,
    };
    //6 - update
    this.props.updateMatch(match);
    this.props.history.push("/");
  };
  handleEndMatch = () => {
    const { currentMatch } = this.props;
    let winner,
      winnerInformation,
      wicketsRemaining,
      ballsRemaining,
      runsRemaining;
    if (currentMatch[0].secondInningsRuns > currentMatch[0].firstInningsRuns) {
      winner = currentMatch[0].secondBatting;
      wicketsRemaining =
        currentMatch[0].players - 1 - currentMatch[0].secondInningsWickets;
      ballsRemaining =
        calculateBalls(currentMatch[0].overs) -
        calculateBalls(currentMatch[0].secondInningsOvers);
      winnerInformation = `${winner} won the game by ${wicketsRemaining} wickets`;
    } else if (
      currentMatch[0].secondInningsRuns < currentMatch[0].firstInningsRuns
    ) {
      winner = currentMatch[0].firstBatting;
      runsRemaining =
        currentMatch[0].firstInningsRuns - currentMatch[0].secondInningsRuns;
      winnerInformation = `${winner} won the game by ${runsRemaining} runs`;
    } else {
      winner = "";
      winnerInformation = "Match is tied";
    }
    let match = {
      ...currentMatch[0],
      status: 4,
      statusType: "MATCH_ENDED",
      currentInnings: "SECOND_INNINGS",
      winner,
      winnerInformation,
    };
    //7 - update
    this.props.updateMatch(match);
    this.props.history.push("/");
  };
  handleConfirm = (type) => {
    if (type === "INNINGS") {
      this.setState({
        confirmEndFlag: true,
        confirmHeaderText: "Are you sure you want to End Innings?",
        endType: type,
      });
    } else {
      this.setState({
        confirmEndFlag: true,
        confirmHeaderText: "Are you sure you want to End Match?",
        endType: type,
      });
    }
  };
  handleConfirmClick = () => {
    const { endType } = this.state;
    if (endType === "INNINGS") {
      this.handleInnings();
    } else {
      this.handleEndMatch();
    }
  };
  lastSixBalls = (lastSixBalls) =>
    lastSixBalls.length !== 0 &&
    lastSixBalls.map((ball, i) => (
      <div key={i} className="col-2 text-center p-1">
        <div className="score-label">{ball.over}</div>
        <div className="ball-values bg-white border border-danger text-uppercase last-six-balls">
          {ball.event}
        </div>
      </div>
    ));
  toggle = () => {
    this.setState((prevState) => ({
      bowlerModalFlag: !prevState.bowlerModalFlag,
    }));
  };
  toggleOutModal = () => {
    this.setState((prevState) => ({
      outModalFlag: !prevState.outModalFlag,
    }));
  };
  toggleBatsmanModal = () => {
    this.setState((prevState) => ({
      batsmanModal: !prevState.batsmanModal,
    }));
  };
  toggleConfirmModal = () => {
    this.setState((prevState) => ({
      confirmEndFlag: !prevState.confirmEndFlag,
    }));
  };

  render() {
    const {
      currentMatch,
      score,
      striker,
      bowler,
      nonStriker,
      bowlingSquad,
      battingSquad,
      auth,
      previousScore,
    } = this.props;
    const {
      bowlerModalFlag,
      ER,
      EE,
      WK,
      outModalFlag,
      batsmanModal,
      battingTeam,
      battingTeamId,
      bowlingTeam,
      bowlingTeamId,
      error,
      currentRunJson,
      confirmEndFlag,
      confirmHeaderText,
      scoreSubmitted,
    } = this.state;
    if (!auth.uid) {
      return <Redirect to="/signIn" />;
    }

    if (currentMatch) {
      if (!currentMatch[0].initialPlayersNeeded && score) {
        return (
          <Container>
            <Row>
              <div className="my-2">
                {/* heading */}
                <div className="m-3 border-bottom border-primary pb-3 score-label">
                  {currentMatch[0].teamOne} vs {currentMatch[0].teamTwo} at{" "}
                  {currentMatch[0].venueMap ? (
                    <a target="_blank" href={currentMatch[0].venueMap}>
                      {currentMatch[0].venue}
                    </a>
                  ) : (
                    currentMatch[0].venue
                  )}
                  <div className="text-danger score-values">
                    {currentMatch[0].currentInnings === "FIRST_INNINGS"
                      ? "1st"
                      : "2nd"}{" "}
                    Inn
                  </div>
                </div>
                {/* top panel */}
                <div className="container">
                  <div className="row text-center px-4">
                    <div className="col-3 bg-danger text-white p-1">
                      <div className="score-label text-uppercase">score</div>
                      <div className="score-values">
                        {score.totalRuns}/{score.totalWickets}
                      </div>
                    </div>
                    <div className="col-6 p-1 bg-light">
                      <div className="score-label text-uppercase">crr</div>
                      <div className="score-values">{score.CRR}</div>
                    </div>
                    <div className="col-3 bg-danger text-white p-1">
                      <div className="score-label text-uppercase">overs</div>
                      <div className="score-values">
                        {score.currentOver}/{currentMatch[0].overs}
                      </div>
                    </div>
                  </div>
                  <div className="row my-1 px-4">
                    <div className="col bg-light">
                      <div className="row">
                        <div className="col-2 text-uppercase p-1">
                          <img
                            src={
                              "https://static.thenounproject.com/png/635343-200.png"
                            }
                            alt="Bat"
                            className="img-fluid"
                          />
                        </div>
                        <div className="col-10 text-capitalize text-truncate border-right p-1">
                          {striker && striker.name}
                        </div>
                      </div>
                    </div>
                    <div className="col">
                      <div className="row bg-light">
                        <div className="col-10 text-capitalize text-truncate p-1">
                          {bowler && bowler.name}
                        </div>
                        <div className="col-2 text-uppercase p-1">
                          <img
                            src={
                              "https://static.thenounproject.com/png/866374-200.png"
                            }
                            alt="Bat"
                            className="img-fluid"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row my-1 px-4">
                    <div className="col p-1 bg-light">
                      {striker.runs}({striker.balls})
                    </div>
                    <div className="col p-1 bg-light">
                      <span className="float-right">
                        {bowler.runs}/{bowler.wickets}(
                        {calculateOvers(bowler.balls)})
                      </span>
                    </div>
                  </div>
                  <div className="row my-1 py-1 px-4">
                    {this.lastSixBalls(score.lastSixBalls)}
                  </div>
                </div>
                {/* runs panel */}
                <div className="bg-light text-dark p-3">
                  <div className="row">
                    <div className="score-label text-center text-uppercase col-12 mb-2">
                      runs
                    </div>
                    <div className="text-center col-12">
                      {ER.map((eachRun, index) => (
                        <span
                          key={index}
                          onClick={() => {
                            this.handleRunClick(eachRun);
                          }}
                          id={eachRun.id}
                          className={
                            eachRun.selected
                              ? eachRun.selectedStyle
                              : eachRun.style
                          }
                        >
                          {eachRun.run}
                        </span>
                      ))}
                    </div>
                  </div>
                  {error && <div className="error">{error}</div>}
                  <hr />
                  <div className="row text-center">
                    <div className="col">
                      <h3 className="score-label">extra</h3>

                      {EE.map((eachExtra, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            this.handleExtra(eachExtra);
                          }}
                          id={eachExtra.id}
                          className={
                            eachExtra.selected
                              ? eachExtra.selectedStyle
                              : eachExtra.style
                          }
                          disabled={
                            currentRunJson.run === 0 &&
                            eachExtra.zeroRunDisabled
                          }
                        >
                          {eachExtra.type}
                        </button>
                      ))}
                    </div>
                    <div className="col">
                      <h3 className="score-label">wicket</h3>

                      {WK.map((eachOut, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            this.handleOut(eachOut);
                          }}
                          id={eachOut.id}
                          className={
                            eachOut.selected
                              ? eachOut.selectedStyle
                              : eachOut.style
                          }
                          disabled={
                            currentRunJson.run !== 0 && eachOut.runDisabled
                          }
                        >
                          {eachOut.type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {/* score submit */}
                <div className="container mt-2">
                  {!scoreSubmitted ? (
                    <button
                      onClick={this.handleScore}
                      className="btn btn-block btn-success text-uppercase"
                    >
                      Submit
                    </button>
                  ) : (
                    <button
                      onClick={this.handleReset}
                      className="btn btn-block btn-danger text-uppercase"
                    >
                      Undo
                    </button>
                  )}
                </div>
                {/* change player panel */}
                <div className="container my-2">
                  <div className="row">
                    <div className="col">
                      <button
                        onClick={this.handleStrike}
                        className="btn btn-success text-uppercase"
                      >
                        Change strike
                      </button>
                    </div>
                    <div className="col">
                      <button
                        onClick={this.handleBowler}
                        className="btn btn-warning text-uppercase"
                      >
                        Change bowler
                      </button>
                    </div>
                    <div className="col">
                      {currentMatch[0].currentInnings === "FIRST_INNINGS" && (
                        <button
                          onClick={() => this.handleConfirm("INNINGS")}
                          className="btn btn-danger text-uppercase"
                        >
                          end innings
                        </button>
                      )}
                      {currentMatch[0].currentInnings === "SECOND_INNINGS" && (
                        <button
                          onClick={() => this.handleConfirm("MATCH")}
                          className="btn btn-danger text-uppercase"
                        >
                          end match
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {/* live scorecard */}
                <LiveScorecard
                  striker={striker}
                  nonStriker={nonStriker}
                  bowler={bowler}
                />
                {/* Full scoredard */}
                <Link
                  to={`/match/${currentMatch[0].id}/scorecard`}
                  className="btn btn-info btn-block"
                  target="_blank"
                >
                  Full Scorecard
                </Link>
                {/* modals */}
                <BowlerModal
                  openModal={bowlerModalFlag}
                  submitBowler={this.handleChangeBowler}
                  bowlingSquad={bowlingSquad}
                  bowlingTeam={bowlingTeam}
                  bowlingTeamId={bowlingTeamId}
                  toggle={this.toggle}
                />
                <OutModal
                  openModal={outModalFlag}
                  toggle={this.toggleOutModal}
                  striker={striker}
                  nonStriker={nonStriker}
                  handleWhoIsOut={this.handleWhoIsOut}
                />
                <BatsmanModal
                  openModal={batsmanModal}
                  submitBatsman={this.handleChangeBatsman}
                  battingSquad={battingSquad}
                  battingTeam={battingTeam}
                  battingTeamId={battingTeamId}
                />
                <ConfirmModal
                  openModal={confirmEndFlag}
                  toggle={this.toggleConfirmModal}
                  heading={confirmHeaderText}
                  confirmClick={this.handleConfirmClick}
                />
              </div>
            </Row>
          </Container>
        );
      } else {
        return (
          <AddPlayerModal
            openModal={currentMatch[0].initialPlayersNeeded}
            submitInitialPlayers={this.handleInitialPlayers}
            battingSquad={battingSquad}
            bowlingSquad={bowlingSquad}
            bowlingTeam={bowlingTeam}
            bowlingTeamId={bowlingTeamId}
            battingTeam={battingTeam}
            battingTeamId={battingTeamId}
            currentMatch={currentMatch[0]}
          />
        );
      }
    } else {
      return (
        <div className="container center">
          <p>Loading Project...</p>
        </div>
      );
    }
  }
}

const mapStateToProps = (state) => {
  let striker = {};
  let bowler = {};
  let nonStriker = {};
  let currentMatch = state.firestore.ordered.matches;
  let scores,
    score,
    previousScore = {};

  let currentInningsBowling, currentInningsBatting;
  if (currentMatch) {
    if (currentMatch[0].currentInnings === "FIRST_INNINGS") {
      scores = state.firestore.ordered.firstInningsScore;
      currentInningsBowling = state.firestore.ordered.firstInningsBowling;
      currentInningsBatting = state.firestore.ordered.firstInningsBatting;
    } else {
      scores = state.firestore.ordered.secondInningsScore;
      currentInningsBowling = state.firestore.ordered.secondInningsBowling;
      currentInningsBatting = state.firestore.ordered.secondInningsBatting;
    }
    if (!currentMatch[0].initialPlayersNeeded && scores) {
      score = scores[0];
      if (scores[1]) previousScore = scores[1];
      striker = score.striker || null;
      bowler = score.bowler || null;
      nonStriker = score.nonStriker || null;

      if (score.runs % 2 !== 0) {
        let tempStriker = striker;
        striker = nonStriker;
        nonStriker = tempStriker;
      }
      if (score.ball !== 0 && score.ball % 6 === 0 && !score.extra) {
        let tempStriker = striker;
        striker = nonStriker;
        nonStriker = tempStriker;
      }
      if (!isEmpty(score.newBowler) && score.newBowler.id !== bowler.id) {
        bowler = score.newBowler;
      }

      if (!isEmpty(score.newBatsman)) {
        if (striker.out) {
          striker = score.newBatsman;
        }
        if (nonStriker.out) {
          nonStriker = score.newBatsman;
        }
      }
      striker = { ...striker, onStrike: true, out: false };
      nonStriker = { ...nonStriker, onStrike: false, out: false };
      if (score.changeStrike) {
        let tempStriker = striker;
        striker = nonStriker;
        nonStriker = tempStriker;
      }
    }
  }
  return {
    auth: state.firebase.auth,
    currentMatch: state.firestore.ordered.matches,
    score: score,
    previousScore: previousScore,
    bowler: bowler,
    striker: striker,
    nonStriker: nonStriker,
    bowlingSquad: state.matches.bowlingSquad,
    battingSquad: state.matches.battingSquad,
    currentInningsBatting: currentInningsBatting,
    currentInningsBowling: currentInningsBowling,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    addScoreToMatch: (score, whichCollection) =>
      dispatch(addScoreToMatch(score, whichCollection)),
    getTeamPlayers: (teamId, teamAction) =>
      dispatch(getTeamPlayers(teamId, teamAction)),
    addBowler: (bowler) => dispatch(addBowler(bowler)),
    addBatsman: (batsman) => dispatch(addBatsman(batsman)),
    updateScore: (score, whichCollection) =>
      dispatch(updateScore(score, whichCollection)),
    addPlayers: (striker, nonStriker, bowler) =>
      dispatch(addPlayers(striker, nonStriker, bowler)),
    resetScore: (score, previousScore, whichCollection) =>
      dispatch(resetScore(score, previousScore, whichCollection)),
    updateMatch: (payload) => dispatch(updateMatch(payload)),
  };
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  firestoreConnect((props) => [
    { collection: "matches", doc: props.match.params.matchId },
    { collection: "teams" },
    {
      collection: "matches",
      doc: props.match.params.matchId,
      subcollections: [{ collection: "firstInningsBatting" }],
      storeAs: "firstInningsBatting",
    },
    {
      collection: "matches",
      doc: props.match.params.matchId,
      subcollections: [{ collection: "firstInningsBowling" }],
      storeAs: "firstInningsBowling",
    },
    {
      collection: "matches",
      doc: props.match.params.matchId,
      subcollections: [{ collection: "secondInningsBatting" }],
      storeAs: "secondInningsBatting",
    },
    {
      collection: "matches",
      doc: props.match.params.matchId,
      subcollections: [{ collection: "secondInningsBowling" }],
      storeAs: "secondInningsBowling",
    },
    {
      collection: "matches",
      doc: props.match.params.matchId,
      subcollections: [
        {
          collection: "firstInningsScore",
          orderBy: ["createdAt", "desc"],
          limit: 2,
        },
      ],
      storeAs: "firstInningsScore",
    },
    {
      collection: "matches",
      doc: props.match.params.matchId,
      subcollections: [
        {
          collection: "secondInningsScore",
          orderBy: ["createdAt", "desc"],
          limit: 2,
        },
      ],
      storeAs: "secondInningsScore",
    },
  ])
)(Console);
