import * as React from 'react';
import {useEffect} from 'react';
import './end-game-dialog.scss';
import {Dialog} from 'azure-devops-ui/Dialog';
import useAxios from 'axios-hooks';

interface Props {
	onDismiss: () => void;
	onSubmit: () => void;
	gameTitle: string;
	gameId: string;
	showJustExit?: boolean;
}

const EndGameDialog = (props: Props): JSX.Element => {
	const [{response}, postGameEnd] = useAxios(
		{
			method: 'POST',
			url: '/api/game/end'
		},
		{manual: true}
	);

	async function onSubmit() {
		await postGameEnd({
			data: {
				gameId: props.gameId
			}
		});
	}

	useEffect(() => {
		if (response) {
			props.onSubmit();
		}
	}, [response]);

	function onJustExit() {
		props.onSubmit();
	}

	return (
		<div className="end-game-dialog-wrapper">
			<Dialog
				titleProps={{text: 'End game'}}
				footerButtonProps={
					props.showJustExit
						? [
								{
									text: 'Cancel',
									onClick: props.onDismiss
								},
								{
									text: 'Just exit',
									primary: true,
									onClick: onJustExit
								},
								{
									text: 'End',
									danger: true,
									onClick: onSubmit
								}
						  ]
						: [
								{
									text: 'Cancel',
									onClick: props.onDismiss
								},
								{
									text: 'End',
									danger: true,
									onClick: onSubmit
								}
						  ]
				}
				onDismiss={props.onDismiss}>
				<div className="delete-game-wrapper">
					<div>Are you sure you want to end this game? You will not be able to resume it.</div>
					<br />
					<span>
						Game title: <i>{props.gameTitle}</i>
					</span>
				</div>
			</Dialog>
		</div>
	);
};

export default EndGameDialog;
