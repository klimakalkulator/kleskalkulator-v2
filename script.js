
document.getElementById('calcForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const type = document.getElementById('type').value;
  const material = document.getElementById('material').value;
  const quantity = parseInt(document.getElementById('quantity').value);
  const source = document.getElementById('source').value;
  const age = parseInt(document.getElementById('age').value);
  const gender = document.getElementById('gender').value;

  const co2Base = {
    bomull: 13, ull: 20, polyester: 25, akryl: 22, viskose: 18,
    elastan: 20, silke: 22, lin: 17, "resirkulert polyester": 15
  };

  const decay = {
    bomull: 5, ull: 2, polyester: 200, akryl: 100, viskose: 4,
    elastan: 80, silke: 2, lin: 2, "resirkulert polyester": 200
  };

  const water = {
    bomull: 8000, ull: 7000, polyester: 2000, akryl: 2500,
    viskose: 4000, elastan: 3000, silke: 5000, lin: 3500, "resirkulert polyester": 1500
  };

  const typeMultiplier = {
    "t-skjorte": 0.6, jeans: 2.5, bukse: 1.0, genser: 1.2,
    joggedress: 1.8, treningstights: 1.3, kjole: 1.4,
    skjorte: 0.9, jakke: 2.0, "badetøy": 0.7
  };

  if (!co2Base[material] || !typeMultiplier[type]) {
    alert("Kombinasjonen er ikke støttet.");
    return;
  }

  const co2 = Math.round(co2Base[material] * typeMultiplier[type] * quantity);
  const totalWater = Math.round(water[material] * typeMultiplier[type] * quantity);
  const breakdown = decay[material];

  let comparison = "";

  if (co2 >= 60) {
    comparison += `<li>Utslippet tilsvarer én flyreise Oslo–Trondheim (ca. 60 kg CO₂).</li>`;
  } else if (co2 >= 30) {
    comparison += `<li>Utslippet tilsvarer omtrent halvparten av en flyreise Oslo–Trondheim.</li>`;
  }

  if (co2 > 0) {
    const km = Math.round(co2 / 0.14);
    comparison += `<li>Tilvarer ca. ${km} km med bensinbil.</li>`;
  }

  if (totalWater >= 10000) {
    comparison += `<li>Vannforbruket tilsvarer over 100 dusjer (10 min hver).</li>`;
  } else if (totalWater >= 3000) {
    comparison += `<li>Vann nok til å produsere flere liter melk (1L melk = ca. 1000L vann).</li>`;
  }

  document.getElementById('result').style.display = 'block';
  document.getElementById('result').innerHTML = `
    <h3>Resultat</h3>
    <p>CO₂-utslipp: <strong>${co2} kg</strong></p>
    <p>Nedbrytningstid: <strong>${breakdown} år</strong></p>
    <p>Vannforbruk: <strong>${totalWater.toLocaleString()} liter</strong></p>
    <ul>${comparison}</ul>
    <p>Takk for at du deltok. Dataene dine lagres anonymt.</p>
  `;
});
