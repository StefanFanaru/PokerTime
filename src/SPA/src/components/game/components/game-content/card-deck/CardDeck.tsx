﻿import * as React from 'react';
import {useEffect, useState} from 'react';
import './card-deck.scss';
import PlayingCard from '../playing-card/PlayingCard';
import {IPlayingCard} from '../../../../../types/card';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {sendSignalREvent, subscribeToClientEvents} from '../../../../../services/signalr';
import {useDispatch, useSelector} from 'react-redux';
import {AppState} from '../../../../../store';
import useAxios from 'axios-hooks';
import {IPlayingCardResponse} from '../../../../../types/playing-card-response';
import {ClientEventType} from '../../../../../types/client-events/signalREvent';
import {ICardSelectedEvent} from '../../../../../types/client-events/card-selected';
import {bindActionCreators} from 'redux';
import {actionCreators as currentRoundActionsCreators} from '../../../../../store/CurrentRound';
import {actionCreators as currentGameActionCreators} from '../../../../../store/CurrentGame';
import {ICardDeselectedEvent} from '../../../../../types/client-events/card-deselected';
import {GameStatus} from '../../../../../types/game-status';
import configureStore from '../../../../../store/Store';
import {actionCreators as gameInfoCardsActionCreators} from '../../../../../store/GameInfoCards';

interface State {
	cards: IPlayingCard[];
	initialCardCheckDone: boolean;
}

const CardDeck = (): JSX.Element => {
	const [state, setState] = useState<State>({
		cards: [],
		initialCardCheckDone: false
	});

	const [scrollBarRef, setScrollBarRef] = useState<PerfectScrollbar | null>();
	const [{data: playingCardsResponse}, getPlayingCards] = useAxios<IPlayingCardResponse[]>(
		{
			url: '/api/cards/list'
		},
		{manual: true}
	);
	const [{response: playedCardResponse}, getPlayedCard] = useAxios<{cardId: string}>({}, {manual: true});

	const {roundId} = useSelector((state: AppState) => state.currentRound);
	const {gameDetails} = useSelector((state: AppState) => state.currentGame);
	const {id: playerId} = useSelector((state: AppState) => state.playerDetails);
	const {playersThatPlayedCards} = useSelector((state: AppState) => state.gameInfoCards);

	const dispatch = useDispatch();
	const {setSelectedCardId, decreaseCurrentHiddenCardsCount} = bindActionCreators(currentRoundActionsCreators, dispatch);
	const {setPlayingCards} = bindActionCreators(currentGameActionCreators, dispatch);
	const {setPlayersThatPlayedCards} = bindActionCreators(gameInfoCardsActionCreators, dispatch);

	useEffect(() => {
		getPlayingCards();
	}, []);

	useEffect(() => {
		if (!roundId || !playedCardResponse) {
			return;
		}
		getPlayedCard({
			url: `/api/gameRound/${roundId}/played-card`
		});
	}, [roundId]);

	useEffect(() => {
		if (!playingCardsResponse?.length) {
			return;
		}

		const cards: IPlayingCard[] = playingCardsResponse.map(card => ({
			...card,
			isActive: false
		}));
		setState(prevState => ({...prevState, cards}));
		setPlayingCards(cards);

		getPlayedCard({
			url: `/api/gameRound/${roundId}/played-card`
		});
	}, [playingCardsResponse]);

	useEffect(() => {
		if (!playerId) {
			return;
		}

		subscribeToClientEvents<ICardSelectedEvent>(async event => {
			const state = configureStore.getState();
			if (state.currentRound.roundId !== event.roundId) {
				return;
			}
			if (event.playerId != playerId || !event.playingCardId) {
				return;
			}

			setState(prevState => {
				const cards = [...prevState.cards];
				cards.forEach(card => (card.isActive = false));
				const card = cards.find(card => card.id === event.playingCardId)!;
				card.isActive = true;
				return {
					...prevState,
					cards
				};
			});
		}, ClientEventType.CardSelected);

		subscribeToClientEvents<ICardDeselectedEvent>(event => {
			const state = configureStore.getState();
			if (state.currentRound.roundId !== event.roundId) {
				return;
			}
			if (event.playerId != playerId) {
				return;
			}

			setState(prevState => {
				const cards = [...prevState.cards];
				cards.forEach(card => (card.isActive = false));
				return {
					...prevState,
					cards
				};
			});
		}, ClientEventType.CardDeselected);
	}, [playerId]);

	useEffect(() => {
		setState(prevState => {
			prevState.cards.forEach(x => (x.isActive = false));
			if (!playedCardResponse?.data) {
				return {...prevState, cards: [...prevState.cards]};
			}
			const card = prevState.cards.find(x => x.id == playedCardResponse.data.cardId)!;
			if (card) {
				card.isActive = true;
			}
			return {...prevState, cards: [...prevState.cards]};
		});
	}, [playedCardResponse]);

	useEffect(() => {
		scrollBarRef?.updateScroll();
	}, [scrollBarRef]);

	useEffect(() => {
		if (!state.cards || !state.cards.length) {
			return;
		}

		if (!state.initialCardCheckDone && playedCardResponse?.data?.cardId) {
			setState(prevState => ({...prevState, initialCardCheckDone: true}));
			return;
		}
	}, [state.cards]);

	function onCardClick(cardId: string) {
		if (gameDetails?.status === GameStatus.Ended) {
			return;
		}
		setState(prevState => {
			const prevCards = [...prevState.cards];
			const activeIndex = prevCards.findIndex(card => card.isActive);
			const clickedIndex = prevCards.findIndex(card => card.id === cardId);
			const activeCard = {...prevCards[activeIndex]};
			const clickedCard = {...prevCards[clickedIndex]};
			if (activeCard) {
				activeCard.isActive = false;
				prevCards[activeIndex] = activeCard;
				if (activeCard.id === cardId) {
					sendSignalREvent({
						type: ClientEventType.CardDeselected,
						payload: {
							roundId: roundId
						} as ICardDeselectedEvent
					});
					setPlayersThatPlayedCards(playersThatPlayedCards.filter(x => x !== playerId));
					decreaseCurrentHiddenCardsCount();
					setSelectedCardId(undefined);
					return {
						...prevState,
						cards: prevCards
					};
				}
			}
			clickedCard!.isActive = true;
			prevCards[clickedIndex] = clickedCard;
			sendSignalREvent({
				type: ClientEventType.CardSelected,
				payload: {
					playingCardId: clickedCard.id,
					roundId: roundId,
					gameId: gameDetails?.id
				} as ICardSelectedEvent
			});
			setSelectedCardId(clickedCard.id);

			return {
				...prevState,
				cards: prevCards
			};
		});
	}

	return (
		<PerfectScrollbar className="card-deck-wrapper" ref={ref => setScrollBarRef(ref)}>
			{state.cards.map((card, index) => (
				<PlayingCard onClick={onCardClick} key={index} card={card} />
			))}
		</PerfectScrollbar>
	);
};

export default CardDeck;
