import React from "react";
import { ListGroup, Table } from "reactstrap";
import moment from "moment";

const BallByBall = ({ match, firstInningsScore, secondInningsScore }) => {
  return (
    <Table size="sm" borderless>
      <thead>
        <tr>
          <th colSpan="4">{match[0].secondBatting} Innings</th>
        </tr>
      </thead>
      <tbody>
        {secondInningsScore &&
          secondInningsScore.map((score, index) => (
            <tr
              key={`first${index}`}
              className={`border-bottom border-success ball-${score.ball}`}
            >
              <th scope="row" className="align-middle text-center" width="12%">
                <span className="border border-primary p-1 d-inline-block w-100">
                  {score.currentOver}
                </span>
              </th>
              <td className="align-middle" width="18%">
                <span className="rounded-0 bg-dark text-white p-2 text-center d-inline-block w-100">
                  {score.lastSixBalls.length && score.lastSixBalls[0].event}
                </span>
              </td>
              <td className="align-middle" width="50%">
                {score.bowler.name} to {score.striker.name},{" "}
                <strong>{score.runs} runs</strong>
              </td>
              <td className="align-middle text-center" width="20%">
                {score.totalRuns} / {score.totalWickets}
              </td>
            </tr>
          ))}
      </tbody>
      <thead>
        <tr>
          <th colSpan="4">{match[0].firstBatting} Innings</th>
        </tr>
      </thead>
      <tbody>
        {firstInningsScore &&
          firstInningsScore.map((score, index) => (
            <tr
              key={`second${index}`}
              className={`border-bottom border-success ball-${score.ball}`}
            >
              <th scope="row" className="align-middle text-center" width="12%">
                <span className="border border-primary p-1 d-inline-block w-100">
                  {score.currentOver}
                </span>
              </th>
              <td className="align-middle" width="18%">
                <span className="rounded-0 bg-dark text-white p-2 text-center d-inline-block w-100">
                  {score.lastSixBalls.length && score.lastSixBalls[0].event}
                </span>
              </td>
              <td className="align-middle" width="50%">
                {score.bowler.name} to {score.striker.name},{" "}
                <strong>{score.runs} runs</strong>
              </td>
              <td className="align-middle text-center" width="20%">
                {score.totalRuns} / {score.totalWickets}
              </td>
            </tr>
          ))}
      </tbody>
    </Table>
  );
};

export default BallByBall;
