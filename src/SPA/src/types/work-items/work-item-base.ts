import { WorkItemType } from './work-item-type';

export interface IWorkItemBase {
	id: number;
	title: string;
	url: string;
	type: WorkItemType;
	points?: number | undefined;
}
