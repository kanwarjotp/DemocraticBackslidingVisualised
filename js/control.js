export function initControls({ onYearChange, sliderSelector, labelSelector, playBtnSelector }) {
  const slider    = document.querySelector(sliderSelector);
  const yearLabel = document.querySelector(labelSelector);
  const playBtn = document.querySelector(playBtnSelector);

  let playInterval = null;

  // when the thumb moves
  slider.addEventListener("input", () => {
    const year = +slider.value;
    yearLabel.textContent = year;
    onYearChange(year);
  });

  // play pause animation
  const stepDelay = 1000;
  slider.max = +slider.max; slider.min = +slider.min; // ensure numbers


  playBtn.addEventListener("click", () => {
      if (!playInterval) {
        console.log(this)
        // reset if at end
        if (slider.value >= slider.max) { slider.value = slider.min; slider.dispatchEvent(new Event("input")); }
        playBtn.textContent = "⏸️";
        playInterval = setInterval(() => {
          let y = +slider.value < slider.max ? +slider.value + 1 : slider.max;
          slider.value = y;
          slider.dispatchEvent(new Event("input"));
          if (y === slider.min) clearInterval(playInterval), playInterval = null, playBtn.textContent = "▶️";
          if (y === slider.max) clearInterval(playInterval), playInterval = null, playBtn.textContent = "▶️";
        }, stepDelay);
      } else {
        clearInterval(playInterval);
        playInterval = null;
        playBtn.textContent = "▶️";
      }
    });
}
