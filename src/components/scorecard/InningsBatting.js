import React from "react";
import { Table } from "reactstrap";

import { fow, extras } from "../../utils";

const InningsBatting = ({ players, finalScore, score }) => {
  let scoreFow = fow(score);
  let extraScore = extras(score);
  return (
    <Table responsive size="sm">
      <thead>
        <tr>
          <th colSpan="2">Batsman</th>
          <th className="text-center">R</th>
          <th className="text-center">B</th>
          <th className="text-center">4s</th>
          <th className="text-center">6s</th>
          <th className="text-center">0s</th>
          <th className="text-center">SR</th>
        </tr>
      </thead>
      <tbody>
        {players &&
          players.map((player, index) => (
            <tr key={index} className="text-center">
              <th scope="row" className="text-left">
                {player.name}
                {player.onStrike ? "*" : ""}
              </th>
              <th scope="row">
                <span className="font-weight-lighter float-left">
                  {player.out
                    ? player.howOut !== "run out"
                      ? `b ${player.howOut}`
                      : "run out"
                    : ""}
                </span>
              </th>
              <td>{player.runs}</td>
              <td>{player.balls}</td>
              <td>{player.fours}</td>
              <td>{player.sixes}</td>
              <td>{player.dots}</td>
              <td>{player.sr}</td>
            </tr>
          ))}
        <tr>
          <td colSpan="3">
            <strong>Extras</strong>
          </td>
          <td colSpan="5">
            <span className="float-right font-italic">
              11 (lb 5, nb 2, w 4)
            </span>
          </td>
        </tr>
        <tr>
          <td>
            <strong>Total</strong>
          </td>
          <td colSpan="7">
            {" "}
            <span className="float-right font-weight-bolder">
              {finalScore}
            </span>{" "}
          </td>
        </tr>
        {/* <tr>
          <td colSpan="8">
            <strong>Did not bat:</strong> P Chopra, K Gowtham, JC Archer, S
            Gopal, S Midhun, DS Kulkarni
          </td>
        </tr> */}
        {scoreFow && (
          <tr>
            <td colSpan="8">
              <strong>Fall of Wickets:</strong> {scoreFow}
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

export default InningsBatting;
