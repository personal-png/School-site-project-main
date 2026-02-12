// Данные игры
const gameData = {
    xp: 0,
    level: 1,
    rank: "Стажер",
    quests: {
        '1.1': { completed: false, xp: 10, unlocked: true },
        '1.2': { completed: false, xp: 15, unlocked: true },
        '2.1': { completed: false, xp: 15, unlocked: false },
        '2.2': { completed: false, xp: 10, unlocked: false },
        '3.1': { completed: false, xp: 20, unlocked: false },
        '3.2': { completed: false, xp: 20, unlocked: false },
        '4.1': { completed: false, xp: 20, unlocked: false }
    },
    level4UnlockedBySecretPhrase: false // Флаг для отслеживания разблокировки уровня 4 через секретную фразу
};

// Уровни и звания
const levels = [
    { level: 1, xpNeeded: 0, rank: "Стажер" },
    { level: 2, xpNeeded: 25, rank: "Сетевой детектив" },
    { level: 3, xpNeeded: 50, rank: "Файловый мастер" },
    { level: 4, xpNeeded: 80, rank: "Системный администратор" }
];

// Система достижений
const achievements = {
    firstQuest: { name: "Первый шаг", desc: "Выполните первый квест", unlocked: false },
    networkMaster: { name: "Сетевой мастер", desc: "Завершите все сетевые квесты", unlocked: false },
    fileMaster: { name: "Файловый мастер", desc: "Завершите все квесты по файловой системе", unlocked: false },
    allQuests: { name: "Великий сисадмин", desc: "Завершите все квесты", unlocked: false }
};

// Текущий открытый уровень
let currentLevel = 1;
// Флаг для отслеживания, было ли модальное окно завершения уровня закрыто пользователем
let levelCompletionModalDismissed = false;

// Инициализация игры
function initGame() {
    loadProgress();
    updateUI();
    updateAllQuestStatuses();
    updateMap();

    // Show start screen instead of going directly to theory
    showStartScreen();
}

// Show start screen
function showStartScreen() {
    const startModal = document.getElementById('start-screen-modal');
    if (startModal) {
        startModal.style.display = 'block';
    }
}

// Start game function
function startGame() {
    const startModal = document.getElementById('start-screen-modal');
    if (startModal) {
        startModal.style.display = 'none';
    }
    showSection('theory');
}

// Show settings (placeholder function)
function showSettings() {
    alert('Настройки будут добавлены в следующих версиях!');
}

// Навигация по разделам
function showSection(sectionName) {
    // Скрываем все разделы
    document.querySelectorAll('.game-section').forEach(section => {
        section.classList.remove('active');
    });

    // Убираем активность со всех кнопок навигации
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Показываем нужный раздел
    if (sectionName === 'theory') {
        document.getElementById('theory-section').classList.add('active');
        document.querySelector('.nav-btn[onclick="showSection(\'theory\')"]').classList.add('active');
    } else if (sectionName === 'map') {
        document.getElementById('map-section').classList.add('active');
        document.querySelector('.nav-btn[onclick="showSection(\'map\')"]').classList.add('active');
        updateMap();
    } else if (sectionName === 'quests') {
        document.getElementById('quests-section').classList.add('active');
    }
}

    // Показать конкретный уровень
function showLevel(levelNumber) {
    // Проверяем, доступен ли уровень
    const levelNode = document.querySelector(`.level-node[data-level="${levelNumber}"]`);

    // Проверяем, заблокирован ли уровень
    if (levelNode && levelNode.classList.contains('locked')) {
        return;
    }

    // Специальная проверка для уровня 4 - требуется секретная фраза
    if (levelNumber === 4 && !gameData.level4UnlockedBySecretPhrase) {
        alert('🔒 Уровень 4 заблокирован! Чтобы разблокировать его, завершите уровень 3 и введите секретную фразу.');
        return;
    }

    currentLevel = levelNumber;

    // Скрываем все уровни
    document.querySelectorAll('.quest-level').forEach(level => {
        level.classList.remove('active');
    });

    // Показываем выбранный уровень
    document.getElementById(`level-${levelNumber}`).classList.add('active');

    // Обновляем заголовок уровня
    const levelTitles = {
        1: "Уровень 1: Стажер",
        2: "Уровень 2: Сетевой детектив",
        3: "Уровень 3: Файловый мастер",
        4: "Уровень 4: Системный администратор"
    };
    document.getElementById('current-level-title').textContent = levelTitles[levelNumber];

    // Переходим к разделу квестов
    showSection('quests');
    updateLevelProgress();

    // Проверяем, завершен ли этот уровень, и показываем модальное окно завершения уровня
    // Это позволит пользователю вспомнить секретную фразу
    // Только если пользователь не закрывал модальное окно завершения уровня
    if (isLevelCompleted(levelNumber) && !levelCompletionModalDismissed) {
        // Для уровня 3 показываем специальное модальное окно с секретной фразой
        if (levelNumber === 3) {
            // Рассчитываем XP, который был получен за завершение уровня
            const levelQuests = Object.keys(gameData.quests)
                .filter(questId => questId.startsWith(levelNumber + '.') && gameData.quests[questId].completed);
            const xpGained = levelQuests.reduce((sum, questId) => sum + gameData.quests[questId].xp, 0);

            // Показываем модальное окно с секретной фразой
            showLevelCompletionModalWithSecretPhrase(levelNumber, xpGained);
        }
        // Для других уровней показываем обычное модальное окно завершения уровня
        else if (levelNumber < 4) {
            // Рассчитываем XP, который был получен за завершение уровня
            const levelQuests = Object.keys(gameData.quests)
                .filter(questId => questId.startsWith(levelNumber + '.') && gameData.quests[questId].completed);
            const xpGained = levelQuests.reduce((sum, questId) => sum + gameData.quests[questId].xp, 0);

            // Показываем модальное окно завершения уровня с анимацией
            showLevelCompletionModalWithAnimation(levelNumber, xpGained);
        }
    }
    // Сбрасываем флаг, если уровень не завершен или если пользователь вернулся на уровень
    if (!isLevelCompleted(levelNumber) || levelCompletionModalDismissed) {
        levelCompletionModalDismissed = false;
    }
}

// Обновление карты уровней
function updateMap() {
    // Обновляем статусы узлов на карте
    document.querySelectorAll('.level-node').forEach(node => {
        const level = parseInt(node.getAttribute('data-level'));

        // Сбрасываем классы
        node.classList.remove('active', 'completed', 'locked');

        if (level === 1) {
            // Уровень 1 всегда доступен
            node.classList.add('active');
            node.querySelector('.node-status').textContent = 'Доступно';
        } else {
            // Проверяем, доступен ли уровень
            const prevLevelCompleted = isLevelCompleted(level - 1);

            // Для уровня 4 также проверяем XP требование (80+ XP)
            if (level === 4) {
                if (gameData.xp >= 80 && prevLevelCompleted) {
                    node.classList.add('active');
                    node.querySelector('.node-status').textContent = 'Доступно';
                } else {
                    node.classList.add('locked');
                    node.querySelector('.node-status').textContent = 'Заблокировано';
                }
            } else {
                if (prevLevelCompleted) {
                    node.classList.add('active');
                    node.querySelector('.node-status').textContent = 'Доступно';
                } else {
                    node.classList.add('locked');
                    node.querySelector('.node-status').textContent = 'Заблокировано';
                }
            }
        }

        // Проверяем, завершен ли уровень
        if (isLevelCompleted(level)) {
            node.classList.remove('active', 'locked');
            node.classList.add('completed');
            node.querySelector('.node-status').textContent = 'Завершено';
        }

        // Обновляем прогресс на карте
        updateLevelProgressOnMap(level);
    });
}

// Проверка завершенности уровня
function isLevelCompleted(level) {
    const levelQuests = Object.keys(gameData.quests)
        .filter(questId => questId.startsWith(level + '.'));

    return levelQuests.every(questId => gameData.quests[questId].completed);
}

// Обновление прогресса уровня на карте
function updateLevelProgressOnMap(level) {
    const levelQuests = Object.keys(gameData.quests)
        .filter(questId => questId.startsWith(level + '.'));

    const completedQuests = levelQuests.filter(questId => gameData.quests[questId].completed);
    const totalXP = levelQuests.reduce((sum, questId) => sum + gameData.quests[questId].xp, 0);
    const earnedXP = completedQuests.reduce((sum, questId) => sum + gameData.quests[questId].xp, 0);

    const progress = (earnedXP / totalXP) * 100;

    // Обновляем прогресс-бар
    const progressBar = document.getElementById(`map-progress-${level}`);
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }

    // Обновляем текст XP
    const xpText = document.getElementById(`map-xp-${level}`);
    if (xpText) {
        xpText.textContent = `${earnedXP}/${totalXP} XP`;
    }
}

// Обновление прогресса текущего уровня
function updateLevelProgress() {
    const levelQuests = Object.keys(gameData.quests)
        .filter(questId => questId.startsWith(currentLevel + '.'));

    const completedQuests = levelQuests.filter(questId => gameData.quests[questId].completed);
    const totalXP = levelQuests.reduce((sum, questId) => sum + gameData.quests[questId].xp, 0);
    const earnedXP = completedQuests.reduce((sum, questId) => sum + gameData.quests[questId].xp, 0);

    const progress = totalXP > 0 ? (earnedXP / totalXP) * 100 : 0;

    // Обновляем прогресс-бар
    const progressBar = document.getElementById('level-progress-fill');
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }

    // Обновляем текст прогресса
    const progressText = document.getElementById('level-progress-text');
    if (progressText) {
        progressText.textContent = `${Math.round(progress)}%`;
    }
}

// Навигация по теории
function nextTheory(nextId) {
    const currentCard = document.querySelector('.theory-card.active');
    const nextCard = document.getElementById(`theory-${nextId}`);

    if (currentCard && nextCard) {
        currentCard.classList.remove('active');
        nextCard.classList.add('active');
    }
}

function prevTheory(prevId) {
    const currentCard = document.querySelector('.theory-card.active');
    const prevCard = document.getElementById(`theory-${prevId}`);

    if (currentCard && prevCard) {
        currentCard.classList.remove('active');
        prevCard.classList.add('active');
    }
}

// Обновление квеста
function updateQuest(questId, completed) {
    if (gameData.quests[questId] && gameData.quests[questId].unlocked) {
        gameData.quests[questId].completed = completed;

        // НЕ пересчитываем XP сразу - только при завершении уровня
        // calculateXP(); - удалено

        // Обновляем интерфейс
        updateQuestStatus(questId);
        updateUI();
        checkLevelUnlocks();
        checkAchievements();
        saveProgress();

        // Обновляем прогресс уровня
        updateLevelProgress();
        updateMap();

        // Проверяем, завершен ли текущий уровень после обновления квеста
        checkLevelCompletion();
    }
}

// Проверка завершения уровня и показ модального окна
function checkLevelCompletion() {
    // Проверяем, завершен ли текущий уровень
    if (isLevelCompleted(currentLevel)) {
        // Показываем модальное окно завершения уровня
        showLevelCompletionModal(currentLevel);
    }
}

// Модифицированная функция расчета XP для анимации
function calculateXPWithAnimation() {
    let totalXP = 0;

    // Считаем XP за квесты
    Object.values(gameData.quests).forEach(quest => {
        if (quest.completed && quest.unlocked) {
            totalXP += quest.xp;
        }
    });

    // Сохраняем текущий XP для анимации
    const currentXP = gameData.xp;
    const xpGained = totalXP - currentXP;

    // Если это завершение уровня, показываем анимацию
    if (isLevelCompleted(currentLevel) && xpGained > 0) {
        // Показываем модальное окно с анимацией
        showLevelCompletionModalWithAnimation(currentLevel, xpGained);
    } else {
        // Иначе обновляем XP как обычно
        gameData.xp = totalXP;
        updateLevel();
    }
}

// Расчет XP
function calculateXP() {
    let totalXP = 0;

    // Считаем XP за квесты
    Object.values(gameData.quests).forEach(quest => {
        if (quest.completed && quest.unlocked) {
            totalXP += quest.xp;
        }
    });

    gameData.xp = totalXP;
    updateLevel();
}

// Обновление уровня
function updateLevel() {
    let newLevel = 1;
    let newRank = "Стажер";

    // Находим текущий уровень на основе XP
    for (let i = levels.length - 1; i >= 0; i--) {
        if (gameData.xp >= levels[i].xpNeeded) {
            newLevel = levels[i].level;
            newRank = levels[i].rank;
            break;
        }
    }

    // Проверяем, изменился ли уровень
    if (newLevel !== gameData.level) {
        gameData.level = newLevel;
        gameData.rank = newRank;
    }
}

// Проверка разблокировки уровней
function checkLevelUnlocks() {
    // Уровень 2 разблокируется при 25 XP
    if (gameData.xp >= 25) {
        unlockQuests(['2.1', '2.2']);
    }

    // Уровень 3 разблокируется при 50 XP
    if (gameData.xp >= 50) {
        unlockQuests(['3.1', '3.2']);
    }

    // Уровень 4 разблокируется при 80 XP
    if (gameData.xp >= 80) {
        unlockQuests(['4.1']);
    }
}

// Разблокировка квестов
function unlockQuests(questIds) {
    questIds.forEach(questId => {
        if (gameData.quests[questId]) {
            gameData.quests[questId].unlocked = true;
            updateQuestStatus(questId);

            // Включаем чекбокс и поле ввода
            const questCard = document.querySelector(`[data-quest="${questId}"]`);
            const checkbox = questCard?.querySelector('input[type="checkbox"]');
            const textInput = questCard?.querySelector('input[type="text"]');

            if (checkbox) {
                checkbox.disabled = false;
            }
            if (textInput) {
                textInput.disabled = false;
            }
        }
    });
}

// Обновление статуса квеста
function updateQuestStatus(questId) {
    const statusElement = document.getElementById(`status-${questId}`);
    const quest = gameData.quests[questId];

    if (statusElement && quest) {
        if (!quest.unlocked) {
            statusElement.textContent = '🔒 Заблокировано';
            statusElement.className = 'status-locked';
        } else if (quest.completed) {
            statusElement.textContent = '🟢 Завершено';
            statusElement.className = 'status-completed';
        } else {
            statusElement.textContent = '🟡 Не начато';
            statusElement.className = 'status-in-progress';
        }
    }
}

// Обновление всех статусов квестов
function updateAllQuestStatuses() {
    Object.keys(gameData.quests).forEach(questId => {
        updateQuestStatus(questId);

        // Обновляем состояние чекбоксов и полей ввода
        const questCard = document.querySelector(`[data-quest="${questId}"]`);
        const checkbox = questCard?.querySelector('input[type="checkbox"]');
        const textInput = questCard?.querySelector('input[type="text"]');
        const quest = gameData.quests[questId];

        if (checkbox) {
            checkbox.checked = quest.completed;
            checkbox.disabled = !quest.unlocked;
        }
        if (textInput) {
            textInput.disabled = !quest.unlocked;
        }
    });
}

// Улучшенная валидация IP-адреса
function validateIP(questId, ip) {
    const ipRegex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const checkbox = document.querySelector(`[data-quest="${questId}"] input[type="checkbox"]`);

    if (ipRegex.test(ip) && gameData.quests[questId].unlocked) {
        checkbox.disabled = false;
        return true;
    } else {
        checkbox.disabled = true;
        return false;
    }
}

// Улучшенное копирование команды
function copyCommand(element) {
    const command = element.textContent;
    navigator.clipboard.writeText(command).then(() => {
        // Сохраняем оригинальные стили
        const originalBg = element.style.backgroundColor;
        const originalText = element.textContent;

        // Визуальный фидбек
        element.style.backgroundColor = '#48bb78';
        element.style.color = 'white';
        element.textContent = '✓ Скопировано!';

        setTimeout(() => {
            element.style.backgroundColor = originalBg;
            element.style.color = '';
            element.textContent = originalText;
        }, 1500);
    }).catch(err => {
        console.log('Ошибка копирования:', err);
        element.style.backgroundColor = '#e53e3e';
        element.textContent = '❌ Ошибка';
        setTimeout(() => {
            element.style.backgroundColor = '#edf2f7';
            element.textContent = command;
        }, 1500);
    });
}

// Функция для перехода на следующий уровень
function goToNextLevel() {
    // Проверяем, завершен ли текущий уровень
    if (isLevelCompleted(currentLevel)) {
        // Переходим на следующий уровень
        const nextLevel = currentLevel + 1;

        // Проверяем, существует ли следующий уровень
        if (nextLevel <= 4) {
            showLevel(nextLevel);
        } else {
        }
    } else {
    }
}

// Проверка и разблокировка достижений
function checkAchievements() {
    // Первый квест
    if (gameData.quests['1.1'].completed && !achievements.firstQuest.unlocked) {
        achievements.firstQuest.unlocked = true;
    }

    // Сетевой мастер
    const networkQuests = ['1.1', '1.2', '2.1', '2.2'];
    if (networkQuests.every(questId => gameData.quests[questId].completed) && !achievements.networkMaster.unlocked) {
        achievements.networkMaster.unlocked = true;
    }

    // Файловый мастер
    const fileQuests = ['3.1', '3.2'];
    if (fileQuests.every(questId => gameData.quests[questId].completed) && !achievements.fileMaster.unlocked) {
        achievements.fileMaster.unlocked = true;
    }

    // Все квесты
    const allQuestIds = Object.keys(gameData.quests);
    if (allQuestIds.every(questId => gameData.quests[questId].completed) && !achievements.allQuests.unlocked) {
        achievements.allQuests.unlocked = true;
    }
}

// Показ достижения
function showAchievement(text) {
    const modal = document.getElementById('achievement-modal');
    const title = document.getElementById('achievement-title');
    const achievementText = document.getElementById('achievement-text');

    achievementText.textContent = text;
    modal.style.display = 'block';
}

// Закрытие модального окна
function closeModal() {
    const modal = document.getElementById('achievement-modal');
    modal.style.display = 'none';
}

// Показ модального окна завершения уровня с анимацией
function showLevelCompletionModalWithAnimation(level, xpGained) {
    const modal = document.getElementById('level-completion-modal');
    const title = document.getElementById('level-completion-title');
    const message = document.getElementById('level-completion-message');
    const levelElement = document.getElementById('completion-level');
    const xpElement = document.getElementById('completion-xp');
    const rankElement = document.getElementById('completion-rank');
    const progressFill = document.getElementById('completion-progress-fill');
    const nextLevelBtn = document.getElementById('next-level-modal-btn');
    const returnToLevelBtn = document.getElementById('return-to-level-btn');

    // Устанавливаем данные в модальное окно
    title.textContent = `🎉 Уровень ${level} завершен!`;

    // Добавляем поздравительные фразы с выделенными словами
    const congratulatoryMessages = {
        1: 'Ты впервые увидел как <span class="golden-word">работает</span> консоль!',
        2: 'Теперь ты узнал что ты <span class="golden-word">не</span> одинок в интернете!',
        3: 'Не <span class="golden-word">трогай</span> Justin Bieber Lunix. Оно тебе не надо.'
    };

    // Устанавливаем поздравительное сообщение для текущего уровня
    if (congratulatoryMessages[level]) {
        message.innerHTML = congratulatoryMessages[level];
    } else {
        message.textContent = `Поздравляем! Вы успешно выполнили все задания уровня ${level}.`;
    }

    // Сохраняем текущий XP до анимации
    const currentXP = gameData.xp;

    // Показываем текущий уровень и XP (до анимации)
    levelElement.textContent = gameData.level;
    xpElement.textContent = currentXP;
    rankElement.textContent = gameData.rank;

    // Сбрасываем прогресс-бар до начала анимации
    progressFill.style.width = '0%';
    progressFill.style.transition = 'none';

    // Всегда показываем кнопку "Вернуться на уровень"
    returnToLevelBtn.style.display = 'block';

    // Показываем кнопку "Перейти на следующий уровень" если есть следующий уровень
    if (level < 4) {
        nextLevelBtn.textContent = `🎮 Перейти на уровень ${level + 1}`;
        nextLevelBtn.style.display = 'block';
        // Убираем обработчик для уровня 1, 2 и 3
        nextLevelBtn.onclick = goToNextLevelFromModal;
    } else {
        nextLevelBtn.textContent = `Завершить игру`;
        nextLevelBtn.style.display = 'block';
    }

    // Создаем список выполненных заданий для текущего уровня
    createCompletedTasksList(level);

    // Запускаем анимацию получения опыта
    animateXPGainWithTaskFlying(level, xpGained, currentXP);

    // Добавляем задержку 3 секунды перед показом модального окна
    setTimeout(() => {
        modal.style.display = 'block';
    }, 3000);
}

// Показ модального окна завершения уровня (оригинальная функция)
function showLevelCompletionModal(level) {
    const modal = document.getElementById('level-completion-modal');
    const title = document.getElementById('level-completion-title');
    const message = document.getElementById('level-completion-message');
    const levelElement = document.getElementById('completion-level');
    const xpElement = document.getElementById('completion-xp');
    const rankElement = document.getElementById('completion-rank');
    const progressFill = document.getElementById('completion-progress-fill');
    const nextLevelBtn = document.getElementById('next-level-modal-btn');

    // Устанавливаем данные в модальное окно
    title.textContent = `🎉 Уровень ${level} завершен!`;
    message.innerHTML = `Не <span class="golden-word">трогай</span> Justin Bieber Lunix. Оно тебе не надо.`;

    // Обновляем информацию о прогрессе
    levelElement.textContent = gameData.level;
    xpElement.textContent = gameData.xp;
    rankElement.textContent = gameData.rank;

    // Рассчитываем прогресс для прогресс-бара
    const currentLevelData = levels.find(l => l.level === gameData.level);
    const nextLevelData = levels.find(l => l.level === gameData.level + 1);

    if (currentLevelData && nextLevelData) {
        const xpInLevel = gameData.xp - currentLevelData.xpNeeded;
        const xpForLevel = nextLevelData.xpNeeded - currentLevelData.xpNeeded;
        const progress = (xpInLevel / xpForLevel) * 100;
        progressFill.style.width = `${Math.min(progress, 100)}%`;
    } else {
        progressFill.style.width = '100%';
    }

    // Показываем кнопку "Перейти на следующий уровень" если есть следующий уровень
    if (level < 4) {
        nextLevelBtn.textContent = `🎮 Перейти на уровень ${level + 1}`;
        nextLevelBtn.style.display = 'block';
    } else {
        nextLevelBtn.textContent = `Завершить игру`;
        nextLevelBtn.style.display = 'block';
    }

    // Создаем список выполненных заданий для текущего уровня
    createCompletedTasksList(level);

    // Анимация получения опыта
    animateXPGain(level);

    // Показываем модальное окно
    modal.style.display = 'block';
}

// Создание списка выполненных заданий
function createCompletedTasksList(level) {
    // Находим контейнер для списка заданий
    let tasksContainer = document.getElementById('completed-tasks-list');

    // Если контейнера нет, создаем его
    if (!tasksContainer) {
        const levelCompletionProgress = document.querySelector('.level-completion-progress');
        if (levelCompletionProgress) {
            tasksContainer = document.createElement('div');
            tasksContainer.id = 'completed-tasks-list';
            tasksContainer.className = 'completed-tasks-container';
            tasksContainer.innerHTML = `
                <h3>📋 Выполненные задания:</h3>
                <ul id="tasks-list"></ul>
            `;
            levelCompletionProgress.appendChild(tasksContainer);
        }
    }

    // Очищаем предыдущий список
    const tasksList = document.getElementById('tasks-list');
    if (tasksList) {
        tasksList.innerHTML = '';
    }

    // Получаем все задания текущего уровня
    const levelQuests = Object.keys(gameData.quests)
        .filter(questId => questId.startsWith(level + '.'));

    // Добавляем выполненные задания в список
    levelQuests.forEach(questId => {
        const quest = gameData.quests[questId];
        if (quest.completed) {
            const listItem = document.createElement('li');
            listItem.className = 'completed-task-item';
            listItem.setAttribute('data-quest', questId);
            listItem.innerHTML = `
                <span class="task-name">${questRequirements[questId]?.title || `Задание ${questId}`}</span>
                <span class="task-xp">+${quest.xp} XP</span>
            `;
            tasksList.appendChild(listItem);
        }
    });
}

// Новая анимация получения опыта с летящим текстом XP
function animateXPGainWithTaskFlying(level, xpGained, currentXP) {
    // Находим контейнеры для анимации
    const progressFill = document.getElementById('completion-progress-fill');
    const xpElement = document.getElementById('completion-xp');
    const levelElement = document.getElementById('completion-level');
    const rankElement = document.getElementById('completion-rank');
    const tasksContainer = document.getElementById('completed-tasks-list');
    const progressBar = document.querySelector('.level-completion-progress .progress-bar');

    if (!progressFill || !tasksContainer || !progressBar) return;

    // Создаем контейнер для летящих элементов XP (если его нет)
    let flyingContainer = document.getElementById('xp-flying-text-container');
    if (!flyingContainer) {
        flyingContainer = document.createElement('div');
        flyingContainer.id = 'xp-flying-text-container';
        flyingContainer.style.position = 'absolute';
        flyingContainer.style.top = '0';
        flyingContainer.style.left = '0';
        flyingContainer.style.width = '100%';
        flyingContainer.style.height = '100%';
        flyingContainer.style.pointerEvents = 'none';
        flyingContainer.style.zIndex = '1000';
        tasksContainer.parentNode.style.position = 'relative';
        tasksContainer.parentNode.appendChild(flyingContainer);
    } else {
        flyingContainer.innerHTML = '';
    }

    // Получаем все выполненные задания текущего уровня
    const levelQuests = Object.keys(gameData.quests)
        .filter(questId => questId.startsWith(level + '.') && gameData.quests[questId].completed);

    // Суммируем опыт за уровень
    const totalXPGained = levelQuests.reduce((sum, questId) => sum + gameData.quests[questId].xp, 0);

    // Рассчитываем прогресс для текущего уровня
    const currentLevelData = levels.find(l => l.level === gameData.level);
    const nextLevelData = levels.find(l => l.level === gameData.level + 1);

    let cumulativeXP = currentXP;
    let cumulativeProgress = 0;

    // Получаем позицию прогресс-бара для таргета анимации
    const progressBarRect = progressBar.getBoundingClientRect();
    const containerRect = tasksContainer.getBoundingClientRect();

    // Создаем анимацию для каждого задания
    let delay = 0;
    levelQuests.forEach((questId, index) => {
        const quest = gameData.quests[questId];
        const xpValue = quest.xp;

        // Находим элемент задания в списке
        const taskElement = document.querySelector(`.completed-task-item[data-quest="${questId}"]`);
        if (!taskElement) {
            delay += 0.8;
            return;
        }

        // Находим элемент с текстом XP
        const xpTextElement = taskElement.querySelector('.task-xp');
        if (!xpTextElement) {
            delay += 0.8;
            return;
        }

        // Получаем позицию элемента с XP
        const taskRect = xpTextElement.getBoundingClientRect();

        // Создаем летящий элемент с текстом XP
        const flyingXP = document.createElement('div');
        flyingXP.className = 'flying-xp-text';
        flyingXP.textContent = `+${xpValue} XP`;
        flyingXP.style.position = 'absolute';

        // Устанавливаем начальную позицию (относительно контейнера)
        flyingXP.style.left = `${taskRect.left - containerRect.left}px`;
        flyingXP.style.top = `${taskRect.top - containerRect.top}px`;

        // Добавляем в контейнер
        flyingContainer.appendChild(flyingXP);

        // Увеличиваем задержку для следующего задания
        delay += 0.8;

        // Запускаем анимацию через задержку
        setTimeout(() => {
            // Рассчитываем целевую позицию (центр прогресс-бара)
            const targetX = (progressBarRect.left + progressBarRect.width / 2) - containerRect.left;
            const targetY = (progressBarRect.top + progressBarRect.height / 2) - containerRect.top;

            // Применяем анимацию полета
            flyingXP.style.transition = 'all 1s cubic-bezier(0.25, 0.1, 0.25, 1)';
            flyingXP.style.left = `${targetX}px`;
            flyingXP.style.top = `${targetY}px`;
            flyingXP.style.opacity = '0';
            flyingXP.style.transform = 'scale(1.5)';
            flyingXP.style.color = '#48bb78';

            // Когда анимация завершится, обновляем прогресс
            setTimeout(() => {
                // Увеличиваем XP
                cumulativeXP += xpValue;

                // Рассчитываем прогресс
                if (currentLevelData && nextLevelData) {
                    const xpInLevel = cumulativeXP - currentLevelData.xpNeeded;
                    const xpForLevel = nextLevelData.xpNeeded - currentLevelData.xpNeeded;
                    cumulativeProgress = (xpInLevel / xpForLevel) * 100;

                    // Обновляем прогресс-бар плавно
                    progressFill.style.width = `${Math.min(cumulativeProgress, 100)}%`;
                    progressFill.style.transition = 'width 0.5s ease-out';

                    // Обновляем текст XP
                    xpElement.textContent = cumulativeXP;

                    // Проверяем, достиг ли пользователь нового уровня
                    if (cumulativeXP >= nextLevelData.xpNeeded) {
                        // Обновляем уровень и звание
                        gameData.level = nextLevelData.level;
                        gameData.rank = nextLevelData.rank;
                        levelElement.textContent = gameData.level;
                        rankElement.textContent = gameData.rank;

                        // Показываем анимацию повышения уровня
                        showLevelUpAnimation();
                    }
                }

                // Удаляем летящий элемент после анимации
                flyingXP.remove();

                // Если это последнее задание, сохраняем прогресс
                if (index === levelQuests.length - 1) {
                    setTimeout(() => {
                        // Обновляем фактический XP в игре
                        gameData.xp = cumulativeXP;

                        // Обновляем UI
                        updateUI();
                        updateMap();
                        checkLevelUnlocks();
                        checkAchievements();
                        saveProgress();
                    }, 1000);
                }
            }, 1000); // Время анимации полета
        }, delay * 1000);
    });
}

// Анимация получения опыта (оригинальная функция)
function animateXPGain(level) {
    // Находим контейнер для анимации
    const xpFlying = document.getElementById('xp-flying');
    const progressFill = document.getElementById('completion-progress-fill');

    if (!xpFlying || !progressFill) return;

    // Очищаем предыдущую анимацию
    xpFlying.innerHTML = '';

    // Получаем все выполненные задания текущего уровня
    const levelQuests = Object.keys(gameData.quests)
        .filter(questId => questId.startsWith(level + '.') && gameData.quests[questId].completed);

    // Суммируем опыт за уровень
    const totalXPGained = levelQuests.reduce((sum, questId) => sum + gameData.quests[questId].xp, 0);

    // Создаем анимацию для каждого задания
    let delay = 0;
    levelQuests.forEach(questId => {
        const quest = gameData.quests[questId];
        const xpValue = quest.xp;

        // Создаем элемент для анимации
        const xpElement = document.createElement('div');
        xpElement.className = 'xp-flying-item';
        xpElement.textContent = `+${xpValue} XP`;
        xpElement.style.animationDelay = `${delay}s`;
        xpFlying.appendChild(xpElement);

        delay += 0.3;
    });

    // Анимация прогресс-бара
    setTimeout(() => {
        const currentLevelData = levels.find(l => l.level === gameData.level);
        const nextLevelData = levels.find(l => l.level === gameData.level + 1);

        if (currentLevelData && nextLevelData) {
            const xpInLevel = gameData.xp - currentLevelData.xpNeeded;
            const xpForLevel = nextLevelData.xpNeeded - currentLevelData.xpNeeded;
            const progress = (xpInLevel / xpForLevel) * 100;

            // Сбрасываем прогресс-бар
            progressFill.style.width = '0%';

            // Плавно увеличиваем прогресс-бар
            setTimeout(() => {
                progressFill.style.width = `${Math.min(progress, 100)}%`;
                progressFill.style.transition = 'width 1.5s ease-out';
            }, 100);
        }
    }, delay * 1000 + 500);
}

// Анимация повышения уровня
function showLevelUpAnimation() {
    const levelElement = document.getElementById('completion-level');
    const rankElement = document.getElementById('completion-rank');

    if (!levelElement || !rankElement) return;

    // Сохраняем текущие значения
    const currentLevel = levelElement.textContent;
    const currentRank = rankElement.textContent;

    // Добавляем анимацию мерцания
    levelElement.style.transition = 'all 0.5s ease';
    rankElement.style.transition = 'all 0.5s ease';

    // Анимация мерцания
    levelElement.style.transform = 'scale(1.2)';
    levelElement.style.color = '#48bb78';
    rankElement.style.transform = 'scale(1.2)';
    rankElement.style.color = '#48bb78';

    setTimeout(() => {
        levelElement.style.transform = 'scale(1)';
        rankElement.style.transform = 'scale(1)';
    }, 500);
}

// Воспроизведение звука задания (заглушка)
function playTaskSound() {
    // В реальной игре здесь был бы звуковой эффект
    console.log('Playing task completion sound...');
}

// Модифицированная функция проверки завершения уровня
function checkLevelCompletion() {
    // Проверяем, завершен ли текущий уровень
    if (isLevelCompleted(currentLevel)) {
        // Рассчитываем XP, который будет получен за завершение уровня
        const levelQuests = Object.keys(gameData.quests)
            .filter(questId => questId.startsWith(currentLevel + '.') && gameData.quests[questId].completed);
        const xpGained = levelQuests.reduce((sum, questId) => sum + gameData.quests[questId].xp, 0);

        // Для уровня 4 - сразу показываем финальный экран без модального окна завершения уровня
        if (currentLevel === 4) {
            // Обновляем XP и прогресс
            calculateXP();
            updateUI();
            updateMap();
            checkLevelUnlocks();
            checkAchievements();
            saveProgress();

            // Показываем финальный экран
            showFinalScreen();
        } else if (currentLevel === 3) {
            // Для уровня 3 показываем специальное модальное окно с секретной фразой
            showLevelCompletionModalWithSecretPhrase(currentLevel, xpGained);
        } else {
            // Для уровней 1-2 показываем обычное модальное окно завершения уровня с анимацией
            showLevelCompletionModalWithAnimation(currentLevel, xpGained);
        }
    }
}

// Закрытие модального окна завершения уровня
function closeLevelCompletionModal() {
    const modal = document.getElementById('level-completion-modal');
    modal.style.display = 'none';
}

// Показ модального окна завершения уровня с секретной фразой для уровня 3
function showLevelCompletionModalWithSecretPhrase(level, xpGained) {
    const modal = document.getElementById('level-completion-modal');
    const title = document.getElementById('level-completion-title');
    const message = document.getElementById('level-completion-message');
    const levelElement = document.getElementById('completion-level');
    const xpElement = document.getElementById('completion-xp');
    const rankElement = document.getElementById('completion-rank');
    const progressFill = document.getElementById('completion-progress-fill');
    const nextLevelBtn = document.getElementById('next-level-modal-btn');

    // Устанавливаем данные в модальное окно
    title.textContent = `🎉 Уровень ${level} завершен!`;
    message.innerHTML = `Не <span class="golden-word">трогай</span> Justin Bieber Lunix. Оно тебе не надо.`;

    // Сохраняем текущий XP до анимации
    const currentXP = gameData.xp;

    // Показываем текущий уровень и XP (до анимации)
    levelElement.textContent = gameData.level;
    xpElement.textContent = currentXP;
    rankElement.textContent = gameData.rank;

    // Сбрасываем прогресс-бар до начала анимации
    progressFill.style.width = '0%';
    progressFill.style.transition = 'none';

    // Скрываем стандартную кнопку "Перейти на следующий уровень"
    nextLevelBtn.style.display = 'none';

    // Создаем контейнер для секретной фразы (если его нет)
    let secretPhraseContainer = document.getElementById('secret-phrase-container');
    if (!secretPhraseContainer) {
        secretPhraseContainer = document.createElement('div');
        secretPhraseContainer.id = 'secret-phrase-container';
        secretPhraseContainer.className = 'secret-phrase-container';
        secretPhraseContainer.style.marginTop = '20px';
        secretPhraseContainer.style.padding = '15px';
        secretPhraseContainer.style.background = 'rgba(108, 92, 234, 0.1)';
        secretPhraseContainer.style.borderRadius = '10px';
        secretPhraseContainer.style.border = '2px solid #667eea';

        // Добавляем заголовок
        const secretTitle = document.createElement('h3');
        secretTitle.textContent = '🔐 СЕКРЕТНЫЙ УРОВЕНЬ';
        secretTitle.style.color = '#667eea';
        secretTitle.style.marginBottom = '10px';
        secretTitle.style.textAlign = 'center';

        // Добавляем описание
        const secretDescription = document.createElement('p');
        secretDescription.textContent = 'Для разблокировки секретного уровня 4 введите секретную фразу:';
        secretDescription.style.marginBottom = '15px';
        secretDescription.style.textAlign = 'center';
        secretDescription.style.color = '#4a5568';

        // Добавляем поле ввода
        const secretInput = document.createElement('input');
        secretInput.type = 'text';
        secretInput.id = 'secret-phrase-input';
        secretInput.placeholder = 'Введите секретную фразу...';
        secretInput.style.width = '100%';
        secretInput.style.padding = '12px';
        secretInput.style.border = '2px solid #667eea';
        secretInput.style.borderRadius = '8px';
        secretInput.style.fontSize = '1em';
        secretInput.style.marginBottom = '10px';

        // Добавляем кнопку проверки
        const secretButton = document.createElement('button');
        secretButton.id = 'secret-phrase-button';
        secretButton.textContent = '🔓 Разблокировать секретный уровень';
        secretButton.style.width = '100%';
        secretButton.style.padding = '12px';
        secretButton.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
        secretButton.style.color = 'white';
        secretButton.style.border = 'none';
        secretButton.style.borderRadius = '8px';
        secretButton.style.fontSize = '1em';
        secretButton.style.fontWeight = 'bold';
        secretButton.style.cursor = 'pointer';
        secretButton.style.transition = 'all 0.3s ease';

        // Добавляем обработчик наведения
        secretButton.onmouseover = function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
        };

        secretButton.onmouseout = function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        };

        // Добавляем обработчик клика
        secretButton.onclick = function() {
            checkSecretPhrase();
        };

        // Добавляем контейнер для сообщения об ошибке/успехе
        const secretMessage = document.createElement('div');
        secretMessage.id = 'secret-phrase-message';
        secretMessage.style.marginTop = '10px';
        secretMessage.style.padding = '8px';
        secretMessage.style.borderRadius = '6px';
        secretMessage.style.textAlign = 'center';
        secretMessage.style.fontWeight = 'bold';

        // Собираем контейнер
        secretPhraseContainer.appendChild(secretTitle);
        secretPhraseContainer.appendChild(secretDescription);
        secretPhraseContainer.appendChild(secretInput);
        secretPhraseContainer.appendChild(secretButton);
        secretPhraseContainer.appendChild(secretMessage);

        // Добавляем кнопку "Вернуться к карте" для удобства пользователя
        const returnToMapButton = document.createElement('button');
        returnToMapButton.id = 'return-to-map-button';
        returnToMapButton.textContent = '🗺️ Вернуться к карте';
        returnToMapButton.style.width = '100%';
        returnToMapButton.style.padding = '12px';
        returnToMapButton.style.marginTop = '10px';
        returnToMapButton.style.background = 'linear-gradient(135deg, #48bb78, #38a169)';
        returnToMapButton.style.color = 'white';
        returnToMapButton.style.border = 'none';
        returnToMapButton.style.borderRadius = '8px';
        returnToMapButton.style.fontSize = '1em';
        returnToMapButton.style.fontWeight = 'bold';
        returnToMapButton.style.cursor = 'pointer';
        returnToMapButton.style.transition = 'all 0.3s ease';

        // Добавляем обработчик наведения
        returnToMapButton.onmouseover = function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 15px rgba(72, 187, 120, 0.4)';
        };

        returnToMapButton.onmouseout = function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        };

        // Добавляем обработчик клика
        returnToMapButton.onclick = function() {
            closeLevelCompletionModal();
            showSection('map');
        };

        secretPhraseContainer.appendChild(returnToMapButton);

        // Добавляем контейнер в модальное окно
        const modalContent = modal.querySelector('.modal-content');
        modalContent.appendChild(secretPhraseContainer);
    }

    // Создаем список выполненных заданий для текущего уровня
    createCompletedTasksList(level);

    // Запускаем анимацию получения опыта
    animateXPGainWithTaskFlying(level, xpGained, currentXP);

    // Добавляем задержку 3 секунды перед показом модального окна
    setTimeout(() => {
        modal.style.display = 'block';
    }, 3000);
}

// Функция проверки секретной фразы
function checkSecretPhrase() {
    const secretInput = document.getElementById('secret-phrase-input');
    const secretMessage = document.getElementById('secret-phrase-message');
    const secretPhrase = secretInput.value.trim();

    // Секретная фраза для разблокировки уровня 4
    const correctPhrase = "работает не трогай";

    if (secretPhrase === correctPhrase) {
        // Правильная фраза - разблокируем уровень 4
        secretMessage.textContent = '✅ Отлично! Секретный уровень разблокирован!';
        secretMessage.style.color = '#48bb78';
        secretMessage.style.background = 'rgba(72, 187, 120, 0.1)';

        // Разблокируем уровень 4
        unlockLevel4();

        // Закрываем модальное окно через 2 секунды
        setTimeout(() => {
            closeLevelCompletionModal();
            // Переходим на карту уровней, чтобы показать разблокированный уровень 4
            showSection('map');
        }, 2000);
    } else {
        // Неправильная фраза
        secretMessage.textContent = '❌ Неправильная секретная фраза. Попробуйте еще раз!';
        secretMessage.style.color = '#e53e3e';
        secretMessage.style.background = 'rgba(229, 62, 62, 0.1)';
    }
}

// Функция разблокировки уровня 4
function unlockLevel4() {
    // Устанавливаем флаг, что уровень 4 разблокирован через секретную фразу
    gameData.level4UnlockedBySecretPhrase = true;

    // Разблокируем уровень 4
    const levelNode = document.querySelector(`.level-node[data-level="4"]`);
    if (levelNode) {
        levelNode.classList.remove('locked');
        levelNode.classList.add('active');
        levelNode.querySelector('.node-status').textContent = 'Секретный уровень!';
        levelNode.style.cursor = 'pointer';
        levelNode.style.opacity = '1';

        // Добавляем специальный стиль для секретного уровня
        levelNode.style.border = '2px solid #f6e05e';
        levelNode.style.background = 'linear-gradient(135deg, rgba(108, 92, 234, 0.1), rgba(162, 155, 254, 0.05))';

        // Обновляем текст уровня
        const levelTitle = levelNode.querySelector('.node-info h3');
        if (levelTitle) {
            levelTitle.textContent = 'Уровень 4: СЕКРЕТНЫЙ УРОВЕНЬ';
            levelTitle.style.color = '#f6e05e';
        }
    }

    // Разблокируем квесты уровня 4
    unlockQuests(['4.1']);

    // Обновляем UI
    updateUI();
    updateMap();
    saveProgress();
}

// Функция возврата на текущий уровень
function returnToCurrentLevel() {
    // Закрываем модальное окно завершения уровня
    closeLevelCompletionModal();

    // Устанавливаем флаг, что пользователь закрыл модальное окно завершения уровня
    levelCompletionModalDismissed = true;

    // Возвращаемся к текущему уровню
    showLevel(currentLevel);
}

// Переход на следующий уровень из модального окна
function goToNextLevelFromModal() {
    // Проверяем, есть ли следующий уровень
    if (currentLevel < 4) {
        // Переходим на следующий уровень
        showLevel(currentLevel + 1);
    } else {
    }

    // Закрываем модальное окно
    closeLevelCompletionModal();
}

// Обновление интерфейса
function updateUI() {
    // Обновляем XP и уровень
    document.getElementById('xp').textContent = gameData.xp;
    document.getElementById('level').textContent = gameData.level;
    document.getElementById('rank').textContent = gameData.rank;

    // Находим XP для следующего уровня
    const nextLevel = levels.find(level => level.level === gameData.level + 1);
    const xpNeeded = nextLevel ? nextLevel.xpNeeded : levels[levels.length - 1].xpNeeded;
    document.getElementById('xp-needed').textContent = xpNeeded;

    // Обновляем прогресс-бар
    const currentLevelData = levels.find(level => level.level === gameData.level);
    const nextLevelData = levels.find(level => level.level === gameData.level + 1);

    if (currentLevelData && nextLevelData) {
        const xpInLevel = gameData.xp - currentLevelData.xpNeeded;
        const xpForLevel = nextLevelData.xpNeeded - currentLevelData.xpNeeded;
        const progress = (xpInLevel / xpForLevel) * 100;
        document.getElementById('progress-fill').style.width = `${Math.min(progress, 100)}%`;
    } else {
        document.getElementById('progress-fill').style.width = '100%';
    }

    // Применяем золотой эффект к XP, если достигнут максимум (все уровни завершены)
    const xpElement = document.getElementById('xp');
    const xpNeededElement = document.getElementById('xp-needed');

    // Проверяем, завершен ли уровень 4 (максимальный уровень)
    if (isLevelCompleted(4) || (isLevelCompleted(3) && gameData.xp >= 100)) {
        xpElement.classList.add('golden-xp');
        xpNeededElement.classList.add('golden-xp');
    } else {
        xpElement.classList.remove('golden-xp');
        xpNeededElement.classList.remove('golden-xp');
    }

    // Обновляем статусы квестов
    updateAllQuestStatuses();
    updateNextLevelButton();
}

// Обновление видимости кнопки "Следующий уровень"
function updateNextLevelButton() {
    const nextLevelBtn = document.getElementById('next-level-btn');
    const nextLevelContainer = document.getElementById('next-level-container');

    if (nextLevelBtn && nextLevelContainer) {
        // Всегда скрываем кнопку в основном интерфейсе
        nextLevelContainer.style.display = 'none';
    }
}

// Сохранение прогресса
function saveProgress() {
    const saveData = {
        xp: gameData.xp,
        level: gameData.level,
        rank: gameData.rank,
        quests: gameData.quests,
        achievements: achievements,
        level4UnlockedBySecretPhrase: gameData.level4UnlockedBySecretPhrase
    };
    localStorage.setItem('sysadminGameProgress', JSON.stringify(saveData));
}

// Загрузка прогресса
function loadProgress() {
    const saved = localStorage.getItem('sysadminGameProgress');
    if (saved) {
        const saveData = JSON.parse(saved);
        gameData.xp = saveData.xp || 0;
        gameData.level = saveData.level || 1;
        gameData.rank = saveData.rank || "Стажер";
        gameData.quests = saveData.quests || gameData.quests;

        if (saveData.achievements) {
            Object.keys(saveData.achievements).forEach(key => {
                if (achievements[key]) {
                    achievements[key].unlocked = saveData.achievements[key].unlocked;
                }
            });
        }

        // Загружаем флаг разблокировки уровня 4
        if (saveData.level4UnlockedBySecretPhrase !== undefined) {
            gameData.level4UnlockedBySecretPhrase = saveData.level4UnlockedBySecretPhrase;
        }

        // НЕ вызываем calculateXP() при загрузке - XP уже сохранен в gameData.xp
        // checkLevelUnlocks() - оставляем, так как нужно разблокировать уровни на основе текущего XP
        checkLevelUnlocks();
    }
}


// Консольный симулятор
const consoleState = {
    currentDirectory: '/home/user',
    files: {
        '/home/user': ['documents', 'downloads', 'projects'],
        '/home/user/documents': ['notes.txt', 'report.doc'],
        '/home/user/downloads': ['software.zip', 'image.jpg'],
        '/home/user/projects': ['web', 'scripts'],
        '/home/user/projects/web': ['index.html', 'style.css'],
        '/home/user/projects/scripts': ['backup.sh', 'install.sh']
    },
    history: [],
    historyIndex: -1,
    currentLevelCommands: {
        1: ['ipconfig', 'ping', 'pwd', 'ls', 'mkdir', 'cp'],
        2: ['ipconfig', 'ping', 'nslookup', 'traceroute'],
        3: ['pwd', 'ls', 'mkdir', 'touch', 'cp', 'mv', 'rm', 'find', 'ps', 'top', 'cat', 'free', 'cd'],
        4: ['nano', 'chmod', './myscript.sh']
    },
    expectedCommands: {
        '1.1': 'ipconfig',
        '1.2': 'ping 192.168.1.20',
        '2.1': ['ipconfig', 'ping 192.168.1.1'],
        '2.2': 'nslookup google.com',
        '3.1': ['mkdir study', 'cd study', 'mkdir projects', 'cd projects', 'mkdir test', 'cd test', 'touch task'],
        '3.2': ['find /home -name "*.txt"', 'cat /proc/cpuinfo', 'free -h'],
        '4.1': ['nano myscript.sh', './myscript.sh']
    },
    completedCommands: {},
    scriptContent: '',
    scriptCreated: false
};

// Инициализация консоли
function initConsole() {
    // Находим активный уровень и инициализируем его консоль
    const activeLevel = document.querySelector('.quest-level.active');
    if (activeLevel) {
        const consoleInput = activeLevel.querySelector('.console-input');
        if (consoleInput) {
            consoleInput.addEventListener('keydown', handleConsoleKey);
            consoleInput.focus();
        }

        // Добавляем обработчик для кнопки сброса
        const resetBtn = activeLevel.querySelector('.console-clear-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', resetConsole);
        }
    }

    // Инициализируем состояние консоли
    consoleState.history = [];
    consoleState.historyIndex = -1;
    consoleState.completedCommands = {};

    // Обновляем статусы квестов
    updateAllQuestStatusDisplays();
}

// Обновленная функция очистки консоли для работы с активным уровнем
function clearConsole() {
    const activeLevel = document.querySelector('.quest-level.active');
    if (activeLevel) {
        const output = activeLevel.querySelector('.console-output');
        if (output) {
            output.innerHTML = `
                <div class="console-line">Добро пожаловать в учебный терминал!</div>
                <div class="console-line">Введите команды как в реальном терминале.</div>
                <div class="console-line">Доступные команды: ${consoleState.currentLevelCommands[currentLevel].join(', ')}</div>
            `;
        }
    }
    consoleState.history = [];
    consoleState.historyIndex = -1;
}

// Обновленная функция обработки команд для работы с активным уровнем
function processCommand(command) {
    const activeLevel = document.querySelector('.quest-level.active');
    if (activeLevel) {
        const output = activeLevel.querySelector('.console-output');
        const input = activeLevel.querySelector('.console-input');

        if (output && input) {
            // Добавляем команду в вывод
            const commandLine = document.createElement('div');
            commandLine.className = 'console-line command-line';
            commandLine.innerHTML = `<span class="console-prompt">user@sysadmin:~$</span> ${command}`;
            output.appendChild(commandLine);

            // Обрабатываем команду
            const response = executeCommand(command);

            // Добавляем ответ
            const responseLine = document.createElement('div');
            responseLine.className = 'console-line response-line';
            responseLine.textContent = response;
            output.appendChild(responseLine);

            // Проверяем, выполнены ли ожидаемые команды для квестов
            checkCommandForQuests(command);

            // Прокручиваем вниз
            output.scrollTop = output.scrollHeight;
        }
    }
}

// Обработка нажатий клавиш в консоли
function handleConsoleKey(event) {
    if (event.key === 'Enter') {
        const activeLevel = document.querySelector('.quest-level.active');
        if (activeLevel) {
            const input = activeLevel.querySelector('.console-input');
            const command = input.value.trim();

            if (command) {
                // Добавляем команду в историю
                consoleState.history.push(command);
                consoleState.historyIndex = consoleState.history.length;

                // Обрабатываем команду
                processCommand(command);

                // Очищаем инпут
                input.value = '';
            }
        }
    } else if (event.key === 'ArrowUp') {
        // Навигация по истории команд
        navigateHistory('up');
        event.preventDefault();
    } else if (event.key === 'ArrowDown') {
        // Навигация по истории команд
        navigateHistory('down');
        event.preventDefault();
    }
}

// Навигация по истории команд
function navigateHistory(direction) {
    const activeLevel = document.querySelector('.quest-level.active');
    if (activeLevel) {
        const input = activeLevel.querySelector('.console-input');

        if (direction === 'up') {
            if (consoleState.historyIndex > 0) {
                consoleState.historyIndex--;
                input.value = consoleState.history[consoleState.historyIndex];
            } else if (consoleState.historyIndex === 0) {
                input.value = consoleState.history[0];
            }
        } else if (direction === 'down') {
            if (consoleState.historyIndex < consoleState.history.length - 1) {
                consoleState.historyIndex++;
                input.value = consoleState.history[consoleState.historyIndex];
            } else {
                consoleState.historyIndex = consoleState.history.length;
                input.value = '';
            }
        }
    }
}

// Выполнение команды
function executeCommand(command) {
    const parts = command.split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);

    // Проверяем доступные команды для текущего уровня
    const availableCommands = consoleState.currentLevelCommands[currentLevel] || [];

    if (!availableCommands.includes(cmd)) {
        return `Команда "${cmd}" не доступна на этом уровне. Доступные команды: ${availableCommands.join(', ')}`;
    }

    // Обработка команд
    switch (cmd) {
        case 'ipconfig':
        case 'ip':
            return `Ethernet adapter Ethernet:
  Connection-specific DNS Suffix  . :
  IPv4 Address. . . . . . . . . . . : 192.168.1.10
  Subnet Mask . . . . . . . . . . . : 255.255.255.0
  Default Gateway . . . . . . . . . : 192.168.1.1`;

        case 'ping':
            if (args.length === 0) {
                return 'Использование: ping [IP-адрес или имя хоста]';
            }

            // Разрешенные IP-адреса для команды ping
            const allowedIPs = ['192.168.1.1', '192.168.1.10', '192.168.1.20'];
            const target = args[0];

            // Проверяем, является ли цель разрешенным IP-адресом
            if (!allowedIPs.includes(target)) {
                return `Ошибка: пинговать можно только айпи адреса`;
            }

            return `Pinging ${target} with 32 bytes of data:
Reply from ${target}: bytes=32 time=1ms TTL=64
Reply from ${target}: bytes=32 time=1ms TTL=64
Reply from ${target}: bytes=32 time=1ms TTL=64
Reply from ${target}: bytes=32 time=1ms TTL=64

Ping statistics for ${target}:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 1ms, Maximum = 1ms, Average = 1ms`;

        case 'nslookup':
            if (args.length === 0) {
                return 'Использование: nslookup [имя хоста]';
            }
            return `Server:  UnKnown
Address:  192.168.1.1

Non-authoritative answer:
Name:    ${args[0]}
Address:  172.217.16.142`;

        case 'pwd':
            return consoleState.currentDirectory;

        case 'cd':
            if (args.length === 0) {
                return 'Использование: cd [путь]';
            }
            const targetDir = args[0];
            let newDirectory;

            if (targetDir === '..') {
                // Переход на уровень выше
                const parts = consoleState.currentDirectory.split('/');
                if (parts.length > 3) { // /home/user - минимальный путь
                    parts.pop();
                    newDirectory = parts.join('/');
                } else {
                    return `cd: cannot go above ${consoleState.currentDirectory}`;
                }
            } else if (targetDir === '~' || targetDir === '/') {
                // Переход в домашнюю директорию
                newDirectory = '/home/user';
            } else if (targetDir.startsWith('/')) {
                // Абсолютный путь
                if (consoleState.files[targetDir]) {
                    newDirectory = targetDir;
                } else {
                    return `cd: no such directory: ${targetDir}`;
                }
            } else {
                // Относительный путь
                const newPath = `${consoleState.currentDirectory}/${targetDir}`;
                if (consoleState.files[newPath]) {
                    newDirectory = newPath;
                } else {
                    return `cd: no such directory: ${targetDir}`;
                }
            }

            consoleState.currentDirectory = newDirectory;
            return `Мы перешли в папку ${newDirectory}`;

        case 'ls':
            const currentFiles = consoleState.files[consoleState.currentDirectory] || [];
            if (args.includes('-la')) {
                return currentFiles.map(file => `-rw-r--r-- 1 user user 4096 Jan 1 12:00 ${file}`).join('\n');
            }
            return currentFiles.join('  ');

        case 'mkdir':
            if (args.length === 0) {
                return 'Использование: mkdir [имя_директории]';
            }
            const dirName = args[0];
            if (!consoleState.files[consoleState.currentDirectory]) {
                consoleState.files[consoleState.currentDirectory] = [];
            }
            if (consoleState.files[consoleState.currentDirectory].includes(dirName)) {
                return `mkdir: cannot create directory '${dirName}': File exists`;
            }
            consoleState.files[consoleState.currentDirectory].push(dirName);
            consoleState.files[`${consoleState.currentDirectory}/${dirName}`] = [];
            return `Папка "${dirName}" была создана`;

        case 'touch':
            if (args.length === 0) {
                return 'Использование: touch [имя_файла]';
            }
            const touchFileName = args[0];
            if (!consoleState.files[consoleState.currentDirectory]) {
                consoleState.files[consoleState.currentDirectory] = [];
            }
            if (consoleState.files[consoleState.currentDirectory].includes(touchFileName)) {
                return `touch: cannot create file '${touchFileName}': File exists`;
            }
            consoleState.files[consoleState.currentDirectory].push(touchFileName);
            return `Файл "${touchFileName}" был создан`;

        case 'cp':
            if (args.length !== 2) {
                return 'Использование: cp [источник] [назначение]';
            }
            const [source, dest] = args;
            if (!consoleState.files[consoleState.currentDirectory] || !consoleState.files[consoleState.currentDirectory].includes(source)) {
                return `cp: cannot stat '${source}': No such file or directory`;
            }
            if (!consoleState.files[consoleState.currentDirectory]) {
                consoleState.files[consoleState.currentDirectory] = [];
            }
            consoleState.files[consoleState.currentDirectory].push(dest);
            return `Файл "${source}" скопирован в "${dest}"`;

        case 'mv':
            if (args.length !== 2) {
                return 'Использование: mv [источник] [назначение]';
            }
            const [src, mvTarget] = args;
            if (!consoleState.files[consoleState.currentDirectory] || !consoleState.files[consoleState.currentDirectory].includes(src)) {
                return `mv: cannot stat '${src}': No such file or directory`;
            }
            // Удаляем из текущей директории
            const index = consoleState.files[consoleState.currentDirectory].indexOf(src);
            consoleState.files[consoleState.currentDirectory].splice(index, 1);

            // Добавляем в целевую директорию
            if (mvTarget.includes('/')) {
                const targetDir = `${consoleState.currentDirectory}/${mvTarget.split('/')[0]}`;
                if (consoleState.files[targetDir]) {
                    consoleState.files[targetDir].push(src);
                }
            } else {
                consoleState.files[consoleState.currentDirectory].push(mvTarget);
            }
            return `Файл "${src}" перемещен в "${mvTarget}"`;

        case 'rm':
            if (args.length === 0) {
                return 'Использование: rm [имя_файла]';
            }
            const fileToRemove = args[0];
            if (!consoleState.files[consoleState.currentDirectory] || !consoleState.files[consoleState.currentDirectory].includes(fileToRemove)) {
                return `rm: cannot remove '${fileToRemove}': No such file or directory`;
            }
            const fileIndex = consoleState.files[consoleState.currentDirectory].indexOf(fileToRemove);
            consoleState.files[consoleState.currentDirectory].splice(fileIndex, 1);
            return `Файл "${fileToRemove}" был удален`;

        case 'find':
            if (args.length === 0) {
                return 'Использование: find [путь] [опции]';
            }

            // Parse find command arguments
            let findPath = '/home/user'; // default path
            let findPattern = '*.txt'; // default pattern

            // Extract path and pattern from arguments
            for (let i = 0; i < args.length; i++) {
                if (args[i] === '-name') {
                    if (i + 1 < args.length) {
                        findPattern = args[i + 1];
                        break;
                    }
                } else if (args[i].startsWith('/')) {
                    findPath = args[i];
                }
            }

            // Remove quotes from pattern if present
            findPattern = findPattern.replace(/["']/g, '');

            // Check if the search path exists
            // Handle special case: /home should be treated as /home/user
            if (findPath === '/home' && consoleState.files['/home/user']) {
                findPath = '/home/user';
            } else if (!consoleState.files[findPath]) {
                return `find: '${findPath}': No such file or directory`;
            }

            // Search for files matching the pattern
            const foundFiles = [];
            const patternRegex = new RegExp(findPattern.replace(/\*/g, '.*').replace(/\?/g, '.'));

            // Recursive search function
            function searchDirectory(directory) {
                const contents = consoleState.files[directory] || [];
                contents.forEach(item => {
                    const fullPath = `${directory}/${item}`;

                    // Check if this item matches the pattern
                    if (patternRegex.test(item)) {
                        foundFiles.push(fullPath);
                    }

                    // If it's a directory, search inside it
                    if (consoleState.files[fullPath]) {
                        searchDirectory(fullPath);
                    }
                });
            }

            // Start search from the specified path
            searchDirectory(findPath);

            // Return results or "no files found" message
            if (foundFiles.length > 0) {
                return foundFiles.join('\n');
            } else {
                return `find: no files match the pattern '${findPattern}' in ${findPath}`;
            }

        case 'ps':
            return `  PID TTY          TIME CMD
   123 ?        00:00:01 systemd
   456 ?        00:00:02 nginx
   789 pts/0    00:00:00 bash
  1011 pts/0    00:00:00 ps`;

        case 'top':
            return `top - 12:00:00 up 1 day,  2:30,  1 user,  load average: 0.15, 0.10, 0.05
Tasks: 123 total,   2 running, 121 sleeping,   0 stopped,   0 zombie
%Cpu(s):  5.2 us,  2.1 sy,  0.0 ni, 92.7 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :   7842.5 total,   2147.2 free,   3125.8 used,   2569.5 buff/cache
MiB Swap:   2048.0 total,   2048.0 free,      0.0 used.   4215.3 avail Mem`;

        case 'cat':
            if (args.length === 0) {
                return 'Использование: cat [имя_файла]';
            }

            const catFilePath = args[0];

            // Handle special system files first
            if (catFilePath === '/proc/cpuinfo') {
                return `processor	: 0
vendor_id	: GenuineIntel
cpu family	: 6
model		: 158
model name	: Intel(R) Core(TM) i7-9700K CPU @ 3.60GHz
stepping	: 12
cpu MHz		: 3600.000
cache size	: 12288 KB
physical id	: 0
siblings	: 8
core id		: 0
cpu cores	: 8
apicid		: 0
initial apicid	: 0
fpu		: yes
fpu_exception	: yes
cpuid level	: 22
wp		: yes`;
            }

            let catFileName = catFilePath;
            let catDirectory = consoleState.currentDirectory;

            // Handle absolute paths
            if (catFilePath.startsWith('/')) {
                const pathParts = catFilePath.split('/');
                catFileName = pathParts[pathParts.length - 1];
                const dirPath = pathParts.slice(0, -1).join('/');
                catDirectory = dirPath || '/';

                if (!consoleState.files[catDirectory]) {
                    return `cat: ${catFilePath}: No such file or directory`;
                }
            }

            // Check if file exists in current directory
            const filesInDir = consoleState.files[catDirectory] || [];
            if (!filesInDir.includes(catFileName)) {
                return `cat: ${catFileName}: No such file or directory`;
            }

            // Return appropriate content based on filename
            if (catFileName === 'notes.txt') {
                return `Привет, это мои заметки.
Сегодня я изучил основы работы с терминалом.
Завтра планирую попрактиковаться с файлами.`;
            } else if (catFileName === 'report.doc') {
                return `Еженедельный отчет
================
Прогресс: Хороший
Задачи: Все выполнены
Планы: Изучить новые команды`;
            } else if (catFileName === 'index.html') {
                return `<!DOCTYPE html>
<html>
<head>
    <title>Мой проект</title>
</head>
<body>
    <h1>Добро пожаловать на мой сайт!</h1>
</body>
</html>`;
            } else if (catFileName === 'style.css') {
                return `body {
    font-family: Arial, sans-serif;
    background-color: #f0f0f0;
    margin: 0;
    padding: 20px;
}`;
            } else if (catFileName === 'backup.sh') {
                return `#!/bin/bash
# Скрипт для резервного копирования
tar -czvf backup.tar.gz /home/user/documents`;
            } else if (catFileName === 'install.sh') {
                return `#!/bin/bash
# Скрипт установки
echo "Установка программы..."
apt-get update
apt-get install -y необходимые-пакеты`;
            } else if (catFileName === 'cpuinfo') {
                return `processor	: 0
vendor_id	: GenuineIntel
cpu family	: 6
model		: 158
model name	: Intel(R) Core(TM) i7-9700K CPU @ 3.60GHz
stepping	: 12
cpu MHz		: 3600.000
cache size	: 12288 KB`;
            } else {
                return `Содержимое файла ${catFileName}:
Это учебный файл для практики работы с терминалом.
Вы можете использовать его для выполнения различных заданий.`;
            }

        case 'free':
            return `              total        used        free      shared  buff/cache   available
Mem:        7842500     3125800     2147200       123456     2569500     4215300
Swap:       2048000          00     2048000`;

        case 'nano':
            if (args.length === 0) {
                return 'Использование: nano [имя_файла]';
            }
            openNanoEditor(args[0]);
            return `Открываем редактор nano для файла ${args[0]}...`;

        case 'chmod':
            if (args.length === 0) {
                return 'Использование: chmod [опции] [файл]';
            }
            if (args.includes('+x') && args.includes('myscript.sh')) {
                consoleState.scriptCreated = true;
                return `Скрипт myscript.sh теперь исполняемый`;
            }
            return `chmod: изменение прав для файла ${args[args.length - 1]}`;

        case './myscript.sh':
            if (consoleState.scriptCreated && consoleState.scriptContent) {
                return executeScript();
            } else {
                return 'Ошибка: скрипт не найден или не является исполняемым. Сначала создайте скрипт с помощью nano и сделайте его исполняемым с помощью chmod +x';
            }

        default:
            return `Команда "${cmd}" не распознана. Введите "help" для списка доступных команд.`;
    }
}

// Проверка выполнения команд для квестов
function checkQuestCommands() {
    const currentLevelQuests = Object.keys(consoleState.expectedCommands)
        .filter(questId => questId.startsWith(currentLevel + '.'));

    currentLevelQuests.forEach(questId => {
        const expected = consoleState.expectedCommands[questId];
        const isArray = Array.isArray(expected);

        if (isArray) {
            // Для квестов с несколькими командами
            const allCompleted = expected.every(cmd => consoleState.completedCommands[questId]?.includes(cmd));

            if (allCompleted && !gameData.quests[questId].completed) {
                updateQuest(questId, true);
            }
        } else {
            // Для квестов с одной командой
            if (consoleState.completedCommands[questId]?.includes(expected) && !gameData.quests[questId].completed) {
                updateQuest(questId, true);
            }
        }
    });
}

// Проверка завершения квеста 3.1 - проверяем фактическое существование структуры папок и файла
function checkQuest31Completion() {
    // Ищем структуру "study/projects/test/task" в любом месте файловой системы
    let structureFound = false;
    let correctStructurePath = null;

    // Рекурсивно ищем правильную структуру в файловой системе
    function findCorrectStructure(currentPath) {
        if (!consoleState.files[currentPath]) {
            return false;
        }

        // Ищем папку "study" в текущей директории
        if (consoleState.files[currentPath].includes('study')) {
            const studyPath = `${currentPath}/study`;

            // Проверяем, что это директория (есть в файловой системе)
            if (consoleState.files[studyPath]) {
                // Ищем папку "projects" внутри "study"
                if (consoleState.files[studyPath].includes('projects')) {
                    const projectsPath = `${studyPath}/projects`;

                    // Проверяем, что это директория
                    if (consoleState.files[projectsPath]) {
                        // Ищем папку "test" внутри "projects"
                        if (consoleState.files[projectsPath].includes('test')) {
                            const testPath = `${projectsPath}/test`;

                            // Проверяем, что это директория
                            if (consoleState.files[testPath]) {
                                // Ищем файл "task" внутри "test"
                                if (consoleState.files[testPath].includes('task')) {
                                    // Нашли правильную структуру!
                                    return testPath;
                                }
                            }
                        }
                    }
                }
            }
        }

        // Рекурсивно ищем в поддиректориях
        for (const item of consoleState.files[currentPath]) {
            const itemPath = `${currentPath}/${item}`;
            if (consoleState.files[itemPath]) { // Это директория
                const result = findCorrectStructure(itemPath);
                if (result) {
                    return result;
                }
            }
        }

        return false;
    }

    // Начинаем поиск с корневой директории
    const searchResult = findCorrectStructure('/home/user');

    if (searchResult) {
        structureFound = true;
        correctStructurePath = searchResult;
    }

    // Дополнительная проверка: файл "task" не должен находиться в неправильных местах
    // Проверяем, что файл не находится в других местах (например, в папке "projects" вместо "test")
    function checkWrongLocations() {
        // Ищем все вхождения файла "task" в неправильных местах
        function findWrongTaskLocations(currentPath, wrongLocations) {
            if (!consoleState.files[currentPath]) {
                return;
            }

            // Проверяем, есть ли файл "task" в текущей директории
            if (consoleState.files[currentPath].includes('task')) {
                // Проверяем, что это не правильное расположение (если мы уже нашли правильную структуру)
                if (correctStructurePath && currentPath !== correctStructurePath) {
                    wrongLocations.push(currentPath);
                }
                // Если мы еще не нашли правильную структуру, но файл "task" есть в "projects" или "study"
                else if (!correctStructurePath &&
                         (currentPath.endsWith('/study/projects') ||
                          currentPath.endsWith('/study') ||
                          currentPath === '/home/user')) {
                    wrongLocations.push(currentPath);
                }
            }

            // Рекурсивно проверяем поддиректории
            for (const item of consoleState.files[currentPath]) {
                const itemPath = `${currentPath}/${item}`;
                if (consoleState.files[itemPath]) { // Это директория
                    findWrongTaskLocations(itemPath, wrongLocations);
                }
            }

            return wrongLocations;
        }

        const wrongLocations = findWrongTaskLocations('/home/user', []);

        // Если есть неправильные расположения файла "task", квест не засчитывается
        if (wrongLocations.length > 0) {
            return false;
        }

        return true;
    }

    const structureValid = checkWrongLocations();

    // Если структура найдена и она валидна, и квест еще не завершен
    if (structureFound && structureValid && !gameData.quests['3.1'].completed) {
        // Помечаем квест как завершенный
        updateQuest('3.1', true);
    }
}

// Проверка команды на соответствие квестам
function checkCommandForQuests(command) {
    const currentLevelQuests = Object.keys(consoleState.expectedCommands)
        .filter(questId => questId.startsWith(currentLevel + '.'));

    currentLevelQuests.forEach(questId => {
        // Для квеста 3.1 используем только структурную валидацию, игнорируем проверку команд
        if (questId === '3.1') {
            // Специальная проверка для квеста 3.1 - проверяем фактическое существование структуры папок и файла
            if (currentLevel === 3 && !gameData.quests['3.1'].completed) {
                checkQuest31Completion();
            }
            return; // Не выполняем стандартную проверку команд для квеста 3.1
        }

        // Для квеста 4.1 НЕ выполняем автоматическую проверку - только при нажатии кнопки "Проверить задание"
        if (questId === '4.1') {
            return; // Не выполняем автоматическую проверку для квеста 4.1
        }

        const expected = consoleState.expectedCommands[questId];
        const isArray = Array.isArray(expected);

        // Инициализируем массив выполненных команд для квеста, если его нет
        if (!consoleState.completedCommands[questId]) {
            consoleState.completedCommands[questId] = [];
        }

        if (isArray) {
            // Для квестов с несколькими командами
            expected.forEach(expectedCmd => {
                // Обычная проверка для других команд
                if (command === expectedCmd && !consoleState.completedCommands[questId].includes(expectedCmd)) {
                    consoleState.completedCommands[questId].push(expectedCmd);

                    // Обновляем статус квеста
                    updateQuestStatusDisplay(questId);
                }
            });

            // Проверяем, все ли команды выполнены
            const allCompleted = expected.every(cmd => consoleState.completedCommands[questId].includes(cmd));
            if (allCompleted && !gameData.quests[questId].completed) {
                updateQuest(questId, true);
            }
        } else {
            // Для квестов с одной командой
            if (command === expected && !consoleState.completedCommands[questId].includes(expected)) {
                consoleState.completedCommands[questId].push(expected);

                // Обновляем статус квеста
                updateQuestStatusDisplay(questId);

                if (!gameData.quests[questId].completed) {
                    updateQuest(questId, true);
                }
            }
        }
    });
}

// Обновление статуса квеста в интерфейсе
function updateQuestStatusDisplay(questId) {
    const statusElement = document.getElementById(`${questId}-status`);
    if (statusElement) {
        const expected = consoleState.expectedCommands[questId];
        const isArray = Array.isArray(expected);

        if (isArray) {
            // Для квестов с несколькими командами
            const completedCount = consoleState.completedCommands[questId]?.length || 0;
            statusElement.textContent = `✅ Выполнено ${completedCount}/${expected.length} команд`;
        } else {
            // Для квестов с одной командой
            if (consoleState.completedCommands[questId]?.includes(expected)) {
                statusElement.textContent = `✅ Команда выполнена!`;
            }
        }
    }
}

// Обновление всех статусов квестов при загрузке
function updateAllQuestStatusDisplays() {
    Object.keys(consoleState.expectedCommands).forEach(questId => {
        updateQuestStatusDisplay(questId);
    });
}

// Очистка консоли
function clearConsole() {
    const activeLevel = document.querySelector('.quest-level.active');
    if (activeLevel) {
        const output = activeLevel.querySelector('.console-output');
        if (output) {
            output.innerHTML = `
                <div class="console-line">Добро пожаловать в учебный терминал!</div>
                <div class="console-line">Введите команды как в реальном терминале.</div>
                <div class="console-line">Доступные команды: ${consoleState.currentLevelCommands[currentLevel].join(', ')}</div>
            `;
        }
    }
    consoleState.history = [];
    consoleState.historyIndex = -1;
}

// Полный сброс консоли
function resetConsole() {
    const activeLevel = document.querySelector('.quest-level.active');
    if (activeLevel) {
        const output = activeLevel.querySelector('.console-output');
        if (output) {
            output.innerHTML = `
                <div class="console-line">🔄 Консоль полностью сброшена!</div>
                <div class="console-line">Добро пожаловать в учебный терминал!</div>
                <div class="console-line">Введите команды как в реальном терминале.</div>
                <div class="console-line">Доступные команды: ${consoleState.currentLevelCommands[currentLevel].join(', ')}</div>
            `;
        }

        // Сбрасываем состояние консоли
        consoleState.history = [];
        consoleState.historyIndex = -1;
        consoleState.completedCommands = {};
        consoleState.currentDirectory = '/home/user';
        consoleState.files = {
            '/home/user': ['documents', 'downloads', 'projects'],
            '/home/user/documents': ['notes.txt', 'report.doc'],
            '/home/user/downloads': ['software.zip', 'image.jpg'],
            '/home/user/projects': ['web', 'scripts'],
            '/home/user/projects/web': ['index.html', 'style.css'],
            '/home/user/projects/scripts': ['backup.sh', 'install.sh']
        };
        consoleState.scriptContent = '';
        consoleState.scriptCreated = false;

        // Сбрасываем прогресс по текущему квесту (если он не завершен)
        const currentLevelQuests = Object.keys(gameData.quests)
            .filter(questId => questId.startsWith(currentLevel + '.'));

        currentLevelQuests.forEach(questId => {
            if (!gameData.quests[questId].completed) {
                gameData.quests[questId].completed = false;
                updateQuestStatus(questId);
            }
        });

        // Обновляем интерфейс
        updateAllQuestStatuses();
        saveProgress();
    }
}

// Функции для шпаргалки
function toggleCheatSheet() {
    const modal = document.getElementById('cheatsheet-modal');
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'block';
    }
}

function showCommandExample(command) {
    const examples = {
        'pwd': 'Пример: <code>pwd</code><br>Результат: <code>/home/user</code>',
        'ls': 'Пример: <code>ls</code><br>Результат: <code>файл1.txt папка1 файл2.txt</code>',
        'mkdir': 'Пример: <code>mkdir моя_папка</code><br>Создаст папку с именем "моя_папка"',
        'cp': 'Пример: <code>cp файл.txt копия.txt</code><br>Скопирует файл.txt в копия.txt'
    };

    const tooltip = document.createElement('div');
    tooltip.className = 'command-tooltip';
    tooltip.innerHTML = examples[command] || 'Пример использования команды';

    document.body.appendChild(tooltip);

    const commandElement = event.target;
    const rect = commandElement.getBoundingClientRect();

    tooltip.style.top = `${rect.top - 10}px`;
    tooltip.style.left = `${rect.left}px`;

    // Remove tooltip when mouse leaves
    commandElement.addEventListener('mouseleave', function removeTooltip() {
        tooltip.remove();
        commandElement.removeEventListener('mouseleave', removeTooltip);
    }, { once: true });
}

// Developer Panel Functions
function toggleDevPanel() {
    const devPanel = document.getElementById('dev-panel');
    devPanel.classList.toggle('active');
    updateDevPanelStats();
}

// Update developer panel stats
function updateDevPanelStats() {
    document.getElementById('dev-xp').textContent = gameData.xp;
    document.getElementById('dev-level').textContent = gameData.level;
    document.getElementById('dev-rank').textContent = gameData.rank;
}

// Unlock a level
function unlockLevel(level) {
    // For level 1, it's always unlocked
    if (level === 1) return;

    // Unlock the level node
    const levelNode = document.querySelector(`.level-node[data-level="${level}"]`);
    if (levelNode) {
        levelNode.classList.remove('locked');
        levelNode.classList.add('active');
        levelNode.querySelector('.node-status').textContent = 'Доступно';
        levelNode.style.cursor = 'pointer';
        levelNode.style.opacity = '1';
    }

    // Unlock all quests in this level
    const levelQuests = Object.keys(gameData.quests)
        .filter(questId => questId.startsWith(level + '.'));

    levelQuests.forEach(questId => {
        gameData.quests[questId].unlocked = true;
        updateQuestStatus(questId);
    });

    // Update UI
    updateUI();
    updateMap();
    updateDevPanelStats();
    saveProgress();
}

// Lock a level
function lockLevel(level) {
    // Level 1 cannot be locked
    if (level === 1) return;

    // Check if any quests in this level are completed
    const levelQuests = Object.keys(gameData.quests)
        .filter(questId => questId.startsWith(level + '.'));

    const anyCompleted = levelQuests.some(questId => gameData.quests[questId].completed);

    // If any quests are completed, don't allow locking
    if (anyCompleted) {
        return;
    }

    // Lock the level node
    const levelNode = document.querySelector(`.level-node[data-level="${level}"]`);
    if (levelNode) {
        levelNode.classList.remove('active');
        levelNode.classList.add('locked');
        levelNode.querySelector('.node-status').textContent = 'Заблокировано';
        levelNode.style.cursor = 'not-allowed';
        levelNode.style.opacity = '0.7';
    }

    // Lock all quests in this level
    levelQuests.forEach(questId => {
        gameData.quests[questId].unlocked = false;
        updateQuestStatus(questId);
    });

    // Update UI
    updateUI();
    updateMap();
    updateDevPanelStats();
    saveProgress();
}

// Unlock a quest
function unlockQuest(questId) {
    if (gameData.quests[questId]) {
        gameData.quests[questId].unlocked = true;
        updateQuestStatus(questId);
        updateUI();
        updateMap();
        updateDevPanelStats();
        saveProgress();
    }
}

// Lock a quest
function lockQuest(questId) {
    if (gameData.quests[questId]) {
        // Don't allow locking if quest is completed
        if (gameData.quests[questId].completed) {
            return;
        }

        gameData.quests[questId].unlocked = false;
        updateQuestStatus(questId);
        updateUI();
        updateMap();
        updateDevPanelStats();
        saveProgress();
    }
}

// Complete a quest
function completeQuest(questId) {
    if (gameData.quests[questId]) {
        // Don't allow completing if quest is locked
        if (!gameData.quests[questId].unlocked) {
            return;
        }

        // Don't allow completing if already completed
        if (gameData.quests[questId].completed) {
            return;
        }

        gameData.quests[questId].completed = true;
        updateQuest(questId, true);
        updateUI();
        updateMap();
        updateDevPanelStats();
        saveProgress();
    }
}

// Complete all quests
function completeAllQuests() {
    Object.keys(gameData.quests).forEach(questId => {
        if (!gameData.quests[questId].completed && gameData.quests[questId].unlocked) {
            gameData.quests[questId].completed = true;
        }
    });

    // Recalculate everything
    calculateXP();
    updateLevel();
    checkLevelUnlocks();
    checkAchievements();
    updateAllQuestStatuses();
    updateUI();
    updateMap();
    updateDevPanelStats();
    saveProgress();

}

// Unlock all levels
function unlockAllLevels() {
    // Unlock all levels
    for (let level = 2; level <= 3; level++) {
        const levelNode = document.querySelector(`.level-node[data-level="${level}"]`);
        if (levelNode) {
            levelNode.classList.remove('locked');
            levelNode.classList.add('active');
            levelNode.querySelector('.node-status').textContent = 'Доступно';
            levelNode.style.cursor = 'pointer';
            levelNode.style.opacity = '1';
        }
    }

    // Unlock all quests
    Object.keys(gameData.quests).forEach(questId => {
        gameData.quests[questId].unlocked = true;
    });

    // Update everything
    updateAllQuestStatuses();
    updateUI();
    updateMap();
    updateDevPanelStats();
    saveProgress();

}

// Reset all progress
function resetAllProgress() {
    if (confirm('Вы уверены, что хотите сбросить весь прогресс? Это удалит все завершенные квесты и статистику.')) {
        localStorage.removeItem('sysadminGameProgress');
        location.reload();
    }
}

// Add XP
function addXP(amount) {
    gameData.xp += amount;
    updateLevel();
    checkLevelUnlocks();
    checkAchievements();
    updateUI();
    updateMap();
    updateDevPanelStats();
    saveProgress();

}

// Set max level
function setMaxLevel() {
    gameData.xp = 1000; // More than enough for max level
    updateLevel();
    checkLevelUnlocks();
    checkAchievements();
    updateUI();
    updateMap();
    updateDevPanelStats();
    saveProgress();

}

// Quest requirements data
const questRequirements = {
    '1.1': {
        title: 'Квест 1.1: Знакомство с рабочим местом',
        description: 'Пользователь должен найти свой IP-адрес с помощью команды ipconfig.',
        requirements: [
            '1. Пользователь должен ввести команду: <code>ipconfig</code>',
            '2. Система должна распознать команду и показать вывод с IP-адресом',
            '3. Квест автоматически завершается при правильном вводе команды',
            '4. Пользователь получает 10 XP за завершение'
        ],
        expectedCommands: ['ipconfig'],
        completionCriteria: 'Квест считается выполненным, когда пользователь вводит команду ipconfig в терминале.'
    },
    '1.2': {
        title: 'Квест 1.2: Поздороваться с соседом',
        description: 'Пользователь должен проверить связь с другим компьютером с помощью команды ping.',
        requirements: [
            '1. Пользователь должен ввести команду: <code>ping 192.168.1.20</code>',
            '2. Система должна показать успешные ответы от целевого IP',
            '3. Квест автоматически завершается при правильном вводе команды',
            '4. Пользователь получает 15 XP за завершение'
        ],
        expectedCommands: ['ping 192.168.1.20'],
        completionCriteria: 'Квест считается выполненным, когда пользователь вводит команду ping 192.168.1.20 в терминале.'
    },
    '2.1': {
        title: 'Квест 2.1: Найти шлюз и выйти "в город"',
        description: 'Пользователь должен определить IP шлюза и проверить связь с ним.',
        requirements: [
            '1. Пользователь должен ввести команду: <code>ipconfig</code> для поиска шлюза',
            '2. Пользователь должен найти строку "Default Gateway" в выводе',
            '3. Пользователь должен пропинговать шлюз: <code>ping [IP_шлюза]</code>',
            '4. Квест автоматически завершается при выполнении обеих команд',
            '5. Пользователь получает 15 XP за завершение'
        ],
        expectedCommands: ['ipconfig', 'ping 192.168.1.1'],
        completionCriteria: 'Квест считается выполненным, когда пользователь вводит обе команды: ipconfig и ping с IP шлюза.'
    },
    '2.2': {
        title: 'Квест 2.2: Найти DNS-сервер',
        description: 'Пользователь должен узнать IP-адрес сайта через DNS.',
        requirements: [
            '1. Пользователь должен ввести команду: <code>nslookup google.com</code>',
            '2. Система должна показать IP-адрес серверов Google',
            '3. Пользователь должен идентифицировать строку "Address" в выводе',
            '4. Квест автоматически завершается при правильном вводе команды',
            '5. Пользователь получает 10 XP за завершение'
        ],
        expectedCommands: ['nslookup google.com'],
        completionCriteria: 'Квест считается выполненным, когда пользователь вводит команду nslookup google.com в терминале.'
    },
    '3.1': {
        title: 'Квест 3.1: Работа с файлами и каталогами',
        description: 'Создать структуру папок "учеба/проекты/тест" и добавить файл "задание"',
        requirements: [
            '1. Пользователь должен создать структуру папок: <code>учеба/проекты/тест</code>',
            '2. Пользователь должен добавить файл "задание" в папку тест',
            '3. Квест завершается ТОЛЬКО при наличии правильной структуры папок и файла в правильном месте',
            '4. Квест НЕ засчитывается если файл создан в неправильной папке (например, в "проекты" вместо "тест")',
            '5. Пользователь получает 20 XP за завершение'
        ],
        expectedCommands: [
            'mkdir учеба',
            'cd учеба',
            'mkdir проекты',
            'cd проекты',
            'mkdir тест',
            'cd тест',
            'touch задание'
        ],
        completionCriteria: 'Квест считается выполненным ТОЛЬКО когда существует структура папок "учеба/проекты/тест" и файл "задание" находится именно в папке тест. Квест НЕ засчитывается если файл находится в неправильном месте.'
    },
    '3.2': {
        title: 'Квест 3.2: Поиск и процессы',
        description: 'Пользователь должен научиться искать файлы и управлять процессами.',
        requirements: [
            '1. Пользователь должен найти все файлы с расширением .txt: <code>find /home -name "*.txt"</code>',
            '2. Пользователь должен посмотреть информацию о процессоре: <code>cat [нужный нам файл]</code>',
            '3. Пользователь должен посмотреть информацию о памяти: <code>free -h</code>',
            '4. Квест требует выполнения всех трех команд',
            '5. Пользователь получает 20 XP за завершение'
        ],
        expectedCommands: [
            'find /home -name "*.txt"',
            'cat /proc/cpuinfo',
            'free -h'
        ],
        completionCriteria: 'Квест считается выполненным, когда пользователь выполняет все три команды для поиска файлов, просмотра информации о процессоре и памяти.'
    }
};

// Show quest requirements
function showQuestRequirements(questId) {
    const requirements = questRequirements[questId];
    if (requirements) {
        const modal = document.getElementById('quest-requirements-modal');
        const title = document.getElementById('requirements-title');
        const content = document.getElementById('requirements-content');

        title.textContent = requirements.title;
        content.innerHTML = `
            <p><strong>Описание:</strong> ${requirements.description}</p>
            <p><strong>Требования:</strong></p>
            <ul>
                ${requirements.requirements.map(req => `<li>${req}</li>`).join('')}
            </ul>
            <p><strong>Ожидаемые команды:</strong></p>
            <ul>
                ${requirements.expectedCommands.map(cmd => `<li><code>${cmd}</code></li>`).join('')}
            </ul>
            <p><strong>Критерий завершения:</strong> ${requirements.completionCriteria}</p>
        `;

        modal.style.display = 'block';
    }
}

// Close quest requirements modal
function closeQuestRequirements() {
    const modal = document.getElementById('quest-requirements-modal');
    modal.style.display = 'none';
}

// Функция для тестирования анимации
function testXPCircleAnimation() {
    // Создаем тестовый контейнер для анимации
    const testContainer = document.createElement('div');
    testContainer.style.position = 'fixed';
    testContainer.style.bottom = '100px';
    testContainer.style.right = '20px';
    testContainer.style.width = '300px';
    testContainer.style.height = '200px';
    testContainer.style.background = 'rgba(255,255,255,0.1)';
    testContainer.style.border = '2px dashed #f6e05e';
    testContainer.style.zIndex = '10000';
    testContainer.style.borderRadius = '10px';
    testContainer.style.display = 'flex';
    testContainer.style.alignItems = 'center';
    testContainer.style.justifyContent = 'center';
    testContainer.style.flexDirection = 'column';

    // Добавляем заголовок
    const title = document.createElement('div');
    title.textContent = 'Тест анимации желтых кружков (дуга)';
    title.style.color = '#f6e05e';
    title.style.marginBottom = '10px';
    title.style.fontWeight = 'bold';
    testContainer.appendChild(title);

    // Создаем контейнер для анимации
    const xpFlying = document.createElement('div');
    xpFlying.style.position = 'relative';
    xpFlying.style.width = '100%';
    xpFlying.style.height = '150px';
    xpFlying.style.background = 'rgba(0,0,0,0.2)';
    xpFlying.style.borderRadius = '5px';
    testContainer.appendChild(xpFlying);

    // Создаем стартовую точку (имитация задания)
    const startPoint = document.createElement('div');
    startPoint.style.position = 'absolute';
    startPoint.style.left = '50%';
    startPoint.style.top = '50%';
    startPoint.style.width = '30px';
    startPoint.style.height = '30px';
    startPoint.style.background = '#48bb78';
    startPoint.style.borderRadius = '50%';
    startPoint.style.transform = 'translate(-50%, -50%)';
    startPoint.style.zIndex = '10001';
    xpFlying.appendChild(startPoint);

    // Создаем целевую точку (центр шкалы уровня)
    const targetPoint = document.createElement('div');
    targetPoint.style.position = 'absolute';
    targetPoint.style.left = '50%';
    targetPoint.style.top = '20%';
    targetPoint.style.width = '20px';
    targetPoint.style.height = '20px';
    targetPoint.style.background = '#667eea';
    targetPoint.style.borderRadius = '50%';
    targetPoint.style.transform = 'translate(-50%, -50%)';
    targetPoint.style.zIndex = '10001';
    xpFlying.appendChild(targetPoint);

    // Добавляем описание
    const description = document.createElement('div');
    description.textContent = 'Кружки должны лететь по дуге к центру';
    description.style.color = '#f6e05e';
    description.style.marginTop = '10px';
    description.style.fontSize = '0.8em';
    testContainer.appendChild(description);

    // Создаем 3 тестовых кружка
    for (let i = 0; i < 3; i++) {
        const circleElement = document.createElement('div');
        circleElement.className = 'xp-circle';
        circleElement.style.left = '50%';
        circleElement.style.top = '50%';

        // Случайная траектория
        const isLeft = Math.random() > 0.5;
        circleElement.classList.add(isLeft ? 'circle-left' : 'circle-right');

        // Задержка для каждого кружочка
        circleElement.style.animationDelay = `${i * 0.3}s`;

        xpFlying.appendChild(circleElement);
    }

    document.body.appendChild(testContainer);

    // Удаляем тест через 3 секунды
    setTimeout(() => {
        testContainer.remove();
    }, 3000);
}

// Функция для показа модального окна оценки
function showRatingModal() {
    // Закрываем модальное окно завершения уровня
    closeLevelCompletionModal();

    // Показываем модальное окно оценки
    const ratingModal = document.getElementById('rating-modal');
    ratingModal.style.display = 'block';

    // Инициализируем звезды с помощью новой функции
    initStarRating();

    // Сбрасываем состояние к начальному
    const feedback = document.getElementById('rating-feedback');
    feedback.innerHTML = `
        <p>Вы оценили игру на <span id="selected-rating">0</span> звёзд!</p>
    `;
    feedback.style.display = 'none';

    const submitBtn = document.getElementById('submit-rating-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправить оценку';

    const continueBtn = document.querySelector('.continue-btn');
    continueBtn.style.display = 'none';
}

// Функция для отправки оценки
function submitRating() {
    const rating = parseInt(document.getElementById('selected-rating').textContent);
    const submitBtn = document.getElementById('submit-rating-btn');
    const feedback = document.getElementById('rating-feedback');
    const stars = document.querySelectorAll('.star');

    // Отключаем кнопку, чтобы предотвратить многократное нажатие
    submitBtn.disabled = true;
    submitBtn.textContent = 'Спасибо за оценку!';

    // Сохраняем оценку в localStorage
    localStorage.setItem('gameRating', rating);

    // Показываем сообщение об успехе
    feedback.innerHTML = `
        <p>Спасибо за вашу оценку!</p>
        <p>Вы поставили игре <span id="selected-rating" style="color: #f6e05e; font-size: 1.2em; font-weight: bold;">${rating}</span> из 10 звёзд!</p>
        <p>Ваш отзыв очень важен для нас!</p>
    `;
}

// Функция для сброса модального окна оценки
function resetRatingModal() {
    const stars = document.querySelectorAll('.star');
    const feedback = document.getElementById('rating-feedback');
    const submitBtn = document.getElementById('submit-rating-btn');

    // Сбрасываем выбранные звезды
    stars.forEach(s => s.classList.remove('active'));

    // Сбрасываем выбранный рейтинг
    document.getElementById('selected-rating').textContent = '0';

    // Сбрасываем обратную связь к начальному состоянию
    feedback.innerHTML = `
        <p>Вы оценили игру на <span id="selected-rating">0</span> звёзд!</p>
    `;
    feedback.style.display = 'none';

    // Отключаем кнопку отправки
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправить оценку';

    // Скрываем кнопку продолжения
    const continueBtn = document.querySelector('.continue-btn');
    continueBtn.style.display = 'none';

    // Переинициализируем обработчики событий для звезд
    initStarRating();
}

// Функция для инициализации рейтинговых звезд
function initStarRating() {
    const stars = document.querySelectorAll('.star');
    let selectedRating = 0;

    stars.forEach(star => {
        // Удаляем старые обработчики событий
        star.removeEventListener('click', handleStarClick);

        // Добавляем новые обработчики
        star.addEventListener('click', handleStarClick);
    });

    function handleStarClick() {
        const value = parseInt(this.getAttribute('data-value'));

        // Убираем активный класс со всех звезд
        stars.forEach(s => s.classList.remove('active'));

        // Добавляем активный класс к выбранным звездам
        for (let i = 0; i < value; i++) {
            stars[i].classList.add('active');
        }

        // Обновляем выбранный рейтинг
        selectedRating = value;
        document.getElementById('selected-rating').textContent = value;

        // Показываем обратную связь
        const feedback = document.getElementById('rating-feedback');
        feedback.style.display = 'block';

        // Активируем кнопку отправки
        const submitBtn = document.getElementById('submit-rating-btn');
        submitBtn.disabled = false;
    }
}
// Функция для показа модального окна оценки
function showRatingModal() {
    // Закрываем модальное окно завершения уровня
    closeLevelCompletionModal();

    // Показываем модальное окно оценки
    const ratingModal = document.getElementById('rating-modal');
    ratingModal.style.display = 'block';

    // Инициализируем звезды
    const stars = document.querySelectorAll('.star');
    let selectedRating = 0;

    stars.forEach(star => {
        star.addEventListener('click', function() {
            const value = parseInt(this.getAttribute('data-value'));

            // Убираем активный класс со всех звезд
            stars.forEach(s => s.classList.remove('active'));

            // Добавляем активный класс к выбранным звездам
            for (let i = 0; i < value; i++) {
                stars[i].classList.add('active');
            }

            // Обновляем выбранный рейтинг
            selectedRating = value;
            document.getElementById('selected-rating').textContent = value;

            // Показываем обратную связь
            const feedback = document.getElementById('rating-feedback');
            feedback.style.display = 'block';

            // Активируем кнопку отправки
            const submitBtn = document.getElementById('submit-rating-btn');
            submitBtn.disabled = false;
        });
    });
}

// Функция для закрытия модального окна оценки
function closeRatingModal() {
    const ratingModal = document.getElementById('rating-modal');
    ratingModal.style.display = 'none';

    // Возвращаемся на карту уровней
    showSection('map');
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initGame();
    initConsole();
});

// Theme toggle functionality
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // Update button icon
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    }
}

// Nano Editor Functions
function openNanoEditor(filename) {
    // Create modal container if it doesn't exist
    let nanoModal = document.getElementById('nano-modal');
    if (!nanoModal) {
        nanoModal = document.createElement('div');
        nanoModal.id = 'nano-modal';
        nanoModal.className = 'modal';
        nanoModal.style.zIndex = '2000';

        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content nano-editor';
        modalContent.style.width = '1600px';
        modalContent.style.height = '900px';
        modalContent.style.maxWidth = '1600px';
        modalContent.style.maxHeight = '900px';
        modalContent.style.overflow = 'hidden';
        modalContent.style.display = 'flex';
        modalContent.style.flexDirection = 'column';

        // Create header
        const header = document.createElement('div');
        header.style.background = '#1e1e1e';
        header.style.color = '#48bb78';
        header.style.padding = '10px 15px';
        header.style.fontFamily = "'Courier New', monospace";
        header.style.borderBottom = '1px solid #333';
        header.textContent = 'GNU nano 6.2          ' + filename + '          Modified';

        // Create editor area
        const editorArea = document.createElement('div');
        editorArea.style.flexGrow = '1';
        editorArea.style.overflow = 'auto';
        editorArea.style.background = '#252525';
        editorArea.style.color = '#e0e0e0';
        editorArea.style.padding = '15px';
        editorArea.style.fontFamily = "'Courier New', monospace";
        editorArea.style.whiteSpace = 'pre';
        editorArea.style.lineHeight = '1.4';

        // Create textarea for editing
        const textarea = document.createElement('textarea');
        textarea.id = 'nano-textarea';
        textarea.style.width = '100%';
        textarea.style.height = '100%';
        textarea.style.background = 'transparent';
        textarea.style.color = '#e0e0e0';
        textarea.style.border = 'none';
        textarea.style.outline = 'none';
        textarea.style.resize = 'none';
        textarea.style.fontFamily = "'Courier New', monospace";
        textarea.style.fontSize = '14px';
        textarea.style.lineHeight = '1.4';

        // Start with empty content - user should write their own script
        textarea.value = '';

        // Create footer with commands (empty as requested)
        const footer = document.createElement('div');
        footer.style.background = '#1e1e1e';
        footer.style.color = '#e0e0e0';
        footer.style.padding = '10px 15px';
        footer.style.fontFamily = "'Courier New', monospace";
        footer.style.borderTop = '1px solid #333';
        footer.style.display = 'flex';
        footer.style.justifyContent = 'space-between';

        const footerLeft = document.createElement('div');
        footerLeft.textContent = '^G Помощь      ^O Сохранить      ^X Выйти';

        const footerRight = document.createElement('div');
        footerRight.textContent = '';

        footer.appendChild(footerLeft);
        footer.appendChild(footerRight);

        // Create save button (green)
        const saveButton = document.createElement('button');
        saveButton.id = 'nano-save-btn';
        saveButton.style.background = '#48bb78';
        saveButton.style.color = 'white';
        saveButton.style.border = 'none';
        saveButton.style.padding = '12px 25px';
        saveButton.style.borderRadius = '8px';
        saveButton.style.cursor = 'pointer';
        saveButton.style.fontSize = '1em';
        saveButton.style.fontWeight = 'bold';
        saveButton.style.marginTop = '15px';
        saveButton.style.alignSelf = 'flex-end';
        saveButton.textContent = 'Сохранить и выйти';

        saveButton.onclick = function() {
            saveNanoContent(filename, textarea.value);
        };

        // Assemble modal content
        modalContent.appendChild(header);
        editorArea.appendChild(textarea);
        modalContent.appendChild(editorArea);
        modalContent.appendChild(footer);
        modalContent.appendChild(saveButton);

        nanoModal.appendChild(modalContent);
        document.body.appendChild(nanoModal);

        // Focus on textarea
        textarea.focus();
    }

    // Show the modal
    nanoModal.style.display = 'block';

    // Add close functionality for ESC key
    document.addEventListener('keydown', function nanoKeyHandler(e) {
        if (e.key === 'Escape') {
            document.removeEventListener('keydown', nanoKeyHandler);
            nanoModal.style.display = 'none';
        }
    });
}

function saveNanoContent(filename, content) {
    consoleState.scriptContent = content;

    // Mark the command as completed
    if (!consoleState.completedCommands['4.1']) {
        consoleState.completedCommands['4.1'] = [];
    }
    if (!consoleState.completedCommands['4.1'].includes('nano myscript.sh')) {
        consoleState.completedCommands['4.1'].push('nano myscript.sh');
    }

    // Automatically mark script as created for quest 4.1
    if (filename === 'myscript.sh') {
        consoleState.scriptCreated = true;
    }

    // Close the nano editor
    const nanoModal = document.getElementById('nano-modal');
    if (nanoModal) {
        nanoModal.style.display = 'none';
    }

    // Show success message in console
    const activeLevel = document.querySelector('.quest-level.active');
    if (activeLevel) {
        const output = activeLevel.querySelector('.console-output');
        if (output) {
            const saveLine = document.createElement('div');
            saveLine.className = 'console-line success-line';
            saveLine.textContent = `Файл ${filename} сохранен успешно.`;
            output.appendChild(saveLine);
            output.scrollTop = output.scrollHeight;
        }
    }

    // Update quest status
    updateQuestStatusDisplay('4.1');
}

function executeScript() {
    // Validate the script content first
    const scriptContent = consoleState.scriptContent || '';

    // More flexible validation - check for basic script structure
    const hasShebang = scriptContent.includes('#!/bin/bash') || scriptContent.includes('#!/bin/sh') || scriptContent.includes('#!/usr/bin/env bash');
    const hasDate = scriptContent.includes('date');
    const hasWhoami = scriptContent.includes('whoami');
    const hasSomeCommand = scriptContent.includes('pwd') || scriptContent.includes('ls') || scriptContent.includes('echo') || scriptContent.includes('hostname');
    const hasMinimumLength = scriptContent.length > 30; // More lenient minimum length

    // Check if the script has the basic structure
    const hasBasicStructure = hasShebang && hasDate && hasWhoami && hasSomeCommand && hasMinimumLength;

    if (!hasBasicStructure) {
        // Script is invalid - return helpful error message
        let errorMessage = '🔧 Подсказка: Ваш скрипт должен содержать основные элементы для системного мониторинга.\n';
        errorMessage += 'Попробуйте добавить:\n';

        if (!hasShebang) {
            errorMessage += '  - Строку #!/bin/bash в начале скрипта\n';
        }
        if (!hasDate) {
            errorMessage += '  - Команду date для вывода текущей даты и времени\n';
        }
        if (!hasWhoami) {
            errorMessage += '  - Команду whoami для вывода имени пользователя\n';
        }
        if (!hasSomeCommand) {
            errorMessage += '  - Какие-то команды для мониторинга (pwd, ls, echo, hostname и т.д.)\n';
        }
        if (!hasMinimumLength) {
            errorMessage += '  - Больше контента (скрипт слишком короткий)\n';
        }

        errorMessage += '\n💡 Совет: Вы можете использовать пример кода из задания или создать свой вариант!';
        errorMessage += '\n📝 Пример: echo "=== Мой системный монитор ==="; echo "Дата: $(date)"; echo "Пользователь: $(whoami)"';

        return errorMessage;
    }

    // Script is valid - return the expected output with more flexible username
    const scriptOutput = `=== Мой системный монитор ===
Дата и время: 13:21
Пользователь: Лучший_Сисадмин
Текущая папка: /home/user
Содержимое папки:
total 20
drwxr-xr-x  2 user user 4096 Jan 1 12:00 .
drwxr-xr-x 10 user user 4096 Jan 1 10:00 ..
-rw-r--r--  1 user user   34 Jan 1 12:00 documents
-rw-r--r--  1 user user   34 Jan 1 12:00 downloads
-rw-r--r--  1 user   34 Jan 1 12:00 projects
-rwxr-xr-x  1 user user   200 Jan 1 12:00 myscript.sh`;

    // Mark the script execution command as completed
    if (!consoleState.completedCommands['4.1']) {
        consoleState.completedCommands['4.1'] = [];
    }
    if (!consoleState.completedCommands['4.1'].includes('./myscript.sh')) {
        consoleState.completedCommands['4.1'].push('./myscript.sh');
    }

    // Check if both commands are completed - but DON'T automatically complete the quest
    const bothCommandsCompleted = consoleState.completedCommands['4.1'].includes('nano myscript.sh') &&
                                consoleState.completedCommands['4.1'].includes('./myscript.sh');

    // Only enable the input field and check button - DON'T mark quest as completed yet
    if (bothCommandsCompleted && !gameData.quests['4.1'].completed) {
        // Enable the username input field and check button
        const usernameInput = document.getElementById('ip-input-4.1');
        const checkButton = document.getElementById('check-btn-4.1');
        if (usernameInput && checkButton) {
            usernameInput.disabled = false;
            checkButton.disabled = false;
        }
    }

    // Update quest status display but don't complete the quest
    updateQuestStatusDisplay('4.1');

    return scriptOutput;
}

// Redesigned function to check the script task - simplified validation
function checkScriptTask(questId) {
    const validationResult = document.getElementById('validation-4.1');

    if (validationResult) {
        // Check if both required commands have been completed
        const nanoCompleted = consoleState.completedCommands['4.1']?.includes('nano myscript.sh');
        const scriptExecuted = consoleState.completedCommands['4.1']?.includes('./myscript.sh');

        if (nanoCompleted && scriptExecuted) {
            // Get the username input value
            const usernameInput = document.getElementById('ip-input-4.1');
            const enteredUsername = usernameInput ? usernameInput.value.trim() : '';

            // Check if the entered username is exactly "Лучший_Сисадмин"
            if (enteredUsername === "Лучший_Сисадмин") {
                validationResult.textContent = '✅ Отлично! Квест завершен.';
                validationResult.style.color = '#48bb78';
                validationResult.style.fontWeight = 'bold';

                // Mark quest as completed if not already
                if (!gameData.quests[questId].completed) {
                    updateQuest(questId, true);

                    // Skip level 4 completion congratulations and go directly to final screen
                    showFinalScreen();
                }
            } else {
                validationResult.textContent = '❌ Пожалуйста, введите правильное имя пользователя из вывода скрипта.';
                validationResult.style.color = '#e53e3e';
                validationResult.style.fontWeight = 'bold';
            }
        } else {
            validationResult.textContent = '❌ Пожалуйста, выполните все шаги задания: создайте скрипт и запустите его.';
            validationResult.style.color = '#e53e3e';
            validationResult.style.fontWeight = 'bold';
        }
    }
}

// Load saved theme on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Update button icon to match current theme
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
});

// Final screen function
function showFinalScreen() {
    // Create modal container if it doesn't exist
    let finalModal = document.getElementById('final-screen-modal');
    if (!finalModal) {
        finalModal = document.createElement('div');
        finalModal.id = 'final-screen-modal';
        finalModal.className = 'modal';
        finalModal.style.zIndex = '3000';

        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content final-screen-content';
        modalContent.style.width = '800px';
        modalContent.style.maxWidth = '90%';
        modalContent.style.textAlign = 'center';
        modalContent.style.padding = '40px';
        modalContent.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        modalContent.style.color = 'white';
        modalContent.style.borderRadius = '15px';
        modalContent.style.boxShadow = '0 20px 60px rgba(0,0,0,0.3)';

        // Create close button
        const closeButton = document.createElement('button');
        closeButton.className = 'close-final-btn';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '15px';
        closeButton.style.right = '15px';
        closeButton.style.background = 'none';
        closeButton.style.border = 'none';
        closeButton.style.color = 'white';
        closeButton.style.fontSize = '24px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.width = '30px';
        closeButton.style.height = '30px';
        closeButton.style.display = 'flex';
        closeButton.style.alignItems = 'center';
        closeButton.style.justifyContent = 'center';
        closeButton.style.borderRadius = '50%';
        closeButton.style.backgroundColor = 'rgba(255,255,255,0.2)';
        closeButton.textContent = '×';
        closeButton.onclick = function() {
            finalModal.style.display = 'none';
        };

        // Create title
        const title = document.createElement('h1');
        title.style.fontSize = '2.5em';
        title.style.marginBottom = '20px';
        title.style.color = '#fff';
        title.style.textShadow = '2px 2px 4px rgba(0,0,0,0.2)';
        title.innerHTML = '🎉 ПОЗДРАВЛЯЕМ! 🎉';

        // Create subtitle
        const subtitle = document.createElement('h2');
        subtitle.style.fontSize = '1.5em';
        subtitle.style.marginBottom = '30px';
        subtitle.style.color = '#fff';
        subtitle.style.fontWeight = 'normal';
        subtitle.textContent = 'Вы завершили игру!';

        // Create achievement message
        const achievement = document.createElement('div');
        achievement.style.fontSize = '1.2em';
        achievement.style.marginBottom = '30px';
        achievement.style.padding = '20px';
        achievement.style.backgroundColor = 'rgba(255,255,255,0.1)';
        achievement.style.borderRadius = '10px';
        achievement.style.border = '2px solid rgba(255,255,255,0.3)';
        achievement.innerHTML = `
            <p>🏆 <strong>ВЫ СТАЛИ ЛЕГЕНДАРНЫМ СИСТЕМНЫМ АДМИНИСТРАТОРОМ!</strong> 🏆</p>
            <p style="margin-top: 15px;">Вы успешно прошли все уровни и доказали свои навыки!</p>
        `;

        // Create stats
        const stats = document.createElement('div');
        stats.style.marginBottom = '30px';
        stats.style.textAlign = 'left';
        stats.style.maxWidth = '400px';
        stats.style.margin = '0 auto 30px';
        stats.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 5px;">
                <span>🎮 Уровней пройдено:</span>
                <span style="font-weight: bold;">${gameData.level}/4</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 5px;">
                <span>⭐ XP получено:</span>
                <span style="font-weight: bold;">${gameData.xp}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 5px;">
                <span>🏅 Текущее звание:</span>
                <span style="font-weight: bold;">${gameData.rank}</span>
            </div>
        `;

        // Create message
        const message = document.createElement('div');
        message.style.marginBottom = '30px';
        message.style.fontSize = '1.1em';
        message.style.lineHeight = '1.6';
        message.innerHTML = `
            <p>🎯 Вы доказали, что являетесь настоящим профессионалом в области системного администрирования!</p>
            <p>💻 Ваши навыки работы с терминалом, сетевыми командами и системным мониторингом достигли высшего уровня.</p>
        `;

        // Create restart button
        const restartButton = document.createElement('button');
        restartButton.style.background = 'linear-gradient(135deg, #48bb78 0%, #48bb78 100%)';
        restartButton.style.color = 'white';
        restartButton.style.border = 'none';
        restartButton.style.padding = '15px 30px';
        restartButton.style.fontSize = '1.1em';
        restartButton.style.fontWeight = 'bold';
        restartButton.style.borderRadius = '8px';
        restartButton.style.cursor = 'pointer';
        restartButton.style.transition = 'all 0.3s ease';
        restartButton.style.boxShadow = '0 4px 12px rgba(72, 187, 120, 0.3)';
        restartButton.textContent = '🔄 Начать игру заново';
        restartButton.onclick = function() {
            if (confirm('Вы уверены, что хотите начать игру заново? Ваш прогресс будет сброшен.')) {
                resetProgress();
            }
        };

        // Add hover effect
        restartButton.onmouseover = function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 6px 16px rgba(72, 187, 120, 0.4)';
        };
        restartButton.onmouseout = function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 12px rgba(72, 187, 120, 0.3)';
        };

        // Assemble modal content
        modalContent.appendChild(closeButton);
        modalContent.appendChild(title);
        modalContent.appendChild(subtitle);
        modalContent.appendChild(achievement);
        modalContent.appendChild(stats);
        modalContent.appendChild(message);
        modalContent.appendChild(restartButton);

        finalModal.appendChild(modalContent);
        document.body.appendChild(finalModal);
    }

    // Show the modal
    finalModal.style.display = 'block';

    // Add close functionality for ESC key
    document.addEventListener('keydown', function finalKeyHandler(e) {
        if (e.key === 'Escape') {
            document.removeEventListener('keydown', finalKeyHandler);
            finalModal.style.display = 'none';
        }
    });
}
