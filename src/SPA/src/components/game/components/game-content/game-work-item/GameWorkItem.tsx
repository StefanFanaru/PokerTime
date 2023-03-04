import * as React from 'react';
import {useEffect, useState} from 'react';
import './game-work-item.scss';
import {WorkItemType} from '../../../../../types/work-items/work-item-type';
import {IWorkItemDetails} from '../../../../../types/work-items/work-item-details';
import PerfectScrollbar from 'react-perfect-scrollbar';
import ImageViewer from '../../../../core/image-viewer/ImageViewer';
import {useSelector} from 'react-redux';
import {AppState} from '../../../../../store';
import {Icon} from 'azure-devops-ui/Icon';
import {replaceAll} from '../../../../../helpers/helpers';
import {Tooltip} from 'azure-devops-ui/TooltipEx';
import {bookIcon, bugIcon} from '../../../../../helpers/svgIcons';

interface State {
	imageSrcUnderView?: string;
	workItem?: IWorkItemDetails;
}

const GameWorkItem = (): JSX.Element => {
	const [state, setState] = useState<State>({});
	const {activeWorkItem} = useSelector((state: AppState) => state.currentRound);

	useEffect(() => {
		if (!activeWorkItem) {
			return;
		}

		if (activeWorkItem?.description) {
			activeWorkItem.description = replaceAll(activeWorkItem.description, '<pre', '<div');
			activeWorkItem.description = replaceAll(activeWorkItem.description, '<img', '<img title="Click to view full size"');
			activeWorkItem.description = replaceAll(activeWorkItem.description, '<a', '<a target="_blank"');
			activeWorkItem.description += '<br>';
		}

		setState(prevState => ({...prevState, workItem: activeWorkItem}));
	}, [activeWorkItem]);

	function onDescriptionClick(e: React.MouseEvent<HTMLDivElement>) {
		if (e.target instanceof HTMLImageElement) {
			setState(prevState => ({...prevState, imageSrcUnderView: (e.target as HTMLImageElement).src}));
		}
	}

	function onImageViewerClose() {
		setState(prevState => ({...prevState, imageSrcUnderView: undefined}));
	}

	return state.workItem ? (
		<div className="game-work-item-wrapper">
			{state.imageSrcUnderView && <ImageViewer imageSrc={state?.imageSrcUnderView} onClose={onImageViewerClose} />}
			<div className="top">
				<div className="icon">{state.workItem.type == WorkItemType.UserStory ? bookIcon : bugIcon}</div>
				<div className="details">
					<Tooltip overflowOnly={true} delayMs={500} text={state.workItem.title}>
						<div className="title">
							{state.workItem.id} - {state.workItem.title}
						</div>
					</Tooltip>
					<div className="tags">
						{state.workItem.tags?.length ? (
							state.workItem.tags.map((tag, index) => <div key={index}>{tag}</div>)
						) : (
							<span className="no-tags">No tags</span>
						)}
					</div>
				</div>
			</div>
			{state.workItem.description ? (
				<PerfectScrollbar className="description card">
					<div
						className="content"
						onClick={e => onDescriptionClick(e)}
						dangerouslySetInnerHTML={{__html: state.workItem.description}}></div>
				</PerfectScrollbar>
			) : (
				<div className="description card no-description">
					<Icon iconName="TextDocument"></Icon>
					<span>No description</span>
				</div>
			)}
		</div>
	) : (
		<div />
	);
};

export default GameWorkItem;
