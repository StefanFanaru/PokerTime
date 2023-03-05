import * as React from 'react';
import './settings.scss';
import {Card} from 'azure-devops-ui/Card';
import {Button} from 'azure-devops-ui/Button';
import {useHistory} from 'react-router-dom';
import SettingsPlayingCards from './SettingsPlayingCards/SettingsPlayingCards';

const Settings = (): JSX.Element => {
	const history = useHistory();

	return (
		<div className="settings-wrapper">
			<Button text="Back to home" className="back-button" iconProps={{iconName: 'Back'}} onClick={() => history.push('/')} />
			<div className="settings-container">
				<div className="setting">
					<div className="title">Playing cards</div>
					<div className="page-content page-content-top">
						<Card>
							<SettingsPlayingCards />
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Settings;
