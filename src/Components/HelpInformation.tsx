import React from "react";
import { pageDescriptions } from "../PageDescriptions";
import { PageName } from "../PageNames";
import { Modal } from "./Modal";

interface Props {
  page: PageName;
  onClose: () => void;
}

export const HelpInformation = (props: Props) => {
  const pageInfo = pageDescriptions.find((x) => x.page === props.page);

  return (
    <Modal
      mode="info"
      name="help"
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
