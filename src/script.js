const scenarioText = document.getElementById('scenario-text');
const choiceA = document.getElementById('choice-a');
const choiceB = document.getElementById('choice-b');
const loading = document.getElementById('loading');
const gameTitle = document.getElementById('game-title');
const goalCard = document.getElementById('goal-card');
const closeGoal = document.getElementById('close-goal');
const showGoal = document.getElementById('show-goal');
const moraleBar = document.getElementById('morale-bar');
const shipBar = document.getElementById('ship-bar');
const goldCount = document.getElementById('gold-count');

let gameState = {
    morale: 100,
    shipCondition: 100,
    gold: 100,
};

function updateStats(moraleChange = 0, shipChange = 0, goldChange = 0) {
    gameState.morale = Math.max(0, Math.min(100, gameState.morale + moraleChange));
    gameState.shipCondition = Math.max(0, Math.min(100, gameState.shipCondition + shipChange));
    gameState.gold = Math.max(0, gameState.gold + goldChange);

    moraleBar.style.width = `${gameState.morale}%`;
    shipBar.style.width = `${gameState.shipCondition}%`;
    goldCount.textContent = gameState.gold;

    if (moraleChange !== 0) {
        moraleBar.style.transition = 'width 0.5s ease';
        setTimeout(() => moraleBar.style.transition = '', 500);
    }
}

const initialScenario = {
    scenario: "Ahoy, Captain! Ye've just been appointed to lead a small pirate ship. The legendary Treasure of Isla Perdida awaits in treacherous waters!",
    choiceA: "Set sail immediately",
    choiceB: "Recruit more scurvy dogs"
};

function updateScenario(data) {
    scenarioText.style.opacity = '0';
    choiceA.style.opacity = '0';
    choiceB.style.opacity = '0';
    
    setTimeout(() => {
        scenarioText.textContent = data.scenario;
        choiceA.textContent = data.choiceA;
        choiceB.textContent = data.choiceB;
        
        scenarioText.style.opacity = '1';
        choiceA.style.opacity = '1';
        choiceB.style.opacity = '1';
        
        choiceA.onclick = () => handleChoice('A');
        choiceB.onclick = () => handleChoice('B');
    }, 300);
}

async function handleChoice(choice) {
    loading.classList.remove('hidden');
    choiceA.disabled = true;
    choiceB.disabled = true;
    
    updateStats(
        Math.floor(Math.random() * 21) - 10,  
        Math.floor(Math.random() * 21) - 10,  
        Math.floor(Math.random() * 51) - 25   
    );
    
    try {
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "mixtral-8x7b-32768",
            messages: [
                {
                    role: "system",
                    content: "You are the game master for an endless pirate-themed card choice game called Corsair's Choice. The player is a captain navigating the Caribbean, facing various adventures and challenges. Generate engaging, pirate-themed scenarios with two choices (A and B) for the player to choose from. Each scenario should be brief (2-3 sentences) and each choice should be one short sentence. The game should never end, so avoid scenarios that would conclude the adventure. Always respond in JSON format with 'scenario', 'choiceA', and 'choiceB' fields."
                },
                {
                    role: "user",
                    content: `Current scenario: ${scenarioText.textContent}
                              Player's choice: ${choice === 'A' ? choiceA.textContent : choiceB.textContent}
                              
                              Based on this, generate the next scenario with two choices (A and B).`
                }
            ],
            temperature: 0.7,
            max_tokens: 150
        }, {
            headers: {
                'Authorization': 'Bearer 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',
                'Content-Type': 'application/json',
            }
        });
        
        const nextScenario = JSON.parse(response.data.choices[0].message.content);
        updateScenario(nextScenario);
    } catch (error) {
        console.error('Error getting next scenario:', error);
        updateScenario({
            scenario: "Arr! The seas be rough and our map be torn. What's our next move, Cap'n?",
            choiceA: "Consult the ship's navigator",
            choiceB: "Follow the stars"
        });
    } finally {
        loading.classList.add('hidden');
        choiceA.disabled = false;
        choiceB.disabled = false;
    }
}

function toggleGoalCard() {
    goalCard.classList.toggle('hidden');
}

scenarioText.style.transition = 'opacity 0.3s ease-in-out';
choiceA.style.transition = 'all 0.3s ease-in-out';
choiceB.style.transition = 'all 0.3s ease-in-out';

gameTitle.addEventListener('click', toggleGoalCard);
showGoal.addEventListener('click', toggleGoalCard);
closeGoal.addEventListener('click', toggleGoalCard);

updateScenario(initialScenario);