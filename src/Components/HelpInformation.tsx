import { PageDescription, pageDescriptions } from "../Data/PageDescriptions";
import Modal from "./Modal";
import { useLocation } from "react-router-dom";
import { PagePath } from "../Data/PageNames";

interface HelpInformationProps {
  onClose: () => void;
}

const HelpInformation = (props: HelpInformationProps) => {
  const location = useLocation().pathname as PagePath;
  const pageInfo: PageDescription | undefined = pageDescriptions.find((x) => x.path === location);
  const titleText: string = pageInfo?.title ?? location;

  return (
    <Modal mode="info" name="help" title={<strong>{titleText}</strong>} onClose={props.onClose}>
      {pageInfo?.helpInfo}
    </Modal>
  );
};

export default HelpInformation;
