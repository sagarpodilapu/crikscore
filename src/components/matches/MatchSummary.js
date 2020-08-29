import React from "react";
import moment from "moment";
import { Link, Redirect } from "react-router-dom";
import firebase from "firebase";

const MatchSummary = ({ match, auth, user }) => {
  let url = `/match/${match.id}/score`;
  console.log(user);
  const removeMatch = (matchId) => {};

  const enableActions = auth.uid === match.scorerId;
  let matchStatusType,
    matchStatusTypeClass,
    showMatchLink = true;
  if (match.statusType === "STARTED") {
    matchStatusTypeClass = "badge-success";
    matchStatusType = "Started";
  } else if (match.statusType === "MATCH_ENDED") {
    matchStatusTypeClass = "badge-danger";
    matchStatusType = "Ended";
  } else if (match.statusType === "INNINGS_BREAK") {
    matchStatusTypeClass = "badge-info";
    matchStatusType = "Break";
  } else {
    showMatchLink = false;
    matchStatusType = "Toss";
    matchStatusTypeClass = "badge-secondary";
  }

  return (
    <div className="card mb-2">
      <div className="card-header text-capitalize">
        {match.venue}
        <span className="float-right">
          {match.overs} overs match
          {enableActions && (
            <button onClick={() => removeMatch(match.id)}>X</button>
          )}
        </span>
      </div>
      <div className="card-body">
        <span className="card-title score-values">
          {match.teamOne} <span className="text-uppercase">vs</span>{" "}
          {match.teamTwo}
        </span>
        <div className="score-label">
          {moment(match.createdAt.toDate()).calendar()}
        </div>
        <div className="score-sub-label">{match.tossInformation}</div>
        <div>
          <span className={`badge badge-pill ${matchStatusTypeClass}`}>
            {matchStatusType}
          </span>
        </div>
        <hr />
        <div className="card-text">
          <div className="score-values">{match.firstBatting}</div>
          <div className="score-sub-text">
            <div>
              {" "}
              {match.firstInningsWickets === match.players - 1 ? (
                <div>
                  {" "}
                  {match.firstInningsRuns} -{" "}
                  <span style={{ color: "red" }}>All Out!</span>{" "}
                </div>
              ) : (
                `${match.firstInningsRuns} - ${match.firstInningsWickets}`
              )}
              <span className="float-right">
                {match.firstInningsOvers} / {match.overs} overs
              </span>
            </div>
          </div>
          <div className="score-values">{match.secondBatting}</div>
          <div className="score-sub-text">
            <div>
              {" "}
              {match.secondInningsWickets === match.players - 1 ? (
                <div>
                  {" "}
                  {match.secondInningsRuns} -{" "}
                  <span style={{ color: "red" }}>All Out!</span>{" "}
                </div>
              ) : (
                `${match.secondInningsRuns} - ${match.secondInningsWickets}`
              )}
              <span className="float-right">
                {match.secondInningsOvers} / {match.overs} overs
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="card-footer">
        {showMatchLink && (
          <Link
            to={`/match/${match.id}/scorecard`}
            className="float-left btn btn-info btn-sm"
          >
            View Score
          </Link>
        )}
        {enableActions && (
          <Link to={url} className="float-right btn btn-primary btn-sm">
            Start Scoring
          </Link>
        )}
        {/* <span>{user && user.initials}</span> */}
      </div>
    </div>
  );
};

export default MatchSummary;
