import { isEmpty } from "lodash";

export const createMatch = (match) => {
  return (dispatch, getState, { getFirebase, getFirestore }) => {
    const firestore = getFirestore();
    const profile = getState().firebase.profile;
    const scorerId = getState().firebase.auth.uid;
    const ref = firestore.collection("matches").doc();
    if (match.tournamentId === "") {
      const tournamentRef = firestore.collection("tournaments").doc();
      match = { ...match, tournamentId: tournamentRef.id };
      tournamentRef
        .set({
          name: match.tournament,
          entryFee: "",
          winnerPrizeMoney: "",
          runnerPrizeMoney: "",
          sponsors: "",
          teams: "",
          scorerFirstName: profile.firstName,
          scorerLastName: profile.lastName,
          scorerId: scorerId,
          status: 1,
          createdAt: new Date(),
        })
        .then(() => {
          console.log(match.tournament + " tournament added successfully");
        })
        .catch((err) => console.log(err));
    }
    if (match.teamOneId === "") {
      const teamOneref = firestore.collection("teams").doc();
      match = { ...match, teamOneId: teamOneref.id };
      teamOneref
        .set({
          name: match.teamOne,
          scorerFirstName: profile.firstName,
          scorerLastName: profile.lastName,
          scorerId: scorerId,
          status: 1,
          createdAt: new Date(),
        })
        .then(() => {
          console.log(match.teamOne + " team added successfully");
        })
        .catch((err) => console.log(err));
    }

    if (match.teamTwoId === "") {
      const teamTworef = firestore.collection("teams").doc();
      match = { ...match, teamTwoId: teamTworef.id };
      teamTworef
        .set({
          name: match.teamTwo,
          scorerFirstName: profile.firstName,
          scorerLastName: profile.lastName,
          scorerId: scorerId,
          status: 1,
          createdAt: new Date(),
        })
        .then(() => {
          console.log(match.teamTwo + " team added successfully");
        })
        .catch((err) => console.log(err));
    }
    if (match.batting === "teamOne") {
      match = {
        ...match,
        firstBattingId: match.teamOneId,
        firstBatting: match.teamOne,
        firstBowlingId: match.teamTwoId,
        firstBowling: match.teamTwo,
        secondBowlingId: match.teamOneId,
        secondBowling: match.teamOne,
        secondBattingId: match.teamTwoId,
        secondBatting: match.teamTwo,
      };
    } else {
      match = {
        ...match,
        firstBattingId: match.teamTwoId,
        firstBatting: match.teamTwo,
        firstBowlingId: match.teamOneId,
        firstBowling: match.teamOne,
        secondBattingId: match.teamOneId,
        secondBatting: match.teamOne,
        secondBowlingId: match.teamTwoId,
        secondBowling: match.teamTwo,
      };
    }
    let tossInformation =
      match.toss === "teamOne"
        ? match.batting === "teamOne"
          ? `${match.teamOne} won the toss and elected to bat first`
          : `${match.teamOne} won the toss and elected to field first`
        : match.batting === "teamTwo"
        ? `${match.teamTwo} won the toss and elected to bat first`
        : `${match.teamTwo} won the toss and elected to field first`;
    ref
      .set({
        ...match,
        venue: match.venue ? match.venue : "Local Ground",
        scorerFirstName: profile.firstName,
        scorerLastName: profile.lastName,
        scorerId: scorerId,
        status: 1,
        statusType: "TOSS",
        currentInnings: "FIRST_INNINGS",
        initialPlayersNeeded: true,
        firstInningsRuns: 0,
        firstInningsOvers: 0.0,
        firstInningsWickets: 0,
        secondInningsRuns: 0,
        secondInningsOvers: 0.0,
        secondInningsWickets: 0,
        tossInformation: tossInformation,
        resetsRemaining: 5,
        createdAt: new Date(),
      })
      .then(() => {
        match = { ...match, id: ref.id };
        dispatch({ type: "CREATE_MATCH", match });
      })
      .catch((err) => console.log(err));
  };
};
export const addBowler = (player) => {
  return (dispatch, getState, { getFirebase, getFirestore }) => {
    const firestore = getFirestore();
    const currentMatch = getState().firestore.ordered.matches;
    let score = getState().firestore.ordered.secondInningsScore;
    const match = currentMatch[0];
    let scoreCollection = "secondInningsScore";
    if (match.currentInnings === "FIRST_INNINGS") {
      scoreCollection = "firstInningsScore";
      score = getState().firestore.ordered.firstInningsScore;
    }
    if (player.id === "") {
      const playerRef = firestore.collection("players").doc();
      player = { ...player, id: playerRef.id };
      dispatch(addPlayer(player));
    }
    let scorePayload = {
      ...score[0],
      newBowler: player,
      currentBowlingOrder: player.bowlingOrder,
    };
    dispatch(updateScore(scorePayload, scoreCollection));
  };
};
export const addBatsman = (player) => {
  return (dispatch, getState, { getFirebase, getFirestore }) => {
    const firestore = getFirestore();
    const currentMatch = getState().firestore.ordered.matches;
    let score = getState().firestore.ordered.secondInningsScore;
    const match = currentMatch[0];
    let scoreCollection = "secondInningsScore";
    if (match.currentInnings === "FIRST_INNINGS") {
      scoreCollection = "firstInningsScore";
      score = getState().firestore.ordered.firstInningsScore;
    }
    if (player.id === "") {
      const playerRef = firestore.collection("players").doc();
      player = { ...player, id: playerRef.id };
      dispatch(addPlayer(player));
    }
    let scorePayload = {
      ...score[0],
      newBatsman: player,
      currentBattingOrder: player.battingOrder,
    };
    dispatch(updateScore(scorePayload, scoreCollection));
  };
};
export const addPlayers = (striker, nonStriker, bowler) => {
  return (dispatch, getState, { getFirebase, getFirestore }) => {
    const firestore = getFirestore();
    const currentMatch = getState().firestore.ordered.matches;
    const match = currentMatch[0];
    let battingCollection,
      bowlingCollection,
      scoreCollection,
      status,
      statusType;
    if (match.currentInnings === "FIRST_INNINGS") {
      battingCollection = "firstInningsBatting";
      bowlingCollection = "firstInningsBowling";
      scoreCollection = "firstInningsScore";
      status = 2;
      statusType = "STARTED";
    } else {
      battingCollection = "secondInningsBatting";
      bowlingCollection = "secondInningsBowling";
      scoreCollection = "secondInningsScore";
      status = 4;
      statusType = "STARTED";
    }
    if (striker.id === "") {
      const strikerRef = firestore.collection("players").doc();
      striker = { ...striker, id: strikerRef.id };
      dispatch(addPlayer(striker));
    }
    if (nonStriker.id === "") {
      const nonStrikerRef = firestore.collection("players").doc();
      nonStriker = { ...nonStriker, id: nonStrikerRef.id };
      dispatch(addPlayer(nonStriker));
    }

    if (bowler.id === "") {
      const bowlerRef = firestore.collection("players").doc();
      bowler = { ...bowler, id: bowlerRef.id };
      dispatch(addPlayer(bowler));
    }
    let score = {
      ball: 0,
      bowler: bowler,
      striker: striker,
      nonStriker: nonStriker,
      runs: 0,
      out: false,
      lastSixBalls: [],
      totalRuns: 0,
      totalWickets: 0,
      CRR: 0,
      EXP: 0,
      currentOver: 0.0,
      newBatsman: {},
      newBowler: {},
      overCompleted: false,
      extra: false,
      boundary: false,
      extraType: "",
      whoIsOut: "",
      nextBallCounted: true,
      currentBattingOrder: 2,
      currentBowlingOrder: 1,
    };
    let matchPayload = {
      ...match,
      status: status,
      statusType: statusType,
      initialPlayersNeeded: false,
    };
    dispatch(addScoreToMatch(score, scoreCollection));
    dispatch(updateMatch(matchPayload));
  };
};
export const addPlayerToMatch = (player, whichCollection) => {
  return (dispatch, getState, { getFirebase, getFirestore }) => {
    const firestore = getFirestore();
    const profile = getState().firebase.profile;
    const scorerId = getState().firebase.auth.uid;
    const currentMatch = getState().firestore.ordered.matches;
    const match = currentMatch[0];
    firestore
      .collection("matches")
      .doc(match.id)
      .collection(whichCollection)
      .doc(player.id)
      .set({
        ...player,
        out: false,
        addedBy: scorerId,
        addedByName: `${profile.firstName} ${profile.lastName}`,
        status: 1,
        createdAt: new Date(),
      })
      .then(() => {
        console.log(player.name + " added to match");
      })
      .catch((err) => console.log(err));
  };
};
export const addPlayer = (player) => {
  return (dispatch, getState, { getFirebase, getFirestore }) => {
    const firestore = getFirestore();
    const profile = getState().firebase.profile;
    const scorerId = getState().firebase.auth.uid;
    firestore
      .collection("players")
      .doc(player.id)
      .set({
        name: player.name,
        addedBy: scorerId,
        addedByName: `${profile.firstName} ${profile.lastName}`,
        status: 1,
        createdAt: new Date(),
      })
      .then(() => {
        console.log(player.name + " added");
      })
      .catch((err) => console.log(err));
    firestore
      .collection("teams")
      .doc(player.teamId)
      .collection("players")
      .doc(player.id)
      .set({
        id: player.id,
        name: player.name,
        addedBy: scorerId,
        addedByName: `${profile.firstName} ${profile.lastName}`,
        status: 1,
        createdAt: new Date(),
      })
      .then(() => {
        console.log(player.name + " added to team " + player.teamName);
      })
      .catch((err) => console.log(err));
  };
};
export const addScoreToMatch = (score, whichCollection) => {
  return (dispatch, getState, { getFirebase, getFirestore }) => {
    const firestore = getFirestore();
    const profile = getState().firebase.profile;
    const scorerId = getState().firebase.auth.uid;
    const currentMatch = getState().firestore.ordered.matches;
    const match = currentMatch[0];
    firestore
      .collection("matches")
      .doc(match.id)
      .collection(whichCollection)
      .add({
        ...score,
        matchId: match.id,
        addedBy: scorerId,
        addedByName: `${profile.firstName} ${profile.lastName}`,
        status: 1,
        createdAt: new Date(),
      })
      .then(() => {
        console.log("score added to match");
        let finalScore;
        let localStriker = score.striker;
        let localNonStriker = score.nonStriker;
        let localBowler = score.bowler;
        if (whichCollection === "firstInningsScore") {
          finalScore = {
            firstInningsRuns: score.totalRuns,
            firstInningsWickets: score.totalWickets,
            firstInningsOvers: score.currentOver,
            updatedAt: new Date(),
          };
        } else {
          finalScore = {
            secondInningsRuns: score.totalRuns,
            secondInningsWickets: score.totalWickets,
            secondInningsOvers: score.currentOver,
            updatedAt: new Date(),
          };
        }
        dispatch(createInningsScore(finalScore, match.id));

        dispatch(createBatsmanScore(localStriker, match.id, whichCollection));
        dispatch(
          createBatsmanScore(localNonStriker, match.id, whichCollection)
        );
        dispatch(createBowlerScore(localBowler, match.id, whichCollection));
      })
      .catch((err) => console.log(err));
  };
};

export const resetScore = (score, previousScore, whichCollection) => {
  return (dispatch, getState, { getFirebase, getFirestore }) => {
    const firestore = getFirestore();
    const currentMatch = getState().firestore.ordered.matches;
    const match = currentMatch[0];
    console.log(match.resetsRemaining);
    firestore
      .collection("matches")
      .doc(match.id)
      .collection(whichCollection)
      .doc(score.id)
      .delete()
      .then(() => {
        console.log("score deleted from match");
        let finalScore;
        let localStriker = previousScore.striker.out
          ? previousScore.newBatsman
          : previousScore.striker;
        let localNonStriker = previousScore.nonStriker.out
          ? previousScore.newBatsman
          : previousScore.nonStriker;
        let localBowler = !isEmpty(previousScore.newBowler)
          ? previousScore.newBowler
          : previousScore.bowler;
        let updateThisBatsman = score.out
          ? {
              ...score.newBatsman,
              onStrike: false,
              battingOrder: 0,
              didNotBat: true,
            }
          : false;
        if (whichCollection === "firstInningsScore") {
          finalScore = {
            firstInningsRuns: previousScore.totalRuns,
            firstInningsWickets: previousScore.totalWickets,
            firstInningsOvers: previousScore.currentOver,
            updatedAt: new Date(),
            resetsRemaining: match.resetsRemaining - 1,
          };
        } else {
          finalScore = {
            secondInningsRuns: previousScore.totalRuns,
            secondInningsWickets: previousScore.totalWickets,
            secondInningsOvers: previousScore.currentOver,
            resetsRemaining: match.resetsRemaining - 1,
            updatedAt: new Date(),
          };
        }
        dispatch(createInningsScore(finalScore, match.id));
        dispatch(createBatsmanScore(localStriker, match.id, whichCollection));
        dispatch(
          createBatsmanScore(localNonStriker, match.id, whichCollection)
        );
        dispatch(createBowlerScore(localBowler, match.id, whichCollection));
        if (updateThisBatsman)
          dispatch(
            createBatsmanScore(updateThisBatsman, match.id, whichCollection)
          );
      })
      .catch((err) => console.log(err));
  };
};

export const deleteMatch = (matchId) => {
  return (dispatch, getState, { getFirebase, getFirestore }) => {
    const firestore = getFirestore();
    firestore
      .collection("matches")
      .doc(matchId)
      .delete()
      .then(() => {
        console.log("match deleted");
      })
      .catch((err) => console.log(err));
  };
};

export const getTeamPlayers = (teamId, teamAction) => {
  return (dispatch, getState, { getFirebase, getFirestore }) => {
    const firestore = getFirestore();
    firestore
      .collection("teams")
      .doc(teamId)
      .collection("players")
      .get()
      .then((somedoc) => {
        if (somedoc.size > 0) {
          let teamData = [];
          somedoc.forEach((snapshot) => {
            let teamSingleData = snapshot.data();
            teamData.push(teamSingleData);
          });
          if (teamAction === "batting") {
            dispatch({ type: "BATTING_TEAM_SQUAD", teamData });
          } else {
            dispatch({ type: "BOWLING_TEAM_SQUAD", teamData });
          }
        } else {
        }
      })
      .catch((err) => console.log(err));
  };
};
export const updateMatch = (payload) => {
  return (dispatch, getState, { getFirebase, getFirestore }) => {
    const firestore = getFirestore();
    const currentMatch = getState().firestore.ordered.matches;
    const match = currentMatch[0];
    firestore
      .collection("matches")
      .doc(match.id)
      .set({
        ...payload,
        updatedAt: new Date(),
      })
      .then(() => {
        // dispatch({ type: "CREATE_MATCH", match });
        console.log("match updated...");
      })
      .catch((err) => console.log(err));
  };
};
export const overComplete = () => {
  return (dispatch, getState) => {
    dispatch({ type: "OVER_COMPLETE" });
  };
};
export const overStart = () => {
  return (dispatch, getState) => {
    dispatch({ type: "OVER_START" });
  };
};
export const updateScore = (payload, whichCollection) => {
  return (dispatch, getState, { getFirebase, getFirestore }) => {
    const firestore = getFirestore();
    const currentMatch = getState().firestore.ordered.matches;
    const match = currentMatch[0];
    firestore
      .collection("matches")
      .doc(match.id)
      .collection(whichCollection)
      .doc(payload.id)
      .set({
        ...payload,
        updatedAt: new Date(),
      })
      .then(() => {
        console.log("score updated... ");
      })
      .catch((err) => console.log(err));
  };
};

const createInningsScore = (finalScore, matchId) => {
  return (dispatch, getState, { getFirebase, getFirestore }) => {
    const firestore = getFirestore();
    firestore
      .collection("matches")
      .doc(matchId)
      .set(finalScore, { merge: true })
      .then((doc) => {
        // console.log(doc);
      })
      .catch((err) => console.log(err));
  };
};

const createBatsmanScore = (striker, matchId, whichCollection) => {
  return (dispatch, getState, { getFirebase, getFirestore }) => {
    const firestore = getFirestore();
    firestore
      .collection("matches")
      .doc(matchId)
      .collection(whichCollection)
      .doc(striker.id)
      .set(striker, { merge: true })
      .then((doc) => {
        // console.log(doc);
      })
      .catch((err) => console.log(err));
  };
};

const createBowlerScore = (bowler, matchId, whichCollection) => {
  return (dispatch, getState, { getFirebase, getFirestore }) => {
    const firestore = getFirestore();
    firestore
      .collection("matches")
      .doc(matchId)
      .collection(whichCollection)
      .doc(bowler.id)
      .set(bowler, { merge: true })
      .then((doc) => {
        // console.log(doc);
      })
      .catch((err) => console.log(err));
  };
};
