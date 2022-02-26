import { HistorySaveData } from "../SaveData";

/** */
export abstract class BaseChallenge {
    /** Title of the challenge */
    public abstract title: string;

    /** Description of the challenge */
    public abstract description: string;

    /** Progress towards the @see target */
    public abstract currentProgress(history: HistorySaveData): number;

    /** Target to reach */
    public abstract target: number;

    /**
     * Returns the current percentage completion of the challenge (capped to 100%).
     * @param history Current save data history.
     * @returns Current percentage completion of the challenge (capped to 100%).
     */
    public getProgressPercentage(history: HistorySaveData): number {
        const percent = (this.currentProgress(history) / this.target) * 100;

        return Math.min(Math.round(percent), 100);
    }

    /**
     * Returns whether the challenge has been achieved.
     * @param history Current save data history.
     * @returns Whether the challenge has been achieved.
     */
    public isAcheived(history: HistorySaveData): boolean {
        return this.getProgressPercentage(history) >= 100;
    }
}