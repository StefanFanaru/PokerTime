import {TextField} from 'azure-devops-ui/TextField';
import {Dropdown} from 'azure-devops-ui/Dropdown';
import {Panel} from 'azure-devops-ui/Panel';
import * as React from 'react';
import {useEffect, useState} from 'react';
import {CoreRestClient, WebApiTeam} from 'azure-devops-extension-api/Core';
import {IListSelection} from 'azure-devops-ui/List';
import {TeamSettingsIteration, WorkRestClient} from 'azure-devops-extension-api/Work';
import {DropdownSelection} from 'azure-devops-ui/Utilities/DropdownSelection';
import {useSelector} from 'react-redux';
import {AppState} from '../../../../store';
import {IListBoxItem} from 'azure-devops-ui/ListBox';
import {getClient} from 'azure-devops-extension-api';
import useAxios from 'axios-hooks';
import {IGamePanelItem} from '../../../../types/game-panel-item';
import {FormItem} from 'azure-devops-ui/FormItem';
import WarningDialog from '../../../dialogs/warning-dialog/WarningDialog';

interface State {
	gameTitle?: string;
	velocity?: number;
	isPointsInputInvalid?: boolean;
	teams?: WebApiTeam[];
	selectedTeam?: WebApiTeam;
	teamsSelection: IListSelection;
	iterations?: TeamSettingsIteration[];
	selectedIteration?: TeamSettingsIteration;
	iterationSelection: IListSelection;
	isIterationWarningVisible?: boolean;
	pendingSelectionIterationId?: string;
	isTeamWarningVisible?: boolean;
	pendingSelectionTeamId?: string;
	isAutomaticTitle?: boolean;
}

interface Props {
	onSubmit: (id: string, title: string, team: WebApiTeam, iteration: TeamSettingsIteration, velocity?: number) => void;
	onClose: () => void;
	gameUnderEdit?: IGamePanelItem;
}

const NewGame = (props: Props): JSX.Element => {
	const [state, setState] = useState<State>({
		teamsSelection: new DropdownSelection(),
		iterationSelection: new DropdownSelection()
	});

	const {details: projectDetails} = useSelector((state: AppState) => state.projectInfo);
	const [{data: dataGameInsert}, postGameInsert] = useAxios<{gameId: string}>(
		{
			method: 'POST',
			url: '/api/game'
		},
		{manual: true}
	);

	const [{response: updateResponse}, postGameUpdate] = useAxios<{gameId: string}>(
		{
			method: 'PATCH',
			url: '/api/game'
		},
		{manual: true}
	);

	// POST game insert
	useEffect(() => {
		if (!dataGameInsert) {
			return;
		}
		props.onSubmit(dataGameInsert.gameId, state.gameTitle!, state.selectedTeam!, state.selectedIteration!, state.velocity);
	}, [dataGameInsert]);

	// PATCH game update
	useEffect(() => {
		if (!updateResponse) {
			return;
		}
		props.onSubmit(props.gameUnderEdit!.id, state.gameTitle!, state.selectedTeam!, state.selectedIteration!, state.velocity);
	}, [updateResponse]);

	function onGameTitleChange(newValue: string, isAutomaticTitle = false) {
		setState(prevState => {
			if (!prevState.isAutomaticTitle && prevState.gameTitle && isAutomaticTitle) {
				return prevState;
			}
			return {...prevState, gameTitle: newValue, isAutomaticTitle: isAutomaticTitle};
		});
	}

	function onIterationSelect(item: IListBoxItem) {
		if (props.gameUnderEdit && props.gameUnderEdit.selectedIterationId !== item.id) {
			setState(prevState => ({...prevState, isIterationWarningVisible: true, pendingSelectionIterationId: item.id}));
			return;
		}

		setState({
			...state,
			selectedIteration: state.iterations?.find(x => x.id == item.id)
		});
	}

	function onTeamSelect(item: IListBoxItem) {
		if (props.gameUnderEdit && props.gameUnderEdit.selectedTeamId !== item.id) {
			setState(prevState => ({...prevState, isTeamWarningVisible: true, pendingSelectionTeamId: item.id}));
			return;
		}
		setState(prevState => ({...prevState, selectedTeam: state.teams?.find(x => x.id == item.id)}));
	}

	useEffect(() => {
		if (state.teams?.length || !projectDetails) {
			return;
		}
		getClient(CoreRestClient)
			.getTeams(projectDetails.id, true)
			.then(teams => {
				setState(prevState => ({...prevState, teams}));
			});
	}, [projectDetails]);

	useEffect(() => {
		if (!state.teams) {
			return;
		}

		if (state.teams?.length == 1) {
			if (state.teams?.length == 1 && state.teamsSelection.selectedCount == 0) {
				state.teamsSelection.select(0);
			}

			setState(prevState => ({...prevState, selectedTeam: state.teams![0]}));
			return;
		}

		if (props.gameUnderEdit) {
			const selectedTeamIndex = state.teams?.findIndex(x => x.id == props.gameUnderEdit!.selectedTeamId)!;
			state.teamsSelection.select(selectedTeamIndex);
			setState(prevState => ({...prevState, selectedTeam: state.teams![selectedTeamIndex]}));
		}
	}, [state.teams]);

	useEffect(() => {
		if (!state.selectedTeam) {
			state.iterationSelection.clear();
			return;
		}

		if (!projectDetails) {
			return;
		}

		getClient(WorkRestClient)
			.getTeamIterations({
				project: projectDetails.name,
				projectId: projectDetails.id,
				team: state.selectedTeam.name,
				teamId: state.selectedTeam.id
			})
			.then(iterations => {
				setState(prevState => ({...prevState, iterations: iterations}));

				if (iterations.length == 1) {
					state.iterationSelection.select(0);
					setState(prevState => ({...prevState, selectedIteration: iterations[0]}));

					return;
				}

				if (props.gameUnderEdit) {
					const selectedIterationIndex = iterations.findIndex(x => x.id == props.gameUnderEdit!.selectedIterationId);
					setState(prevState => ({...prevState, selectedIteration: iterations[selectedIterationIndex]}));
					state.iterationSelection.select(selectedIterationIndex);

					return;
				}

				state.iterationSelection.clear();
			});
	}, [state.selectedTeam, projectDetails]);

	useEffect(() => {
		if (props.gameUnderEdit) {
			setState(prevState => ({...prevState, gameTitle: props.gameUnderEdit!.title, velocity: props.gameUnderEdit!.velocity}));
			return;
		}

		if (state.selectedIteration) {
			onGameTitleChange(state.selectedIteration.name, true);
		}
	}, [state.selectedIteration]);

	async function onSubmit() {
		const isValid =
			state.gameTitle && state.selectedTeam && state.selectedIteration && (state.velocity == undefined || state.velocity > 0);
		if (!isValid) {
			return;
		}

		const request = {
			data: {
				gameId: '',
				gameTitle: state.gameTitle,
				iterationId: state.selectedIteration!.id,
				iterationName: state.selectedIteration!.name,
				projectId: projectDetails!.id,
				projectName: projectDetails!.name,
				teamId: state.selectedTeam!.id,
				teamName: state.selectedTeam!.name,
				velocity: state.velocity
			}
		};

		if (props.gameUnderEdit) {
			request.data.gameId = props.gameUnderEdit.id;
			await postGameUpdate(request);
			return;
		}

		await postGameInsert(request);
	}

	function onVelocityChange(newValue: string) {
		if (!newValue) {
			setState(prevState => ({...prevState, velocity: undefined}));
			return;
		}
		const value = parseFloat(newValue);
		setState(prevState => ({...prevState, velocity: value, isPointsInputInvalid: value <= 0}));
	}

	function onIterationWarningDismiss() {
		setState(prevState => {
			const selectedIterationIndex = state.iterations!.findIndex(x => x.id == props.gameUnderEdit!.selectedIterationId);
			state.iterationSelection.select(selectedIterationIndex);
			return {
				...prevState,
				selectedIteration: state.iterations![selectedIterationIndex],
				isIterationWarningVisible: false,
				pendingSelectionIterationId: undefined
			};
		});
	}

	function onIterationWarningSubmit() {
		setState(prevState => ({
			...prevState,
			selectedIteration: prevState.iterations?.find(x => x.id == prevState.pendingSelectionIterationId),
			pendingSelectionIterationId: undefined,
			isIterationWarningVisible: false
		}));
	}

	function onTeamWarningDismiss() {
		setState(prevState => {
			const selectedTeamIndex = state.teams?.findIndex(x => x.id == props.gameUnderEdit!.selectedTeamId)!;
			state.teamsSelection.select(selectedTeamIndex);
			return {
				...prevState,
				selectedTeam: prevState.teams![selectedTeamIndex],
				isTeamWarningVisible: false,
				pendingSelectionTeamId: undefined
			};
		});
	}

	function onTeamWarningSubmit() {
		setState(prevState => ({
			...prevState,
			selectedTeam: prevState.teams?.find(x => x.id == prevState.pendingSelectionTeamId),
			pendingSelectionTeamId: undefined,
			isTeamWarningVisible: false
		}));
	}

	return (
		<div className="new-game">
			{state.isIterationWarningVisible && (
				<WarningDialog
					onDismiss={onIterationWarningDismiss}
					onSubmit={onIterationWarningSubmit}
					title="Are you sure you want to do this?"
					message="Changing the iteration of this game will resulting in loosing all it's data.
                        Are you sure you want to do this?"
				/>
			)}
			{state.isTeamWarningVisible && (
				<WarningDialog
					onDismiss={onTeamWarningDismiss}
					onSubmit={onTeamWarningSubmit}
					title="Are you sure you want to do this?"
					message="Changing the team that plays this game will resulting in loosing all it's data.
                        Are you sure you want to do this?"
				/>
			)}
			<Panel
				titleProps={{text: props.gameUnderEdit ? 'Edit Game' : 'New Game'}}
				onDismiss={props.onClose}
				footerButtonProps={[
					{
						text: props.gameUnderEdit ? 'Save' : 'Start',
						primary: true,
						disabled: !state.gameTitle || !state.selectedTeam || !state.selectedIteration || state.isPointsInputInvalid,
						onClick: onSubmit
					}
				]}>
				<div className="new-game-panel">
					<div className="panel-group">
						<label>Team</label>
						<Dropdown
							ariaLabel="Team"
							className="input-element"
							placeholder="Select a team that you are part of"
							items={state.teams?.map(team => ({id: team.id, text: team.name})) ?? []}
							noItemsText="No teams available"
							disabled={!state.teams || state.teams.length <= 1}
							onSelect={(_, item) => onTeamSelect(item)}
							inputId="team"
							selection={state.teamsSelection}
						/>
					</div>
					<div className="panel-group">
						<label>Iteration</label>
						<Dropdown
							ariaLabel="Iteration"
							className="input-element"
							placeholder={state.iterations ? 'Select an iteration to be used in this game' : 'Select a team first'}
							items={state.iterations?.map(iteration => ({id: iteration.id, text: iteration.name})) ?? []}
							noItemsText="No iterations available"
							disabled={!state.iterations || state.iterations.length <= 1}
							onSelect={(_, item) => onIterationSelect(item)}
							inputId="iteration"
							selection={state.iterationSelection}
						/>
					</div>
					<div className="panel-group">
						<label>Game title</label>
						<TextField
							className="input-element"
							value={state.gameTitle}
							onChange={(_, newValue) => onGameTitleChange(newValue)}
							placeholder="Game title"
							required={true}
						/>
					</div>
					<div className="panel-group">
						<label>Velocity</label>
						<FormItem
							message={state.isPointsInputInvalid && 'The velocity should be a positive numeric value'}
							error={state.isPointsInputInvalid}>
							<TextField
								className="input-element"
								value={state.velocity?.toString()}
								onChange={(_, newValue) => onVelocityChange(newValue)}
								placeholder="Team velocity reference limit for this game"
								inputType="number"
							/>
						</FormItem>
					</div>
				</div>
			</Panel>
		</div>
	);
};

export default NewGame;
