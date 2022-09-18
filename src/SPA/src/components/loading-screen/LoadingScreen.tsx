import * as React from 'react';
import './loading-screen.scss';
import { Spinner, SpinnerSize } from 'azure-devops-ui/Spinner';

interface Props {
	label?: string;
}

const LoadingScreen = (props: Props): JSX.Element => {
	return (
		<div className="loading-screen-wrapper">
			<Spinner size={SpinnerSize.large} label={props.label ?? 'Loading...'}/>
		</div>
	);
};

export default LoadingScreen;
