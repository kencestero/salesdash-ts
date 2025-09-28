useEffect(() => {
  if (image) {
    const gutteredSvg = `
      <svg xmlns='http://www.w3.org/2000/svg' width='${gutter + 100}' height='${gutter + 100}' viewBox='0 0 ${gutter + 100} ${gutter + 100}'>
        <rect x='0' y='0' width='${gutter + 100}' height='${gutter + 100}' fill='transparent' />
        <image href='${image}' x='${gutter / 2}' y='${gutter / 2}' width='100' height='100' />
      </svg>
    `;
    const convertedSvg = encodeURIComponent(gutteredSvg)
      .replace(/'/g, "%27")
      .replace(/"/g, "%22");

    setBackgroundImage(`url("data:image/svg+xml,${convertedSvg}")`);
  } else {
    const svg = generateSvg({
      text,
      textColor,
      textSize,
      fontFamily,
      opacity,
      gutter,
      rotate,
      multiline,
      lineHeight,
    });
    const convertedSvg = encodeURIComponent(svg)
      .replace(/'/g, "%27")
      .replace(/"/g, "%22");

    setBackgroundImage(`url("data:image/svg+xml,${convertedSvg}")`);
  }
}, [
  image,
  text,
  textColor,
  textSize,
  fontFamily,
  opacity,
  gutter,
  rotate,
  multiline,
  lineHeight,
]);
