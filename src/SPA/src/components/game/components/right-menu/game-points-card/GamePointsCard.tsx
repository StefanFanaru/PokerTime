import * as React from 'react';
import {useEffect, useState} from 'react';
import './game-points-card.scss';
import {TextField} from 'azure-devops-ui/TextField';
import {Button} from 'azure-devops-ui/Button';
import {FormItem} from 'azure-devops-ui/FormItem';
import {useDispatch, useSelector} from 'react-redux';
import {AppState} from '../../../../../store';
import {GameStatus} from '../../../../../types/game-status';
import {getClient} from 'azure-devops-extension-api';
import {WorkItemTrackingRestClient} from 'azure-devops-extension-api/WorkItemTracking';
import {bindActionCreators} from 'redux';
import {actionCreators as currentRoundActionCreators} from '../../../../../store/CurrentRound';
import useAxios from 'axios-hooks';
import {computeAveragePoints} from '../helpers';
import {actionCreators as gameInfoActionCreators} from '../../../../../store/GameInfoCards';

interface State {
	pointsInputValue?: number;
	isPointsInputInvalid: boolean;
	averagePoints: number | null;
}

const GamePointsCard = (): JSX.Element => {
	const [state, setState] = useState<State>({
		isPointsInputInvalid: false,
		averagePoints: null
	});
	const {gameDetails} = useSelector((state: AppState) => state.currentGame);
	const {activeWorkItemStoryPoints, activeWorkItem, roundId, playedCards} = useSelector((state: AppState) => state.currentRound);

	const {details: projectDetails} = useSelector((state: AppState) => state.projectInfo);
	const {playedRoundsCount} = useSelector((state: AppState) => state.gameInfoCards);
	const [{}, patchStoryPoints] = useAxios<{gameId: string}>(
		{
			method: 'PATCH',
			url: '/api/GameRound/set-story-points'
		},
		{manual: true}
	);

	const dispatch = useDispatch();
	const {setActiveWorkItemStoryPoints} = bindActionCreators(currentRoundActionCreators, dispatch);
	const {setPlayedRoundsCount} = bindActionCreators(gameInfoActionCreators, dispatch);
	useEffect(() => {
		if (!playedCards.length) {
			setState(prevState => ({...prevState, averagePoints: null}));
			return;
		}

		const averagePoints = computeAveragePoints(playedCards);
		setState(prevState => ({
			...prevState,
			averagePoints: averagePoints ? Math.round(averagePoints * 100) / 100 : averagePoints
		}));
	}, [playedCards]);

	useEffect(() => {
		if (activeWorkItemStoryPoints !== state.pointsInputValue) {
			setState(prevState => ({...prevState, pointsInputValue: activeWorkItemStoryPoints}));
		}
	}, [activeWorkItemStoryPoints]);

	function onPointsInputChange(newValue: string) {
		const value = parseFloat(newValue);
		setState(prevState => ({...prevState, pointsInputValue: value, isPointsInputInvalid: value < 0}));
	}

	async function onPointsSave() {
		if (state.pointsInputValue === undefined) {
			return;
		}
		const points = Math.round(state.pointsInputValue * 100) / 100;
		const workRestClient = getClient(WorkItemTrackingRestClient);
		await workRestClient.updateWorkItem(
			[
				{
					op: 'add',
					path: '/fields/Microsoft.VSTS.Scheduling.StoryPoints',
					value: points
				}
			],
			activeWorkItem?.id!,
			projectDetails?.id
		);
		if (activeWorkItemStoryPoints == undefined || activeWorkItemStoryPoints == null) {
			setPlayedRoundsCount(playedRoundsCount + 1);
		}
		setActiveWorkItemStoryPoints(points);
		patchStoryPoints({
			data: {
				roundId: roundId!,
				gameId: gameDetails?.id!,
				submittedStoryPoints: points
			}
		});
	}

	return (
		<div className="game-points-card-wrapper">
			<div className="left">
				<div className="top-points noSelect">
					<span>Average points:</span>
					<span className="points">{state.averagePoints ?? '...'}</span>
				</div>
				<FormItem error={state.isPointsInputInvalid}>
					<TextField
						disabled={gameDetails?.status === GameStatus.Paused}
						value={state.pointsInputValue?.toString()}
						onChange={(_, newValue) => onPointsInputChange(newValue)}
						placeholder="Points"
						inputType="number"
					/>
				</FormItem>
			</div>
			<div className="right">
				<Button
					tooltipProps={{text: 'Save points', delayMs: 500}}
					disabled={
						activeWorkItemStoryPoints == state.pointsInputValue ||
						gameDetails?.status === GameStatus.Paused ||
						state.isPointsInputInvalid ||
						(!state.pointsInputValue && state.pointsInputValue != 0)
					}
					iconProps={{iconName: 'Save'}}
					onClick={onPointsSave}
				/>
			</div>
		</div>
	);
};

export default GamePointsCard;
