document.addEventListener('DOMContentLoaded', () => {
    // --- SUPABASE SETUP (FIXED) ---
    const supabaseUrl = 'https://xnedmhnxwylntekmjcqq.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuZWRtaG54d3lsbnRla21qY3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MzEyMDgsImV4cCI6MjA2NzMwNzIwOH0.EHj6hw5PN4vwwF0PABXCldMRDIED-LaCnvoNV89izX0';
    // Renamed the client variable to avoid naming conflict
    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

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

    // --- MAIN FUNCTION ---
    async function loadStatistics() {
        try {
            // Use the new client variable name
            const { data, error } = await supabaseClient
                .from('submissions')
                .select('cart_data');

            if (error) throw error;
            if (!data || data.length === 0) {
                document.getElementById('error-message').textContent = 'Ingen data er sendt inn ennå. Prøv kalkulatoren først!';
                document.getElementById('error-message').style.display = 'block';
                renderStats({
                    totalSubmissions: 0,
                    totalGarments: 0,
                    avgCo2: 0,
                    avgWater: 0,
                    mostCommonMaterial: 'N/A',
                    maxDecay: 0,
                });
                return;
            }

            const allItems = data.flatMap(submission => submission.cart_data);
            const stats = calculateStats(allItems, data.length);
            
            renderStats(stats);

        } catch (error) {
            console.error('Error loading statistics:', error.message);
            document.getElementById('error-message').textContent = 'Kunne ikke laste statistikk. Vennligst prøv igjen senere.';
            document.getElementById('error-message').style.display = 'block';
        }
    }

    function calculateStats(allItems, submissionCount) {
        if (allItems.length === 0) {
            return { totalSubmissions: submissionCount, totalGarments: 0, avgCo2: 0, avgWater: 0, mostCommonMaterial: 'N/A', maxDecay: 0 };
        }

        let totalCo2 = 0;
        let totalWater = 0;
        let totalGarments = 0;
        let maxDecay = 0;
        const materialCounts = {};

        allItems.forEach(item => {
            const quantity = item.quantity || 1;
            totalGarments += quantity;
            
            if (materialData[item.material] && fabricArea[item.type]) {
                const material = materialData[item.material];
                const area = fabricArea[item.type];
                
                totalCo2 += area * material.co2 * quantity;
                totalWater += area * material.water * quantity;

                if (material.decay > maxDecay) {
                    maxDecay = material.decay;
                }

                materialCounts[item.material] = (materialCounts[item.material] || 0) + quantity;
            }
        });

        const mostCommonMaterial = Object.keys(materialCounts).reduce((a, b) => materialCounts[a] > materialCounts[b] ? a : b);
        
        return {
            totalSubmissions: submissionCount,
            totalGarments: totalGarments,
            avgCo2: totalCo2 / totalGarments,
            avgWater: totalWater / totalGarments,
            mostCommonMaterial: mostCommonMaterial.charAt(0).toUpperCase() + mostCommonMaterial.slice(1),
            maxDecay: maxDecay,
        };
    }

    function renderStats(stats) {
        document.getElementById('total-submissions').textContent = stats.totalSubmissions.toLocaleString('nb-NO');
        document.getElementById('total-garments').textContent = stats.totalGarments.toLocaleString('nb-NO');
        document.getElementById('most-common-material').textContent = stats.mostCommonMaterial;
        document.getElementById('avg-co2').textContent = `${stats.avgCo2.toFixed(1)} kg`;
        document.getElementById('avg-water').textContent = `${Math.round(stats.avgWater).toLocaleString('nb-NO')} L`;
        document.getElementById('max-decay').textContent = `${stats.maxDecay} år`;
    }

    loadStatistics();
});
