import React from "react";
import { Page, pages } from "./App";
import { Modal } from "./Modal";

interface Props {
  page: Page;
  onClose: () => void;
}

export const HelpInformation: React.FC<Props> = (props) => {
  const pageInfo = pages.find((x) => x.page === props.page);

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
      {pageInfo?.helpInfo}
    </Modal>
  );
};

export default HelpInformation;
