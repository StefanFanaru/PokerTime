import * as React from 'react';
import './game-ended-dialog.scss';
import { Dialog } from 'azure-devops-ui/Dialog';
import { useHistory } from 'react-router-dom';

interface Props {
	onDismiss: () => void;
	gameTitle?: string;
}

const GameEndedDialog = (props: Props): JSX.Element => {
	const history = useHistory();

	function onLeave() {
		history.push('/');
	}

	return (
		<div className="game-ended-dialog-wrapper">
			<Dialog
				titleProps={{ text: 'Game ended' }}
				footerButtonProps={[
					{
						text: 'Stay',
						onClick: props.onDismiss
					},
					{
						text: 'Leave',
						primary: true,
						onClick: onLeave
					}
				]}
				onDismiss={props.onDismiss}>
				<div className="delete-game-wrapper">
					<div>
						The game '{props.gameTitle}' has ended.
						<br/>
						You can choose to stay here, or you can leave to the games list.
					</div>
				</div>
			</Dialog>
		</div>
	);
};

export default GameEndedDialog;
