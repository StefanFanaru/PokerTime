import * as React from 'react';
import './error-page.scss';
import { useHistory } from 'react-router-dom';
import { Page } from 'azure-devops-ui/Page';
import { ZeroData, ZeroDataActionType } from 'azure-devops-ui/ZeroData';

interface Props {
	message?: string;
	canGoHome?: boolean;
}

const ErrorPage = (props: Props): JSX.Element => {
	const history = useHistory();

	return (
		<Page className="flex-grow error-page-wrapper">
			<ZeroData
				iconProps={{ iconName: 'Error' }}
				imageAltText="Error"
				primaryText="Error"
				secondaryText={props.message ?? 'And unexpected error has occurred.'}
				actionType={ZeroDataActionType.ctaButton}
				actionText={props.canGoHome ? 'Home' : ''}
				onActionClick={() => history.push('/home')}
			/>
		</Page>
	);
};

export default ErrorPage;
