import React, { Component } from "react";
import moment from "moment";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { createMatch } from "../../store/actions/matches";
import { compose } from "redux";
import { firestoreConnect } from "react-redux-firebase";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";
import "react-bootstrap-typeahead/css/Typeahead-bs4.css";

import { has, startCase, toLower } from "lodash";

class CreateMatch extends Component {
  state = {
    tournament: "",
    tournamentId: "",
    venue: "",
    players: 11,
    overs: 20,
    toss: "",
    batting: "",
    teamOne: "Team One",
    teamTwo: "Team Two",
    teamOneId: "",
    teamTwoId: "",
    error: "",
  };
  handleChange = (e) => {
    this.setState({ [e.target.id]: e.target.value });
  };
  handleSubmit = (e) => {
    e.preventDefault();
    const { teamOne, teamTwo, toss, batting } = this.state;
    if (teamOne === "Team One") {
      this.setState({ error: "Team One is required" });
    } else if (teamTwo === "Team Two") {
      this.setState({ error: "Team Two is required" });
    } else if (toss === "") {
      this.setState({ error: "Toss is required" });
    } else if (batting === "") {
      this.setState({ error: "Batting is required" });
    } else {
      this.props.createMatch(this.state);
      this.props.history.push("/matches");
    }
  };
  render() {
    const { teamOne, teamTwo, error, players, overs } = this.state;
    const { auth, teams, tournaments } = this.props;
    if (!auth.uid) {
      return <Redirect to="/signIn" />;
    }
    return (
      <div className="container">
        <div className="row">
          <div className="col col-12">
            <form onSubmit={this.handleSubmit} autoComplete="off">
              <h5 className="dark">
                Match Data
                <div>{moment().format("MMMM Do, h:mm a")}</div>
              </h5>
              <hr />
              <div className="form-group row">
                <label htmlFor="venue" className="col-sm-4 col-form-label">
                  Venue
                </label>
                <div className="col-sm-8">
                  <input
                    type="text"
                    className="form-control"
                    id="venue"
                    onChange={this.handleChange}
                    required={true}
                  />
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="venueMap" className="col-sm-4 col-form-label">
                  Venue Google Map Link
                </label>
                <div className="col-sm-8">
                  <input
                    type="text"
                    className="form-control"
                    id="venueMap"
                    onChange={this.handleChange}
                    required={false}
                  />
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="tournament" className="col-sm-4 col-form-label">
                  Tournament
                </label>
                <div className="col-sm-8">
                  <Typeahead
                    id="tournaments"
                    labelKey="name"
                    onChange={(selected) => {
                      if (selected.length) {
                        let tournamentId;
                        if (has(selected[0], "customOption")) {
                          tournamentId = "";
                        } else {
                          tournamentId = selected[0].id;
                        }

                        this.setState({
                          tournament: startCase(toLower(selected[0].name)),
                          tournamentId: tournamentId,
                        });
                      }
                    }}
                    allowNew={true}
                    options={tournaments !== undefined ? tournaments : []}
                    filterBy={["name"]}
                    placeholder="Type tournament name..."
                    newSelectionPrefix="Choose : "
                  />
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="players" className="col-sm-4 col-form-label">
                  Number of Players / Team
                </label>
                <div className="col-sm-8">
                  <input
                    required={true}
                    type="text"
                    className="form-control"
                    id="players"
                    onChange={this.handleChange}
                    value={players}
                  />
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="overs" className="col-sm-4 col-form-label">
                  Number of Overs / Team
                </label>
                <div className="col-sm-8">
                  <input
                    required={true}
                    type="text"
                    className="form-control"
                    id="overs"
                    onChange={this.handleChange}
                    value={overs}
                  />
                </div>
              </div>
              <hr className="mb-3 border border-warning" />
              <div className="form-group row">
                <label htmlFor="teamOne" className="col-sm-4 col-form-label">
                  Team One
                </label>
                <div className="col-sm-8">
                  <Typeahead
                    id="teamOne"
                    labelKey="name"
                    onChange={(selected) => {
                      if (selected.length) {
                        let teamOneId;
                        if (has(selected[0], "customOption")) {
                          teamOneId = "";
                        } else {
                          teamOneId = selected[0].id;
                        }
                        this.setState({
                          teamOne: startCase(toLower(selected[0].name)),
                          teamOneId: teamOneId,
                        });
                      }
                    }}
                    allowNew={true}
                    options={teams !== undefined ? teams : []}
                    filterBy={["name"]}
                    placeholder="Type team name..."
                    newSelectionPrefix="Choose : "
                  />
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="teamTwo" className="col-sm-4 col-form-label">
                  Team Two
                </label>
                <div className="col-sm-8">
                  <Typeahead
                    id="teamTwo"
                    labelKey="name"
                    onChange={(selected) => {
                      if (selected.length) {
                        let teamTwoId;
                        if (has(selected[0], "customOption")) {
                          teamTwoId = "";
                        } else {
                          teamTwoId = selected[0].id;
                        }
                        this.setState({
                          teamTwo: startCase(toLower(selected[0].name)),
                          teamTwoId: teamTwoId,
                        });
                      }
                    }}
                    allowNew={true}
                    options={teams !== undefined ? teams : []}
                    filterBy={["name"]}
                    placeholder="Type team name..."
                    newSelectionPrefix="Choose : "
                  />
                </div>
              </div>
              <fieldset className="form-group">
                <div className="row">
                  <legend className="col-form-label col-sm-4 pt-0">
                    Toss Winner
                  </legend>
                  <div className="col-sm-8">
                    <div className="form-check">
                      <input
                        type="radio"
                        className="form-check-input"
                        id="tossTeamOne"
                        name="toss"
                        onChange={() => this.setState({ toss: "teamOne" })}
                      />
                      <label htmlFor="tossTeamOne">
                        <span>{teamOne}</span>
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        type="radio"
                        className="form-check-input"
                        id="tossTeamTwo"
                        name="toss"
                        onChange={() => this.setState({ toss: "teamTwo" })}
                      />
                      <label htmlFor="tossTeamTwo">
                        <span>{teamTwo}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </fieldset>
              <fieldset className="form-group">
                <div className="row">
                  <legend className="col-form-label col-sm-4 pt-0">
                    First Batting
                  </legend>
                  <div className="col-sm-8">
                    <div className="form-check">
                      <input
                        type="radio"
                        className="form-check-input"
                        id="battingTeamOne"
                        name="batting"
                        onChange={() => this.setState({ batting: "teamOne" })}
                      />
                      <label htmlFor="battingTeamOne">
                        <span>{teamOne}</span>
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        type="radio"
                        className="form-check-input"
                        id="battingTeamTwo"
                        name="batting"
                        onChange={() => this.setState({ batting: "teamTwo" })}
                      />
                      <label htmlFor="battingTeamTwo">
                        <span>{teamTwo}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </fieldset>
              {error && <div className="error">{error}</div>}
              <div className="form-group row">
                <div className="col-sm-8">
                  <button className="btn btn-primary">Add Match</button>
                </div>
              </div>
            </form>
          </div>
          <div className="col col-12">
            <h3>we will show instructions here</h3>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    auth: state.firebase.auth,
    teams: state.firestore.ordered.teams,
    tournaments: state.firestore.ordered.tournaments,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    createMatch: (match) => dispatch(createMatch(match)),
  };
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  firestoreConnect([{ collection: "teams" }, { collection: "tournaments" }])
)(CreateMatch);
