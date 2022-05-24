import { Button } from "./Button";
import { Modal } from "./Modal";
import { FaRegCopy } from "react-icons/fa";
import { AiOutlineMail } from "react-icons/ai";
import { FiRefreshCw } from "react-icons/fi";
import { SettingsData } from "./SaveData";

interface Props {
  error: Error;
  resetErrorBoundary: () => void;
  settingsData: SettingsData;
  version: string;
}

export const ErrorFallback: React.FC<Props> = (props) => {
  // TODO: Save data/local storage, window.naviagtor, prompt/ask for dxDiag file or system specs?

  // The error information, settings and version number (formatted)
  const message = `${props.error.message}\n\n${props.error.stack || ""}\n\n${JSON.stringify(props.settingsData)}\n\n${
    props.version
  }`;

  function prepareEmail() {
    // The email address that the bug reports will be sent to
    const ourAddress = "wingo@example.com";
    const subject = "Bug%20Report";
    const mailString = `mailto:${ourAddress}subject=${subject}&body${message}`;
    // Opens default mail client
    window.location.href = mailString;
  }

  return (
    <Modal mode="error" name="error" title="Something went wrong" onClose={props.resetErrorBoundary}>
      <p>Something caused this part of the game to crash. Please try again.</p>
      <div className="error-fallback-display-wrapper">
        <strong className="error-fallback-label">Error:</strong>
        <pre>{props.error.message}</pre>
        <Button
          className="error-fallback-copy"
          mode="default"
          onClick={() => {
            navigator.clipboard.writeText(message);
          }}
        >
          <FaRegCopy />
        </Button>
      </div>

      {/* Testing: <pre>{message}</pre>*/}

      <div className="error-fallback-action-wrapper">
        <Button className="error-fallback-reset" mode="default" onClick={props.resetErrorBoundary}>
          <FiRefreshCw />
          Try again
        </Button>
        <Button className="error-fallback-send" mode="default" onClick={prepareEmail}>
          <AiOutlineMail />
          Submit bug report
        </Button>
      </div>
    </Modal>
  );
};
