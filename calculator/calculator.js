const display = document.getElementById("display");
let isSecondMode = false;
let isRadianMode = false;
let ansValue = "0"; 
const operators = ["+", "-", "*", "/", "^", "x²", "√", "%", "x⁻¹", "!x"];
let isResultDisplayed = false;

function toggle2nd() {
    isSecondMode = !isSecondMode;
    const btn = document.getElementById("btn-2nd");

    document.getElementById("sin-btn").innerText = isSecondMode ? "sin⁻¹" : "sin";
    document.getElementById("cos-btn").innerText = isSecondMode ? "cos⁻¹" : "cos";
    document.getElementById("tan-btn").innerText = isSecondMode ? "tan⁻¹" : "tan";
    document.getElementById("ln-btn").innerHTML = isSecondMode ? "eˣ" : "ln";
    document.getElementById("log-btn").innerHTML = isSecondMode ? "10ˣ" : "log";
}

function toggleRAD() {
    isRadianMode = !isRadianMode;
    document.getElementById("btn-Radians").innerText = isRadianMode ? "RAD" : "DEG";
}

function handleTrig(func) {
    if (isSecondMode) {
        if (func === 'ln') appendToDisplay('e^');
        else if (func === 'log') appendToDisplay('10^');
        else if (func === 'sin') appendToDisplay('sin⁻¹');
        else if (func === 'cos') appendToDisplay('cos⁻¹');
        else if (func === 'tan') appendToDisplay('tan⁻¹');
    } else {
        appendToDisplay(func);
    }
}

function radToDeg(rad) {
    return rad * (180 / Math.PI);
}

function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

function appendToDisplay(input) {
   
   
    if (display.value.includes("Error")) {
        display.value = "";
    }


if (isResultDisplayed) {
        if (operators.includes(input) ) {
            
            display.value = "PREV";
        }else{
            display.value = "";
        }
        isResultDisplayed = false; 
    }
    display.value += input;
    display.scrollLeft = display.scrollWidth;
}

function clearDisplay() {
    display.value = "";
    isResultDisplayed = true;
}

function useAns() {
    appendToDisplay('PREV');
}

function calculate() {
    try {
        let val = display.value;
        
        val = val.split('PREV').join(ansValue);
        val = val.split('sin⁻¹').join('asin');
        val = val.split('cos⁻¹').join('acos');
        val = val.split('tan⁻¹').join('atan');
        val = val.split('e^').join('exp');
        val = val.split('10^').join('tenpow');
        
        val = val.replace(/\^/g, '**');

        // 2. Handle THE CONSTANTS 
        val = val.replace(/π/g, Math.PI);
        
        // 3. THE MATH ENGINE
        val = val.replace(/(asin|acos|atan|sin|cos|tan|log|ln|exp|tenpow)\(?([\d.-]+)\)?/gi, (match, func, num) => {
            const n = parseFloat(num);
            const f = func.toLowerCase();
            
            if (f === 'sin') return isRadianMode ? Math.sin(n) : Math.sin(degToRad(n));
            if (f === 'cos') return isRadianMode ? Math.cos(n) : Math.cos(degToRad(n));
            if (f === 'tan') return isRadianMode ? Math.tan(n) : Math.tan(degToRad(n));
            
            if (f === 'asin') {
                if (n < -1 || n > 1) return "NaN"; 
                return isRadianMode ? Math.asin(n) : radToDeg(Math.asin(n));
            }
            if (f === 'acos') {
                if (n < -1 || n > 1) return "NaN"; 
                return isRadianMode ? Math.acos(n) : radToDeg(Math.acos(n));
            }
            if (f === 'atan') return isRadianMode ? Math.atan(n) : radToDeg(Math.atan(n));

            if (f === 'log') return Math.log10(n);
            if (f === 'ln')  return Math.log(n);
            if (f === 'exp') return Math.pow(Math.E, n);
            if (f === 'tenpow') return Math.pow(10, n);
            
            return match;
        });

       
        val = val.replace(/\be\b/g, Math.E);

        // 5. Handle Factorials
        val = val.replace(/(\d+)!/g, (m, n) => factorial(parseInt(n)));

        // 6. FINAL EVALUATION
        let result = eval(val);
        
        if (result === "NaN" || isNaN(result)) {
            display.value = "Error"; 
        } else if (!isFinite(result)) {
            display.value = "Error: Divide by 0";
        } else {
            let finalResult = Number(result.toFixed(8)).toString();
            display.value = finalResult;
            ansValue = finalResult; 
            isResultDisplayed = true;
        }
       


    } catch (error) {
        display.value = "Error";
    }
}

function power(exponent) {
    try {
        let val = (display.value || ansValue).replace(/π/g, Math.PI).replace(/e/g, Math.E);
        let res = Math.pow(eval(val), exponent);
        let finalResult = Number(res.toFixed(8)).toString();
        display.value = finalResult;
        ansValue = finalResult; 
    } catch(error) { 
        display.value = "Error"; 
    }
}

function squareRoot() {
    try {
        let val = (display.value || ansValue).replace(/π/g, Math.PI).replace(/e/g, Math.E);
        let res = Math.sqrt(eval(val));
        let finalResult = Number(res.toFixed(8)).toString();
        display.value = finalResult;
        ansValue = finalResult; 
    } catch(error) { 
        display.value = "Error";
     }
}

function factorial(n) {
    if (n < 0) return "Error";
    return (n <= 1) ? 1 : n * factorial(n - 1);
}

function instantFactorial() {
    try {
       let val = (display.value || ansValue).replace(/π/g, Math.PI).replace(/e/g, Math.E);
        let res = factorial(eval(val));
        display.value = res;
        ansValue = res.toString();
    } catch(error) 
    { display.value = "Error"; 
    }
}

function backspace() {
    if (display.value === "Error") {
        display.value = "";
    } else {
        display.value = display.value.slice(0, -1);
        ansValue = display.value;
    }
}

function reciprocal() {
    try {
        let val = (display.value || ansValue).replace(/π/g, Math.PI).replace(/e/g, Math.E);
        let res = 1 / eval(val);
        let finalResult = Number(res.toFixed(8)).toString();
        display.value = finalResult;
        ansValue = finalResult;
    } catch(error) { 
        display.value = "Error"; 
    }   
}

function Signchanger() {
    try {
        let val = display.value.replace(/π/g, Math.PI).replace(/e/g, Math.E);
        let res = -1 * eval(val);
        let finalResult = Number(res.toFixed(8)).toString();
        display.value = finalResult;
        ansValue = finalResult; 
      } catch(error) { 
        display.value = "Error"; 
      }
    }