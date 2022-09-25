import { pageDescriptions } from "../Data/PageDescriptions";
import { Modal } from "./Modal";

import { useLocation } from "react-router-dom";
import { PagePath } from "../Data/PageNames";

interface Props {
  onClose: () => void;
}

export const HelpInformation = (props: Props) => {
  const location = useLocation().pathname as PagePath;

  const pageInfo = pageDescriptions.find((x) => x.path === location);

  return (
    <Modal
      mode="info"
      name="help"
      title={
        <>
          <strong>{pageInfo?.title || location}</strong>
        </>
      }
      onClose={props.onClose}
    >
      {pageInfo?.helpInfo}
    </Modal>
  );
};

export default HelpInformation;
