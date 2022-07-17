type Props = {
  setting: SettingInfo;
};

// Individual setting
export type SettingInfo =
  | {
      type: "option";
      name: string;
      value: string | null;
      values: string[];
      onChange: (value: string | null) => void;
    }
  | { type: "decimal"; name: string; value: number; onChange: (value: number) => void }
  | {
      type: "integer";
      name: string;
      value: number;
      min: number;
      max: number;
      step?: number;
      onChange: (value: number) => void;
    }
  | { type: "boolean"; name: string; value: boolean; onChange: (value: boolean) => void };

export const Setting: React.FC<Props> = (props) => {
  /**
   * Renders a setting control.
   * @param setting Setting to render.
   * @returns Element to render.
   */
  function renderSettingControl(setting: SettingInfo): React.ReactNode {
    switch (setting.type) {
      // Option control
      case "option": {
        return (
          <select
            onChange={(e) =>
              setting.onChange(
                e.target.selectedOptions[0]?.value === "null" ? null : e.target.selectedOptions[0]?.value ?? null
              )
            }
            value={setting.value || "null"}
          >
            <option value="null">No preference (default)</option>
            {setting.values.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        );
      }

      // Slider 0.0 to 1.0 control
      case "decimal": {
        const MAX = 100;
        const MIN = 0;

        return (
          <input
            type="range"
            min={MIN}
            max={MAX}
            onChange={(e) => setting.onChange(Math.min(MAX, e.target.valueAsNumber / MAX))}
            value={Math.min(MAX, setting.value * 100)}
          />
        );
      }

      // Number control
      case "integer": {
        return (
          <input
            type="number"
            min={setting.min}
            max={setting.max}
            step={setting.step || 1}
            onChange={(e) => setting.onChange(Math.min(setting.max, e.target.valueAsNumber))}
            value={Math.min(setting.max, setting.value)}
          />
        );
      }

      // Checkbox Yes/No control
      case "boolean": {
        return <input type="checkbox" onChange={(e) => setting.onChange(e.target.checked)} checked={setting.value} />;
      }
    }
  }

  return (
    <div className="setting-container">
      <label key={props.setting.name} className="setting">
        <span className="setting-name">{props.setting.name}</span>
        <div className="setting-control">{renderSettingControl(props.setting)}</div>
      </label>
    </div>
  );
};
