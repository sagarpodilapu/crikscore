import React from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";
import "react-bootstrap-typeahead/css/Typeahead-bs4.css";
import { has, startCase, toLower, find, isEmpty } from "lodash";

class BowlerModal extends React.Component {
  constructor(props) {
    super(props);
  }
  state = {
    bowler: {},
  };

  handleCancel = () => {
    this.props.toggle();
  };

  handleSubmit = (e) => {
    this.props.submitBowler(e, this.state.bowler);
  };
  render() {
    const {
      openModal,
      bowlingSquad,
      bowlingTeam,
      bowlingTeamId,
      currentBowler,
    } = this.props;
    const { bowler } = this.state;
    const typeaheadOptions = bowlingSquad
      ? bowlingSquad.filter((item) => item.id !== currentBowler.id)
      : [];
    return (
      <Modal isOpen={openModal} className={this.props.className}>
        <ModalHeader>Change Bowler</ModalHeader>
        <ModalBody>
          <h5>Bowling Team: {bowlingTeam}</h5>
          <div className="form-group row">
            <label htmlFor="bowler" className="col-sm-2 col-form-label">
              Bowler
            </label>
            <div className="col-sm-10">
              <Typeahead
                id="one"
                labelKey="name"
                onChange={(selected) => {
                  if (selected.length) {
                    let bowlerId;
                    if (has(selected[0], "customOption")) {
                      bowlerId = "";
                    } else {
                      bowlerId = selected[0].id;
                    }
                    this.setState({
                      bowler: {
                        id: bowlerId,
                        name: startCase(toLower(selected[0].name)),
                        teamName: bowlingTeam,
                        teamId: bowlingTeamId,
                        bowlingOrder: 2,
                        balls: 0,
                        wickets: 0,
                        wides: 0,
                        noBalls: 0,
                        runs: 0,
                        dots: 0,
                        byes: 0,
                        fours: 0,
                        sixes: 0,
                        eco: 0,
                        didNotBowl: true,
                        overs: "0.0",
                        currentlyBowling: true,
                      },
                    });
                  }
                }}
                allowNew={true}
                options={typeaheadOptions}
                filterBy={["name"]}
                placeholder="Type player name..."
                newSelectionPrefix="Choose : "
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={this.handleCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            color="primary"
            disabled={isEmpty(bowler)}
            onClick={this.handleSubmit}
          >
            Change Bowler
          </Button>{" "}
        </ModalFooter>
      </Modal>
    );
  }
}

export default BowlerModal;
