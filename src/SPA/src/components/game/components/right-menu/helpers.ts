export function computeAveragePoints(cards: any[]): number | null {
  // @ts-ignore
  const numbers: number[] = cards
    .map(card => card.content)
    .filter(content => isNumeric(content))
    .map(content => parseFloat(content));
  const sum = numbers.reduce((a, b) => a + b, 0);
  return numbers.length ? sum / numbers.length || null : null;
}

function isNumeric(str: string | undefined) {
  // @ts-ignore
  return str && !isNaN(str) && !isNaN(parseFloat(str));
}
