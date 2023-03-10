import ProgressBar from "./ProgressBar";
import Star from "../Data/Images/star.png";
import GoldCoin from "../Data/Images/gold.png";
import { BaseChallenge } from "../Data/Challenges/BaseChallenge";
import Button from "./Button";
import { useNotificationChime } from "../Data/Sounds";
import { SettingsData } from "../Data/SaveData/Settings";
import { getHistory } from "../Data/SaveData/GameHistory";

interface ChallengeProps {
  mode: "enhanced" | "default";
  challenge: BaseChallenge;
  settings: SettingsData;
  addGold: (gold: number) => void;
  onClick?: () => void;
}

export const Challenge = (props: ChallengeProps) => {
  const [playNotificationChime] = useNotificationChime(props.settings);

  const { challenge } = props;
  const history = getHistory();
  const currentProgress = challenge.currentProgress(history);
  const { status, statusDescription } = challenge.getStatus(history);

  return (
    <div
      className={["challenge", status === "acheived" ? "shimmer" : ""].join(" ")}
      key={challenge.id()}
      data-status={status}
      data-animation-setting={props.settings.graphics.animation}
      title={statusDescription}
      onClick={props.onClick}
    >
      <img className="challenge-icon" src={Star} width={32} height={32} alt="" />
      <h3 className="challenge-title">{challenge.userFacingTitle}</h3>
      <p className="challenge-description">{challenge.description()}</p>
      <ChallengeReward goldCoins={challenge.reward().goldCoins} />
      <ProgressBar
        progress={Math.min(challenge.target(), currentProgress)}
        total={challenge.target()}
        display={{ type: "solid", color: "#ffd613" }}
      >
        {Math.min(challenge.target(), currentProgress)} / {challenge.target()} {challenge.unit}
      </ProgressBar>
      {status === "acheived" && (
        <Button
          mode="default"
          className="challenge-redeem-reward"
          settings={props.settings}
          onClick={(event) => {
            challenge.isRedeemed = true;
            props.addGold(challenge.reward().goldCoins);
            playNotificationChime();

            // Stop the onClick of the parent DIV firing as well
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          Redeem
        </Button>
      )}
    </div>
  );
};

interface ChallengeRewardProps {
  goldCoins: number;
}

export const ChallengeReward = (props: ChallengeRewardProps) => {
  return (
    <span className="challenge-reward">
      <img className="challenge-reward-icon" height={18} width={18} src={GoldCoin} alt="" />
      {props.goldCoins}
    </span>
  );
};
