document.addEventListener('DOMContentLoaded', () => {
  // --- SUPABASE SETUP ---
  const supabaseUrl = 'https://xnedmhnxwylntekmjcqq.supabase.co'; 
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuZWRtaG54d3lsbnRla21qY3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MzEyMDgsImV4cCI6MjA2NzMwNzIwOH0.EHj6hw5PN4vwwF0PABXCldMRDIED-LaCnvoNV89izX0';
  const supabase = supabase.createClient(supabaseUrl, supabaseKey);

  // --- DATA MODELS ---
  const fabricArea = {
    't-skjorte': 0.75, 'jeans': 1.5, 'bukse': 1.4, 'genser': 1.6, 'joggedress': 2.5,
    'treningstights': 0.8, 'kjole': 2.0, 'skjorte': 1.2, 'jakke': 2.2, 'badetøy': 0.2
  };

  const materialData = {
    'bomull': { co2: 20, water: 6700, decay: 5 }, 'ull': { co2: 25, water: 8000, decay: 5 },
    'polyester': { co2: 14, water: 50, decay: 200 }, 'akryl': { co2: 16, water: 60, decay: 200 },
    'viskose': { co2: 12, water: 3000, decay: 4 }, 'elastan': { co2: 18, water: 2500, decay: 100 },
    'silke': { co2: 22, water: 5000, decay: 4 }, 'lin': { co2: 5, water: 2000, decay: 2 },
    'resirkulert polyester': { co2: 8, water: 20, decay: 200 }
  };

  // --- EVENT LISTENERS AND CORE LOGIC (Unchanged) ---
  let shoppingCart = [];
  const startBtn = document.getElementById('startBtn');
  const calculatorSection = document.getElementById('calculator-section');
  const addItemForm = document.getElementById('addItemForm');
  const cartItemsList = document.getElementById('cart-items');
  const calculateBtn = document.getElementById('calculateBtn');
  const resultBox = document.getElementById('result-box');
  
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
      id: Date.now(),
      type: clothingType,
      material: materialType,
      quantity: quantity
    };

    shoppingCart.push(item);
    renderCart();
    addItemForm.reset();
  });

  calculateBtn.addEventListener('click', async () => {
    calculateBtn.disabled = true;
    calculateBtn.textContent = 'Beregner...';
    await submitDataForResearch(shoppingCart);
    calculateAndDisplayResults();
    calculateBtn.disabled = false;
    calculateBtn.textContent = 'Beregn totalt utslipp';
  });

  function renderCart() {
    const cartPlaceholder = document.querySelector('#cart-items .placeholder');
    cartItemsList.innerHTML = ''; 

    if (shoppingCart.length === 0) {
        if (cartPlaceholder) {
            cartItemsList.appendChild(cartPlaceholder);
        }
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
    const waterComparison = getWaterComparison(totalWater);

    resultBox.innerHTML = `
      <h3>Ditt resultat</h3>
      <p>Takk for at du deltok! Dine svar er lagret anonymt for forskningsformål.</p>
      <ul>
        <li><strong>Totalt CO₂-utslipp:</strong> ${totalCo2.toFixed(1)} kg. ${co2Comparison}</li>
        <li><strong>Totalt vannforbruk:</strong> ${Math.round(totalWater).toLocaleString('nb-NO')} liter. ${waterComparison}</li>
        <li><strong>Lengste nedbrytningstid:</strong> Det vil ta opptil <strong>${maxDecay} år</strong> før plagget med lengst nedbrytningstid forsvinner i naturen.</li>
      </ul>
      <div class="action-tips">
          <h4>Hva kan du gjøre?</h4>
          <p>For å redusere fotavtrykket kan du vurdere å kjøpe brukt, reparere klær du allerede har, og velge materialer med lavere påvirkning. For syntetiske plagg, bruk en vaskepose for å fange opp mikroplast.</p>
      </div>
    `;
    resultBox.style.display = 'block';
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }

  function getCo2Comparison(co2) {
      const kmPerKgCo2 = 7.5; 
      const flightOsloBergen = 70; 
      const flightOsloThailand = 1100;
      
      if (co2 >= flightOsloThailand * 0.5) {
          const numFlights = (co2 / flightOsloThailand).toFixed(1);
          return `Det tilsvarer ca. <strong>${numFlights}</strong> flyreiser fra Oslo til Thailand.`;
      }
      if (co2 >= flightOsloBergen * 0.5) {
          const numFlights = (co2 / flightOsloBergen).toFixed(1);
          return `Det tilsvarer ca. <strong>${numFlights}</strong> flyreiser fra Oslo til Bergen.`;
      }
      if (co2 > 1) {
          const km = (co2 * kmPerKgCo2).toFixed(0);
          return `Det tilsvarer en kjøretur på ca. <strong>${km} km</strong> med en bensinbil.`;
      }
      if (co2 > 0) {
          return `Selv små utslipp summerer seg opp over tid.`;
      }
      return "";
  }
  
  function getWaterComparison(water) {
      const dailyDrinkingWater = 2;
      const showerWater = 100; 
      const milkWater = 1000; 

      if (water >= 20000) {
          const yearsOfWater = (water / (dailyDrinkingWater * 365)).toFixed(1);
          return `Det er nok drikkevann for én person i <strong>${yearsOfWater} år</strong>.`;
      }
      if (water >= 5000) {
          const showers = Math.round(water / showerWater);
          return `Det tilsvarer vannforbruket til ca. <strong>${showers}</strong> dusjer på 10 minutter.`;
      }
      if (water >= 1000) {
          const milkLiters = Math.round(water / milkWater);
          return `Det er nok vann til å produsere <strong>${milkLiters} liter</strong> melk.`;
      }
      if (water > 0) {
        const daysOfWater = Math.round(water / dailyDrinkingWater);
        return `Det tilsvarer drikkevann for én person i <strong>${daysOfWater}</strong> dager.`;
      }
      return "";
  }
  
  async function submitDataForResearch(data) {
    try {
        const { error } = await supabase
            .from('submissions')
            .insert([{ cart_data: data }]);
        if (error) { throw error; }
        console.log('Data submitted successfully to Supabase.');
    } catch (error) {
        console.error('Error submitting data to Supabase:', error.message);
    }
  }

  renderCart();
});
