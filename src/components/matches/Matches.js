import React, { Component } from "react";
import LiveMatches from "./LiveMatches";
import { deleteMatch } from "../../store/actions/matches";
import { connect } from "react-redux";
import { compose } from "redux";
import { Redirect } from "react-router-dom";
import { firestoreConnect } from "react-redux-firebase";

class Matches extends Component {
  render() {
    const { matches, auth, user, deleteMatch } = this.props;
    return (
      <div className="dashboard container">
        <div className="row">
          <div className="col">
            <h1 className="mt-3">
              Matches{" "}
              <a
                className="btn btn-primary btn-sm float-right"
                href="/newMatch"
              >
                New Match
              </a>
            </h1>
            <LiveMatches
              matches={matches}
              auth={auth}
              user={user}
              deleteMatch={deleteMatch}
            />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    matches: state.firestore.ordered.matches,
    auth: state.firebase.auth,
    user: state.firebase.profile,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    deleteMatch: (payload) => dispatch(deleteMatch(payload)),
  };
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  firestoreConnect([{ collection: "matches", orderBy: ["createdAt", "desc"] }])
)(Matches);
