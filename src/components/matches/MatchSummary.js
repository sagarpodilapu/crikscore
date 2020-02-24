import React from "react";
import moment from "moment";
import { Link, Redirect } from "react-router-dom";
import firebase from 'firebase';


const MatchSummary = ({ match, auth }) => {
  let url = `/match/${match.id}/score`;

  const removeMatch = (matchId) => {
    
  }
  return (
    
    <div className="card mb-2">
      <div className="card-header text-capitalize">
        {match.venue}
        <span className="float-right">{match.overs} overs match <button onClick={() => removeMatch(match.id)}>X</button></span>
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
         {(match.statusType===`STARTED`) ?
        <span class="badge badge-pill badge-success">{match.statusType}</span>
         : (match.statusType===`MATCH_ENDED`) ?
         <span class="badge badge-pill badge-danger">{match.statusType}</span>
         : (match.statusType===`INNINGS_BREAK`) ?
         <span class="badge badge-pill badge-info">{match.statusType}</span>
         : <span class="badge badge-pill badge-secondary">{match.statusType}</span>
        }
        </div>
        <hr />
        <div className="card-text">
          <div className="score-values">{match.firstBatting}</div>
          <div className="score-sub-text">
            
          <div> {(match.firstInningsWickets === match.players-1) ? 
          <div> {match.firstInningsRuns} - <span style={{color: "red"}}>All Out!</span> </div> 
          : `${match.firstInningsRuns} - ${match.firstInningsWickets}`} 
          </div>
            <span className="float-right">
              {match.firstInningsOvers} / {match.overs} overs
              
            </span>
          </div>
          <div className="score-values">{match.secondBatting}</div>
          <div className="score-sub-text">
            
          <div> {(match.secondInningsWickets === match.players-1) ? 
          <div> {match.secondInningsRuns} - <span style={{color: "red"}}>All Out!</span> </div>
          : `${match.secondInningsRuns} - ${match.secondInningsWickets}`} 
          </div>
            <span className="float-right">
              {match.secondInningsOvers} / {match.overs} overs
            </span>
          </div>
        </div>
      </div>
      <div className="card-footer">
        <Link
          to={`/match/${match.id}/scorecard`}
          className="float-left btn btn-info btn-sm"
        >
          View Score
        </Link>
        {auth.uid === match.scorerId && (
          <Link to={url} className="float-right btn btn-primary btn-sm">
            Start Scoring
          </Link>
        )}
        </div>
      
    </div>
  );
};

export default MatchSummary;
