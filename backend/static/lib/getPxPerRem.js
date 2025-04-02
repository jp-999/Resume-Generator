export const getPxPerRem = () => {
  const bodyComputedStyle = getComputedStyle(
    document.querySelector("body")
  );
  return parseFloat(bodyComputedStyle["font-size"]) || 16;
};
