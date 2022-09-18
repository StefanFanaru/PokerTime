import * as React from 'react';
import './forbidden.scss';
import { Page } from 'azure-devops-ui/Page';
import { ZeroData, ZeroDataActionType } from 'azure-devops-ui/ZeroData';
import { useHistory } from 'react-router-dom';

interface Props {
	userNotAuthenticated?: boolean;
}

const Forbidden = (props: Props): JSX.Element => {
	const history = useHistory();

	return (
		<Page className="flex-grow forbidden-wrapper">
			<ZeroData
				iconProps={{ iconName: 'BlockedSite' }}
				imageAltText="Blocked page"
				primaryText="Forbidden"
				secondaryText={<span>You are not authorized to access this page.</span>}
				actionType={ZeroDataActionType.ctaButton}
				actionText={props.userNotAuthenticated ? '' : 'Home'}
				onActionClick={() => history.push('/home')}
			/>
		</Page>
	);
};

export default Forbidden;
