export const random = (min, max) =>
  min + Math.round(Math.random() * (max - min));
export const wait = (timeout) =>
  new Promise((resolve) => setTimeout(resolve, timeout));
