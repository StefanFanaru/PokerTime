import * as React from 'react';
import './help-dialog.scss';
import { Dialog } from 'azure-devops-ui/Dialog';

interface Props {
	onDismiss: () => void;
}

const HelpDialog = (props: Props): JSX.Element => {
	return (
		<div className="help-dialog-wrapper">
			<Dialog
				titleProps={{ text: 'Help' }}
				footerButtonProps={[
					{
						text: 'Close',
						onClick: props.onDismiss
					}
				]}
				onDismiss={props.onDismiss}>
				<div className="delete-game-wrapper">
					<div>Some help for stuff</div>
					<br/>
				</div>
			</Dialog>
		</div>
	);
};

export default HelpDialog;
