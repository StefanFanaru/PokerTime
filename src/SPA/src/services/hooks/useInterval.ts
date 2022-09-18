import { useEffect, useRef } from 'react';

export function useInterval(callback: () => void, delay: number): void {
	const savedCallback = useRef<() => void>();

	useEffect(() => {
		savedCallback.current = callback;
	});

	useEffect(() => {
		function tick(): void {
			if (savedCallback?.current) {
				savedCallback?.current();
			}
		}

		if (delay > 0) {
			const id = setInterval(tick, delay);
			return () => clearInterval(id);
		}

		return;
	}, [delay]);
}
