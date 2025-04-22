document.addEventListener('DOMContentLoaded', () => {
    // jsPDF setup
    const { jsPDF } = window.jspdf;
    let spiderChart; // Declare chart variable upfront

    // --- Theme Toggle Elements / Logic ---
    const themeToggleButton = document.getElementById('theme-toggle');
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

    // Function to set theme
    function setTheme(isDark) {
        console.log('setTheme called with isDark:', isDark);
        if (isDark) {
            console.log('Applying dark theme...');
            document.documentElement.classList.add('dark');
            themeToggleLightIcon.classList.remove('hidden');
            themeToggleDarkIcon.classList.add('hidden');
            localStorage.theme = 'dark';
        } else {
            console.log('Applying light theme...');
            document.documentElement.classList.remove('dark');
            themeToggleDarkIcon.classList.remove('hidden');
            themeToggleLightIcon.classList.add('hidden');
            localStorage.theme = 'light';
        }
        // Update chart colors ONLY if chart exists
        if (typeof spiderChart !== 'undefined' && spiderChart) {
            console.log('Chart exists, calling updateChartColors...');
            updateChartColors(isDark);
        } else {
            console.log('Chart does not exist yet, skipping color update.');
        }
    }

    // Set initial theme based on localStorage or preference
    const isInitiallyDark = localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setTheme(isInitiallyDark);

    // Listener for toggle button
    themeToggleButton.addEventListener('click', () => {
        const isCurrentlyDark = document.documentElement.classList.contains('dark');
        console.log('Theme toggle clicked. Currently dark:', isCurrentlyDark);
        setTheme(!isCurrentlyDark); // Toggle the theme
    });

    // --- Chart Setup ---
    const ctx = document.getElementById('spiderChart').getContext('2d');
    let submissionTimestamp = null; // To store when data was submitted

    // Define colors for light/dark mode
    const lightModeColors = {
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        pointBackgroundColor: 'rgb(54, 162, 235)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(54, 162, 235)',
        gridColor: 'rgba(0, 0, 0, 0.1)',
        ticksColor: '#666',
        pointLabelsColor: '#333'
    };

    const darkModeColors = {
        backgroundColor: 'rgba(130, 180, 255, 0.25)', // Lighter blue for dark bg
        borderColor: 'rgb(130, 180, 255)',
        pointBackgroundColor: 'rgb(130, 180, 255)',
        pointBorderColor: '#1f2937', // Dark background color
        pointHoverBackgroundColor: '#1f2937',
        pointHoverBorderColor: 'rgb(130, 180, 255)',
        gridColor: 'rgba(255, 255, 255, 0.2)', // Lighter grid lines
        ticksColor: '#bbb',         // Lighter tick labels
        pointLabelsColor: '#ddd'    // Lighter axis labels
    };

    // Function to get current theme colors
    function getChartColors() {
        return document.documentElement.classList.contains('dark') ? darkModeColors : lightModeColors;
    }

    // Initial chart data
    const initialData = {
        labels: [
            'Strength', 'Aesthetics', 'Flexibility', 'Coordination', 'Easiness'
        ],
        datasets: [{
            label: 'Your Score',
            data: [0, 0, 0, 0, 0],
            fill: true,
            borderWidth: 2 // Slightly thinner line?
            // Colors are set below using getChartColors()
        }]
    };

    const config = {
        type: 'radar',
        data: initialData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { // Enhanced animation
                duration: 1000, // Longer duration
                easing: 'easeOutBounce' // A more noticeable easing
            },
            elements: {
                line: {
                    borderWidth: 3
                }
            },
            scales: {
                r: {
                    angleLines: {
                        display: true
                        // color will be updated
                    },
                    grid: {
                         // color will be updated
                    },
                    suggestedMin: 0,
                    suggestedMax: 10,
                    ticks: {
                         stepSize: 2,
                         backdropColor: 'transparent' // Ensure ticks background is transparent
                         // color will be updated
                    },
                     pointLabels: {
                        font: {
                            size: 14
                        }
                        // color will be updated
                    }
                }
            },
            plugins: {
                 legend: {
                    position: 'top',
                     labels: {
                        // color will be updated
                     }
                 },
                 tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Standard tooltip bg
                    titleFont: { size: 14 },
                    bodyFont: { size: 12 },
                    padding: 10,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) label += ': ';
                            if (context.parsed.r !== null) {
                                label += Number.isInteger(context.parsed.r) ? context.parsed.r : context.parsed.r.toFixed(1);
                            }
                            return label;
                        }
                    }
                 }
            }
        },
    };

    // Function to update chart colors based on theme
    function updateChartColors(isDark) {
        const colors = isDark ? darkModeColors : lightModeColors;

        // Update dataset colors
        spiderChart.data.datasets[0].backgroundColor = colors.backgroundColor;
        spiderChart.data.datasets[0].borderColor = colors.borderColor;
        spiderChart.data.datasets[0].pointBackgroundColor = colors.pointBackgroundColor;
        spiderChart.data.datasets[0].pointBorderColor = colors.pointBorderColor;
        spiderChart.data.datasets[0].pointHoverBackgroundColor = colors.pointHoverBackgroundColor;
        spiderChart.data.datasets[0].pointHoverBorderColor = colors.pointHoverBorderColor;

        // Update scale colors
        spiderChart.options.scales.r.angleLines.color = colors.gridColor;
        spiderChart.options.scales.r.grid.color = colors.gridColor;
        spiderChart.options.scales.r.ticks.color = colors.ticksColor;
        spiderChart.options.scales.r.pointLabels.color = colors.pointLabelsColor;

        // Update legend label colors
        spiderChart.options.plugins.legend.labels.color = colors.pointLabelsColor; // Use same color as point labels

        spiderChart.update('none'); // Update without animation for color changes
    }

    // Create the chart instance
    spiderChart = new Chart(ctx, config);
    // Apply initial theme colors
    updateChartColors(isInitiallyDark);

    // --- Metrics Data Structure ---
    const metricsData = {
        "Strength": [
            { id: "pushups", name: "Push-ups", unit: "reps", tracking: "Max reps in one set", scoreFn: scorePushups },
            { id: "pullups", name: "Pull-ups", unit: "reps", tracking: "Max reps in one set", scoreFn: scorePullups },
            { id: "plank", name: "Plank hold", unit: "seconds", tracking: "Time in seconds", scoreFn: scoreTimeHold, minVal: 30, maxVal: 180 },
            { id: "wallsit", name: "Wall sit", unit: "seconds", tracking: "Time in seconds", scoreFn: scoreTimeHold, minVal: 30, maxVal: 180 }
        ],
        "Aesthetics": [
            { id: "bodyfat", name: "Body Fat %", unit: "%", tracking: "Smart scale / US Navy Method", scoreFn: scoreBodyFat },
            { id: "bmi", name: "BMI", unit: "", tracking: "Weight ÷ height²", scoreFn: scoreBmi },
            { id: "whr", name: "Waist-to-Height Ratio", unit: "", tracking: "Waist ÷ Height", scoreFn: scoreWhr },
            { id: "musclemass", name: "Muscle Mass %", unit: "%", tracking: "Smart scale or DEXA scan", scoreFn: scoreMuscleMass },
            { id: "stw", name: "Shoulder-to-Waist Ratio", unit: "", tracking: "Shoulder ÷ Waist", scoreFn: scoreStw }
        ],
        "Flexibility": [
            { id: "sidesplit", name: "Side splits distance", unit: "cm", tracking: "Cm from floor", scoreFn: scoreSideSplit },
            { id: "forwardfold", name: "Seated forward fold reach", unit: "cm", tracking: "Cm past toes", scoreFn: scoreForwardFold },
            { id: "shouldermobility", name: "Shoulder mobility", unit: "pass/fail/angle", tracking: "Wall test or stick rotation", scoreFn: scoreShoulderMobility }, // Needs specific handling
            { id: "hamstring", name: "Hamstring raise angle", unit: "°", tracking: "Straight leg raise angle (°)", scoreFn: scoreHamstringRaise },
            { id: "backbend", name: "Backbend depth", unit: "description", tracking: "Cobra pose or wheel photo", scoreFn: scoreBackbend } // Needs specific handling
        ],
        "Coordination": [
            { id: "onelegbalance", name: "One-leg balance", unit: "seconds", tracking: "Seconds held (eyes closed)", scoreFn: scoreOneLegBalance },
            { id: "reflex", name: "Reflex test", unit: "ms", tracking: "Ruler drop test or app (ms)", scoreFn: scoreReflex }
        ],
        "Easiness": [
            { id: "breathhold", name: "Breath Holding Time", unit: "seconds", tracking: "Time after normal inhale", scoreFn: scoreBreathHold },
            { id: "vo2max", name: "VO2 Max Estimate", unit: "value", tracking: "Fitness band or Cooper test", scoreFn: scoreVo2Max },
            { id: "restinghr", name: "Resting Heart Rate", unit: "bpm", tracking: "Morning pulse (bpm)", scoreFn: scoreRestingHr }
        ]
    };

    // --- Scoring Functions ---
    // Helper to clamp score between 0 and 10
    function clampScore(score) {
        return Math.max(0, Math.min(10, score));
    }

    // Strength
    function scorePushups(reps) { return clampScore(reps / 5); } // 50 reps = 10
    function scorePullups(reps) { return clampScore(reps / 1.5); } // 15 reps = 10
    // Generic timed hold (Plank, Wall Sit)
    function scoreTimeHold(seconds, minSeconds = 30, maxSeconds = 180) { // min = 0 points, max = 10 points
        if (seconds < minSeconds) return 0;
        if (seconds >= maxSeconds) return 10;
        return clampScore(((seconds - minSeconds) / (maxSeconds - minSeconds)) * 10);
    }

    // Aesthetics
    function scoreBodyFat(percent) { // 10 = ~10-12%, 0 = >25%
        if (percent <= 12) return 10;
        if (percent > 25) return 0;
        // Linear decrease from 12% to 25%
        return clampScore(10 - ((percent - 12) / (25 - 12)) * 10);
    }
    function scoreBmi(bmi) { // 10 = 21–23, 0 = <18.5 or >30
        if (bmi >= 21 && bmi <= 23) return 10;
        if (bmi < 18.5 || bmi > 30) return 0;
        if (bmi < 21) return clampScore(((bmi - 18.5) / (21 - 18.5)) * 10); // Scale up from 18.5 to 21
         // Scale down from 23 to 30
        return clampScore(10 - ((bmi - 23) / (30 - 23)) * 10);
    }
     function scoreWhr(ratio) { // 10 = 0.45–0.49, 0 = >0.55
        if (ratio >= 0.45 && ratio <= 0.49) return 10;
        if (ratio > 0.55) return 0;
        if (ratio < 0.45) return 0; // Assuming below ideal is also 0 for this metric
         // Linear decrease from 0.49 to 0.55
        return clampScore(10 - ((ratio - 0.49) / (0.55 - 0.49)) * 10);
    }
    function scoreMuscleMass(percent) { // 10 = >38%, 0 = <30%
         if (percent >= 38) return 10;
         if (percent < 30) return 0;
         // Linear increase from 30% to 38%
         return clampScore(((percent - 30) / (38 - 30)) * 10);
    }
    function scoreStw(ratio) { // 10 = 1.6+, 0 = <1.2
        if (ratio >= 1.6) return 10;
        if (ratio < 1.2) return 0;
        // Linear increase from 1.2 to 1.6
        return clampScore(((ratio - 1.2) / (1.6 - 1.2)) * 10);
    }

    // Flexibility - Some need refinement based on how input is captured
    function scoreSideSplit(cmGap) { // 10 = full split (0cm), 0 = >50cm gap
        if (cmGap <= 0) return 10;
        if (cmGap > 50) return 0;
        // Linear decrease score as gap increases
        return clampScore(10 - (cmGap / 50) * 10);
    }
    function scoreForwardFold(cmPastToes) { // 10 = +15cm, 0 = can't reach toes (< 0 cm)
        if (cmPastToes >= 15) return 10;
        if (cmPastToes < 0) return 0;
        // Linear increase from 0cm to 15cm
        return clampScore((cmPastToes / 15) * 10);
    }
    function scoreShoulderMobility(value) {
        // Needs defined input: e.g., 0=fail, 5=partial, 10=pass or angle
        // Placeholder: assuming 10 for full pass, 0 otherwise
        return (value === "pass" || value >= 90) ? 10 : 0; // Example, adjust based on actual input method
    }
     function scoreHamstringRaise(angle) { // 10 = 90°+, 0 = <40°
        if (angle >= 90) return 10;
        if (angle < 40) return 0;
        // Linear increase from 40 to 90
        return clampScore(((angle - 40) / (90 - 40)) * 10);
    }
    function scoreBackbend(value) {
        // Needs defined input: e.g., 0=minimal, 5=cobra_touch_feet, 10=wheel_head_feet
         // Placeholder:
         if (value === "head_to_feet") return 10;
         if (value === "cobra_touch_feet") return 8; // Example intermediate score
         if (value === "minimal_lift") return 0;
         return 0; // Default
    }

    // Coordination
    function scoreOneLegBalance(seconds) { // 10 = 60s+, 0 = <5s
        if (seconds >= 60) return 10;
        if (seconds < 5) return 0;
        // Linear increase from 5s to 60s
        return clampScore(((seconds - 5) / (60 - 5)) * 10);
    }
    function scoreReflex(ms) { // 10 = <150ms, 0 = >400ms
        if (ms <= 150) return 10;
        if (ms > 400) return 0;
        // Linear decrease score as time increases
        return clampScore(10 - ((ms - 150) / (400 - 150)) * 10);
    }

    // Easiness
    function scoreBreathHold(seconds) { // 10 = 90s+, 0 = <30s
        if (seconds >= 90) return 10;
        if (seconds < 30) return 0;
        return clampScore(((seconds - 30) / (90 - 30)) * 10);
    }
    function scoreVo2Max(value) { // 10 = >50, 0 = <30
        if (value >= 50) return 10;
        if (value < 30) return 0;
        return clampScore(((value - 30) / (50 - 30)) * 10);
    }
    function scoreRestingHr(bpm) { // 10 = <60 bpm, 0 = >85
        if (bpm <= 60) return 10;
        if (bpm > 85) return 0;
        return clampScore(10 - ((bpm - 60) / (85 - 60)) * 10);
    }

    // --- Aggregation Logic ---
    function calculateCategoryScores(rawInputs) {
        const categoryScores = {};
        const finalScores = [];

        for (const category in metricsData) {
            let totalScore = 0;
            let count = 0;
            metricsData[category].forEach(metric => {
                const rawValue = rawInputs[metric.id]; // e.g., rawInputs['pushups']
                if (rawValue !== undefined && rawValue !== null && rawValue !== '') {
                    // Handle special cases like pass/fail or descriptive inputs if needed
                    let score;
                     // Pass necessary extra params for generic functions like scoreTimeHold
                    if (metric.scoreFn === scoreTimeHold) {
                        score = metric.scoreFn(parseFloat(rawValue), metric.minVal, metric.maxVal);
                    } else {
                        // Assume numeric input for others unless specifically handled
                         score = metric.scoreFn(parseFloat(rawValue)); // Or handle non-numeric cases
                    }

                    if (!isNaN(score)) {
                        totalScore += score;
                        count++;
                    } else {
                        console.warn(`Could not calculate score for ${metric.id} with value: ${rawValue}`);
                    }
                } else {
                     console.warn(`Missing input for ${metric.id}`);
                }
            });
            categoryScores[category] = (count > 0) ? (totalScore / count) : 0;
            finalScores.push(categoryScores[category]); // Maintain order for chart
        }

        console.log("Calculated Category Scores:", categoryScores);
        return finalScores; // Returns array: [StrengthScore, AestheticsScore, ...]
    }

    // --- DOM Elements ---
    const welcomeSection = document.getElementById('welcome-section');
    const getStartedButton = document.getElementById('get-started-button');
    const chartSection = document.getElementById('chart-section');
    const updateScoresButton = document.getElementById('update-scores-button');
    const downloadReportButton = document.getElementById('download-report-button');
    const inputSection = document.getElementById('input-section');
    const metricsForm = document.getElementById('metrics-form');
    const stepIndicator = document.getElementById('step-indicator');
    const categoryTitle = inputSection.querySelector('h2');

    // --- State ---
    let currentCategoryIndex = 0;
    const categories = Object.keys(metricsData);
    let allRawInputs = {}; // Object to store inputs across steps

    // --- Functions ---

    function showSection(sectionToShow) {
        [welcomeSection, chartSection, inputSection].forEach(section => {
            if (section.id === sectionToShow) {
                section.classList.remove('hidden');
                // Optional: Add transition classes if desired
                // section.classList.add('transition', 'duration-500', 'ease-in-out', 'opacity-100');
            } else {
                section.classList.add('hidden');
                 // section.classList.remove('opacity-100');
                 // section.classList.add('opacity-0');
            }
        });
    }

    function renderInputForm(categoryIndex) {
        const categoryName = categories[categoryIndex];
        const metrics = metricsData[categoryName];
        metricsForm.innerHTML = ''; // Clear previous form content

        // Update Step Indicator and Title
        stepIndicator.textContent = `Step ${categoryIndex + 1} of ${categories.length}`;
        categoryTitle.textContent = categoryName;

        metrics.forEach(metric => {
            const value = allRawInputs[metric.id] || ''; // Pre-fill
            const formGroup = document.createElement('div');
            formGroup.classList.add('mb-5'); // Tailwind margin bottom

            const label = document.createElement('label');
            label.htmlFor = metric.id;
            // Added Tailwind classes for styling
            label.className = 'block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300';
            label.innerHTML = `${metric.name} <span class="text-xs text-gray-500 dark:text-gray-400 font-normal">(${metric.tracking})</span>`; // Use innerHTML for span

            const input = document.createElement('input');
             if (metric.unit === 'seconds' || metric.unit === 'reps' || metric.unit === 'cm' || metric.unit === '%' || metric.unit === '°' || metric.unit === 'ms' || metric.unit === 'bpm' || metric.unit === 'value') {
                input.type = 'number';
                input.step = (metric.unit === '%' || metric.unit === '' || metric.id === 'whr' || metric.id === 'stw') ? '0.01' : '1'; // Finer step for ratios/percentages
            } else if (metric.unit === 'pass/fail/angle' || metric.unit === 'description') {
                 input.type = 'text'; // Keep as text for now
                 // TODO: Consider select dropdowns for better UX here
                 // Example placeholder improvement:
                 if (metric.id === 'shouldermobility') input.placeholder = 'e.g., pass, fail, 45'
                 if (metric.id === 'backbend') input.placeholder = 'e.g., minimal_lift, cobra_touch_feet, head_to_feet'

            } else {
                input.type = 'text';
            }
            input.id = metric.id;
            input.name = metric.id;
            // Apply Tailwind classes for input styling
            input.className = 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500';
             if (!input.placeholder) { // Add placeholder only if not already set
                input.placeholder = `Enter ${metric.unit || 'value'}`;
            }
            input.value = value;
            input.required = true;

            formGroup.appendChild(label);
            formGroup.appendChild(input);
            metricsForm.appendChild(formGroup);
        });

        // Navigation Buttons - Applying Tailwind classes
        const navContainer = document.createElement('div');
        navContainer.className = 'flex mt-8'; // Justify will be handled by spacer or button placement

        if (categoryIndex > 0) {
            const prevButton = document.createElement('button');
            prevButton.type = 'button';
            prevButton.textContent = 'Previous';
            // Tailwind classes for Previous button
            prevButton.className = 'bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out';
            prevButton.addEventListener('click', () => {
                saveCurrentInputs();
                currentCategoryIndex--;
                renderInputForm(currentCategoryIndex);
            });
            navContainer.appendChild(prevButton);
        }

        // Add a spacer to push next/calculate button to the right
        const spacer = document.createElement('div');
        spacer.className = 'flex-grow';
        navContainer.appendChild(spacer);

        if (categoryIndex < categories.length - 1) {
            const nextButton = document.createElement('button');
            nextButton.type = 'button';
            nextButton.textContent = 'Next';
            // Tailwind classes for Next button
            nextButton.className = 'bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out';
            nextButton.addEventListener('click', () => {
                if (validateCurrentInputs()) {
                    saveCurrentInputs();
                    currentCategoryIndex++;
                    renderInputForm(currentCategoryIndex);
                }
            });
            navContainer.appendChild(nextButton);
        } else {
            const calculateButton = document.createElement('button');
            calculateButton.type = 'submit';
            calculateButton.textContent = 'Calculate & View Chart';
            // Tailwind classes for Calculate button
            calculateButton.className = 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out';
            // Event listener is attached to the form's submit event
            navContainer.appendChild(calculateButton);
        }

        metricsForm.appendChild(navContainer);
    }

    // Save inputs from the current step before navigating
    function saveCurrentInputs() {
        const inputs = metricsForm.querySelectorAll('input'); // Also consider select/textarea if added later
        inputs.forEach(input => {
            if (input.name) {
                // Trim whitespace from text inputs
                allRawInputs[input.name] = typeof input.value === 'string' ? input.value.trim() : input.value;
            }
        });
         // console.log("Saved Inputs:", allRawInputs);
    }

     // Basic validation for the current step's inputs
    function validateCurrentInputs() {
        const inputs = metricsForm.querySelectorAll('input[required]');
        let isValid = true;
        // Clear previous errors (if implemented visually)
        // inputs.forEach(input => input.classList.remove('border-red-500'));

        for (const input of inputs) { // Use for...of to allow early exit
             const labelText = input.previousElementSibling?.textContent?.split(' (')[0] || 'field'; // Get label text
            if (!input.value.trim()) {
                 // Visual feedback could be added here (e.g., red border)
                 // input.classList.add('border-red-500');
                alert(`Please fill in the value for ${labelText}`);
                input.focus();
                isValid = false;
                break; // Stop validation on first error
            }
             if (input.type === 'number' && isNaN(parseFloat(input.value))) {
                 // input.classList.add('border-red-500');
                alert(`Please enter a valid number for ${labelText}`);
                input.focus();
                isValid = false;
                break; // Stop validation on first error
            }
        }
        return isValid;
    }

    // --- Event Listeners ---

    getStartedButton.addEventListener('click', () => {
        console.log("Assessment started!");
        currentCategoryIndex = 0;
        allRawInputs = {}; // Reset inputs
        submissionTimestamp = null; // Reset timestamp
        downloadReportButton.classList.add('hidden'); // Hide download button
        renderInputForm(currentCategoryIndex);
        showSection('input-section');
    });

    updateScoresButton.addEventListener('click', () => {
        // Same action as Get Started: restart the input process
        console.log("Updating scores!");
        currentCategoryIndex = 0;
        allRawInputs = {}; // Reset inputs
        submissionTimestamp = null; // Reset timestamp
        downloadReportButton.classList.add('hidden'); // Hide download button
        renderInputForm(currentCategoryIndex);
        showSection('input-section');
    });

    // Download Report Button Listener
    downloadReportButton.addEventListener('click', generatePDF);

    // Form Submission (Update chart, store timestamp, show download button)
    metricsForm.addEventListener('submit', (event) => {
        event.preventDefault();
         if (!validateCurrentInputs()) {
            return;
        }
        saveCurrentInputs();
        console.log("Calculating scores with final inputs:", allRawInputs);
        submissionTimestamp = new Date(); // Store the submission time

        const finalScores = calculateCategoryScores(allRawInputs);
        // updateChart(finalScores); // <-- Move this call

        downloadReportButton.classList.remove('hidden'); // Show download button
        showSection('chart-section');
        updateChart(finalScores); // <-- Call update AFTER section is visible
    });

    // Update Chart Data Function (Keep as is)
    function updateChart(newData) {
        spiderChart.data.datasets[0].data = newData;
        spiderChart.update(); // Default update uses animation config
    }

    // --- PDF Generation ---
    function generatePDF() {
        if (!allRawInputs || Object.keys(allRawInputs).length === 0) {
            alert("No data available to generate report.");
            return;
        }

        const doc = new jsPDF();
        const chartImage = spiderChart.toBase64Image('image/png', 1.0);
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight(); // Use if needed for centering
        const margin = 15;
        const contentWidth = pageWidth - 2 * margin;
        let currentY = margin;

        // Title
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text("Fitness Assessment Report", pageWidth / 2, currentY, { align: 'center' });
        currentY += 10;

        // Date Recorded
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        const formattedDate = submissionTimestamp
            ? submissionTimestamp.toLocaleString()
            : 'Date not recorded';
        doc.text(`Date Recorded: ${formattedDate}`, pageWidth / 2, currentY, { align: 'center' });
        currentY += 10;

        // --- Add Chart Image with Background ---
        // Determine background color based on theme
        const isDark = document.documentElement.classList.contains('dark');
        const chartBgColor = isDark ? '#1f2937' : '#ffffff'; // gray-800 or white

        // Get chart dimensions for PDF
        const aspectRatio = spiderChart.width / spiderChart.height;
        const imgWidth = contentWidth * 0.8; // Make chart slightly smaller than full width
        const imgHeight = imgWidth / aspectRatio;
        const imgX = (pageWidth - imgWidth) / 2; // Center the image

        // Draw background rectangle
        doc.setFillColor(chartBgColor);
        doc.rect(imgX, currentY, imgWidth, imgHeight, 'F'); // 'F' for fill

        // Add Chart Image on top of background
        doc.addImage(chartImage, 'PNG', imgX, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 15;

        // --- Add Raw Input Data ---
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text("Submitted Data", margin, currentY);
        currentY += 8;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        const lineSpacing = 6;

        for (const category in metricsData) {
             if (currentY > pageHeight - margin * 2) { // Check for page break
                doc.addPage();
                currentY = margin;
            }
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text(category, margin, currentY);
            currentY += lineSpacing * 1.5;
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');

            metricsData[category].forEach(metric => {
                 if (currentY > pageHeight - margin) { // Check for page break
                    doc.addPage();
                    currentY = margin;
                     // Repeat category header on new page if needed (optional)
                     // doc.setFontSize(12);
                     // doc.setFont(undefined, 'bold');
                     // doc.text(category + " (cont.)", margin, currentY);
                     // currentY += lineSpacing * 1.5;
                     // doc.setFontSize(10);
                     // doc.setFont(undefined, 'normal');
                 }
                const rawValue = allRawInputs[metric.id] || 'N/A';
                const unitLabel = metric.unit ? ` (${metric.unit})` : '';
                doc.text(`${metric.name}:`, margin + 5, currentY);
                doc.text(`${rawValue}${unitLabel}`, contentWidth / 2 + margin, currentY);
                currentY += lineSpacing;
            });
            currentY += lineSpacing; // Extra space between categories
        }

        doc.save('fitness-report.pdf');
    }

    // --- Initial State ---
    showSection('welcome-section'); // Show welcome screen first

    // Example usage after calculations:
    // const finalScores = [7.25, 8, 6.8, 7.5, 7.33]; // Using your test data averages
    // updateChart(finalScores);

}); 