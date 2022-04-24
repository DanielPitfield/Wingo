import { Button } from "./Button";
import { Modal } from "./Modal";

export const ErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void }> = (props) => {
  return (
    <Modal mode="error" title="Something went wrong" onClose={props.resetErrorBoundary}>
      <p>Something caused this part of the game to crash. Please try again.</p>
      <strong>Error:</strong>
      <pre>{props.error.message}</pre>
      <pre>{props.error.stack}</pre>
      <Button mode="default" onClick={props.resetErrorBoundary}>
        Try again
      </Button>
    </Modal>
  );
};
