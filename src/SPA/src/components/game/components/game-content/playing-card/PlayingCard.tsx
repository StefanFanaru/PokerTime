import * as React from 'react';
import './playing-card.scss';
import { IPlayingCard } from '../../../../../types/card';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../../store';
import { GameStatus } from '../../../../../types/game-status';

interface IProps {
	card: IPlayingCard;
	onClick?: (cardId: string) => void;
}

const PlayingCard = (props: IProps): JSX.Element => {
	const { gameDetails } = useSelector((state: AppState) => state.currentGame);

	return (
		<div
			className={
				'playing-card-wrapper noSelect ' +
				(props.card.isActive ? 'active' : '') +
				(gameDetails?.status === GameStatus.Ended ? ' disabled' : '')
			}
			style={{ background: props.card.color }}
			onClick={() => (props.onClick ? props.onClick(props.card.id) : null)}>
			<span className="card-content">{props.card.content}</span>
		</div>
	);
};

export default PlayingCard;
