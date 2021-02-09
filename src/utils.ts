export const random = (min: number, max: number) =>
  min + Math.round(Math.random() * (max - min));
export const wait = (timeout: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, timeout));
