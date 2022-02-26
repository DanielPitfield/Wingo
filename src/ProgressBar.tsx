import React from 'react'
import './index.css'

interface Props {
  progress: number
  total: number
}

const ProgressBar: React.FC<Props> = (props) => {
  return (
    <div className="progress_bar">
      <div
        className="progress_bar_progress"
        style={{ width: `${(props.progress / props.total) * 100}%` }}
      ></div>
    </div>
  )
}

export default ProgressBar
