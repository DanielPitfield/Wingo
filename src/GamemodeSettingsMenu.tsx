import React, { useState } from "react";
import { Button } from "./Button";
import { Modal } from "./Modal";
import { FiSettings } from "react-icons/fi";
import { Setting, SettingInfo } from "./Setting";

interface Props {
  settings: SettingInfo[];
}

const GamemodeSettingsMenu: React.FC<Props> = (props) => {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <Button mode="default" className="gamemode-settings-button" onClick={() => setShowModal(true)}>
        <FiSettings />
        Game Settings
      </Button>
      {showModal && (
        <Modal mode="default" name="Gamemode Settings" onClose={() => setShowModal(false)} title="Gamemode Settings">
          {props.settings.map((setting) => (
            <Setting key={setting.name} setting={setting} />
          ))}
        </Modal>
      )}
    </>
  );
};

export default GamemodeSettingsMenu;
