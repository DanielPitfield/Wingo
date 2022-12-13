export interface MessageNotificationProps {
  type: "default" | "info" | "success" | "warning" | "error";
  children?: React.ReactNode;
}

const MessageNotification = (props: MessageNotificationProps) => {
  return (
    <span className="message-notification" data-type={props.type}>
      {props.children}
    </span>
  );
};

export default MessageNotification;
