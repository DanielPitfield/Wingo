type Props = {
  type: "default" | "info" | "success" | "warning" | "error";
  children?: React.ReactNode;
};

export const MessageNotification = (props: Props) => {
  return (
    <span className="message-notification" data-type={props.type}>
      {props.children}
    </span>
  );
};
