import { IWorkItemBase } from './work-item-base';

export interface IListWorkItem extends IWorkItemBase {
	isActive: boolean;
	isSelected: boolean;
}
