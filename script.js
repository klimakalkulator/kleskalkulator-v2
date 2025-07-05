document.addEventListener('DOMContentLoaded', () => {
  // --- DATA MODELS ---

  // Estimated fabric area in square meters (m^2) for each clothing type
  const fabricArea = {
    't-skjorte': 0.75,
    'jeans': 1.5,
    'bukse': 1.4,
    'genser': 1.6,
    'joggedress': 2.5,
    'treningstights': 0.8,
    'kjole': 2.0,
    'skjorte': 1.2,
    'jakke': 2.2,
    'badetøy': 0.2
  };

  // Environmental cost per square meter of material
  const materialData = {
    'bomull': { co2: 20, water: 6700, decay: 5 }, // kg CO2, Liters water, Years to decompose
    'ull': { co2: 25, water: 8000, decay: 5 },
    'polyester': { co2: 14, water: 50, decay: 200 },
    'akryl': { co2: 16, water: 60, decay: 200 },
    'viskose': { co2: 12, water: 3000, decay: 4 },
    'elastan': { co2: 18, water: 2500, decay: 100 },
    'silke': { co2: 22, water: 5000, decay: 4 },
    'lin': { co2: 5, water: 2000, decay: 2 },
    'resirkulert polyester': { co2: 8, water: 20, decay: 200 }
  };
  
  // Comparison data
  const comparisonData = {
      flightOsloBergen: 70, // kg CO2
      flightOsloSpain: 275, // kg CO2
      flightOsloThailand: 1100, // kg CO2
      dailyDrinkingWater: 2 // Liters
  };

  // --- APPLICATION STATE ---
  let shoppingCart = [];

  // --- DOM ELEMENTS ---
  const startBtn = document.getElementById('startBtn');
  const calculatorSection = document.getElementById('calculator-section');
  const addItemForm = document.getElementById('addItemForm');
  const cartItemsList = document.getElementById('cart-items');
  const calculateBtn = document.getElementById('calculateBtn');
  const resultBox = document.getElementById('result-box');
  const cartPlaceholder = document.querySelector('#cart-items .placeholder');

  // --- EVENT LISTENERS ---
  startBtn.addEventListener('click', () => {
    calculatorSection.style.display = 'block';
    startBtn.style.display = 'none';
  });

  addItemForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const clothingType = document.getElementById('clothingType').value;
    const materialType = document.getElementById('materialType').value;
    const quantity = parseInt(document.getElementById('quantity').value);

    const item = {
      id: Date.now(), // Unique ID for removal
      type: clothingType,
      material: materialType,
      quantity: quantity
    };

    shoppingCart.push(item);
    renderCart();
    addItemForm.reset();
  });

  calculateBtn.addEventListener('click', () => {
    // This is where you would send data to a database
    // For now, it's anonymous as no personal data is collected
    submitDataForResearch(shoppingCart);
    
    calculateAndDisplayResults();
  });

  // --- FUNCTIONS ---
  
  function renderCart() {
    cartItemsList.innerHTML = ''; // Clear the list

    if (shoppingCart.length === 0) {
      cartItemsList.appendChild(cartPlaceholder);
      calculateBtn.style.display = 'none';
      return;
    }

    shoppingCart.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div>
          <span class="item-details">${item.quantity} x ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
          <span class="item-material">(${item.material})</span>
        </div>
        <button class="remove-btn" data-id="${item.id}">&times;</button>
      `;
      cartItemsList.appendChild(li);
    });

    // Add event listeners to new remove buttons
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemId = parseInt(e.target.getAttribute('data-id'));
            shoppingCart = shoppingCart.filter(item => item.id !== itemId);
            renderCart();
        });
    });
    
    calculateBtn.style.display = 'block';
  }

  function calculateAndDisplayResults() {
    let totalCo2 = 0;
    let totalWater = 0;
    let maxDecay = 0;

    shoppingCart.forEach(item => {
      const area = fabricArea[item.type];
      const material = materialData[item.material];
      
      totalCo2 += area * material.co2 * item.quantity;
      totalWater += area * material.water * item.quantity;
      
      if (material.decay > maxDecay) {
        maxDecay = material.decay;
      }
    });

    const co2Comparison = getCo2Comparison(totalCo2);
    const waterComparison = `Det tilsvarer drikkevann for én person i <strong>${Math.round(totalWater / comparisonData.dailyDrinkingWater).toLocaleString('nb-NO')}</strong> dager.`;

    resultBox.innerHTML = `
      <h3>Ditt resultat</h3>
      <p>Takk for at du deltok! Dine svar er lagret anonymt for forskningsformål.</p>
      <ul>
        <li><strong>Totalt CO₂-utslipp:</strong> ${totalCo2.toFixed(1)} kg. ${co2Comparison}</li>
        <li><strong>Totalt vannforbruk:</strong> ${Math.round(totalWater).toLocaleString('nb-NO')} liter. ${waterComparison}</li>
        <li><strong>Lengste nedbrytningstid:</strong> Det vil ta opptil <strong>${maxDecay} år</strong> før plagget med lengst nedbrytningstid forsvinner i naturen.</li>
      </ul>
    `;
    resultBox.style.display = 'block';
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }
  
  function getCo2Comparison(co2) {
      const { flightOsloBergen, flightOsloSpain, flightOsloThailand } = comparisonData;
      
      if (co2 > flightOsloThailand * 0.75) {
          const numFlights = (co2 / flightOsloThailand).toFixed(1);
          return `Det tilsvarer ca. <strong>${numFlights}</strong> flyreiser fra Oslo til Thailand.`;
      }
      if (co2 > flightOsloSpain * 0.75) {
          const numFlights = (co2 / flightOsloSpain).toFixed(1);
          return `Det tilsvarer ca. <strong>${numFlights}</strong> flyreiser fra Oslo til Spania.`;
      }
      if (co2 > flightOsloBergen * 0.75) {
          const numFlights = (co2 / flightOsloBergen).toFixed(1);
          return `Det tilsvarer ca. <strong>${numFlights}</strong> flyreiser fra Oslo til Bergen.`;
      }
      if (co2 > 0) {
        const percentageOfFlight = ((co2 / flightOsloBergen) * 100).toFixed(0);
        return `Det er <strong>${percentageOfFlight}%</strong> av utslippet fra en flyreise mellom Oslo og Bergen.`;
      }
      return "";
  }
  
  function submitDataForResearch(data) {
    console.log("Følgende data ville blitt sendt til en database:", data);
    // **For a real application, you would add a backend call here.**
    // Example:
    // fetch('https://your-backend-api.com/submit-data', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // })
    // .then(response => console.log('Data submitted successfully'))
    // .catch(error => console.error('Error submitting data:', error));
  }

  // Initial setup
  renderCart(); // To show the initial empty message
});
