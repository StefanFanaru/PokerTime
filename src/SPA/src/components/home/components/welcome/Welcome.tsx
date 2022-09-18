import * as React from 'react';
import './welcome.scss';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../store';
import { Button } from 'azure-devops-ui/Button';

interface Props {
	onNewGameClick: () => void;
}

const Welcome = (props: Props): JSX.Element => {
	const { name } = useSelector((state: AppState) => state.playerDetails);

	return (
		<div className="welcome-wrapper">
			<div className="title">Welcome, {name}!</div>
			<div className="subtitle">This is PokerTime. Are you ready to play some cards? If so, start a new game.</div>
			<span>
				<Button text="Start a new game" primary={true} onClick={props.onNewGameClick}/>
			</span>
		</div>
	);
};

export default Welcome;
