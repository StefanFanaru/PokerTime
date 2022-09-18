import * as React from 'react';
import './warning-dialog.scss';
import { Dialog } from 'azure-devops-ui/Dialog';

interface Props {
	onDismiss: () => void;
	onSubmit: () => void;
	title: string;
	message: string;
}

const WarningDialog = (props: Props): JSX.Element => {
	return (
		<div className="warning-dialog-wrapper">
			<Dialog
				titleProps={{ text: props.title, className: 'warning-dialog-title' }}
				footerButtonProps={[
					{
						text: 'Ok',
						danger: true,
						onClick: props.onSubmit
					},
					{
						text: 'Cancel',
						onClick: props.onDismiss
					}
				]}
				onDismiss={props.onDismiss}>
				<div className="delete-game-wrapper">
					<div>{props.message}</div>
					<br/>
				</div>
			</Dialog>
		</div>
	);
};

export default WarningDialog;
