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
        '3.1': { completed: false, xp: 15, unlocked: false },
        '3.2': { completed: false, xp: 15, unlocked: false }
    }
};

// Уровни и звания
const levels = [
    { level: 1, xpNeeded: 0, rank: "Стажер" },
    { level: 2, xpNeeded: 25, rank: "Сетевой детектив" },
    { level: 3, xpNeeded: 50, rank: "Файловый мастер" }
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

// Инициализация игры
function initGame() {
    loadProgress();
    updateUI();
    showSection('theory');
    updateAllQuestStatuses();
    updateMap();
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
    if (levelNode.classList.contains('locked')) {
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
        3: "Уровень 3: Файловый мастер"
    };
    document.getElementById('current-level-title').textContent = levelTitles[levelNumber];
    
    // Переходим к разделу квестов
    showSection('quests');
    updateLevelProgress();
    
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
            
            if (prevLevelCompleted) {
                node.classList.add('active');
                node.querySelector('.node-status').textContent = 'Доступно';
            } else {
                node.classList.add('locked');
                node.querySelector('.node-status').textContent = 'Заблокировано';
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
        
        // Пересчитываем XP
        calculateXP();
        
        // Обновляем интерфейс
        updateQuestStatus(questId);
        updateUI();
        checkLevelUnlocks();
        checkAchievements();
        saveProgress();
        
        // Обновляем прогресс уровня
        updateLevelProgress();
        updateMap();
        
        // Показываем ачивку, если квест завершен
        if (completed) {
            showAchievement(`Квест завершен! +${gameData.quests[questId].xp} XP`);
            
        }
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
        showAchievement(`Новый уровень! ${newLevel} - ${newRank}`);
        
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
            statusElement.className = 'quest-status status-locked';
        } else if (quest.completed) {
            statusElement.textContent = '🟢 Завершено';
            statusElement.className = 'quest-status status-completed';
        } else {
            statusElement.textContent = '🟡 Не начато';
            statusElement.className = 'quest-status status-in-progress';
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
        if (nextLevel <= 3) {
            showLevel(nextLevel);
        } else {
            // Если это был последний уровень, показываем поздравление
            showAchievement(`🎉 Поздравляем! Вы завершили все уровни!`);
        }
    } else {
        // Если уровень не завершен, показываем сообщение
        showAchievement(`🔒 Чтобы перейти на следующий уровень, завершите все квесты текущего уровня.`);
    }
}

// Проверка и разблокировка достижений
function checkAchievements() {
    // Первый квест
    if (gameData.quests['1.1'].completed && !achievements.firstQuest.unlocked) {
        achievements.firstQuest.unlocked = true;
        showAchievement(`🏆 ${achievements.firstQuest.name}: ${achievements.firstQuest.desc}`);
    }
    
    // Сетевой мастер
    const networkQuests = ['1.1', '1.2', '2.1', '2.2'];
    if (networkQuests.every(questId => gameData.quests[questId].completed) && !achievements.networkMaster.unlocked) {
        achievements.networkMaster.unlocked = true;
        showAchievement(`🏆 ${achievements.networkMaster.name}: ${achievements.networkMaster.desc}`);
    }
    
    // Файловый мастер
    const fileQuests = ['3.1', '3.2'];
    if (fileQuests.every(questId => gameData.quests[questId].completed) && !achievements.fileMaster.unlocked) {
        achievements.fileMaster.unlocked = true;
        showAchievement(`🏆 ${achievements.fileMaster.name}: ${achievements.fileMaster.desc}`);
    }
    
    // Все квесты
    const allQuestIds = Object.keys(gameData.quests);
    if (allQuestIds.every(questId => gameData.quests[questId].completed) && !achievements.allQuests.unlocked) {
        achievements.allQuests.unlocked = true;
        showAchievement(`🏆 ${achievements.allQuests.name}: ${achievements.allQuests.desc}`);
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
    
    // Обновляем статусы квестов
    updateAllQuestStatuses();
    updateNextLevelButton();
}

// Обновление видимости кнопки "Следующий уровень"
function updateNextLevelButton() {
    const nextLevelBtn = document.getElementById('next-level-btn');
    const nextLevelContainer = document.getElementById('next-level-container');

    if (nextLevelBtn && nextLevelContainer) {
        // Проверяем, завершен ли текущий уровень
        if (isLevelCompleted(currentLevel)) {
            // Проверяем, есть ли следующий уровень
            if (currentLevel < 3) {
                nextLevelContainer.style.display = 'block';
                nextLevelBtn.textContent = `🎮 Перейти на уровень ${currentLevel + 1}`;
            } else {
                // Если это последний уровень
                nextLevelContainer.style.display = 'block';
                nextLevelBtn.textContent = `🎉 Завершить игру`;
            }
        } else {
            nextLevelContainer.style.display = 'none';
        }
    }
}

// Сохранение прогресса
function saveProgress() {
    const saveData = {
        xp: gameData.xp,
        level: gameData.level,
        rank: gameData.rank,
        quests: gameData.quests,
        achievements: achievements
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
        
        checkLevelUnlocks();
    }
}

// Сброс прогресса (для отладки)
function resetProgress() {
    if (confirm('Вы уверены, что хотите сбросить весь прогресс?')) {
        localStorage.removeItem('sysadminGameProgress');
        location.reload();
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
        3: ['pwd', 'ls', 'mkdir', 'touch', 'cp', 'mv', 'rm', 'find', 'ps', 'top', 'cat', 'free', 'cd']
    },
    expectedCommands: {
        '1.1': 'ipconfig',
        '1.2': 'ping 192.168.1.20',
        '2.1': ['ipconfig', 'ping 192.168.1.1'],
        '2.2': 'nslookup google.com',
        '3.1': ['mkdir учеба', 'cd учеба', 'mkdir проекты', 'cd проекты', 'mkdir тест', 'cd тест', 'touch'],
        '3.2': ['find /home -name "*.txt"', 'free -h']
    },
    completedCommands: {}
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

        // Добавляем обработчик для кнопки очистки
        const clearBtn = activeLevel.querySelector('.console-clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', clearConsole);
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
            return `Pinging ${args[0]} with 32 bytes of data:
Reply from ${args[0]}: bytes=32 time=1ms TTL=64
Reply from ${args[0]}: bytes=32 time=1ms TTL=64
Reply from ${args[0]}: bytes=32 time=1ms TTL=64
Reply from ${args[0]}: bytes=32 time=1ms TTL=64

Ping statistics for ${args[0]}:
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
            const fileName = args[0];
            if (!consoleState.files[consoleState.currentDirectory]) {
                consoleState.files[consoleState.currentDirectory] = [];
            }
            if (consoleState.files[consoleState.currentDirectory].includes(fileName)) {
                return `touch: cannot create file '${fileName}': File exists`;
            }
            consoleState.files[consoleState.currentDirectory].push(fileName);
            return `Файл "${fileName}" был создан`;

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
            const [src, target] = args;
            if (!consoleState.files[consoleState.currentDirectory] || !consoleState.files[consoleState.currentDirectory].includes(src)) {
                return `mv: cannot stat '${src}': No such file or directory`;
            }
            // Удаляем из текущей директории
            const index = consoleState.files[consoleState.currentDirectory].indexOf(src);
            consoleState.files[consoleState.currentDirectory].splice(index, 1);

            // Добавляем в целевую директорию
            if (target.includes('/')) {
                const targetDir = `${consoleState.currentDirectory}/${target.split('/')[0]}`;
                if (consoleState.files[targetDir]) {
                    consoleState.files[targetDir].push(src);
                }
            } else {
                consoleState.files[consoleState.currentDirectory].push(target);
            }
            return `Файл "${src}" перемещен в "${target}"`;

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
            // Простая симуляция поиска
            return `/home/user/documents/notes.txt
/home/user/projects/web/index.html
/home/user/projects/scripts/backup.sh`;

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
            return `Это содержимое файла ${args[0]}.
Оно может содержать любую информацию,
которая нужна для выполнения квеста.`;

        case 'free':
            return `              total        used        free      shared  buff/cache   available
Mem:        7842500     3125800     2147200       123456     2569500     4215300
Swap:       2048000          00     2048000`;

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

// Проверка команды на соответствие квестам
function checkCommandForQuests(command) {
    const currentLevelQuests = Object.keys(consoleState.expectedCommands)
        .filter(questId => questId.startsWith(currentLevel + '.'));

    currentLevelQuests.forEach(questId => {
        const expected = consoleState.expectedCommands[questId];
        const isArray = Array.isArray(expected);

        // Инициализируем массив выполненных команд для квеста, если его нет
        if (!consoleState.completedCommands[questId]) {
            consoleState.completedCommands[questId] = [];
        }

        if (isArray) {
            // Для квестов с несколькими командами
            expected.forEach(expectedCmd => {
                // Специальная обработка для квеста 3.1 - проверка команды touch
                if (questId === '3.1' && expectedCmd === 'touch') {
                    if (command.startsWith('touch ') && !consoleState.completedCommands[questId].includes('touch')) {
                        consoleState.completedCommands[questId].push('touch');

                        // Показываем сообщение об успехе
                        const activeLevel = document.querySelector('.quest-level.active');
                        if (activeLevel) {
                            const output = activeLevel.querySelector('.console-output');
                            if (output) {
                                const successLine = document.createElement('div');
                                successLine.className = 'console-line success-line';
                                successLine.textContent = `✅ Файл создан успешно!`;
                                output.appendChild(successLine);
                            }
                        }

                        // Обновляем статус квеста
                        updateQuestStatusDisplay(questId);
                    }
                }
                // Обычная проверка для других команд
                else if (command === expectedCmd && !consoleState.completedCommands[questId].includes(expectedCmd)) {
                    consoleState.completedCommands[questId].push(expectedCmd);

                    // Показываем сообщение об успехе
                    const activeLevel = document.querySelector('.quest-level.active');
                    if (activeLevel) {
                        const output = activeLevel.querySelector('.console-output');
                        if (output) {
                            const successLine = document.createElement('div');
                            successLine.className = 'console-line success-line';
                            successLine.textContent = `✅ Команда "${expectedCmd}" выполнена успешно!`;
                            output.appendChild(successLine);
                        }
                    }

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

                // Показываем сообщение об успехе
                const activeLevel = document.querySelector('.quest-level.active');
                if (activeLevel) {
                    const output = activeLevel.querySelector('.console-output');
                    if (output) {
                        const successLine = document.createElement('div');
                        successLine.className = 'console-line success-line';
                        successLine.textContent = `✅ Команда "${expected}" выполнена успешно!`;
                        output.appendChild(successLine);
                    }
                }

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

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initGame();
    initConsole();

    // Кнопка сброса прогресса
    const resetBtn = document.createElement('button');
    resetBtn.textContent = '🔄 Сброс';
    resetBtn.style.position = 'fixed';
    resetBtn.style.top = '10px';
    resetBtn.style.right = '10px';
    resetBtn.style.zIndex = '1000';
    resetBtn.style.background = '#e53e3e';
    resetBtn.style.color = 'white';
    resetBtn.style.border = 'none';
    resetBtn.style.padding = '5px 10px';
    resetBtn.style.borderRadius = '5px';
    resetBtn.style.cursor = 'pointer';
    resetBtn.onclick = resetProgress;
    document.body.appendChild(resetBtn);
});
