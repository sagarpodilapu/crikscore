import React, { Component } from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import { firestoreConnect } from "react-redux-firebase";
import { isEmpty } from "lodash";

import LiveScorecard from "./LiveScorecard";
import InningsBatting from "./InningsBatting";
import InningsBowling from "./InningsBowling";
import BallByBall from "./BallByBall";

import {
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Card,
  Button,
  CardTitle,
  CardText,
  Row,
  Col,
} from "reactstrap";
import classnames from "classnames";

import { currentRR, calculateBalls } from "../../utils";

class FullScorecard extends Component {
  state = {
    activeTab: "1",
  };
  componentWillMount() {}
  componentDidMount() {}
  toggle = (tab) => {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab,
      });
    }
  };

  render() {
    const {
      currentMatch,
      striker,
      nonStriker,
      bowler,
      firstInningsBatting,
      secondInningsBatting,
      firstInningsBowling,
      secondInningsBowling,
      scores,
      firstInningsScore,
      secondInningsScore,
    } = this.props;
    if (currentMatch) {
      return (
        <div className="container mt-5">
          <h3>
            <span className="score-label">{currentMatch[0].teamOne}</span> vs{" "}
            <span className="score-label">{currentMatch[0].teamTwo}</span> at{" "}
            {currentMatch[0].venueMap ? (
              <a
                target="_blank"
                href={currentMatch[0].venueMap}
                className="score-label"
              >
                {currentMatch[0].venue}
              </a>
            ) : (
              <span className="score-label"> currentMatch[0].venue</span>
            )}
          </h3>
          <Nav pills justified={true} fill={true}>
            <NavItem>
              <NavLink
                className={classnames({ active: this.state.activeTab === "1" })}
                onClick={() => {
                  this.toggle("1");
                }}
              >
                Full
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: this.state.activeTab === "2" })}
                onClick={() => {
                  this.toggle("2");
                }}
              >
                Live
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: this.state.activeTab === "3" })}
                onClick={() => {
                  this.toggle("3");
                }}
              >
                Ball By Ball
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: this.state.activeTab === "4" })}
                onClick={() => {
                  this.toggle("4");
                }}
              >
                Stats
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent className="mt-3" activeTab={this.state.activeTab}>
            <TabPane tabId="1">
              <h3>
                {currentMatch[0].firstBatting}
                <small className="float-right">1st Inn</small>
              </h3>
              <InningsBatting
                score={firstInningsScore}
                players={firstInningsBatting}
                finalScore={`${currentMatch[0].firstInningsRuns}/${
                  currentMatch[0].firstInningsWickets
                }(${currentMatch[0].firstInningsOvers}/${
                  currentMatch[0].overs
                }, RR: ${currentRR(
                  currentMatch[0].firstInningsRuns,
                  calculateBalls(currentMatch[0].firstInningsOvers)
                )})`}
              />
              <InningsBowling players={firstInningsBowling} />

              {secondInningsBatting && secondInningsBatting.length > 0 ? (
                <div className="border-top pt-5 border-primary">
                  <h3>
                    {currentMatch[0].firstBowling}
                    <small className="float-right">2nd Inn</small>
                  </h3>
                  <InningsBatting
                    score={secondInningsScore}
                    players={secondInningsBatting}
                    finalScore={`${currentMatch[0].secondInningsRuns}/${
                      currentMatch[0].secondInningsWickets
                    }(${currentMatch[0].secondInningsOvers}/${
                      currentMatch[0].overs
                    }, RR: ${currentRR(
                      currentMatch[0].secondInningsRuns,
                      calculateBalls(currentMatch[0].secondInningsOvers)
                    )})`}
                  />
                  <InningsBowling players={secondInningsBowling} />
                </div>
              ) : (
                <div />
              )}
            </TabPane>
            <TabPane tabId="2">
              <LiveScorecard
                striker={striker}
                nonStriker={nonStriker}
                bowler={bowler}
              />
            </TabPane>
            <TabPane tabId="3">
              <BallByBall
                firstInningsScore={firstInningsScore}
                secondInningsScore={secondInningsScore}
                match={currentMatch}
              />
            </TabPane>
            <TabPane tabId="4">
              <Row>
                <Col sm="6">
                  <Card body>
                    <CardTitle>Special Title Treatment</CardTitle>
                    <CardText>
                      With supporting text below as a natural lead-in to
                      additional content.
                    </CardText>
                    <Button>Go somewhere</Button>
                  </Card>
                </Col>
                <Col sm="6">
                  <Card body>
                    <CardTitle>Special Title Treatment</CardTitle>
                    <CardText>
                      With supporting text below as a natural lead-in to
                      additional content.
                    </CardText>
                    <Button>Go somewhere</Button>
                  </Card>
                </Col>
              </Row>
            </TabPane>
          </TabContent>
        </div>
      );
    } else {
      return (
        <div className="container center">
          <p>Loading Score...</p>
        </div>
      );
    }
  }
}

const mapStateToProps = (state, ownProps) => {
  let striker = {};
  let bowler = {};
  let nonStriker = {};
  let currentMatch = state.firestore.ordered.matches;
  let scores;
  let score;
  let fScore = state.firestore.ordered.firstInningsScore;
  let sScore = state.firestore.ordered.secondInningsScore;
  if (currentMatch) {
    if (currentMatch[0].currentInnings === "FIRST_INNINGS") {
      scores = fScore;
    } else {
      scores = sScore;
    }
    if (scores && scores.length) {
      score = scores[0];
      striker = score.striker;
      bowler = score.bowler;
      nonStriker = score.nonStriker;
      if (!isEmpty(score.newBowler)) {
        bowler = score.newBowler;
      }
    }
  }
  return {
    auth: state.firebase.auth,
    currentMatch: state.firestore.ordered.matches,
    score: score,
    scores: scores,
    bowler: bowler,
    striker: striker,
    nonStriker: nonStriker,
    firstInningsBatting: state.firestore.ordered.firstInningsBatting,
    secondInningsBatting: state.firestore.ordered.secondInningsBatting,
    firstInningsBowling: state.firestore.ordered.firstInningsBowling,
    secondInningsBowling: state.firestore.ordered.secondInningsBowling,
    firstInningsScore: fScore,
    secondInningsScore: sScore,
  };
};
export default compose(
  connect(mapStateToProps),
  firestoreConnect((props) => [
    { collection: "matches", doc: props.match.params.matchId },
    {
      collection: "matches",
      doc: props.match.params.matchId,
      subcollections: [
        {
          collection: "firstInningsScore",
          orderBy: ["createdAt", "desc"],
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
        },
      ],
      storeAs: "secondInningsScore",
    },
    {
      collection: "matches",
      doc: props.match.params.matchId,
      subcollections: [{ collection: "firstInningsBatting" }],
      orderBy: ["battingOrder", "asc"],
      storeAs: "firstInningsBatting",
    },
    {
      collection: "matches",
      doc: props.match.params.matchId,
      subcollections: [{ collection: "firstInningsBowling" }],
      orderBy: ["bowlingOrder", "asc"],
      storeAs: "firstInningsBowling",
    },
    {
      collection: "matches",
      doc: props.match.params.matchId,
      subcollections: [{ collection: "secondInningsBatting" }],
      orderBy: ["battingOrder", "asc"],
      storeAs: "secondInningsBatting",
    },
    {
      collection: "matches",
      doc: props.match.params.matchId,
      subcollections: [{ collection: "secondInningsBowling" }],
      orderBy: ["bowlingOrder", "asc"],
      storeAs: "secondInningsBowling",
    },
  ])
)(FullScorecard);
