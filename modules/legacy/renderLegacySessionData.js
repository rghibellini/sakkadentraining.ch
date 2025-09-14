export function renderLegacySessionData(sessions, mode) {
    const container = document.getElementById('session-data');
    if (!container) return;

    let htmlContent = '';
    let sessionData = [];

    const labels = {
        reactionTime: "Mittlere Reaktionszeit",
        leftRT: "Mittlere Reaktionszeit (Links)",
        rightRT: "Mittlere Reaktionszeit (Rechts)",
        correctPerc: "Trefferquote (%)",
        missedPerc: "Verpasst (%)",
        falsePerc: "Falsch (%)"
    };

    const reactionTimeColors = window.reactionTimeColors;

    if (mode === 'normal' || mode === 'folgen') {
        const quadrantHtml = renderQuadrantGrid(sessions);
        sessionData = sessions.map(session => {
            const data = JSON.parse(session.data);
            const meanRT = data.trials.reduce((sum, t) => sum + (t.reactionTime || t.responseTime || 0), 0) / data.trials.length || 0;
            const hitRate = (data.trials.filter(t => t.hit).length / data.trials.length) * 100 || 0;
            return { id: session.id, startTime: session.start_time, meanRT, hitRate };
        });
        htmlContent = `
            <h2>Grafiken</h2>
            <div class="data-split">
                <div class="graph-toggle-buttons" style="margin-bottom: 1vh; text-align: center;">
                    <button id="toggleQuadrant" class="mode-tab" style="margin-right: 0.5vw;">Quadrantengrafik</button>
                    <button id="toggleLineChart" class="mode-tab">Liniengrafik</button>
                </div>
                <div class="graph-panel-wrapper" style="width: 100%; display: flex; justify-content: center;">
                    <div id="quadrantGraph" class="graph-panel" style="margin-right: 2vw; display: flex; justify-content: center; align-items: center;">${quadrantHtml}</div>
                    <div id="lineGraph" class="graph-panel" style="display: none; width: 100%; height: 49vh;">
                        <canvas id="session-line-chart" style="width: 100%; height: 49vh; display: block;"></canvas>
                    </div>
                </div>
            </div>
            <div class="session-text">
                <h2>Sitzungen</h2>
                ${renderSessionStats(sessionData)}
            </div>`;

        container.innerHTML = htmlContent;
        const renderLineChart = () => updateSessionLineChart(sessionData);

        const toggleQuadrant = document.getElementById('toggleQuadrant');
        const toggleLine = document.getElementById('toggleLineChart');
        const quadGraph = document.getElementById('quadrantGraph');
        const lineGraph = document.getElementById('lineGraph');

        if (toggleQuadrant && toggleLine && quadGraph && lineGraph) {
            toggleQuadrant.addEventListener('click', () => {
                quadGraph.style.display = 'block';
                lineGraph.style.display = 'none';
                toggleQuadrant.classList.add('active');
                toggleLine.classList.remove('active');
            });

            toggleLine.addEventListener('click', () => {
                quadGraph.style.display = 'none';
                lineGraph.style.display = 'block';
                toggleLine.classList.add('active');
                toggleQuadrant.classList.remove('active');

                // Delay rendering to ensure visibility is committed
                setTimeout(() => {
                    renderLineChart();

                    // Force Chart.js to recompute layout just in case
                    if (window.sessionLineChart) {
                        window.sessionLineChart.resize();
                    }
                }, 50); // small delay, usually enough
            });
        }

    } else if (mode === 'reihenfolge') {
        sessionData = sessions.map(session => {
            const data = JSON.parse(session.data);
            const trials = data.trials;
            const totalTrials = trials.length;
            const trialHitRates = trials.map(trial => Math.max(0, 100 * (1 - (trial.misclicks / 6))));
            const hitRate = trialHitRates.reduce((sum, rate) => sum + rate, 0) / totalTrials || 0;
            const meanRT = trials.reduce((sum, trial) => sum + trial.duration, 0) / totalTrials || 0;
            return { id: session.id, startTime: session.start_time, hitRate, meanRT };
        });

        container.innerHTML = `
            <h2>Grafiken</h2>
            <div class="charts-container-full">
                <canvas id="reihenfolge-chart" width="100%" height="49vh"></canvas>
            </div>
            <div class="session-text">
                <h2>Sitzungen</h2>
                ${renderSessionStats(sessionData)}
            </div>`;

        updateReihenfolgeChart(sessionData);

    } else if (mode === 'punkte' || mode === 'vergleich') {
        sessionData = sessions.map(session => {
            const data = JSON.parse(session.data);
            const totalTrials = data.trials.length;
            const correct = data.trials.filter(t => t.hit).length;
            const late = data.trials.filter(t => t.late).length;
            const missed = data.trials.filter(t => t.missed).length;
            const wrong = data.trials.filter(t => t.wrong).length;
            const meanRT = data.trials.reduce((sum, t) => sum + (t.reactionTime || t.responseTime || 0), 0) / totalTrials || 0;
            return {
                id: session.id,
                startTime: session.start_time,
                meanRT,
                correctPerc: (correct / totalTrials) * 100 || 0,
                latePerc: (late / totalTrials) * 100 || 0,
                missedPerc: (missed / totalTrials) * 100 || 0,
                wrongPerc: (wrong / totalTrials) * 100 || 0
            };
        });

        container.innerHTML = `
            <h2>Grafiken</h2>
            <div class="charts-container-full">
                <canvas id="session-stacked-bar" width="100%" height="49vh"></canvas>
            </div>
            <div class="session-text">
                <h2>Sitzungen</h2>
                ${renderSessionStats(sessionData)}
            </div>`;

        updatePunkteVergleichStackedBar(sessionData);
    } else if (mode === 'autofahren') {
        sessionData = sessions.map(session => {
            const data = JSON.parse(session.data);
            const leftRTs = [];
            const rightRTs = [];
            let hitLeft = 0, hitRight = 0;
            let missedLeft = 0, missedRight = 0;
            let falseLeft = 0, falseRight = 0;

            data.trials.forEach(t => {
                if (t.side === 'left' && t.reactionTime != null) leftRTs.push(t.reactionTime);
                if (t.side === 'right' && t.reactionTime != null) rightRTs.push(t.reactionTime);

                if (t.hit && t.side === 'left') hitLeft++;
                if (t.hit && t.side === 'right') hitRight++;

                if (t.missed && t.side === 'left') missedLeft++;
                if (t.missed && t.side === 'right') missedRight++;

                if (t.false && t.side === 'left') falseLeft++;
                if (t.false && t.side === 'right') falseRight++;
            });

            const allRTs = [...leftRTs, ...rightRTs];
            const meanRT = average(allRTs); // ✅ new line

            const allTrials = data.trials.length;

            return {
                id: session.id,
                startTime: session.start_time,
                leftRT: average(leftRTs),
                rightRT: average(rightRTs),
                reactionTime: meanRT,
                hitLeftPerc: (hitLeft / allTrials) * 100,
                hitRightPerc: (hitRight / allTrials) * 100,
                missedLeftPerc: (missedLeft / allTrials) * 100,
                missedRightPerc: (missedRight / allTrials) * 100,
                falseLeftPerc: (falseLeft / allTrials) * 100,
                falseRightPerc: (falseRight / allTrials) * 100
            };
        });

        container.innerHTML = `
        <h2>Grafiken</h2>
        <div class="charts-container-full">
            <canvas id="autofahren-bar-chart" width="100%" height="49vh"></canvas>
        </div>
        <div class="session-text">
            <h2>Sitzungen</h2>
            ${renderSessionStats(sessionData)}
        </div>`;

        updateAutofahrenBarChart(sessionData);
    } else if (mode === 'fangen') {
        sessionData = sessions.map(session => {
            const data = JSON.parse(session.data);
            const total = data.trials.length;
            const hit = data.trials.filter(t => t.hit).length;
            const early = data.trials.filter(t => t.early).length;
            const missed = data.trials.filter(t => t.missed).length;

            return {
                id: session.id,
                startTime: session.start_time,
                hitPerc: (hit / total) * 100,
                earlyPerc: (early / total) * 100,
                missedPerc: (missed / total) * 100
            };
        });

        container.innerHTML = `
        <h2>Grafiken</h2>
        <div class="charts-container-full">
            <canvas id="fangen-chart" width="100%" height="49vh"></canvas>
        </div>
        <div class="session-text">
            <h2>Sitzungen</h2>
            ${renderSessionStats(sessionData)}
        </div>`;

        updateFangenChart(sessionData);


        attachDeleteListeners();
    } else if (mode === 'schiessen') {
        sessionData = sessions.map(session => {
            const data = JSON.parse(session.data);
            const trials = data.trials || [];
            const total = trials.length;
            const hit = trials.filter(t => t.hit).length;
            const missed = trials.filter(t => t.missed).length;
            const wrong = trials.filter(t => t.false).length;

            return {
                id: session.id,
                startTime: session.start_time,
                hitPerc: (hit / total) * 100,
                missedPerc: (missed / total) * 100,
                falsePerc: (wrong / total) * 100
            };
        });

        container.innerHTML = `
        <h2>Grafiken</h2>
        <div class="charts-container-full">
            <canvas id="schiessen-chart" width="100%" height="49vh"></canvas>
        </div>
        <div class="session-text">
            <h2>Sitzungen</h2>
            ${renderSessionStats(sessionData)}
        </div>`;

        updateSchiessenChart(sessionData);
    } else if (mode === 'schwimmen') {
        const quadrantHtml = renderQuadrantGrid(sessions);
        sessionData = sessions.map(session => {
            const data = JSON.parse(session.data);
            const trials = data.trials;
            const hitRate = (trials.filter(t => t.hit).length / trials.length) * 100 || 0;
            const meanRT = trials.reduce((sum, t) => sum + (t.reactionTime || 0), 0) / trials.length || 0;

            return {
                id: session.id,
                startTime: session.start_time,
                hitRate,
                meanRT
            };
        });

        htmlContent = `
        <h2>Grafiken</h2>
        <div class="data-split">
            <div class="graph-toggle-buttons" style="margin-bottom: 1vh; text-align: center;">
                <button id="toggleQuadrant" class="mode-tab" style="margin-right: 0.5vw;">Quadrantengrafik</button>
                <button id="toggleLineChart" class="mode-tab">Liniengrafik</button>
            </div>
            <div class="graph-panel-wrapper" style="width: 100%; display: flex; justify-content: center;">
                <div id="quadrantGraph" class="graph-panel" style="margin-right: 2vw; display: flex; justify-content: center; align-items: center;">${quadrantHtml}</div>
                <div id="lineGraph" class="graph-panel" style="display: none; width: 100%; height: 49vh;">
                    <canvas id="session-line-chart" style="width: 100%; height: 49vh; display: block;"></canvas>
                </div>
            </div>
        </div>
        <div class="session-text">
            <h2>Sitzungen</h2>
            ${renderSessionStats(sessionData)}
        </div>`;

        container.innerHTML = htmlContent;
        const renderLineChart = () => updateSessionLineChart(sessionData);

        const toggleQuadrant = document.getElementById('toggleQuadrant');
        const toggleLine = document.getElementById('toggleLineChart');
        const quadGraph = document.getElementById('quadrantGraph');
        const lineGraph = document.getElementById('lineGraph');

        if (toggleQuadrant && toggleLine && quadGraph && lineGraph) {
            toggleQuadrant.addEventListener('click', () => {
                quadGraph.style.display = 'block';
                lineGraph.style.display = 'none';
                toggleQuadrant.classList.add('active');
                toggleLine.classList.remove('active');
            });

            toggleLine.addEventListener('click', () => {
                quadGraph.style.display = 'none';
                lineGraph.style.display = 'block';
                toggleLine.classList.add('active');
                toggleQuadrant.classList.remove('active');
                setTimeout(() => {
                    renderLineChart();
                    if (window.sessionLineChart) window.sessionLineChart.resize();
                }, 50);
            });
        }
    }

    function attachDeleteListeners() {
        document.querySelectorAll('.delete-session').forEach(button => {
            button.addEventListener('click', async () => {
                const sessionId = button.dataset.sessionId;
                if (confirm('Diese Sitzung wirklich löschen?')) {
                    try {
                        const res = await fetch('sessions/delete_session.php', {  // ✅ fix URL
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: `session_id=${encodeURIComponent(sessionId)}`
                        });
                        const data = await res.json();
                        if (!data.success) {
                            alert('Löschen fehlgeschlagen: ' + (data.message || 'Unbekannter Fehler'));
                        } else {
                            const activeProfile = document.querySelector('.profile-tab.active')?.dataset.profileId;
                            const mode = document.querySelector('.mode-tab.active')?.dataset.mode;
                            if (activeProfile && mode) {
                                await window.loadSessions(activeProfile, mode);
                            }
                        }
                    } catch (err) {
                        alert('Netzwerkfehler beim Löschen.');
                        console.error(err);
                    }
                }
            });
        });
    }

    function average(arr) {
        return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    }

    function renderSessionStats(sessionData) {
        if (!sessionData.length) return 'Keine Sitzungsdaten verfügbar.';

        const isAutofahren = sessionData[0].leftRT !== undefined && sessionData[0].rightRT !== undefined;

        return sessionData.map((s, index) => {
            const date = new Date(s.startTime);
            const dateStr = date.toLocaleDateString();
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            let html = `
            <div style="position: relative;">
                <strong style="color: rgba(42, 86, 116, 1);">Sitzung ${index + 1} (${dateStr}, ${timeStr})</strong>:<br>
        `;

            // ✅ Mittlere Reaktionszeit (always shown)
            const rt = s.reactionTime ?? s.meanRT;
            if (rt != null) {
                html += `<strong>Mittlere Reaktionszeit:</strong> ${rt.toFixed(2)} ms<br>`;
            }

            // ✅ For Autofahren: also show left and right
            if (isAutofahren) {
                if (s.leftRT != null) html += `<strong>Mittlere Reaktionszeit (Links):</strong> ${s.leftRT.toFixed(2)} ms<br>`;
                if (s.rightRT != null) html += `<strong>Mittlere Reaktionszeit (Rechts):</strong> ${s.rightRT.toFixed(2)} ms<br>`;
            }

            // Other performance metrics
            if (s.hitRate != null) html += `<strong>Treffer:</strong> ${s.hitRate.toFixed(2)}%<br>`;
            if (s.correctPerc != null) html += `<strong>Treffer:</strong> ${s.correctPerc.toFixed(2)}%<br>`;
            if (s.latePerc != null) html += `<strong>Verspätet:</strong> ${s.latePerc.toFixed(2)}%<br>`;
            if (s.missedPerc != null) html += `<strong>Verpasst:</strong> ${s.missedPerc.toFixed(2)}%<br>`;
            if (s.wrongPerc != null) html += `<strong>Falsch:</strong> ${s.wrongPerc.toFixed(2)}%<br>`;

            html += `
            <span class="delete-session" data-session-id="${s.id}" style="position: absolute; right: 0; top: 0; cursor: pointer; color: #173C56; font-size: 1.5em;">X</span>
            </div><hr>
        `;
            return html;
        }).join('');
    }

    function renderQuadrantGrid(sessions) {
        const quadrantData = {};
        sessions.forEach(session => {
            const sessionData = JSON.parse(session.data);
            sessionData.trials.forEach(trial => {
                if (trial.quadrant) {
                    if (!quadrantData[trial.quadrant]) {
                        quadrantData[trial.quadrant] = { rtSum: 0, hits: 0, total: 0 };
                    }
                    quadrantData[trial.quadrant].total++;
                    if (trial.hit) {
                        quadrantData[trial.quadrant].hits++;
                        quadrantData[trial.quadrant].rtSum += trial.reactionTime || trial.responseTime || 0;
                    }
                }
            });
        });

        let gridHtml = '<div class="quadrant-grid" style="display: grid; grid-template-columns: repeat(5, 150px); grid-template-rows: repeat(5, 150px); gap: 4px;">';
        for (let row = 1; row <= 5; row++) {
            for (let col = 1; col <= 5; col++) {
                if (row === 3 && col === 3) {
                    gridHtml += '<div class="quadrant-cell empty" style="background: transparent;"></div>';
                    continue;
                }
                const quadrant = `${row}-${col}`;
                const data = quadrantData[quadrant] || { rtSum: 0, hits: 0, total: 0 };
                const meanRT = data.total > 0 ? Math.round(data.rtSum / data.total) : 0;
                const hitRate = data.total > 0 ? (data.hits / data.total) * 100 : 0;

                let color = '#ffffff';
                if (data.total > 0) {
                    if (meanRT <= 300) color = reactionTimeColors['<=300'];
                    else if (meanRT <= 500) color = reactionTimeColors['<=500'];
                    else if (meanRT <= 700) color = reactionTimeColors['<=700'];
                    else if (meanRT <= 1000) color = reactionTimeColors['<=1000'];
                    else color = reactionTimeColors['>1000'];
                }

                gridHtml += `
                    <div class="quadrant-cell"
                        style="background-color:${color}; width:100%; height:100%;
                                display:flex; justify-content:center; align-items:center;">
                        <div class="quadrant-stats"
                            style="padding:2px 4px; border-radius:3px; font-size:1.25em;
                                    line-height:1.2; text-align:center;">
                        <span class="hit-rate">${hitRate.toFixed(0)}%</span><br>
                        <span class="reaction-time">${meanRT}ms</span>
                        </div>
                    </div>`;
            }
        }
        gridHtml += '</div>';
        return gridHtml;
    }

    function updateSessionLineChart(sessionData) {
        if (window.sessionLineChart) window.sessionLineChart.destroy();
        const ctx = document.getElementById('session-line-chart').getContext('2d');
        const labels = sessionData.map((_, i) => `Sitzung ${i + 1}`);
        const hitRates = sessionData.map(s => s.hitRate);
        const meanRTs = sessionData.map(s => s.meanRT);

        window.sessionLineChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Trefferquote (%)',
                        data: hitRates,
                        backgroundColor: '#8CD47E',
                        yAxisID: 'y',
                        order: 2
                    },
                    {
                        label: 'Mittlere Reaktionszeit (ms)',
                        data: meanRTs,
                        type: 'line',
                        borderColor: 'rgba(42, 86, 116, 1)',
                        backgroundColor: 'rgba(42, 86, 116, 0.2)',
                        yAxisID: 'y1',
                        order: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // ← this is key!
                scales: {
                    y: {
                        type: 'linear',
                        position: 'left',
                        max: 100,
                        title: { display: true, text: 'Trefferquote (%)' }
                    },
                    y1: {
                        type: 'linear',
                        position: 'right',
                        title: { display: true, text: 'Reaktionszeit (ms)' },
                        grid: { drawOnChartArea: false }
                    }
                }
            }
        });
    }

    function updateReihenfolgeChart(sessionData) {
        if (window.reihenfolgeChart) window.reihenfolgeChart.destroy();
        const ctx = document.getElementById('reihenfolge-chart').getContext('2d');
        const labels = sessionData.map((_, i) => `Sitzung ${i + 1}`);
        const hitRates = sessionData.map(s => s.hitRate);
        const meanRTs = sessionData.map(s => s.meanRT);

        window.reihenfolgeChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Trefferquote (%)',
                        data: hitRates,
                        backgroundColor: '#8CD47E',
                        yAxisID: 'y',
                        order: 2
                    },
                    {
                        label: 'Mittlere Reaktionszeit (ms)',
                        data: meanRTs,
                        type: 'line',
                        borderColor: 'rgba(42, 86, 116, 1)',
                        backgroundColor: 'rgba(42, 86, 116, 0.2)',
                        yAxisID: 'y1',
                        order: 1
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        type: 'linear',
                        position: 'left',
                        max: 100,
                        title: { display: true, text: 'Trefferquote (%)' }
                    },
                    y1: {
                        type: 'linear',
                        position: 'right',
                        title: { display: true, text: 'Reaktionszeit (ms)' },
                        grid: { drawOnChartArea: false }
                    }
                }
            }
        });
    }

    function updatePunkteVergleichStackedBar(sessionData) {
        if (window.stackedBarChart) window.stackedBarChart.destroy();
        const ctx = document.getElementById('session-stacked-bar').getContext('2d');
        const labels = sessionData.map((_, i) => `Sitzung ${i + 1}`);

        window.stackedBarChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Treffer',
                        data: sessionData.map(s => s.correctPerc),
                        backgroundColor: '#8CD47E',
                        stack: 'stack1'
                    },
                    {
                        label: 'Verspätet',
                        data: sessionData.map(s => s.latePerc),
                        backgroundColor: '#F8D66D',
                        stack: 'stack1'
                    },
                    {
                        label: 'Verpasst',
                        data: sessionData.map(s => s.missedPerc),
                        backgroundColor: '#FFB54C',
                        borderColor: 'rgba(42, 86, 116, 1)',
                        stack: 'stack1'
                    },
                    {
                        label: 'Falsch',
                        data: sessionData.map(s => s.wrongPerc),
                        backgroundColor: '#FF6961',
                        borderColor: 'rgba(42, 86, 116, 1)',
                        stack: 'stack1'
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        stacked: true
                    },
                    y: {
                        stacked: true,
                        max: 100,
                        title: { display: true, text: 'Antworten (%)' }
                    }
                }
            }
        });
    }

    function updateAutofahrenBarChart(sessionData) {
        const ctx = document.getElementById('autofahren-bar-chart')?.getContext('2d');
        if (!ctx) {
            console.error("❌ Cannot find canvas element with id 'autofahrenBarChart'");
            return;
        }

        if (window.autofahrenChart) {
            window.autofahrenChart.destroy();
        }

        const labels = sessionData.map((_, i) => `Sitzung ${i + 1}`);

        // Combine left and right percentages
        const combine = (keyLeft, keyRight) => sessionData.map(s => ((s[keyLeft] ?? 0) + (s[keyRight] ?? 0)));

        window.autofahrenChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Treffer (%)',
                        data: combine('hitLeftPerc', 'hitRightPerc'),
                        backgroundColor: '#8CD47E',
                        stack: 'stack1',
                        order: 2
                    },
                    {
                        label: 'Verpasst (%)',
                        data: combine('missedLeftPerc', 'missedRightPerc'),
                        backgroundColor: '#FFB54C',
                        stack: 'stack1',
                        order: 2
                    },
                    {
                        label: 'Falsch (%)',
                        data: combine('falseLeftPerc', 'falseRightPerc'),
                        backgroundColor: '#FF6961',
                        stack: 'stack1',
                        order: 2
                    },
                    {
                        label: 'RT Links (ms)',
                        data: sessionData.map(s => s.leftRT ?? NaN),
                        borderColor: 'rgba(42, 86, 116, 1)',
                        backgroundColor: 'rgba(42, 86, 116, 0.3)',
                        borderDash: [6, 4],
                        borderWidth: 2,
                        type: 'line',
                        yAxisID: 'y1',
                        spanGaps: true,
                        order: 1
                    },
                    {
                        label: 'RT Rechts (ms)',
                        data: sessionData.map(s => s.rightRT ?? NaN),
                        borderColor: 'rgba(42, 86, 116, 1)',
                        backgroundColor: 'rgba(42, 86, 116, 0.3)',
                        borderDash: [],
                        borderWidth: 2,
                        type: 'line',
                        yAxisID: 'y1',
                        spanGaps: true,
                        order: 1
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Autofahren: Leistung insgesamt',
                        font: { size: 18 }
                    },
                    tooltip: {
                        mode: 'nearest',
                        intersect: true
                    },
                    legend: {
                        position: 'top'
                    }
                },
                interaction: {
                    mode: 'nearest',
                    intersect: true
                },
                scales: {
                    x: {
                        stacked: true
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Antworten (%)'
                        }
                    },
                    y1: {
                        position: 'right',
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Reaktionszeit (ms)'
                        },
                        grid: { drawOnChartArea: false }
                    }
                }
            }
        });
    }

    function updateFangenChart(sessionData) {
        if (window.fangenChart) window.fangenChart.destroy();
        const ctx = document.getElementById('fangen-chart').getContext('2d');
        const labels = sessionData.map((_, i) => `Sitzung ${i + 1}`);

        window.fangenChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Treffer (%)',
                        data: sessionData.map(s => s.hitPerc),
                        backgroundColor: '#8CD47E',
                        stack: 'stack1'
                    },
                    {
                        label: 'Früh (%)',
                        data: sessionData.map(s => s.earlyPerc),
                        backgroundColor: '#FFB54C',
                        stack: 'stack1'
                    },
                    {
                        label: 'Verpasst (%)',
                        data: sessionData.map(s => s.missedPerc),
                        backgroundColor: '#FF6961',
                        stack: 'stack1'
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: { stacked: true },
                    y: {
                        stacked: true,
                        max: 100,
                        title: { display: true, text: 'Antworten (%)' }
                    }
                }
            }
        });
    }

    function updateSchiessenChart(sessionData) {
        if (window.schiessenChart) window.schiessenChart.destroy();
        const ctx = document.getElementById('schiessen-chart').getContext('2d');
        const labels = sessionData.map((_, i) => `Sitzung ${i + 1}`);

        window.schiessenChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Treffer (%)',
                        data: sessionData.map(s => s.hitPerc),
                        backgroundColor: '#8CD47E',
                        stack: 'stack1'
                    },
                    {
                        label: 'Falsch (%)',
                        data: sessionData.map(s => s.falsePerc),
                        backgroundColor: '#FFB54C',
                        stack: 'stack1'
                    },
                    {
                        label: 'Verpasst (%)',
                        data: sessionData.map(s => s.missedPerc),
                        backgroundColor: '#FF6961',
                        stack: 'stack1'
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: { stacked: true },
                    y: {
                        stacked: true,
                        max: 100,
                        title: { display: true, text: 'Antworten (%)' }
                    }
                }
            }
        });
    }
}
