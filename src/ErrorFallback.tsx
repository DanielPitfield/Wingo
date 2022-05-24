import { Button } from "./Button";
import { Modal } from "./Modal";
import { FaRegCopy } from "react-icons/fa";
import { AiOutlineMail } from "react-icons/ai";

export const ErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void }> = (props) => {
  function getMessage() {
    let message = props.error.message;
    message += props.error.stack;

    // TODO: Save data/local storage
    // TODO: Game version
    // TODO: Prompt/ask for dxDiag file or system specs

    return message;
  }

  function prepareEmail() {
    const ourAddress = "wingo@example.com";
    const subject = "Bug%20Report";
    const message = getMessage();
    const mailString = `mailto:${ourAddress}subject=${subject}&body${message}`;
    window.location.href = mailString;
  }

  return (
    <Modal mode="error" name="error" title="Something went wrong" onClose={props.resetErrorBoundary}>
      <p>Something caused this part of the game to crash. Please try again.</p>
      <strong>Error:</strong><Button
        mode="default"
        onClick={() => {
          const message = getMessage();
          navigator.clipboard.writeText(message);
        }}
      >
        <FaRegCopy />
      </Button>
      <pre>{props.error.message}</pre>
      <pre>{props.error.stack}</pre>
      <Button mode="default" onClick={props.resetErrorBoundary}>
        Try again
      </Button>
      <Button mode="default" onClick={prepareEmail}>
        <AiOutlineMail />
        Submit bug report
      </Button>
      
    </Modal>
  );
};
