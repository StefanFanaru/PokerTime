import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import './image-viewer.scss';
import { ConditionalChildren } from 'azure-devops-ui/ConditionalChildren';
import { Button } from 'azure-devops-ui/Button';
import FullScreenService from '../../../services/fullScreenService';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actionCreators as generalActionCreators } from '../../../store/General';

interface IProps {
	imageSrc: string;
	onClose: () => void;
}

interface State {
	scale: number;
	panning: boolean;
	pointX: number;
	pointY: number;
	start: { x: number; y: number };
	zoom: HTMLElement | null;
	shouldExitFullScreen: boolean;
}

const ImageViewer = (props: IProps): JSX.Element => {
	const [state, setState] = useState<State>({
		scale: 1,
		panning: false,
		pointX: 0,
		pointY: 0,
		start: { x: 0, y: 0 },
		zoom: null,
		shouldExitFullScreen: false
	});
	const firstUpdate = useRef(true);
	const dispatch = useDispatch();
	const { setIsViewingImage } = bindActionCreators(generalActionCreators, dispatch);

	useEffect(() => {
		if (!firstUpdate.current) {
			return;
		}

		setIsViewingImage(true);
		if (!FullScreenService.isFullScreen) {
			FullScreenService.set(true);
			setState(prevState => ({ ...prevState, shouldExitFullScreen: true }));
		}

		const zoomElement = document.getElementById('zoom');
		if (zoomElement) {
			setState(prevState => ({ ...prevState, zoom: zoomElement! }));
		}

		firstUpdate.current = false;
	}, []);

	function createTransform(currentState: State): string {
		return 'translate(' + currentState.pointX + 'px, ' + currentState.pointY + 'px) scale(' + currentState.scale + ')';
	}

	function onMouseDown(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
		e.preventDefault();
		setState(prevState => {
			return {
				...prevState,
				panning: true,
				start: { x: e.clientX - prevState.pointX, y: e.clientY - prevState.pointY }
			};
		});
	}

	function onMouseUp(_: React.MouseEvent<HTMLDivElement, MouseEvent>) {
		setState(prevState => {
			return {
				...prevState,
				panning: false
			};
		});
	}

	function onMouseMove(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
		e.preventDefault();
		if (!state.panning) {
			return;
		}
		setState(prevState => {
			let newState = {
				...prevState,
				pointX: e.clientX - prevState.start.x,
				pointY: e.clientY - prevState.start.y
			};
			let currentElement = prevState.zoom;
			currentElement!.style.transform = createTransform(newState);
			newState.zoom = currentElement;

			return newState;
		});
	}

	function onWheel(e: React.WheelEvent<HTMLDivElement>) {
		// e.preventDefault();
		setState(prevState => {
			const xs = (e.clientX - prevState.pointX) / prevState.scale;
			const ys = (e.clientY - prevState.pointY) / prevState.scale;
			const delta = -e.deltaY;
			const scale = delta > 0 ? prevState.scale * 1.2 : prevState.scale / 1.2;

			let newState = {
				...prevState,
				pointX: e.clientX - xs * scale,
				pointY: e.clientY - ys * scale,
				scale: scale
			};

			let currentElement = prevState.zoom;
			currentElement!.style.transform = createTransform(newState);
			newState.zoom = currentElement;

			return newState;
		});
	}

	function onClose() {
		if (!state.shouldExitFullScreen) {
			props.onClose();
			return;
		}

		FullScreenService.set(false);
		props.onClose();

		setTimeout(() => {
			setIsViewingImage(false);
		}, 200);
	}

	return (
		<div className="image-viewer-wrapper">
			<div id="zoom" onMouseDown={onMouseDown} onMouseUp={onMouseUp} onMouseMove={onMouseMove} onWheel={onWheel}>
				<ConditionalChildren renderChildren={state.zoom != null}>
					<img src={props.imageSrc} alt=""/>
				</ConditionalChildren>
			</div>
			<ConditionalChildren renderChildren={state.zoom != null}>
				<Button
					className="close-button"
					iconProps={{ iconName: 'ChromeClose', className: 'close-icon' }}
					tooltipProps={{ text: 'Close the viewer' }}
					onClick={onClose}
				/>
			</ConditionalChildren>
		</div>
	);
};

export default ImageViewer;
