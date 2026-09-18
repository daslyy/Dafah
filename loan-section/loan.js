const slider = document.getElementById("slider");
const amountText = document.getElementById("amount");
const results = document.getElementById("results");

const APR = 22.9 / 100;

// years list
const terms = [1,2,3,4,5,6,7];

function calculate() {
  let amount = parseInt(slider.value);
  amountText.innerText = formatMoney(amount);

  results.innerHTML = "";

  terms.forEach(year => {
    let months = year * 12;

    // monthly payment formula
    let monthlyRate = APR / 12;

    let monthly =
      (amount * monthlyRate) /
      (1 - Math.pow(1 + monthlyRate, -months));

    let row = `
      <div class="row">
        <span>${year} year</span>
        <span>22.9%</span>
        <span>₦${formatMoney(monthly.toFixed(2))}</span>
      </div>
    `;

    results.innerHTML += row;
  });
}
function formatMoney(num) {
  return Number(num).toLocaleString('en-NG');
}

function updateSliderBackground() {
  const min = slider.min;
  const max = slider.max;
  const val = slider.value;

  const percent = ((val - min) / (max - min)) * 100;

  slider.style.background =
    `linear-gradient(to right, #16a34a ${percent}%, #ddd ${percent}%)`;
}



// slider move

slider.addEventListener("input", () => {
  calculate();
  updateSliderBackground();
});
// slider.addEventListener("input", calculate);

// + button
document.getElementById("plus").onclick = () => {
  slider.value = Math.min(parseInt(slider.value) + 100, parseInt(slider.max));
  calculate();
  updateSliderBackground();
};

// − button
document.getElementById("minus").onclick = () => {
  slider.value = Math.max(parseInt(slider.value) - 100, parseInt(slider.min));
  calculate();
  updateSliderBackground();
};

// initial run
calculate();
updateSliderBackground();
