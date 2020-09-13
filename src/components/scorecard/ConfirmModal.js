import React from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import { isEmpty } from "lodash";

class ConfirmModal extends React.Component {
  render() {
    const { openModal, toggle, heading, confirmClick } = this.props;
    return (
      <Modal
        isOpen={openModal}
        toggle={toggle}
        className={this.props.className}
      >
        <ModalHeader toggle={toggle}>{heading}</ModalHeader>
        <ModalFooter>
          <Button color="primary" onClick={() => confirmClick()}>
            Okay
          </Button>{" "}
          <Button color="secondary" onClick={toggle}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default ConfirmModal;
