import * as React from 'react';
import './right-menu-admin-button.scss';
import { Icon } from 'azure-devops-ui/Icon';

interface IProps {
	text: string;
	icon: string;
	onClick: () => void;
	isDisabled?: boolean;
}

const RightMenuAdminButton = (props: IProps): JSX.Element => {
	return (
		<div className={'right-menu-admin-button-wrapper noSelect ' + (props.isDisabled ? 'disabled' : '')} onClick={props.onClick}>
			<div className="icon">
				<Icon iconName={props.icon}/>
			</div>
			<span>{props.text}</span>
		</div>
	);
};

export default RightMenuAdminButton;
