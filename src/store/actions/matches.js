export const createMatch = match => {
  return (dispatch, getState, { getFirebase, getFirestore }) => {
    const firestore = getFirestore();
    const profile = getState().firebase.profile;
    const scorerId = getState().firebase.auth.uid;
    const ref = firestore.collection("matches").doc();
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
          createdAt: new Date()
        })
        .then(() => {
          console.log("team added successfully");
        })
        .catch(err => console.log(err));
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
          createdAt: new Date()
        })
        .then(() => {
          console.log("team added successfully");
        })
        .catch(err => console.log(err));
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
        secondbatting: match.teamTwo
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
        secondBowling: match.teamTwo
      };
    }
    console.log(match);
    ref
      .set({
        ...match,
        scorerFirstName: profile.firstName,
        scorerLastName: profile.lastName,
        scorerId: scorerId,
        status: 1,
        statusType: "CREATED",
        currentInnings: "FIRST_INNINGS",
        createdAt: new Date()
      })
      .then(() => {
        match = { ...match, id: ref.id };
        dispatch({ type: "CREATE_MATCH", match });
      })
      .catch(err => console.log(err));
  };
};
export const addBowler = player => {
  return (dispatch, getState, { getFirebase, getFirestore }) => {
    const firestore = getFirestore();
    const currentMatch = getState().firestore.ordered.matches;
    const score = getState().firestore.ordered.firstInningsScore;
    const match = currentMatch[0];
    let whichCollection = "secondInningsBowling";
    let scoreCollection = "secondInningsScore";
    if (match.currentInnings === "FIRST_INNINGS") {
      whichCollection = "firstInningsBowling";
      scoreCollection = "firstInningsScore";
    }
    if (player.id === "") {
      const playerRef = firestore.collection("players").doc();
      player = { ...player, id: playerRef.id };
      dispatch(addPlayer(player));
    }
    dispatch(addPlayerToMatch(player, whichCollection));
    let scorePlayload = { ...score[0], newBowler: player };
    dispatch(updateScore(scorePlayload, scoreCollection));
  };
};
export const addPlayers = (striker, nonStriker, bowler) => {
  return (dispatch, getState, { getFirebase, getFirestore }) => {
    const firestore = getFirestore();
    const currentMatch = getState().firestore.ordered.matches;
    console.log(currentMatch);
    const match = currentMatch[0];
    let battingCollection, bowlingCollection, scoreCollection;
    if (match.currentInnings === "FIRST_INNINGS") {
      battingCollection = "firstInningsBatting";
      bowlingCollection = "firstInningsBowling";
      scoreCollection = "firstInningsScore";
    } else {
      battingCollection = "secondInningsBatting";
      bowlingCollection = "secondInningsBowling";
      scoreCollection = "secondInningsScore";
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
    dispatch(addPlayerToMatch(nonStriker, battingCollection));
    dispatch(addPlayerToMatch(bowler, bowlingCollection));
    dispatch(addPlayerToMatch(striker, battingCollection));
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
      whoIsOut: ""
    };
    let matchPayload = { ...match, status: 2, statusType: "STARTED" };
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
    console.log(match);
    console.log(player);
    console.log(whichCollection);
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
        createdAt: new Date()
      })
      .then(() => {
        console.log("player added to match");
        // dispatch({ type: "CREATE_PLAYERS", players });
      })
      .catch(err => console.log(err));
  };
};
export const addPlayer = player => {
  return (dispatch, getState, { getFirebase, getFirestore }) => {
    const firestore = getFirestore();
    const profile = getState().firebase.profile;
    const scorerId = getState().firebase.auth.uid;
    console.log(player);
    firestore
      .collection("players")
      .doc(player.id)
      .set({
        name: player.name,
        addedBy: scorerId,
        addedByName: `${profile.firstName} ${profile.lastName}`,
        status: 1,
        createdAt: new Date()
      })
      .then(() => {
        console.log("player added");
      })
      .catch(err => console.log(err));
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
        createdAt: new Date()
      })
      .then(() => {
        console.log("player added to team");
      })
      .catch(err => console.log(err));
  };
};
export const addScoreToMatch = (score, whichCollection) => {
  return (dispatch, getState, { getFirebase, getFirestore }) => {
    const firestore = getFirestore();
    const profile = getState().firebase.profile;
    const scorerId = getState().firebase.auth.uid;
    const currentMatch = getState().firestore.ordered.matches;
    const match = currentMatch[0];
    console.log(match);
    console.log(score);
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
        createdAt: new Date()
      })
      .then(() => {
        console.log("score added to match");
        console.log(score);
        dispatch(updateMatchPlayer(score.striker, "firstInningsBatting"));
        dispatch(updateMatchPlayer(score.nonStriker, "firstInningsBatting"));
        dispatch(updateMatchPlayer(score.bowler, "firstInningsBowling"));
        dispatch({ type: "ADD_SCORE", score });
      })
      .catch(err => console.log(err));
  };
};

export const getTeamPlayers = (teamId, teamAction) => {
  return (dispatch, getState, { getFirebase, getFirestore }) => {
    const firestore = getFirestore();
    console.log(teamId);
    firestore
      .collection("teams")
      .doc(teamId)
      .collection("players")
      .get()
      .then(somedoc => {
        if (somedoc.size > 0) {
          let teamData = [];
          somedoc.forEach(snapshot => {
            let teamSingleData = snapshot.data();
            console.log(teamData);
            teamData.push(teamSingleData);
          });
          if (teamAction === "batting") {
            dispatch({ type: "BATTING_TEAM_SQUAD", teamData });
          } else {
            dispatch({ type: "BOWLING_TEAM_SQUAD", teamData });
          }
          // console.log(somedoc.data());
        } else {
          console.log("no data available");
        }
      })
      .catch(err => console.log(err));
  };
};
export const updateMatch = payload => {
  return (dispatch, getState, { getFirebase, getFirestore }) => {
    const firestore = getFirestore();
    const currentMatch = getState().firestore.ordered.matches;
    const match = currentMatch[0];
    firestore
      .collection("matches")
      .doc(match.id)
      .set({
        ...payload,
        updatedAt: new Date()
      })
      .then(() => {
        dispatch({ type: "CREATE_MATCH", match });
      })
      .catch(err => console.log(err));
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
    console.log(match);
    console.log(payload);
    console.log(whichCollection);
    firestore
      .collection("matches")
      .doc(match.id)
      .collection(whichCollection)
      .doc(payload.id)
      .set({
        ...payload,
        updatedAt: new Date()
      })
      .then(() => {
        console.log(payload, "score updated");
      })
      .catch(err => console.log(err));
  };
};
export const updateMatchPlayer = (payload, whichCollection) => {
  //later this should be a cloud function
  return (dispatch, getState, { getFirebase, getFirestore }) => {
    const firestore = getFirestore();
    const currentMatch = getState().firestore.ordered.matches;
    const match = currentMatch[0];
    console.log(payload);
    console.log(whichCollection);
    console.log(match);
    firestore
      .collection("matches")
      .doc(match.id)
      .collection(whichCollection)
      .doc(payload.id)
      .set({
        ...payload,
        updatedAt: new Date()
      })
      .then(() => {
        console.log(payload, " updated");
      })
      .catch(err => console.log(err));
  };
};