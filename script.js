// Initial monster data
const INITIAL_MONSTERS = {
    'L0': { level: 0, max: 1, known: 0, killed: 0 },
    'L1': { level: 1, max: 16, known: 0, killed: 0 },
    'L1a': { level: 1, max: 1, known: 0, killed: 0 },
    'L2': { level: 2, max: 10, known: 0, killed: 0 },
    'L3': { level: 3, max: 10, known: 0, killed: 0 },
    'L4': { level: 4, max: 8, known: 0, killed: 0 },
    'L5': { level: 5, max: 6, known: 0, killed: 0 },
    'L5a': { level: 5, max: 1, known: 0, killed: 0 },
    'L5b': { level: 5, max: 45, known: 0, killed: 0 },
    'L6': { level: 6, max: 4, known: 0, killed: 0 },
    'L7': { level: 7, max: 3, known: 0, killed: 0 },
    'L8': { level: 8, max: 5, known: 0, killed: 0 },
    'L10': { level: 10, max: 1, known: 0, killed: 0 },
    'L11': { level: 11, max: 1, known: 0, killed: 0 },
    'L100': { level: 100, max: 9, known: 0, killed: 0 }
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
                <span class="max-count">Max: ${data.max}</span>
            </div>
            <div class="monster-stats">
                <div class="unknown-count">Unknown: ${data.max - (data.known + data.killed)}</div>
                <div class="control-group">
                    <span class="count-label">Known:</span>
                    <button onclick="updateMonsterCount('${name}', -1, 'known')" ${data.known <= 0 ? 'disabled' : ''}>-</button>
                    <span class="monster-count">${data.known}</span>
                    <button onclick="updateMonsterCount('${name}', 1, 'known')" ${data.known >= data.max - data.killed ? 'disabled' : ''}>+</button>
                </div>
                <div class="control-group">
                    <span class="count-label">Killed:</span>
                    <button onclick="updateMonsterCount('${name}', -1, 'killed')" ${data.killed <= 0 ? 'disabled' : ''}>-</button>
                    <span class="killed-count">${data.killed}</span>
                    <button onclick="updateMonsterCount('${name}', 1, 'killed')" ${data.killed >= data.max - data.known ? 'disabled' : ''}>+</button>
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
        const newKnown = monster.known + change;
        const maxAllowed = monster.max - monster.killed;
        
        if (newKnown >= 0 && newKnown <= maxAllowed) {
            monster.known = newKnown;
            initializeMonsterGrid();
        }
    } else if (type === 'killed') {
        const newKilled = monster.killed + change;
        const maxKillable = monster.max - monster.known;
        
        if (newKilled >= 0 && newKilled <= maxKillable) {
            monster.killed = newKilled;
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
        .filter(([name, data]) => data.known < data.max - data.killed) // Only include monsters that have available slots
        .map(([name, data]) => ({
            name,
            level: data.level,
            remaining: data.max - (data.known + data.killed) // Available slots
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

    let html = `<div class="solution-summary">Found ${solutions.length} possible combinations</div>`;

    // Display solutions with better formatting
    solutions.slice(0, 100).forEach((solution, index) => {
        html += formatSolution(solution, index, Math.min(solutions.length, 100));
    });

    if (solutions.length > 100) {
        html += `
            <div class="solution-note">
                Showing first 100 of ${solutions.length} solutions
            </div>
        `;
    }

    solutionsDiv.innerHTML = html;
}

// Reset monster tracker
function resetMonsterTracker() {
    currentMonsters = JSON.parse(JSON.stringify(INITIAL_MONSTERS));
    initializeMonsterGrid();
}

// Add reset button event listener
document.getElementById('resetTrackerBtn').addEventListener('click', resetMonsterTracker);

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
    
    // Basic input validation
    if (isNaN(locations) || isNaN(targetLevel)) {
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
    
    // Validate locations
    if (locations < 1 || locations > 9) {
        solutionsDiv.innerHTML = `
            <div class="solution-summary">Invalid Input</div>
            <div class="solution-item">
                <div class="solution-content">
                    Number of locations must be between 1 and 9.
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

    const solutions = generateCombinations(locations, targetLevel);
    displaySolutions(solutions);
}

// Event listeners
locationCountInput.addEventListener('input', () => {
    handleInputChange(locationCountInput, 1, 9);
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

// Monster ID to level mapping
const monsterMapping = {
    'rat': 'L1',
    'bat': 'L2',
    'skeleton': 'L3',
    'gargoyle': 'L4',
    'slime': 'L5',
    'snake': 'L6',
    'minotaur': 'L7',
    'elemental': 'L8',
    'minion': 'L9',
    'mimic': 'L10',
    'lich': 'L11',
    'dragon': 'L100',
    'mine': 'L100'
};

// Listen for monster defeated events from the game
window.addEventListener('message', function(event) {
    // Only handle messages from our game iframe
    if (event.source === document.querySelector('iframe').contentWindow) {
        if (event.data.type === 'monsterDefeated') {
            const monster = event.data.detail;
            // Convert ActorId to simple name
            const monsterType = monster.type.toLowerCase();
            // Find the corresponding monster in our tracker
            const monsterKey = monsterMapping[monsterType];
            
            if (monsterKey && currentMonsters[monsterKey]) {
                // Update the killed count
                updateMonsterCount(monsterKey, 1, 'killed');
                console.log(`Tracked kill: ${monsterType} (${monsterKey})`);
            } else {
                console.log(`Unknown monster type: ${monsterType}`);
            }
        }
    }
});

// Initialize the UI
initializeMonsterGrid();
clearInputs();

// Add event forwarding in game iframe
const gameFrame = document.querySelector('iframe');
gameFrame.onload = function() {
    // Forward monster defeated events from game to parent
    gameFrame.contentWindow.addEventListener('monsterDefeated', function(event) {
        window.postMessage({
            type: 'monsterDefeated',
            detail: event.detail
        }, '*');
    });
};