function backspace() {
  let display = document.getElementById("display");
  display.value = display.value.slice(0, -1);
}


// TOGGLE BUTTTON OF RADIAN TO DEG
let degMode = "rad"; // Variable to store the current mode, initialized as radians

function toggleDeg() {
    const toggleBtn = document.getElementById("toggleBtn");
    if (degMode === "rad") {
        degMode = "deg"; // Switch to degrees mode
        toggleBtn.value = "DEG";
        toggleBtn.style.cssText = "";
      } else {
        degMode = "rad"; // Switch to radians mode
        toggleBtn.value = "RAD";
        toggleBtn.style.cssText = "color: aquamarine; ";
    }
}


// ONLY RADIAN VALUE
function calculate() {
  let display = document.getElementById("display");
  let expression = display.value;
  let result;

  try {
    // Replace trigonometric functions with arguments in radians
    expression = expression.replace(/sin\(/g, "sin(");
    expression = expression.replace(/cos\(/g, "cos(");
    expression = expression.replace(/tan\(/g, "tan(");
    expression = expression.replace(/asin\(/g, "asin(");
    expression = expression.replace(/acos\(/g, "acos(");
    expression = expression.replace(/atan\(/g, "atan(");

    result = math.evaluate(expression);
    display.value = result;
  } catch (error) {
    display.value = "Error";
  }
}


// Other functions remain the same

function squareRoot() {
  let display = document.getElementById("display");
  display.value += "sqrt(";
}

function base10Log() {
  let display = document.getElementById("display");
  display.value += "log(";
}

function pi() {
  let display = document.getElementById("display");
  display.value += "pi";
}

function e() {
  let display = document.getElementById("display");
  display.value += "e";
}

function power() {
  let display = document.getElementById("display");
  display.value += "^(";
}

// ========== TOGGLE OPTION BUTTON ===========

function toggleAccordion() {
  const accordionItem = document.querySelector(".accordion-item");
  const content = accordionItem.querySelector(".accordion-content");
  const icon = accordionItem.querySelector(".icon");

  accordionItem.classList.toggle("active");

  if (accordionItem.classList.contains("active")) {
    content.style.maxHeight = content.scrollHeight + "px";
    // icon.innerText = "-";
  } else {
    content.style.maxHeight = "0";
    // icon.innerText = "+";
  }
}

