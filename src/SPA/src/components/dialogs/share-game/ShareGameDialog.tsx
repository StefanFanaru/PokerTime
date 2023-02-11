import * as React from 'react';
import './share-game-dialog.scss';
import {Link} from 'azure-devops-ui/Link';
import {Dialog} from 'azure-devops-ui/Dialog';
import {useSelector} from 'react-redux';
import {AppState} from '../../../store';
import {toast} from 'react-toastify';

interface Props {
	onDismiss: () => void;
	gameId: string;
}

const ShareGameDialog = (props: Props): JSX.Element => {
	const {baseUrl} = useSelector((state: AppState) => state.parentFrameData);

	async function onCopy() {
		const urlField = document.createElement('textarea');
		urlField.innerText = `${baseUrl}#/game/${props.gameId}`;
		document.body.appendChild(urlField);
		urlField.select();
		document.execCommand('copy');
		urlField.remove();
		props.onDismiss();
		toast('Link copied to clipboard', {type: 'success'});
	}

	return (
		<div className="share-game-dialog-wrapper">
			<Dialog
				className="share-link-dialog"
				titleProps={{text: 'Share link'}}
				footerButtonProps={[
					{
						text: 'Cancel',
						onClick: () => props.onDismiss()
					},
					{
						text: 'Copy',
						primary: true,
						onClick: onCopy
					}
				]}
				onDismiss={() => props.onDismiss()}>
				<span>Share this link with the person you want to invite:</span>
				<div className="share-link-wrapper">
					<Link href={`${baseUrl}#/game/${props.gameId}`}>{`${baseUrl}#/game/${props.gameId}`}</Link>
				</div>
			</Dialog>
		</div>
	);
};

export default ShareGameDialog;
