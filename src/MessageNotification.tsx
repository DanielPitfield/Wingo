type Props = {
  type: "default" | "info" | "success" | "warning" | "error";
};

export const MessageNotification: React.FC<Props> = (props) => {
  return (
    <span className="message-notification" data-type={props.type}>
      {props.children}
    </span>
  );
};
