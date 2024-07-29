import { SprintDetails } from "./SprintDetails";
import { UserDetails } from "./UserDetails";

export interface SprintSummary {
    sprintDetails: SprintDetails[],
    userStoriesCount: number,
    sprintCommitPoints: number,
    completedPoints: number,
    sprintCompletePercentage: number,
    sprintName: string,
    userdata: Map<String, UserDetails[]>
}