import * as React from 'react';
import {useEffect, useState} from 'react';
import './played-cards.scss';
import PlayedCard from '../playing-card-back/PlayedCard';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {getClient} from 'azure-devops-extension-api';
import {GraphRestClient} from 'azure-devops-extension-api/Graph';
import {subscribeToClientEvents} from '../../../../../services/signalr';
import {ClientEventType} from '../../../../../types/client-events/signalREvent';
import {IPlayedCard} from '../../../../../types/played-card';
import {useDispatch, useSelector} from 'react-redux';
import {AppState} from '../../../../../store';
import useAxios from 'axios-hooks';
import {ICardDeselectedEvent} from '../../../../../types/client-events/card-deselected';
import {ICardsWereFlippedEvent} from '../../../../../types/client-events/cards-were-flipped';
import {bindActionCreators} from 'redux';
import {actionCreators as currentRoundActionsCreators} from '../../../../../store/CurrentRound';
import {actionCreators as gameInfoCardsActionCreators} from '../../../../../store/GameInfoCards';
import {ICardSelectedEvent} from '../../../../../types/client-events/card-selected';
import configureStore from '../../../../../store/Store';

interface State {
	cards: IPlayedCard[];
}

const PlayedCards = (): JSX.Element => {
	const [state, setState] = useState<State>({
		cards: []
	});
	const [scrollBarRef, setScrollBarRef] = useState<PerfectScrollbar | null>();
	const {id: playerId} = useSelector((state: AppState) => state.playerDetails);
	const {selectedCardId, roundId, flippedCards, cardsWereFlipped} = useSelector((state: AppState) => state.currentRound);
	const {gameDetails, playingCards} = useSelector((state: AppState) => state.currentGame);
	const [{response: playedCardsResponse}, getPlayedCards] = useAxios<IPlayedCard[]>({}, {manual: true});

	const dispatch = useDispatch();
	const {
		setFlippedCards,
		setPlayedCards,
		setCurrentHiddenCardsCount,
		increaseCurrentHiddenCardsCount,
		decreaseCurrentHiddenCardsCount
	} = bindActionCreators(currentRoundActionsCreators, dispatch);
	const {setPlayersThatPlayedCards} = bindActionCreators(gameInfoCardsActionCreators, dispatch);

	useEffect(() => {
		if (roundId) {
			getPlayedCards({
				url: `/api/gameRound/${roundId}/played-cards`
			});
		}
	}, [roundId]);

	useEffect(() => {
		setPlayedCards(cardsWereFlipped ? state.cards : []);
	}, [state.cards]);

	useEffect(() => {
		if (playedCardsResponse?.data) {
			addPlayersCards(playedCardsResponse.data);
			setCurrentHiddenCardsCount(playedCardsResponse.data.length);
			setPlayersThatPlayedCards(playedCardsResponse.data.map(x => x.playerId));
		}
	}, [playedCardsResponse]);

	useEffect(() => {
		scrollBarRef?.updateScroll();
	}, [scrollBarRef]);

	useEffect(() => {
		if (!selectedCardId) {
			removeCurrentPlayerCard(playerId!);
			return;
		}

		if (cardsWereFlipped) {
			const playingCard = playingCards.find(card => card.id === selectedCardId);
			insertNewCard({
				playerId: playerId!,
				roundId,
				gameId: gameDetails?.id!,
				playingCardId: selectedCardId,
				color: playingCard!.color,
				content: playingCard!.content
			});
			return;
		}

		insertNewCard({
			playerId: playerId!,
			roundId,
			gameId: gameDetails?.id!,
			playingCardId: undefined,
			color: undefined,
			content: undefined
		});
	}, [selectedCardId]);

	async function getPlayerData(playerId: string): Promise<void> {
		const avatarSrc = sessionStorage.getItem(`${playerId}_avatar`);
		const displayName = sessionStorage.getItem(`${playerId}_displayName`);

		if (avatarSrc && displayName) {
			return;
		}

		const client = getClient(GraphRestClient);
		const descriptorResult = await client.getDescriptor(playerId);
		const avatar = await client.getAvatar(descriptorResult.value);
		const user = await client.getUser(descriptorResult.value);
		sessionStorage.setItem(`${playerId}_avatar`, avatar.value.toString());
		sessionStorage.setItem(`${playerId}_displayName`, user.displayName);
	}

	useEffect(() => {
		if (playerId) {
			getPlayerData(playerId);
		}
	}, [playerId]);

	useEffect(() => {
		if (!flippedCards.length) {
			return;
		}

		setState(prevState => {
			const newCards = prevState.cards.map(x => {
				const flippedCard = flippedCards.find(y => y.playerId === x.playerId);
				if (flippedCard) {
					return {
						...x,
						content: flippedCard.content,
						color: flippedCard.color
					};
				}

				return x;
			});
			return {
				...prevState,
				cards: [...newCards]
			};
		});
	}, [flippedCards]);

	useEffect(() => {
		if (!gameDetails) {
			return;
		}

		subscribeToClientEvents<ICardSelectedEvent>(async event => {
			const state = configureStore.getState();
			if (state.currentRound.roundId !== event.roundId) {
				return;
			}
			addPlayerThatPlayedCard(event.playerId);
			await insertNewCard(event);
			increaseCurrentHiddenCardsCount();
		}, ClientEventType.CardSelected);

		subscribeToClientEvents<ICardDeselectedEvent>(event => {
			const state = configureStore.getState();
			if (state.currentRound.roundId !== event.roundId) {
				return;
			}
			removePlayerThatPlayedCard(event.playerId);
			removeCurrentPlayerCard(event.playerId);
			decreaseCurrentHiddenCardsCount();
		}, ClientEventType.CardDeselected);

		subscribeToClientEvents<ICardsWereFlippedEvent>(async event => {
			setFlippedCards(event.cards);
		}, ClientEventType.CardsWereFlipped);
	}, [gameDetails]);

	function addPlayerThatPlayedCard(playerId: string) {
		const state = configureStore.getState();
		if (!state.gameInfoCards.playersThatPlayedCards.some(x => x === playerId)) {
			setPlayersThatPlayedCards([...state.gameInfoCards.playersThatPlayedCards, playerId]);
		}
	}

	function removePlayerThatPlayedCard(playerId: string) {
		const state = configureStore.getState();
		if (state.gameInfoCards.playersThatPlayedCards.some(x => x === playerId)) {
			setPlayersThatPlayedCards(state.gameInfoCards.playersThatPlayedCards.filter(x => x !== playerId));
		}
	}

	function removeCurrentPlayerCard(playerIdParam: string) {
		setState(prevState => {
			return {...prevState, cards: [...prevState.cards.filter(c => c.playerId !== playerIdParam)]};
		});
	}

	async function insertNewCard(selectedCard: ICardSelectedEvent): Promise<void> {
		const newCard: IPlayedCard = await buildCardWithUserDetails(selectedCard);

		setState(prevState => {
			const card = prevState.cards.find(c => c.playerId === selectedCard.playerId);
			if (card) {
				if (selectedCard.content) {
					return updateSelectedCard(selectedCard, prevState);
				}
				return prevState;
			}

			if (selectedCard.playerId === playerId) {
				prevState.cards.unshift(newCard);
				return {...prevState, cards: [...prevState.cards]};
			}

			return {...prevState, cards: [...prevState.cards, newCard]};
		});
	}

	function updateSelectedCard(selectedCard: ICardSelectedEvent, prevState: State) {
		const card = prevState.cards.find(c => c.playerId === selectedCard.playerId);
		const index = prevState.cards.indexOf(card!);
		prevState.cards[index] = {
			...card!,
			content: selectedCard.content,
			color: selectedCard.color
		};
		return {
			...prevState,
			cards: [...prevState.cards]
		};
	}

	async function addPlayersCards(cards: IPlayedCard[]) {
		const newCards = await Promise.all(cards.map(async card => await buildCardWithUserDetails(card)));

		setState(prevState => ({...prevState, cards: [...newCards]}));
	}

	async function buildCardWithUserDetails(card: IPlayedCard | ICardDeselectedEvent): Promise<IPlayedCard> {
		let avatarSrc = sessionStorage.getItem(`${card.playerId}_avatar`)!;
		let playerDisplayName = sessionStorage.getItem(`${card.playerId}_displayName`)!;

		if (!avatarSrc || !playerDisplayName) {
			await getPlayerData(card.playerId);
		}

		avatarSrc = sessionStorage.getItem(`${card.playerId}_avatar`)!;
		playerDisplayName = sessionStorage.getItem(`${card.playerId}_displayName`)!;

		return {
			...card,
			isAway: false,
			userName: playerDisplayName,
			avatarBase64: avatarSrc
		};
	}

	return (
		<PerfectScrollbar className="played-cards-wrapper" ref={ref => setScrollBarRef(ref)}>
			{state.cards.map(card => (
				<PlayedCard
					key={card.playerId}
					isAway={card.isAway}
					avatarBase64={card.avatarBase64}
					userName={card.userName}
					content={card.content}
					color={card.color}
					playerId={card.playerId}
				/>
			))}
		</PerfectScrollbar>
	);
};

export default PlayedCards;
