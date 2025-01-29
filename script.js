// Initial monster data
const INITIAL_MONSTERS = {
    'L0': { count: 1, level: 0, max: 1, known: 0, killed: 0 },
    'L1': { count: 16, level: 1, max: 16, known: 0, killed: 0 },
    'L1a': { count: 1, level: 1, max: 1, known: 0, killed: 0 },
    'L2': { count: 10, level: 2, max: 10, known: 0, killed: 0 },
    'L3': { count: 10, level: 3, max: 10, known: 0, killed: 0 },
    'L4': { count: 8, level: 4, max: 8, known: 0, killed: 0 },
    'L5': { count: 6, level: 5, max: 6, known: 0, killed: 0 },
    'L5a': { count: 1, level: 5, max: 1, known: 0, killed: 0 },
    'L5b': { count: 45, level: 5, max: 45, known: 0, killed: 0 },
    'L6': { count: 4, level: 6, max: 4, known: 0, killed: 0 },
    'L7': { count: 3, level: 7, max: 3, known: 0, killed: 0 },
    'L8': { count: 5, level: 8, max: 5, known: 0, killed: 0 },
    'L10': { count: 1, level: 10, max: 1, known: 0, killed: 0 },
    'L11': { count: 1, level: 11, max: 1, known: 0, killed: 0 },
    'L100': { count: 9, level: 100, max: 9, known: 0, killed: 0 }
};

// Current state of monsters
let currentMonsters = JSON.parse(JSON.stringify(INITIAL_MONSTERS));

// UI Elements
const monsterGrid = document.getElementById('monsterGrid');
const locationCountInput = document.getElementById('locationCount');
const knownLocationsInput = document.getElementById('knownLocations');
const knownLevelsContainer = document.getElementById('knownLevelsContainer');
const combinedLevelInput = document.getElementById('combinedLevel');
const solveBtn = document.getElementById('solveBtn');
const clearBtn = document.getElementById('clearBtn');
const solutionsDiv = document.getElementById('solutions');

// Known locations state
let knownLevels = [];

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

// Create known level inputs
function createKnownLevelInputs(count) {
    knownLevelsContainer.innerHTML = '';
    knownLevels = new Array(count).fill(0);
    
    if (count > 0) {
        for (let i = 0; i < count; i++) {
            const inputGroup = document.createElement('div');
            inputGroup.className = 'known-level-input';
            
            const label = document.createElement('label');
            label.textContent = `Known Location ${i + 1} Level:`;
            
            const input = document.createElement('input');
            input.type = 'number';
            input.min = '0';
            input.max = '100';
            input.value = '0';
            input.placeholder = 'Level (0-100)';
            input.dataset.index = i;
            
            input.addEventListener('input', (e) => {
                const validValue = validateNumberInput(e.target, 0, 100);
                e.target.value = validValue;
                knownLevels[i] = parseInt(validValue) || 0;
                updateRemainingLevel();
            });
            
            inputGroup.appendChild(label);
            inputGroup.appendChild(input);
            knownLevelsContainer.appendChild(inputGroup);
        }
        
        // Add remaining level display
        const remainingDiv = document.createElement('div');
        remainingDiv.id = 'remainingLevel';
        remainingDiv.className = 'remaining-level';
        knownLevelsContainer.appendChild(remainingDiv);
        
        updateRemainingLevel();
    }
}

// Update remaining level display
function updateRemainingLevel() {
    const remainingDiv = document.getElementById('remainingLevel');
    if (!remainingDiv) return;
    
    const totalLevel = parseInt(combinedLevelInput.value) || 0;
    const knownTotal = knownLevels.reduce((sum, level) => sum + level, 0);
    const remaining = totalLevel - knownTotal;
    
    remainingDiv.textContent = `Remaining Level for Unknown Locations: ${remaining}`;
    remainingDiv.style.color = remaining < 0 ? 'var(--danger-color)' : 'var(--accent-color)';
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
                    <span class="known-count">Known: ${data.known}</span>
                    <span class="killed-count">Killed: ${data.killed}</span>
                    <span class="max-count">Max: ${data.max}</span>
                </div>
                <div class="monster-controls">
                    <div class="control-group">
                        <label>Known:</label>
                        <button onclick="updateMonsterCount('${name}', -1, 'known')" ${data.count <= 0 ? 'disabled' : ''}>-</button>
                        <span class="monster-count">${data.count}</span>
                        <button onclick="updateMonsterCount('${name}', 1, 'known')" ${data.count >= data.max ? 'disabled' : ''}>+</button>
                    </div>
                    <div class="control-group">
                        <label>Killed:</label>
                        <button onclick="updateMonsterCount('${name}', -1, 'killed')" ${data.killed <= 0 ? 'disabled' : ''}>-</button>
                        <span class="killed-count">${data.killed}</span>
                        <button onclick="updateMonsterCount('${name}', 1, 'killed')" ${data.killed >= data.max - data.known ? 'disabled' : ''}>+</button>
                    </div>
                </div>
            </div>
        `;
        monsterGrid.appendChild(card);
    });
}

// Update monster count
function updateMonsterCount(monsterName, change, type) {
    const monster = currentMonsters[monsterName];
    
    if (type === 'known') {
        const newCount = monster.count + change;
        const maxAllowed = monster.max - monster.killed;
        
        if (newCount >= 0 && newCount <= maxAllowed) {
            monster.count = newCount;
            monster.known = monster.max - newCount - monster.killed;
            initializeMonsterGrid();
        }
    } else if (type === 'killed') {
        const newKilled = monster.killed + change;
        const maxKillable = monster.max - monster.known;
        
        if (newKilled >= 0 && newKilled <= maxKillable) {
            monster.killed = newKilled;
            // Adjust available count if needed
            if (monster.count > monster.max - monster.killed) {
                monster.count = monster.max - monster.killed;
                monster.known = monster.max - monster.count - monster.killed;
            }
            initializeMonsterGrid();
        }
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
    
    // Get available monsters (excluding killed ones)
    const availableMonsters = Object.entries(currentMonsters)
        .filter(([name, data]) => data.count > 0 && data.killed < data.max) // Only include monsters that aren't all killed
        .map(([name, data]) => ({
            name,
            level: data.level,
            remaining: Math.min(data.count, data.max - data.killed) // Adjust remaining count based on killed monsters
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
    knownLocationsInput.value = '';
    combinedLevelInput.value = '';
    knownLevelsContainer.innerHTML = '';
    knownLevels = [];
    locationCountInput.focus();
    solutionsDiv.innerHTML = `
        <div class="solution-summary">Enter values above and click Find Possible Combinations</div>
    `;
}

// Validate and solve
function validateAndSolve() {
    const unknownLocations = parseInt(locationCountInput.value);
    const knownLocationCount = parseInt(knownLocationsInput.value) || 0;
    const targetLevel = parseInt(combinedLevelInput.value);
    
    // Basic input validation
    if (isNaN(unknownLocations) || isNaN(targetLevel)) {
        solutionsDiv.innerHTML = `
            <div class="solution-summary">Invalid Input</div>
            <div class="solution-item">
                <div class="solution-content">
                    Please enter valid numbers for all required fields.
                </div>
            </div>
        `;
        return;
    }
    
    // Validate unknown locations
    if (unknownLocations < 1 || unknownLocations > 9) {
        solutionsDiv.innerHTML = `
            <div class="solution-summary">Invalid Input</div>
            <div class="solution-item">
                <div class="solution-content">
                    Number of unknown locations must be between 1 and 9.
                </div>
            </div>
        `;
        return;
    }

    // Validate target level
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

    // Calculate remaining level after known locations
    const knownTotal = knownLevels.reduce((sum, level) => sum + level, 0);
    const remainingLevel = targetLevel - knownTotal;

    if (remainingLevel < 0) {
        solutionsDiv.innerHTML = `
            <div class="solution-summary">Invalid Input</div>
            <div class="solution-item">
                <div class="solution-content">
                    Known locations total (${knownTotal}) exceeds combined level (${targetLevel}).
                </div>
            </div>
        `;
        return;
    }

    const solutions = generateCombinations(unknownLocations, remainingLevel);
    displaySolutions(solutions);
}

// Event listeners
locationCountInput.addEventListener('input', () => {
    handleInputChange(locationCountInput, 1, 9);
});

knownLocationsInput.addEventListener('input', () => {
    handleInputChange(knownLocationsInput, 0, 8);
    const count = parseInt(knownLocationsInput.value) || 0;
    createKnownLevelInputs(count);
});

combinedLevelInput.addEventListener('input', () => {
    handleInputChange(combinedLevelInput, 0, 999);
    updateRemainingLevel();
});

locationCountInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (locationCountInput.value) {
            knownLocationsInput.focus();
        }
        e.preventDefault();
    }
});

knownLocationsInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (knownLocationsInput.value) {
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