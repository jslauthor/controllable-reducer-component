export const titleCase = str =>
  str.charAt(0).toUpperCase() +
  str
    .substr(1)
    .split()
    .map(s => s.toLowerCase())
    .join("");
export const getChangeHandler = str => `on${titleCase(str)}Change`;
export const getDefaultName = str => `default${titleCase(str)}`;
export const sentenceJoin = arr =>
  arr.reduce(
    (str, value, index) =>
      str +
      value +
      (index === arr.length - 2
        ? `, and `
        : index !== arr.length - 1 && arr.length !== 0
          ? `, `
          : ``),
    ""
  );
