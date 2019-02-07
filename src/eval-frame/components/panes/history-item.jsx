import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import ValueRenderer from "../../../components/reps/value-renderer";
import PreformattedTextItemsHandler from "../../../components/reps/preformatted-text-items-handler";

import EvalInput from "./console/eval-input";
import ConsoleMessage from "./console/console-message";
import AppMessage from "./console/app-message";

import { EVALUATION_RESULTS } from "../../actions/actions";

export class HistoryItemUnconnected extends React.Component {
  static propTypes = {
    level: PropTypes.string,
    historyId: PropTypes.number.isRequired,
    historyType: PropTypes.string.isRequired,
    lastRan: PropTypes.number.isRequired,
    language: PropTypes.string
  };

  render() {
    let out;
    switch (this.props.historyType) {
      case "CONSOLE_MESSAGE": {
        // CONSOLE_MESSAGEs are non eval input / output messages.
        // examples: implicit plugin load statuses / errors, eventually browser console
        // interception.
        out = (
          <ConsoleMessage level={this.props.level}>
            {this.props.content}
          </ConsoleMessage>
        );
        break;
      }
      case "CONSOLE_INPUT": {
        // returns an input.
        out = (
          <EvalInput language={this.props.language}>
            {this.props.content}
          </EvalInput>
        );
        break;
      }
      case "CONSOLE_OUTPUT":
      case "FETCH_CELL_INFO": {
        // returns an output associated with an input.
        // it uses the ConsoleMessage component, since it is stylistically
        // identical to these.
        out = (
          <ConsoleMessage level={this.props.level || "output"}>
            {this.props.historyType === "FETCH_CELL_INFO" ? (
              <PreformattedTextItemsHandler
                textItems={this.props.valueToRender}
              />
            ) : (
              <ValueRenderer valueToRender={this.props.valueToRender} />
            )}
          </ConsoleMessage>
        );
        break;
      }
      case "APP_MESSAGE": {
        out = <AppMessage messageType={this.props.content} />;
        break;
      }
      default:
        out = (
          <ConsoleMessage level="warn">
            Unknown history type {this.props.historyType}
          </ConsoleMessage>
        );
    }
    return out;
  }
}

export function mapStateToProps(state, ownProps) {
  return {
    content: ownProps.historyItem.content,
    historyId: ownProps.historyItem.historyId,
    historyType: ownProps.historyItem.historyType,
    lastRan: ownProps.historyItem.lastRan,
    level: ownProps.historyItem.level,
    language: ownProps.historyItem.language,
    valueToRender: EVALUATION_RESULTS[ownProps.historyItem.historyId]
  };
}

export default connect(mapStateToProps)(HistoryItemUnconnected);
