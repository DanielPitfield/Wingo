import React from "react";
import { Page, pages } from "./App";
import { Modal } from "./Modal";

interface Props {
  page: Page;
  onClose: () => void;
}

export const HelpInformation: React.FC<Props> = (props) => {
  const pageInfo = pages.find((x) => x.page === props.page);

  // TODO: Include a button which opens a modal body for the base game mode type (playing Wordle Daily, include a button to modal which explains Wordle)
  // TODO: Every gamemode has this HelpInformation component, use state with callback to determine whether it is currently displayed or not

  // Body elements for specific gamemodes
  function getModalBody(): React.ReactNode {
    switch (props.page) {
      case "wingo/daily":
        return <p>Daily resets every 24 hours</p>;

      default:
        return null;
    }
    // ...
  }

  return (
    <Modal
      mode="default"
      title={
        <>
          <strong>{pageInfo?.title || props.page}</strong>
        </>
      }
      onClose={props.onClose}
    >
      {getModalBody()}
    </Modal>
  );
};

export default HelpInformation;
