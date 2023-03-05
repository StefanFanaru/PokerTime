import * as React from 'react';
import {useEffect, useState} from 'react';
import './settings-playing-cards.scss';
import useAxios from 'axios-hooks';
import {IPlayingCardResponse} from '../../../types/playing-card-response';
import {IPlayingCard} from '../../../types/card';
import PlayingCard from '../../game/components/game-content/playing-card/PlayingCard';
import {Button} from 'azure-devops-ui/Button';
import {Dialog} from 'azure-devops-ui/Dialog';
import {TextField} from 'azure-devops-ui/TextField';
import {TitleSize} from 'azure-devops-ui/Header';
import {FormItem} from 'azure-devops-ui/FormItem';
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd';

interface State {
	isDialogSaveDisabled?: boolean;
	isDragDisabled?: boolean;
	cardColor?: string;
	cardContent?: string;
	cards: IPlayingCard[];
	isDialogOpen?: boolean;
	selectedCardId?: string;
}

const SettingsPlayingCards = (): JSX.Element => {
	const [state, setState] = useState<State>({
		cards: []
	});

	const [{data: playingCardsResponse}, getCardList] = useAxios<IPlayingCardResponse[]>({
		url: '/api/cards/list'
	});

	const [{response: updateResponse}, postCardUpdate] = useAxios<{hasReceivedCardDeck: boolean}>(
		{
			method: 'PATCH',
			url: '/api/cards/update'
		},
		{manual: true}
	);

	const [{response: updateIndexesResponse}, postCardUpdateIndexes] = useAxios<{hasReceivedCardDeck: boolean}>(
		{
			method: 'PATCH',
			url: '/api/cards/update-indexes'
		},
		{manual: true}
	);

	const [{response: insertResponse}, postCardInsert] = useAxios<{hasReceivedCardDeck: boolean; cardId: string}>(
		{
			method: 'POST',
			url: '/api/cards'
		},
		{manual: true}
	);

	const [{response: deleteResponse}, postCardDelete] = useAxios<{hasReceivedCardDeck: boolean}>(
		{
			method: 'DELETE',
			url: '/api/cards'
		},
		{manual: true}
	);

	useEffect(() => {
		if (!playingCardsResponse?.length) {
			return;
		}

		const cards: IPlayingCard[] = playingCardsResponse.map(card => ({
			...card,
			isActive: false
		}));

		setState(prevState => ({...prevState, cards, isDragDisabled: false}));
	}, [playingCardsResponse]);

	function onCancel() {
		setState(prevState => ({...prevState, isDialogOpen: false, selectedCardId: undefined}));
	}

	function onCardClick(cardId: string) {
		setState(prevState => {
			const selectedCard = prevState.cards.find(card => card.id === cardId);
			return {
				...prevState,
				cardColor: selectedCard?.color,
				cardContent: selectedCard?.content,
				selectedCardId: cardId
			};
		});
		setState(prevState => ({...prevState, selectedCardId: cardId, isDialogOpen: true}));
	}

	function getCardIdsOrdered() {
		return state.cards.map(card => card.id);
	}

	async function onDeleteCard() {
		await postCardDelete({
			data: {
				playingCardId: state.selectedCardId,
				playingCardIdsOrdered: getCardIdsOrdered()
			}
		});
	}

	useEffect(() => {
		if (!deleteResponse || deleteResponse.status !== 200) {
			return;
		}

		if (deleteResponse.data.hasReceivedCardDeck) {
			getCardList();
		}

		setState(prevState => {
			const newCards = [...prevState.cards];
			const selectedCardIndex = newCards.findIndex(card => card.id === prevState.selectedCardId);
			newCards.splice(selectedCardIndex, 1);

			return {
				...prevState,
				cards: newCards,
				isDialogOpen: false,
				selectedCardId: undefined,
				cardColor: undefined,
				cardContent: undefined
			};
		});
	}, [deleteResponse]);

	async function insertCard() {
		await postCardInsert({
			data: {
				cardId: state.selectedCardId,
				content: state.cardContent,
				color: state.cardColor
			}
		});
	}

	useEffect(() => {
		if (!insertResponse || insertResponse.status !== 200) {
			return;
		}

		if (insertResponse.data.hasReceivedCardDeck) {
			getCardList();
		}

		setState(prevState => ({
			...prevState,
			isDialogOpen: false,
			selectedCardId: undefined,
			cardColor: undefined,
			cardContent: undefined,
			cards: [
				...prevState.cards,
				{
					id: insertResponse.data.cardId,
					color: prevState.cardColor!,
					content: prevState.cardContent!,
					isActive: false
				}
			]
		}));
	}, [insertResponse]);

	async function updateCard() {
		await postCardUpdate({
			data: {
				cardId: state.selectedCardId,
				content: state.cardContent,
				color: state.cardColor
			}
		});
	}

	useEffect(() => {
		if (!updateResponse || updateResponse.status !== 200) {
			return;
		}

		if (updateResponse.data.hasReceivedCardDeck) {
			getCardList();
		}

		setState(prevState => {
			const newCards = [...prevState.cards];
			const selectedCardIndex = newCards.findIndex(card => card.id === prevState.selectedCardId);
			newCards[selectedCardIndex] = {
				...newCards[selectedCardIndex],
				color: prevState.cardColor!,
				content: prevState.cardContent!
			};

			return {
				...prevState,
				cards: newCards,
				isDialogOpen: false,
				selectedCardId: undefined,
				cardColor: undefined,
				cardContent: undefined
			};
		});
	}, [updateResponse]);

	async function onSaveChanges() {
		if (state.selectedCardId) {
			await updateCard();
		} else {
			await insertCard();
		}
	}

	function onCardContentChanges(newValue: string) {
		if (newValue.length > 3) {
			return;
		}
		setState(prevState => {
			const cardWithSameContent = prevState.cards.some(card => card.content === newValue);
			console.log(cardWithSameContent);
			return {
				...prevState,
				cardContent: newValue,
				isDialogSaveDisabled: cardWithSameContent || !newValue
			};
		});
	}

	function onCardColorChange(value: string) {
		setState(prevState => ({...prevState, cardColor: value}));
	}

	function onDragComplete(result: any) {
		if (!result.destination) {
			return;
		}

		setState(prevState => {
			const newCards = [...prevState.cards];
			const removedCard = newCards.splice(result.source.index, 1)[0];
			newCards.splice(result.destination.index, 0, removedCard);

			postCardUpdateIndexes({
				data: {
					playingCardIdsOrdered: newCards.map(card => card.id)
				}
			});

			return {
				...prevState,
				cards: newCards,
				isDragDisabled: true
			};
		});
	}

	useEffect(() => {
		if (!updateIndexesResponse || updateIndexesResponse.status !== 200) {
			return;
		}

		if (updateIndexesResponse.data.hasReceivedCardDeck) {
			getCardList();
			return;
		}

		setState(prevState => ({...prevState, isDragDisabled: false}));
	}, [updateIndexesResponse]);

	function onAddNewCardClick() {
		setState(prevState => ({
			...prevState,
			isDialogOpen: true,
			selectedCardId: undefined,
			cardColor: '#000000',
			cardContent: undefined
		}));
	}

	return (
		<div className="settings-playing-cards-wrapper">
			<span>Click on a card to edit it. Drag and drop the cards to change their order.</span>
			{/* eslint-disable-next-line @typescript-eslint/no-empty-function */}
			<DragDropContext onDragEnd={onDragComplete}>
				<Droppable droppableId="drag-drop-list" direction="horizontal">
					{provided => (
						<div className="drag-drop-list-container" {...provided.droppableProps} ref={provided.innerRef}>
							{state.cards.map((card, index) => (
								<Draggable key={card.id} draggableId={card.id} index={index} isDragDisabled={state.isDragDisabled}>
									{provided => (
										<div className="item-card" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
											<PlayingCard onClick={onCardClick} card={card} />
										</div>
									)}
								</Draggable>
							))}
							{provided.placeholder}
						</div>
					)}
				</Droppable>
			</DragDropContext>

			<Button text="Add a new card" className="add-card-button" onClick={onAddNewCardClick} iconProps={{iconName: 'Add'}} />

			{state.isDialogOpen && (
				<Dialog
					titleProps={{text: 'Edit card', size: TitleSize.Large}}
					footerButtonProps={[
						{
							text: 'Cancel',
							onClick: onCancel
						},
						{
							text: 'Delete card',
							danger: true,
							style: {display: state.selectedCardId ? 'block' : 'none'},
							onClick: onDeleteCard
						},
						{
							text: 'Save Changes',
							disabled: state.isDialogSaveDisabled,
							onClick: onSaveChanges,
							primary: true
						}
					]}
					onDismiss={onCancel}>
					<div className="dialog-content">
						<div className="inputs">
							<div className="panel-group">
								<FormItem message="This field is required" error={state.cardContent == ''}>
									<label>Card content</label>
									<TextField
										className="input-element"
										value={state.cardContent}
										onChange={(_, newValue) => onCardContentChanges(newValue)}
										placeholder="Content"
										required={true}
									/>
								</FormItem>
							</div>
							<div className="panel-group">
								<label>Card color</label>
								<input
									className="card-color"
									type="color"
									id="head"
									name="head"
									value={state.cardColor}
									onChange={e => onCardColorChange(e.target.value)}
								/>
							</div>
						</div>
						<div className="preview">
							<PlayingCard
								onClick={onCardClick}
								card={{
									content: state.cardContent ?? '?',
									color: state.cardColor!,
									id: 'x',
									isActive: false
								}}
							/>
						</div>
					</div>
				</Dialog>
			)}
		</div>
	);
};

export default SettingsPlayingCards;
