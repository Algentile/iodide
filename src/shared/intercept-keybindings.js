import Mousetrap from "mousetrap";

Mousetrap.prototype.stopCallback = () => false;

let warnUser = false;

const preventBacknav = e => {
  warnUser = e.target === document.body;
};

export function handleInterceptBackspace() {
  Mousetrap.bind(["delete", "backspace"], preventBacknav);
}

// Test: Need to monitor for push state. Back button should call a pop state

window.onbeforeunload = () => {
  if (warnUser || window.history.pushState) {
    console.log("this is the state change", window.history);
    warnUser = false;
    return "Are you sure you want to leave?";
  }
  return undefined;
};
