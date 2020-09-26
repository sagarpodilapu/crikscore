import React from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";
import "react-bootstrap-typeahead/css/Typeahead-bs4.css";
import { has, startCase, toLower, find, isEmpty } from "lodash";

class BatsmanModal extends React.Component {
  constructor(props) {
    super(props);
  }
  state = {
    batsman: {},
  };

  render() {
    const {
      openModal,
      toggle,
      submitBatsman,
      battingSquad,
      battingTeam,
      battingTeamId,
      currentInningsBatting,
    } = this.props;
    const { batsman } = this.state;
    const currentInningsBattingIds = currentInningsBatting
      ? currentInningsBatting.map((item) => item.id)
      : [];
    const typeaheadOptions = battingSquad
      ? battingSquad.filter(
          (item) => currentInningsBattingIds.indexOf(item.id) === -1
        )
      : [];
    return (
      <Modal isOpen={openModal} className={this.props.className}>
        <ModalHeader>Change Batsman</ModalHeader>
        <form
          onSubmit={(e) => {
            submitBatsman(e, this.state.batsman);
          }}
          autoComplete="off"
          className="m-0 p-0"
        >
          <ModalBody>
            <h5>Batting Team: {battingTeam}</h5>
            <div className="form-group row">
              <label htmlFor="batsman" className="col-sm-2 col-form-label">
                Batsman
              </label>
              <div className="col-sm-10">
                <Typeahead
                  id="one"
                  labelKey="name"
                  onChange={(selected) => {
                    if (selected.length) {
                      let batsmanId;
                      if (has(selected[0], "customOption")) {
                        batsmanId = "";
                      } else {
                        batsmanId = selected[0].id;
                      }
                      this.setState({
                        batsman: {
                          id: batsmanId,
                          name: startCase(toLower(selected[0].name)),
                          teamName: battingTeam,
                          teamId: battingTeamId,
                          onStrike: true,
                          balls: 0,
                          runs: 0,
                          dots: 0,
                          fours: 0,
                          sixes: 0,
                          didNotBat: false,
                          sr: 0,
                          out: false,
                          howOut: "",
                          battingOrder: 0,
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
            <Button color="primary" disabled={isEmpty(batsman)}>
              Change Batsman
            </Button>{" "}
          </ModalFooter>
        </form>
      </Modal>
    );
  }
}

export default BatsmanModal;
