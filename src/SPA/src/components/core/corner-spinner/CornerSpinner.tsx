import * as React from 'react';
import './corner-spinner.scss';
import { Spinner, SpinnerSize } from 'azure-devops-ui/Spinner';

const CornerSpinner = (): JSX.Element => {
	return (
		<div className="corner-spinner-wrapper" id="app-spinner">
			<Spinner size={SpinnerSize.medium}/>
		</div>
	);
};

export default CornerSpinner;
