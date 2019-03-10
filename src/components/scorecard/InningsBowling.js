import React from "react";
import { Table } from "reactstrap";

const InningsBowling = ({ players }) => {
  return (
    <Table responsive>
      <thead>
        <tr>
          <th>Bowler</th>
          <th>Ovs</th>
          <th>Runs</th>
          <th>Wks</th>
          <th>0s</th>
          <th>4s</th>
          <th>6s</th>
          <th>Eco</th>
        </tr>
      </thead>
      <tbody>
        {players &&
          players.map((player, index) => (
            <tr key={index}>
              <th scope="row">{player.name}</th>
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