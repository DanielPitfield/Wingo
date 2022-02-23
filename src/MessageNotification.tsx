type Props = {
  type: 'default' | 'success' | 'warning' | 'error'
}

export const MessageNotification: React.FC<Props> = (props) => {
  return (
    <span className="message-notification" data-type={props.type}>
      {props.children}
    </span>
  )
}
