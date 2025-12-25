let currentIndex = 0;

// статистика
let mistakes = 0;
let totalQuestions = 0;
let correctAnswers = 0;
let pendingContinue = null;
let practiceAchievementUnlocked = false;
let quizAchievementUnlocked = false;

const content = document.getElementById("content");
const title = document.getElementById("lesson-title");

title.innerText = lessonData.title;

renderCurrentBlock();

// === ОСНОВНАЯ ФУНКЦИЯ ===
function renderCurrentBlock() {
  if (currentIndex >= lessonData.blocks.length) {
    showFinishScreen();
    return;
  }

  updateProgress();

  const block = lessonData.blocks[currentIndex];

  if (block.type === "theory") {
    renderTheory(block);
    currentIndex++;
    renderCurrentBlock(); // теория не блокирует, сразу идём к следующему блоку

  } else if (block.type === "checkpoint") {
    renderCheckpoint(block);

  } else if (block.type === "practice") {
    renderPractice(block); // практика блокирует, не вызываем renderCurrentBlock сразу
  }
}

// === ТЕОРИЯ ===
function renderTheory(block) {
  const div = document.createElement("div");
  div.className = "theory";

  let html = `<p>${block.text}</p>`;

  if (block.image) {
    html += `<img src="${block.image}" alt="" class="theory-image">`;
  }

  div.innerHTML = html;
  content.appendChild(div);

  // пролистываем к новому блоку
  div.scrollIntoView({ behavior: "smooth" });
}

// === ЧЕКПОИНТЫ ===
function renderCheckpoint(block) {
  if (block.checkpointType === "button") {
    renderNextButton(block);
  }

  if (block.checkpointType === "quiz") {
    renderQuiz(block);
  }
}

// кнопка "Далее"
function renderNextButton(block) {
  const btn = document.createElement("button");
  btn.className = "next-btn";
  btn.innerText = block.buttonText || "Далее";

  btn.onclick = () => {
    btn.remove();
    currentIndex++;
    renderCurrentBlock();
  };

  content.appendChild(btn);
}

// === КВИЗ ===
function renderQuiz(block) {
  totalQuestions++;
  let attemptsLeft = block.attempts;

  const div = document.createElement("div");
  div.className = "quiz";

  div.innerHTML = `
    <p>${block.question}</p>
    ${block.options.map((opt, i) => `<button data-index="${i}">${opt}</button>`).join("")}
    <p class="attempts">Попыток осталось: ${attemptsLeft}</p>
  `;

  content.appendChild(div);

  div.scrollIntoView({ behavior: "smooth" });

  div.querySelectorAll("button").forEach(btn => {
    btn.onclick = () => {
      const chosen = Number(btn.dataset.index);

      // отключаем все кнопки
      div.querySelectorAll("button").forEach(b => b.disabled = true);

      // подсвечиваем правильный ответ
      div.querySelectorAll("button")[block.correctIndex].classList.add("correct");

      if (chosen === block.correctIndex) {
        correctAnswers++;
        btn.classList.add("correct");
      
        // переходим к следующему блоку
        currentIndex++;
        renderCurrentBlock();
      
        // проверяем ачивку через setTimeout, чтобы браузер успел отрисовать блок
        setTimeout(checkQuizAchievement, 50);
      } else {
        mistakes++;
        attemptsLeft--;
        btn.classList.add("wrong");

        div.querySelector(".attempts").innerText = `Попыток осталось: ${attemptsLeft}`;

        if (attemptsLeft > 0) {
          showHint(block.hint, attemptsLeft);
          div.querySelectorAll("button").forEach(b => b.disabled = false);
        } else {
          showHint(block.hint, attemptsLeft);
          pendingContinue = () => {
            currentIndex++;
            renderCurrentBlock();
          };
        }
      }
    };
  });
}

// === ПРАКТИКА ===
function renderPractice(block) {
  const container = document.createElement("div");
  container.className = "practice";

  let solvedCount = 0;
  const total = block.tasks.length;

  // прогресс бар в шапке
  const headerProgress = document.getElementById("practice-header-progress");
  const headerText = document.getElementById("practice-progress-text");
  headerProgress.classList.remove("hidden");
  headerText.innerText = `0 / ${total}`;

  container.innerHTML = `<h2>${block.title}</h2>`;

  block.tasks.forEach((task, index) => {
    const taskDiv = document.createElement("div");
    taskDiv.className = "practice-task";

    taskDiv.innerHTML = `
      <p>${index + 1}. ${task.question}</p>
      <input type="text">
      <span class="status"></span>
    `;

    const input = taskDiv.querySelector("input");
    const status = taskDiv.querySelector(".status");

    input.oninput = () => {
      const userAnswer = input.value.trim().toLowerCase();
      const correct = task.answer.trim().toLowerCase();

      if (userAnswer === correct && !input.disabled) {
        input.disabled = true;
        input.classList.add("correct");
        status.innerText = "✔";
        solvedCount++;

        headerText.innerText = `${solvedCount} / ${total}`;

        if (solvedCount === total) {
          showPracticeComplete(container);
        }
      }
    };

    container.appendChild(taskDiv);
  });

  content.appendChild(container);
  container.scrollIntoView({ behavior: "smooth" });
}

function showPracticeComplete(container) {
  document.getElementById("practice-header-progress").classList.add("hidden");

  const done = document.createElement("div");
  done.className = "practice-complete";

  done.innerHTML = `
    <p>Практика завершена 🎉</p>
    <button>Продолжить</button>
  `;

  done.querySelector("button").onclick = () => {
    currentIndex++;
    renderCurrentBlock();
    unlockPracticeAchievement();
  };

  container.appendChild(done);
}

// === ПРОГРЕСС ===
function updateProgress() {
  const percent = (currentIndex / lessonData.blocks.length) * 100;
  document.getElementById("progress-bar").style.width = percent + "%";
}

// === ПОДСКАЗКИ ===
function showHint(text, attemptsLeft) {
  const hintPopup = document.getElementById("hint-popup");
  hintPopup.classList.add("visible");
  document.getElementById("hint-text").innerText = text;
}

document.getElementById("close-hint").onclick = () => {
  const hintPopup = document.getElementById("hint-popup");
  hintPopup.classList.remove("visible");

  if (pendingContinue) {
    pendingContinue();
    pendingContinue = null;
  }
};

// === ФИНИШ ===
function showFinishScreen() {
  updateProgress();
  content.innerHTML += `<h2>Урок завершён 🎉</h2>`;
}

// === АЧИВКИ ===
function showAchievementPopup(title, text) {
  const popup = document.createElement("div");
  popup.className = "achievement-popup"; // CSS уже скрывает через display:none

  popup.innerHTML = `
    <div class="popup-content">
      <h3>${title}</h3>
      <p>${text}</p>
      <button>Отлично!</button>
    </div>
  `;

  document.body.appendChild(popup);

  // сразу делаем видимым через класс, чтобы CSS правил display
  requestAnimationFrame(() => {
    popup.style.display = "flex"; // чтобы flex сработал
  });

  popup.querySelector("button").onclick = () => popup.remove();
}

// проверка, остались ли квизы
function areQuizzesRemaining() {
  for (let i = currentIndex; i < lessonData.blocks.length; i++) {
    const b = lessonData.blocks[i];
    if (b.type === "checkpoint" && b.checkpointType === "quiz") return true;
  }
  return false;
}

// ачивка за квизы
function checkQuizAchievement() {
  if (quizAchievementUnlocked) return;
  if (areQuizzesRemaining()) return;
  if (totalQuestions === 0) return;

  let className = "";
  let title = "";
  let text = "";

  if (mistakes === 0) {
    className = "gold";
    title = "Золото 🥇";
    text = "Схватываешь на лету — ни одной ошибки в тестах";
  } else if (mistakes <= 2) {
    className = "silver";
    title = "Серебро 🥈";
    text = "Отличный результат — всего 1–2 ошибки в квизах";
  } else if (mistakes <= 4) {
    className = "bronze";
    title = "Бронза 🥉";
    text = "Хороший результат — теория усвоена";
  } else {
    return; // слишком много ошибок — без ачивки
  }

  quizAchievementUnlocked = true;

  const badge = document.getElementById("achievement-badge");
  badge.className = `achievement ${className}`;

  showAchievementPopup(title, text);
}

// ачивка за практику
function unlockPracticeAchievement() {
  if (practiceAchievementUnlocked) return;

  practiceAchievementUnlocked = true;

  const badge = document.getElementById("achievement-practice");
  badge.className = "achievement practice";

  showAchievementPopup("Ачивка получена!", "Решил все практические задания 🎯");
}
