import * as React from 'react';
import './game-content.scss';
import GameWorkItem from './game-work-item/GameWorkItem';
import CardDeck from './card-deck/CardDeck';
import PlayedCards from './played-cards/PlayedCards';
import GameInfoCards from './game-info-cards/GameInfoCards';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../store';
import { GameStatus } from '../../../../types/game-status';
import { Icon } from 'azure-devops-ui/Icon';

const GameContent = (): JSX.Element => {
	const { roundId } = useSelector((state: AppState) => state.currentRound);
	const { gameDetails } = useSelector((state: AppState) => state.currentGame);

	return (
		<div className="game-content-wrapper">
			{gameDetails?.status === GameStatus.Paused && (
				<div className="game-content-paused">
					<Icon iconName="CirclePause"/>
					<span>The game is currently paused</span>
				</div>
			)}
			<div className="top-wrapper">
				<div className="left">
					<GameWorkItem/>
				</div>
				{window.innerWidth >= 1000 && (
					<div className="right">
						<GameInfoCards/>
					</div>
				)}
			</div>
			<PlayedCards/>
			{roundId && <CardDeck/>}
		</div>
	);
};

export default GameContent;
