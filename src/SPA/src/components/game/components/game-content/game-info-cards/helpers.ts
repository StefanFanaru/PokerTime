export function getTimePlaying(startedAt: Date, endDate: Date | null | undefined, roundId: string) {
  if (!roundId) {
    return '00:00:00';
  }
  endDate ??= new Date();
  const seconds = getDifferenceInSeconds(startedAt, endDate);
  const hours = Math.floor(seconds / 60 / 60);
  const remainingMinutes = Math.floor((seconds - hours * 60 * 60) / 60);
  const remainingSeconds = Math.floor(seconds - remainingMinutes * 60 - hours * 60 * 60);
  return `${padWithZero(hours)}:${padWithZero(remainingMinutes)}:${padWithZero(remainingSeconds)}`;
}

function padWithZero(number: number) {
  return number < 10 ? `0${number}` : number;
}

function getDifferenceInSeconds(date1: Date, date2: Date) {
  // @ts-ignore
  const diffInMs = Math.abs(date2 - date1);
  return diffInMs / 1000;
}
