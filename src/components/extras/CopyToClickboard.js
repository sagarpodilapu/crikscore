import React from "react";

class CopyToClickboard extends React.Component {
  state = {
    copyText: "Copy",
    copyBtn: "btn-danger",
    btnDisabled: false,
  };
  render() {
    const { textToCopy } = this.props;
    const { copyText, copyBtn, btnDisabled } = this.state;
    return (
      /* Logical shortcut for only displaying the 
            button if the copy command exists */
      document.queryCommandSupported("copy") && (
        <button
          className={`ml-1 btn btn-sm ${copyBtn}`}
          onClick={() => {
            navigator.clipboard.writeText(textToCopy);
            this.setState({
              copyText: "Copied!!",
              copyBtn: "btn-link",
              btnDisabled: true,
            });
          }}
          disabled={btnDisabled}
        >
          {copyText}
        </button>
      )
    );
  }
}

export default CopyToClickboard;
