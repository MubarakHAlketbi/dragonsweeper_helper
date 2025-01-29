// Initial monster data
const INITIAL_MONSTERS = {
    'L0': { count: 1, level: 0, max: 1, found: 0 },
    'L1': { count: 16, level: 1, max: 16, found: 0 },
    'L1a': { count: 1, level: 1, max: 1, found: 0 },
    'L2': { count: 10, level: 2, max: 10, found: 0 },
    'L3': { count: 10, level: 3, max: 10, found: 0 },
    'L4': { count: 8, level: 4, max: 8, found: 0 },
    'L5': { count: 6, level: 5, max: 6, found: 0 },
    'L5a': { count: 1, level: 5, max: 1, found: 0 },
    'L5b': { count: 45, level: 5, max: 45, found: 0 },
    'L6': { count: 4, level: 6, max: 4, found: 0 },
    'L7': { count: 3, level: 7, max: 3, found: 0 },
    'L8': { count: 5, level: 8, max: 5, found: 0 },
    'L10': { count: 1, level: 10, max: 1, found: 0 },
    'L11': { count: 1, level: 11, max: 1, found: 0 },
    'L100': { count: 9, level: 100, max: 9, found: 0 }
};

// Current state of monsters
let currentMonsters = JSON.parse(JSON.stringify(INITIAL_MONSTERS));

// UI Elements
const monsterGrid = document.getElementById('monsterGrid');
const locationCountInput = document.getElementById('locationCount');
const combinedLevelInput = document.getElementById('combinedLevel');
const solveBtn = document.getElementById('solveBtn');
const clearBtn = document.getElementById('clearBtn');
const solutionsDiv = document.getElementById('solutions');

// Input validation
function validateNumberInput(input, min, max) {
    let value = input.value.replace(/[^0-9]/g, '');
    if (value === '') return '';
    
    value = parseInt(value);
    if (isNaN(value)) return '';
    
    value = Math.max(min, Math.min(max, value));
    return value.toString();
}

// Handle input changes
function handleInputChange(input, min, max) {
    const validValue = validateNumberInput(input, min, max);
    input.value = validValue;
}

// Initialize monster tracker grid
function initializeMonsterGrid() {
    monsterGrid.innerHTML = '';
    Object.entries(currentMonsters).forEach(([name, data]) => {
        const card = document.createElement('div');
        card.className = 'monster-card';
        card.innerHTML = `
            <div class="monster-info">
                <img src="asset/${name}.png" alt="${name}" class="monster-icon">
                <span class="monster-name">Lvl ${data.level}</span>
            </div>
            <div class="monster-stats">
                <div class="monster-counters">
                    <span class="found-count">Found: ${data.found}</span>
                    <span class="max-count">Max: ${data.max}</span>
                </div>
                <div class="monster-controls">
                    <button onclick="updateMonsterCount('${name}', -1)" ${data.count <= 0 ? 'disabled' : ''}>-</button>
                    <span class="monster-count">${data.count}</span>
                    <button onclick="updateMonsterCount('${name}', 1)" ${data.count >= data.max ? 'disabled' : ''}>+</button>
                </div>
            </div>
        `;
        monsterGrid.appendChild(card);
    });
}

// Update monster count
function updateMonsterCount(monsterName, change) {
    const monster = currentMonsters[monsterName];
    const newCount = monster.count + change;
    
    if (newCount >= 0 && newCount <= monster.max) {
        monster.count = newCount;
        monster.found = monster.max - newCount;
        initializeMonsterGrid();
    }
}

// Format solution for display
function formatSolution(solution, index, total) {
    const monsters = solution.map((monster, pos) => {
        if (!monster) return `<span class="empty-slot">Location ${pos + 1}: Empty</span>`;
        const monsterData = currentMonsters[monster];
        return `
            <span class="monster-slot">
                <img src="asset/${monster}.png" alt="${monster}" class="monster-icon-small">
                Location ${pos + 1}: ${monster} (Lvl ${monsterData.level})
            </span>`;
    });

    const totalLevel = calculateSolutionLevel(solution);
    const nonEmptyCount = solution.filter(m => m !== null).length;

    return `
        <div class="solution-item">
            <div class="solution-header">Solution ${index + 1} of ${total}</div>
            <div class="solution-content">${monsters.join('<br>')}</div>
            <div class="solution-footer">
                Total Level: ${totalLevel} | Monsters: ${nonEmptyCount}
            </div>
        </div>
    `;
}

// Calculate solution level
function calculateSolutionLevel(solution) {
    return solution.reduce((total, monster) => {
        if (!monster) return total;
        return total + currentMonsters[monster].level;
    }, 0);
}

// Generate combinations
function generateCombinations(locations, targetLevel) {
    if (locations <= 0 || targetLevel < 0) return [];
    
    // Get available monsters
    const availableMonsters = Object.entries(currentMonsters)
        .filter(([name, data]) => data.count > 0)
        .map(([name, data]) => ({
            name,
            level: data.level,
            remaining: data.count
        }));

    const solutions = [];
    const currentCombination = Array(locations).fill(null);

    function solve(position, remainingLevel, usedMonsters) {
        // Base case: all positions filled
        if (position === locations) {
            if (remainingLevel === 0 && currentCombination.some(m => m !== null)) {
                solutions.push([...currentCombination]);
            }
            return;
        }

        // Try empty location if not all locations are empty
        if (remainingLevel > 0 || position < locations - 1) {
            currentCombination[position] = null;
            solve(position + 1, remainingLevel, usedMonsters);
        }

        // Try each available monster
        for (const monster of availableMonsters) {
            const monsterUsed = usedMonsters[monster.name] || 0;
            if (monsterUsed < monster.remaining && monster.level <= remainingLevel) {
                currentCombination[position] = monster.name;
                usedMonsters[monster.name] = monsterUsed + 1;
                solve(position + 1, remainingLevel - monster.level, usedMonsters);
                usedMonsters[monster.name] = monsterUsed;
            }
        }
    }

    solve(0, targetLevel, {});
    return solutions;
}

// Display solutions
function displaySolutions(solutions) {
    solutionsDiv.innerHTML = '';
    
    if (solutions.length === 0) {
        solutionsDiv.innerHTML = `
            <div class="solution-summary">No valid combinations found</div>
            <div class="solution-item">
                <div class="solution-content">
                    Try different values or check if you have enough monsters available.
                </div>
            </div>
        `;
        return;
    }

    // Add summary header
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'solution-summary';
    summaryDiv.textContent = `Found ${solutions.length} possible combinations`;
    solutionsDiv.appendChild(summaryDiv);

    // Display solutions with better formatting
    solutions.slice(0, 100).forEach((solution, index) => {
        const solutionHtml = formatSolution(solution, index, Math.min(solutions.length, 100));
        solutionsDiv.insertAdjacentHTML('beforeend', solutionHtml);
    });

    if (solutions.length > 100) {
        const note = document.createElement('div');
        note.className = 'solution-note';
        note.textContent = `Showing first 100 of ${solutions.length} solutions`;
        solutionsDiv.appendChild(note);
    }
}

// Clear inputs and solutions
function clearInputs() {
    locationCountInput.value = '';
    combinedLevelInput.value = '';
    locationCountInput.focus();
    solutionsDiv.innerHTML = `
        <div class="solution-summary">Enter values above and click Find Possible Combinations</div>
    `;
}

// Validate and solve
function validateAndSolve() {
    const locations = parseInt(locationCountInput.value);
    const targetLevel = parseInt(combinedLevelInput.value);
    
    if (isNaN(locations) || isNaN(targetLevel)) {
        solutionsDiv.innerHTML = `
            <div class="solution-summary">Invalid Input</div>
            <div class="solution-item">
                <div class="solution-content">
                    Please enter valid numbers for both fields.
                </div>
            </div>
        `;
        return;
    }
    
    if (locations < 1 || locations > 99) {
        solutionsDiv.innerHTML = `
            <div class="solution-summary">Invalid Input</div>
            <div class="solution-item">
                <div class="solution-content">
                    Number of locations must be between 1 and 99.
                </div>
            </div>
        `;
        return;
    }

    if (targetLevel < 0 || targetLevel > 999) {
        solutionsDiv.innerHTML = `
            <div class="solution-summary">Invalid Input</div>
            <div class="solution-item">
                <div class="solution-content">
                    Combined level must be between 0 and 999.
                </div>
            </div>
        `;
        return;
    }

    const solutions = generateCombinations(locations, targetLevel);
    displaySolutions(solutions);
}

// Event listeners
locationCountInput.addEventListener('input', () => {
    handleInputChange(locationCountInput, 1, 99);
});

combinedLevelInput.addEventListener('input', () => {
    handleInputChange(combinedLevelInput, 0, 999);
});

locationCountInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (locationCountInput.value) {
            combinedLevelInput.focus();
        }
        e.preventDefault();
    }
});

combinedLevelInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (combinedLevelInput.value) {
            validateAndSolve();
        }
        e.preventDefault();
    }
});

solveBtn.addEventListener('click', validateAndSolve);
clearBtn.addEventListener('click', clearInputs);

// Initialize the UI
initializeMonsterGrid();
clearInputs();