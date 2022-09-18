import { IWorkItemBase } from './work-item-base';

export interface IWorkItemDetails extends IWorkItemBase {
	tags?: string[];
	description?: string;
}
