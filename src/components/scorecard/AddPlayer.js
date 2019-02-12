import React, { Component } from "react";
import moment from "moment";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { getTeamPlayers, addPlayer } from "../../store/actions/matches";
import { compose } from "redux";
import { firestoreConnect } from "react-redux-firebase";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";
import "react-bootstrap-typeahead/css/Typeahead-bs4.css";
import { has, startCase, toLower } from "lodash";

class AddPlayer extends Component {
  handleSubmit = e => {
    e.preventDefault();
    // this.props.createMatch(this.state);
    // this.props.history.push("/matches");
  };

  componentDidUpdate(previousProps, previousState) {
    const { currentMatch } = this.props;
    if (previousProps.currentMatch !== currentMatch) {
      if (currentMatch) {
        let teamOneAction =
          currentMatch[0].batting === "teamOne" ? "batting" : "bowling";
        let teamTwoAction =
          currentMatch[0].batting === "teamTwo" ? "batting" : "bowling";
        this.props.getTeamPlayers(currentMatch[0].teamOneId, teamOneAction);
        this.props.getTeamPlayers(currentMatch[0].teamTwoId, teamTwoAction);
      }
    }
  }
  render() {
    const { auth, bowlingSquad, battingSquad, currentMatch } = this.props;
    if (!auth.uid) {
      return <Redirect to="/signIn" />;
    }
    if (currentMatch) {
      const battingTeam =
        currentMatch[0].batting === "teamOne"
          ? currentMatch[0].teamOne
          : currentMatch[0].teamTwo;
      const bowlingTeam =
        currentMatch[0].batting === "teamOne"
          ? currentMatch[0].teamTwo
          : currentMatch[0].teamOne;
      const battingTeamId =
        currentMatch[0].batting === "teamOne"
          ? currentMatch[0].teamOneId
          : currentMatch[0].teamTwoId;
      const bowlingTeamId =
        currentMatch[0].batting === "teamOne"
          ? currentMatch[0].teamTwoId
          : currentMatch[0].teamOneId;
      return (
        <div className="container">
          <form onSubmit={this.handleSubmit} autoComplete="off">
            <div>
              <span>{currentMatch[0].currentInnings}</span>
              <span className="float-right">
                {moment().format("MMMM Do, h:mm a")}
              </span>
            </div>
            <h5 className="bg-dark text-light p-2">
              {currentMatch[0].teamOne}
              {currentMatch[0].toss === "teamOne" ? "(T)" : ""} vs{" "}
              {currentMatch[0].teamTwo}
              {currentMatch[0].toss === "teamTwo" ? "(T)" : ""}
            </h5>
            <hr />
            <h5>{battingTeam}</h5>
            <div className="form-group row">
              <label htmlFor="striker" className="col-sm-2 col-form-label">
                Striker
              </label>
              <div className="col-sm-10">
                <Typeahead
                  labelKey="name"
                  onChange={selected => {
                    if (selected.length) {
                      let strikerId;
                      if (has(selected[0], "customOption")) {
                        strikerId = "";
                      } else {
                        strikerId = selected[0].id;
                      }
                      this.props.addPlayer(
                        startCase(toLower(selected[0].name)),
                        strikerId,
                        battingTeamId,
                        currentMatch[0].id,
                        "batting",
                        currentMatch[0].currentInnings
                      );
                    }
                  }}
                  allowNew={true}
                  options={battingSquad !== undefined ? battingSquad : []}
                  filterBy={["name"]}
                  placeholder="Choose striker..."
                />
              </div>
            </div>
            <div className="form-group row">
              <label htmlFor="nonStriker" className="col-sm-2 col-form-label">
                Non Striker
              </label>
              <div className="col-sm-10">
                <Typeahead
                  labelKey="name"
                  onChange={selected => {
                    if (selected.length) {
                      let nonStrikerId;
                      if (has(selected[0], "customOption")) {
                        nonStrikerId = "";
                      } else {
                        nonStrikerId = selected[0].id;
                      }
                      this.props.addPlayer(
                        startCase(toLower(selected[0].name)),
                        nonStrikerId,
                        battingTeamId,
                        currentMatch[0].id,
                        "batting",
                        currentMatch[0].currentInnings
                      );
                    }
                  }}
                  allowNew={true}
                  options={battingSquad !== undefined ? battingSquad : []}
                  filterBy={["name"]}
                  placeholder="Choose non striker..."
                />
              </div>
            </div>
            <h5>{bowlingTeam}</h5>
            <div className="form-group row">
              <label htmlFor="bowler" className="col-sm-2 col-form-label">
                Bowler
              </label>
              <div className="col-sm-10">
                <Typeahead
                  labelKey="name"
                  onChange={selected => {
                    console.log(selected);
                    if (selected.length) {
                      let bowlerId;
                      if (has(selected[0], "customOption")) {
                        bowlerId = "";
                      } else {
                        bowlerId = selected[0].id;
                      }
                      this.props.addPlayer(
                        startCase(toLower(selected[0].name)),
                        bowlerId,
                        bowlingTeamId,
                        currentMatch[0].id,
                        "bowling",
                        currentMatch[0].currentInnings
                      );
                    }
                  }}
                  allowNew={true}
                  options={bowlingSquad !== undefined ? bowlingSquad : []}
                  filterBy={["name"]}
                  placeholder="Choose bowler..."
                />
              </div>
            </div>
            <div className="form-group row">
              <div className="col-sm-10">
                <button className="btn btn-primary">Add Players</button>
              </div>
            </div>
          </form>
        </div>
      );
    } else {
      return (
        <div className="container center">
          <p>Loading Project...</p>
        </div>
      );
    }
  }
}

const mapStateToProps = state => {
  console.log(state);
  return {
    auth: state.firebase.auth,
    currentMatch: state.firestore.ordered.matches,
    bowlingSquad: state.matches.bowlingSquad,
    battingSquad: state.matches.battingSquad
  };
};
const mapDispatchToProps = dispatch => {
  return {
    getTeamPlayers: (teamId, teamAction) =>
      dispatch(getTeamPlayers(teamId, teamAction)),
    addPlayer: (name, playerId, teamId, matchId, teamAction, currentInnings) =>
      dispatch(
        addPlayer(name, playerId, teamId, matchId, teamAction, currentInnings)
      )
  };
};

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  firestoreConnect(props => [
    { collection: "matches", doc: props.match.params.matchId }
  ])
)(AddPlayer);
