import React from "react";
import { Table } from "reactstrap";

const InningsBowling = ({ players }) => {
  return (
    <Table responsive size="sm">
      <thead>
        <tr>
          <th width="40%">Bowler</th>
          <th className="text-center">Ovs</th>
          <th className="text-center">R</th>
          <th className="text-center">Wks</th>
          <th className="text-center">0s</th>
          <th className="text-center">4s</th>
          <th className="text-center">6s</th>
          <th className="text-center">Eco</th>
        </tr>
      </thead>
      <tbody>
        {players &&
          players.map((player, index) => (
            <tr key={index} className="text-center">
              <th scope="row" className="text-left">
                {player.name}
              </th>
              <td>{player.overs}</td>
              <td>{player.runs}</td>
              <td>{player.wickets}</td>
              <td>{player.dots}</td>
              <td>{player.fours}</td>
              <td>{player.sixes}</td>
              <td>{player.eco}</td>
            </tr>
          ))}
      </tbody>
    </Table>
  );
};

export default InningsBowling;
