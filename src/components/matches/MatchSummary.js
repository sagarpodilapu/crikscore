import React from "react";
import moment from "moment";
import { Link, Redirect } from "react-router-dom";
import firebase from "firebase";

import CopyToClickboard from "../extras/CopyToClickboard";
import { matchActions, iframeText } from "../../config/match-summary";

const MatchSummary = ({ match, auth, user }) => {
  let url = `/match/${match.id}/score`;
  const removeMatch = (matchId) => {};

  const enableActions = auth.uid === match.scorerId;
  let matchActionIndex = 0;
  console.log(match);
  if (match.statusType === "TOSS") {
    matchActionIndex = 3;
    console.log(match);
  } else if (match.statusType === "MATCH_ENDED") {
    matchActionIndex = 1;
  } else if (match.statusType === "INNINGS_BREAK") {
    matchActionIndex = 2;
  }

  return (
    <div className="card mb-2">
      <div className="card-header text-capitalize">
        {match.venueMap ? (
          <a className="btn btn-link" target="_blank" href={match.venueMap}>
            {match.venue}
          </a>
        ) : (
          match.venue
        )}
        <span className="float-right">
          {match.overs}/{match.overs}
          {enableActions && (
            <i
              className="fa fa-trash remove ml-1"
              onClick={() => removeMatch(match.id)}
              aria-hidden="true"
            ></i>
          )}
        </span>
      </div>
      <div className="card-body">
        {match.tournament && <div>{match.tournament}</div>}
        <span className="card-title score-values">
          {match.teamOne} <span className="text-uppercase">vs</span>{" "}
          {match.teamTwo}
        </span>
        <div className="score-label">
          {moment(match.createdAt.toDate()).calendar()}
        </div>
        <div className="score-sub-label">{match.tossInformation}</div>
        <div>
          <span
            className={`badge badge-pill ${matchActions[matchActionIndex].matchStatusTypeClass}`}
          >
            {matchActions[matchActionIndex].matchStatusType}
          </span>
        </div>
        {match.winnerInformation && (
          <div className="score-sub-label">{match.winnerInformation}</div>
        )}
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
        {/* {!matchActions[matchActionIndex].showMatchLink && (
          <Link
            to={`/match/${match.id}/addPlayers`}
            className="float-left btn btn-dark btn-sm"
          >
            Add Players
          </Link>
        )} */}
        {matchActions[matchActionIndex].showMatchLink && (
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

        {match &&
          enableActions &&
          matchActions[matchActionIndex].showEmbedLink && (
            <CopyToClickboard
              textToCopy={iframeText.replace("MATCH_ID", match.id)}
            />
          )}
      </div>
    </div>
  );
};

export default MatchSummary;
