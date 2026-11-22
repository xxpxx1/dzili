function el(tag, className = "", text = "") {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text) n.textContent = text;
  return n;
}

function factorial(n) {
  if (!Number.isFinite(n) || n < 0 || Math.floor(n) !== n || n > 170) return NaN;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

export function evalSafeMath(rawExpr, degMode = true) {
  const src = String(rawExpr || "").trim();
  if (!src) return "0";
  if (!/^[0-9+\-*/^().%!eEπa-zA-Z\s]+$/.test(src)) return "Error";

  let expr = src
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-")
    .replace(/\^/g, "**")
    .replace(/π/g, `(${Math.PI})`)
    .replace(/\be\b/g, `(${Math.E})`);

  expr = expr.replace(/(\d+(?:\.\d+)?)\s*!/g, (_, num) => String(factorial(Number(num))));
  expr = expr.replace(/√\(/g, "sqrt(").replace(/\|([^|]+)\|/g, "abs($1)");

  if (!/^[0-9+\-*/().*\s,a-zA-Z]+$/.test(expr)) return "Error";
  if (/[;=#[\]{}\\]/.test(expr)) return "Error";

  const tokens = expr.match(/[a-zA-Z_]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?|\*\*|[+\-*/(),%]/gi);
  if (!tokens) return "Error";

  const toAngle = (x) => (degMode ? (x * Math.PI) / 180 : x);
  const fnMap = {
    sin: (x) => Math.sin(toAngle(x)),
    cos: (x) => Math.cos(toAngle(x)),
    tan: (x) => {
      const a = toAngle(x);
      if (Math.abs(Math.cos(a)) < 1e-12) return NaN;
      return Math.tan(a);
    },
    ln: (x) => (x > 0 ? Math.log(x) : NaN),
    log: (x) => (x > 0 ? Math.log10(x) : NaN),
    sqrt: (x) => (x >= 0 ? Math.sqrt(x) : NaN),
    abs: (x) => Math.abs(x)
  };

  const prec = { "+": 1, "-": 1, "*": 2, "/": 2, "%": 2, "**": 3 };
  const rightAssoc = { "**": true };
  const output = [];
  const ops = [];
  let prevToken = null;

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (/^\d/.test(t)) {
      output.push({ type: "num", val: Number(t) });
      prevToken = "num";
    } else if (/^[a-zA-Z]+$/.test(t)) {
      const lower = t.toLowerCase();
      if (!fnMap[lower]) return "Error";
      ops.push({ type: "fn", val: lower });
      prevToken = "fn";
    } else if (t === "(") {
      ops.push({ type: "lparen", val: "(" });
      prevToken = "(";
    } else if (t === ")") {
      while (ops.length && ops[ops.length - 1].type !== "lparen") {
        output.push(ops.pop());
      }
      if (!ops.length) return "Error";
      ops.pop();
      if (ops.length && ops[ops.length - 1].type === "fn") {
        output.push(ops.pop());
      }
      prevToken = "rparen";
    } else if (["+", "-", "*", "/", "%", "**"].includes(t)) {
      const isUnary =
        (t === "-" || t === "+") &&
        (prevToken === null || prevToken === "op" || prevToken === "(" || prevToken === "fn");
      if (isUnary) {
        output.push({ type: "num", val: 0 });
      }
      while (ops.length) {
        const top = ops[ops.length - 1];
        if (top.type === "fn") {
          output.push(ops.pop());
        } else if (top.type === "op") {
          const p1 = prec[t];
          const p2 = prec[top.val];
          if (p2 > p1 || (p1 === p2 && !rightAssoc[t])) {
            output.push(ops.pop());
          } else break;
        } else break;
      }
      ops.push({ type: "op", val: t });
      prevToken = "op";
    } else {
      return "Error";
    }
  }

  while (ops.length) {
    const top = ops.pop();
    if (top.type === "lparen") return "Error";
    output.push(top);
  }

  const stack = [];
  for (const item of output) {
    if (item.type === "num") {
      stack.push(item.val);
    } else if (item.type === "fn") {
      if (!stack.length) return "Error";
      const a = stack.pop();
      const res = fnMap[item.val](a);
      if (!Number.isFinite(res)) return "Error";
      stack.push(res);
    } else if (item.type === "op") {
      if (stack.length < 2) return "Error";
      const b = stack.pop();
      const a = stack.pop();
      let res = NaN;
      if (item.val === "+") res = a + b;
      else if (item.val === "-") res = a - b;
      else if (item.val === "*") res = a * b;
      else if (item.val === "/") res = b !== 0 ? a / b : NaN;
      else if (item.val === "%") res = a % b;
      else if (item.val === "**") res = a ** b;
      if (!Number.isFinite(res)) return "Error";
      stack.push(res);
    }
  }

  if (stack.length !== 1) return "Error";
  const out = stack[0];
  const rounded = Math.abs(out) < 1e-12 ? 0 : Number(out.toPrecision(12));
  return String(rounded);
}

export function createScientificCalculatorModal() {
  let degMode = true;
  let expr = "";
  let resultText = "0";

  const backdrop = el("div", "dzili-calc-backdrop");
  backdrop.hidden = true;

  const sheet = el("div", "dzili-calc-sheet");
  const head = el("div", "dzili-calc-head");
  const title = el("h3", "", "Kalkulator Ilmiah");

  const rightHead = el("div", "dzili-calc-head-actions");
  const modeBtn = el("button", "dzili-calc-deg", "DEG");
  modeBtn.type = "button";
  const closeBtn = el("button", "dzili-calc-close", "✕");
  closeBtn.type = "button";
  rightHead.append(modeBtn, closeBtn);
  head.append(title, rightHead);

  const screen = el("div", "dzili-calc-screen");
  const exprLine = el("div", "dzili-calc-expr", "0");
  const resLine = el("div", "dzili-calc-res", "0");
  screen.append(exprLine, resLine);

  function syncScreen() {
    exprLine.textContent = expr || "0";
    resLine.textContent = resultText;
  }

  modeBtn.addEventListener("click", () => {
    degMode = !degMode;
    modeBtn.textContent = degMode ? "DEG" : "RAD";
  });

  function close() {
    backdrop.hidden = true;
  }
  function open() {
    backdrop.hidden = false;
    syncScreen();
  }

  closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) close();
  });

  const keys = [
    ["sin", "sin("], ["cos", "cos("], ["tan", "tan("], ["ln", "ln("], ["log", "log("],
    ["√", "√("], ["x^y", "^"], ["π", "π"], ["e", "e"], ["n!", "!"],
    ["(", "("], [")", ")"], ["⌫", "BACK"], ["AC", "AC"], ["÷", "/"],
    ["7", "7"], ["8", "8"], ["9", "9"], ["×", "*"], ["|x|", "|x|"],
    ["4", "4"], ["5", "5"], ["6", "6"], ["−", "-"], ["Salin", "COPY"],
    ["1", "1"], ["2", "2"], ["3", "3"], ["+", "+"], ["=", "EQ"],
    ["0", "0"], [".", "."], ["%", "%"]
  ];

  const grid = el("div", "dzili-calc-grid");
  keys.forEach(([label, act]) => {
    const btn = el("button", "dzili-calc-key", label);
    btn.type = "button";
    if (act === "EQ") btn.classList.add("is-eq");
    else if (act === "AC" || act === "BACK") btn.classList.add("is-danger");
    else if (["/", "*", "-", "+", "%", "^", "COPY"].includes(act)) btn.classList.add("is-op");
    if (act === "EQ") btn.style.gridRow = "span 2";

    btn.addEventListener("click", () => {
      if (act === "AC") {
        expr = "";
        resultText = "0";
      } else if (act === "BACK") {
        expr = expr.slice(0, -1);
      } else if (act === "EQ") {
        const out = evalSafeMath(expr, degMode);
        resultText = out;
        if (out !== "Error") expr = out;
      } else if (act === "COPY") {
        const val = resultText !== "0" ? resultText : expr;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(val).catch(() => {});
        }
        btn.textContent = "Tersalin";
        setTimeout(() => { btn.textContent = "Salin"; }, 900);
      } else {
        expr += act;
      }
      syncScreen();
    });

    grid.appendChild(btn);
  });

  sheet.append(head, screen, grid);
  backdrop.appendChild(sheet);
  document.body.appendChild(backdrop);

  return { open, close };
}
