import React from "react";
import styled from "react-emotion";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import ArrowDropUpIcon from "@material-ui/icons/ArrowDropUp";
import Popover from "../../../../shared/components/popover";
import Menu from "../../../../shared/components/menu";
import MenuItem from "../../../../shared/components/menu-item";
import MenuDivider from "../../../../shared/components/menu-divider";
import { TextButton } from "../../../../shared/components/buttons";
import BaseIcon from "./base-icon";

import {
  setConsoleLanguage,
  clearConsoleHistory
} from "../../../actions/actions";
import { sendActionToEditor } from "../../../actions/editor-message-senders";

const ArrowDropUp = styled(BaseIcon(ArrowDropUpIcon))`
  display: inline-block;
  transform: translateY(3px);
`;

const LanguageSelectButton = styled(TextButton)`
  display: block;
  font-size: 12px;
  height: 30px;
  padding: 0px;
  padding-left: 5px;
  padding-right: 5px;
  border-radius: 0px;
  margin: auto;
  background-color: gainsboro;
  border-left: 1px solid gainsboro;
  align-self: center;
  color: rgba(0, 0, 0, 0.6);
  text-transform: lowercase;
  transition: 300ms;
  :hover {
    background-color: #d5b9dd;
  }
  :active {
    border-left: 1px solid gainsboro;
  }

  div {
    margin: auto;
    transform: translateY(-1px);
  }
`;

const LanguageShort = styled("div")`
  padding-left: 6px;
  opacity: 0.6;
`;

const LanguageName = styled("div")`
  min-width: 100px;
  text-align: left;
  padding-right: 6px;
`;

const onMenuClick = (fcn, languageId) => () => {
  fcn(languageId);
};

const ConsoleLanguageMenuUnconnected = ({
  availableLanguages,
  currentLanguage
}) => {
  return (
    <React.Fragment>
      <Popover
        placement="left-end"
        activatingComponent={
          <LanguageSelectButton>
            <div>
              <ArrowDropUp />
              {currentLanguage}
            </div>
          </LanguageSelectButton>
        }
      >
        <Menu>
          {availableLanguages.map(language => (
            <MenuItem
              key={language.languageId}
              onClick={onMenuClick(
                languageId =>
                  sendActionToEditor(setConsoleLanguage(languageId)),
                language.languageId
              )}
            >
              <LanguageName>{language.displayName}</LanguageName>
              <LanguageShort>{language.languageId}</LanguageShort>
            </MenuItem>
          ))}
          <MenuDivider />
          <MenuItem
            onClick={onMenuClick(() => {
              sendActionToEditor(clearConsoleHistory());
            })}
          >
            Clear Console
          </MenuItem>
        </Menu>
      </Popover>
    </React.Fragment>
  );
};

ConsoleLanguageMenuUnconnected.propTypes = {
  availableLanguages: PropTypes.arrayOf(
    PropTypes.shape({
      displayName: PropTypes.string.isRequired,
      languageId: PropTypes.string.isRequired
    })
  ).isRequired,
  currentLanguage: PropTypes.string.isRequired
};

export function mapStateToProps(state) {
  const availableLanguages = Object.values(
    Object.assign({}, state.languageDefinitions, state.loadedLanguages)
  );
  return {
    currentLanguage: state.languageLastUsed,
    availableLanguages
  };
}

export default connect(mapStateToProps)(ConsoleLanguageMenuUnconnected);
