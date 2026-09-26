import "./style.css";

import { SimulationEngine } from "./simulation/SimulationEngine";
import { Renderer } from "./rendering/Renderer";

const app =
  document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error(
    "Could not find #app element"
  );
}

// ============================================================
// ENGINE
// ============================================================

const engine =
  new SimulationEngine();

// ============================================================
// DASHBOARD HTML
// ============================================================

app.innerHTML = `
  <div class="app-shell">

    <!-- ======================================================
         HEADER
         ====================================================== -->

    <header class="topbar nexus-header">

      <div class="brand">
        <div class="brand-mark">N</div>
        <div class="brand-copy">
          <h1>NEXUS</h1>
          <p>Self-Healing Decentralized Multi-Robot Fleet</p>
        </div>
      </div>

      <div class="nexus-title-controls" aria-label="Simulation controls">
        <div class="header-action-group">
          <span class="header-label">SIM</span>
          <strong id="simulationTime" class="header-sim-time">0.0s</strong>
          <button id="startBtn" class="btn btn-primary header-btn"><svg class="vector-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7z"/></svg> Start</button>
          <button id="pauseBtn" class="btn header-btn"><svg class="vector-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5v14M17 5v14"/></svg> Pause</button>
          <button id="resetBtn" class="btn header-btn"><svg class="vector-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 1 0 2 5"/><path d="M20 5v6h-6"/></svg> Reset</button>
          <button id="generateBtn" class="btn btn-secondary header-btn"><svg class="vector-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg> Generate</button>
          <button id="assignBtn" class="btn btn-secondary header-btn"><svg class="vector-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg> Assign</button>
          <button id="autoAssignBtn" class="btn btn-secondary header-btn"><svg class="vector-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.2-1.7l2-1.2-2-3.4-2.1 1.2a7 7 0 0 0-2.9-1.7V2.8h-4v2.4a7 7 0 0 0-2.9 1.7L4.8 5.7l-2 3.4 2 1.2A7 7 0 0 0 4.6 12c0 .6.1 1.2.2 1.7l-2 1.2 2 3.4 2.1-1.2a7 7 0 0 0 2.9 1.7v2.4h4v-2.4a7 7 0 0 0 2.9-1.7l2.1 1.2 2-3.4-2-1.2c.1-.5.2-1.1.2-1.7z"/></svg> Auto: OFF</button>
          <button id="deadlockBtn" class="btn btn-warning header-btn"><svg class="vector-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 7h12M6 12h8M6 17h12"/><path d="m17 9 3 3-3 3"/></svg> Deadlock</button>
          <button id="failureBtn" class="btn btn-danger header-btn"><svg class="vector-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 9 17H3z"/><path d="M12 9v5M12 17h.01"/></svg> Fail Bot</button>
        </div>

        <div class="speed-control nexus-speed">
          <span>SPEED</span>
          <button class="speed-btn" data-speed="0.5">0.5×</button>
          <button class="speed-btn" data-speed="1">1×</button>
          <button class="speed-btn" data-speed="2">2×</button>
          <button class="speed-btn" data-speed="4">4×</button>
          <button class="speed-btn" data-speed="10">10×</button>
          <button class="speed-btn" data-speed="20">20×</button>
        </div>
      </div>

      <div class="system-status">
        <span id="statusDot" class="status-dot"></span>
        <div>
          <span id="systemStatus">SYSTEM READY</span>
          <small>Decentralized fleet controller</small>
        </div>
      </div>

    </header>


    <!-- ======================================================
         KPI CARDS
         ====================================================== -->

    <section class="kpi-grid">

      <div class="kpi-card">
        <span class="kpi-label">
          FLEET
        </span>

        <strong id="robotCount">
          0
        </strong>

        <small>
          Active robots
        </small>
      </div>


      <div class="kpi-card">
        <span class="kpi-label">
          TASKS
        </span>

        <strong id="taskCount">
          0
        </strong>

        <small>
          Total missions
        </small>
      </div>


      <div class="kpi-card">
        <span class="kpi-label">
          COMPLETED
        </span>

        <strong id="completedCount">
          0
        </strong>

        <small>
          Missions completed
        </small>
      </div>


      <div class="kpi-card">
        <span class="kpi-label">
          ACTIVE
        </span>

        <strong id="activeCount">
          0
        </strong>

        <small>
          Robots executing tasks
        </small>
      </div>

    </section>


    <!-- ======================================================
         MAIN CONTENT
         ====================================================== -->

    <main class="dashboard-grid">

      <!-- ====================================================
           LEFT COLUMN
           ==================================================== -->

      <section class="simulation-panel">

        <div class="panel-header">

          <div>
            <h2>Warehouse Simulation</h2>

            <p>
              Live decentralized fleet operation
            </p>
          </div>

          <div class="legend">

            <span>
              <i class="legend-dot picker"></i>
              Picker
            </span>

            <span>
              <i class="legend-dot carrier"></i>
              Carrier
            </span>

            <span>
              <i class="legend-dot inspection"></i>
              Inspection
            </span>

            <span>
              <i class="legend-dot emergency"></i>
              Emergency
            </span>

          </div>

        </div>

        <div class="canvas-wrapper">

          <canvas
            id="simulationCanvas"
          ></canvas>

          <div class="simulation-zoom-controls" aria-label="Simulation zoom controls">
            <button id="zoomOutBtn" class="zoom-btn" title="Zoom out" aria-label="Zoom out">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>
            </button>
            <button id="zoomResetBtn" class="zoom-btn zoom-reset" title="Reset zoom" aria-label="Reset zoom">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.35-5.65"/><path d="M4 5v5h5"/></svg>
            </button>
            <button id="zoomInBtn" class="zoom-btn" title="Zoom in" aria-label="Zoom in">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          </div>

        </div>

      </section>


      <!-- ====================================================
           RIGHT COLUMN
           ==================================================== -->

      <aside class="side-panel">

        <!-- ================================================
             NEGOTIATION
             ================================================ -->

        <section class="panel">

          <div class="panel-header compact">

            <div>
              <h2>🤝 Negotiation</h2>

              <p>
                Decentralized task allocation
              </p>
            </div>

            <span
              id="negotiationStatus"
              class="live-badge"
            >
              LIVE
            </span>

          </div>


          <div class="stat-grid">

            <div class="mini-stat">

              <span>
                Negotiations
              </span>

              <strong id="negotiationCount">
                0
              </strong>

            </div>

            <div class="mini-stat">

              <span>
                Contracts
              </span>

              <strong id="contractCount">
                0
              </strong>

            </div>

            <div class="mini-stat">

              <span>
                Avg Bids
              </span>

              <strong id="averageBids">
                0
              </strong>

            </div>

          </div>


          <div class="subheading">
            Current Negotiation
          </div>

          <div
            id="currentTaskNegotiation"
            class="negotiation-current"
          >
            Waiting for negotiation...
          </div>


          <div
            id="negotiationPanel"
            class="negotiation-list"
          >
            <div class="empty-state">
              No active negotiation
            </div>
          </div>

        </section>


        <!-- ================================================
             SAFETY MONITOR
             ================================================ -->

        <section class="panel safety-panel">

          <div class="panel-header compact">

            <div>
              <h2>⚠ Safety Monitor</h2>

              <p>
                Predictive collision analysis
              </p>
            </div>

            <span
              id="safetyBadge"
              class="safe-badge"
            >
              SAFE
            </span>

          </div>


          <div class="safety-summary">

            <div class="safety-stat">

              <span>
                Active Risks
              </span>

              <strong
                id="collisionCount"
              >
                0
              </strong>

            </div>


            <div class="safety-stat">

              <span>
                Warnings
              </span>

              <strong
                id="collisionWarnings"
              >
                0
              </strong>

            </div>

          </div>


          <div
            id="collisionPanel"
            class="collision-list"
          >
            <div class="empty-state">
              No predicted collisions
            </div>
          </div>

        </section>


        <!-- ================================================
             FLEET HEALTH
             ================================================ -->

        <section class="panel">

          <div class="panel-header compact">

            <div>
              <h2>Fleet Health</h2>

              <p>
                Robot operational status
              </p>
            </div>

          </div>

          <div
            id="fleetHealth"
            class="fleet-health"
          >
            100%
          </div>

        </section>

      </aside>

    </main>


    <!-- ======================================================
         LOWER DASHBOARD
         ====================================================== -->

    <section class="lower-grid">


      <!-- ====================================================
           ROBOT FLEET
           ==================================================== -->

      <section class="panel">

        <div class="panel-header compact">

          <div>
            <h2>Robot Fleet</h2>

            <p>
              Individual agent state
            </p>
          </div>

        </div>

        <div
          id="robotList"
          class="robot-list"
        ></div>

      </section>


      <!-- ====================================================
           TASK QUEUE
           ==================================================== -->

      <section class="panel">

        <div class="panel-header compact">

          <div>
            <h2>Task Queue</h2>

            <p>
              Mission lifecycle
            </p>
          </div>

        </div>

        <div
          id="taskList"
          class="task-list"
        ></div>

      </section>


      <!-- ====================================================
           SYSTEM
           ==================================================== -->

      <section class="panel system-panel">

        <div class="panel-header compact">

          <div>
            <h2>System</h2>

            <p>
              Runtime information
            </p>
          </div>

        </div>


        <div class="system-info">

          <div>
            <span>
              Pending Tasks
            </span>

            <strong id="pendingTasks">
              0
            </strong>
          </div>


          <div>
            <span>
              Collision Warnings
            </span>

            <strong id="systemCollisionWarnings">
              0
            </strong>
          </div>


          <div>
            <span>
              Completed Tasks
            </span>

            <strong id="systemCompletedTasks">
              0
            </strong>
          </div>

        </div>

      </section>

    </section>

  </div>
`;


// ============================================================
// DOM REFERENCES
// ============================================================

const canvas =
  document.querySelector<HTMLCanvasElement>(
    "#simulationCanvas"
  );

if (!canvas) {
  throw new Error(
    "Could not find simulation canvas"
  );
}

const renderer =
  new Renderer(
    canvas,
    engine.world.environment
  );


const startBtn =
  document.querySelector<HTMLButtonElement>(
    "#startBtn"
  )!;

const pauseBtn =
  document.querySelector<HTMLButtonElement>(
    "#pauseBtn"
  )!;

const resetBtn =
  document.querySelector<HTMLButtonElement>(
    "#resetBtn"
  )!;

const generateBtn =
  document.querySelector<HTMLButtonElement>(
    "#generateBtn"
  )!;

const assignBtn =
  document.querySelector<HTMLButtonElement>(
    "#assignBtn"
  )!;

const autoAssignBtn =
  document.querySelector<HTMLButtonElement>(
    "#autoAssignBtn"
  )!;

const deadlockBtn =
  document.querySelector<HTMLButtonElement>(
    "#deadlockBtn"
  )!;

const failureBtn =
  document.querySelector<HTMLButtonElement>(
    "#failureBtn"
  )!;

const speedButtons =
  Array.from(
    document.querySelectorAll<HTMLButtonElement>(
      ".speed-btn"
    )
  );

const zoomInBtn = document.querySelector<HTMLButtonElement>("#zoomInBtn")!;
const zoomOutBtn = document.querySelector<HTMLButtonElement>("#zoomOutBtn")!;
const zoomResetBtn = document.querySelector<HTMLButtonElement>("#zoomResetBtn")!;


// ============================================================
// BUTTON EVENTS
// ============================================================

startBtn.addEventListener(
  "click",
  () => {
    engine.start();
    updateStatus();
  }
);


pauseBtn.addEventListener(
  "click",
  () => {
    engine.pause();
    updateStatus();
  }
);


resetBtn.addEventListener(
  "click",
  () => {
    engine.reset();

    renderer.render(
      engine.world.robots,
      engine.world.tasks,
      engine.communicationLinks,
      engine.collisionPredictions
    );

    updateUI();
    updateStatus();
    updateAutoButton();
    updateSpeedButtons();
  }
);


generateBtn.addEventListener(
  "click",
  () => {
    engine.generateRandomTasks(8);
    updateUI();
  }
);


assignBtn.addEventListener(
  "click",
  () => {
    engine.assignPendingTasks();
    updateUI();
  }
);


autoAssignBtn.addEventListener(
  "click",
  () => {
    engine.toggleAutoTaskAssignment();
    updateAutoButton();
    updateUI();
  }
);


deadlockBtn.addEventListener(
  "click",
  () => {
    engine.injectDeadlockScenario();
    updateUI();
  }
);


failureBtn.addEventListener(
  "click",
  () => {
    engine.injectRobotFailure();
    updateUI();
  }
);


speedButtons.forEach(button => {
  button.addEventListener(
    "click",
    () => {
      const speed = Number(button.dataset.speed);
      engine.setSimulationSpeed(speed);
      updateSpeedButtons();
    }
  );
});

zoomInBtn.addEventListener("click", () => renderer.zoomIn());
zoomOutBtn.addEventListener("click", () => renderer.zoomOut());
zoomResetBtn.addEventListener("click", () => renderer.resetZoom());


function updateAutoButton(): void {
  autoAssignBtn.textContent =
    engine.autoTaskAssignment
      ? "⚙ Auto: ON"
      : "⚙ Auto: OFF";

  autoAssignBtn.classList.toggle(
    "active-control",
    engine.autoTaskAssignment
  );
}


function updateSpeedButtons(): void {
  speedButtons.forEach(button => {
    button.classList.toggle(
      "active-speed",
      Number(button.dataset.speed) ===
        engine.simulationSpeed
    );
  });
}


// ============================================================
// STATUS
// ============================================================

function updateStatus(): void {
  const statusDot =
    document.querySelector<HTMLSpanElement>(
      "#statusDot"
    )!;

  const systemStatus =
    document.querySelector<HTMLSpanElement>(
      "#systemStatus"
    )!;

  if (engine.isRunning()) {
    statusDot.classList.add(
      "running"
    );

    systemStatus.textContent =
      "SYSTEM RUNNING";
  } else {
    statusDot.classList.remove(
      "running"
    );

    systemStatus.textContent =
      "SYSTEM PAUSED";
  }
}


// ============================================================
// ROBOT LIST
// ============================================================

function updateRobotList(): void {
  const container =
    document.querySelector<HTMLDivElement>(
      "#robotList"
    )!;

  container.innerHTML =
    engine.world.robots
      .map(robot => {

        const stateClass =
          robot.state
            .toLowerCase()
            .replaceAll(
              "_",
              "-"
            );

        const taskText =
          robot.currentTaskId ??
          "No task";

        return `
          <div class="robot-row">

            <div
              class="robot-type-dot ${robot.type.toLowerCase()}"
            ></div>

            <div class="robot-main">

              <strong>
                ${robot.id}
              </strong>

              <span>
                ${formatRobotType(
                  robot.type
                )}
              </span>

            </div>

            <div class="robot-task">
              ${taskText}
            </div>

            <div class="robot-battery">

              <div class="battery-track">

                <div
                  class="battery-fill ${getBatteryClass(
                    robot.battery
                  )}"
                  style="
                    width: ${Math.max(
                      0,
                      Math.min(
                        100,
                        robot.battery
                      )
                    )}%;
                  "
                ></div>

              </div>

              <span>
                ${robot.battery.toFixed(
                  0
                )}%
              </span>

            </div>

            <span
              class="state-badge ${stateClass}"
            >
              ${formatState(
                robot.state
              )}
            </span>

          </div>
        `;
      })
      .join("");
}


// ============================================================
// TASK LIST
// ============================================================

function updateTaskList(): void {
  const container =
    document.querySelector<HTMLDivElement>(
      "#taskList"
    )!;

  container.innerHTML =
    engine.world.tasks
      .map(task => {

        const statusClass =
          task.status
            .toLowerCase()
            .replaceAll(
              "_",
              "-"
            );

        return `
          <div class="task-row">

            <div class="task-id">
              ${task.id}
            </div>

            <div class="task-info">

              <strong>
                ${formatTaskType(
                  task.type
                )}
              </strong>

              <span>
                Priority ${task.priority}
              </span>

            </div>

            <div class="task-assigned">
              ${
                task.assignedRobotId ??
                "Unassigned"
              }
            </div>

            <span
              class="task-status ${statusClass}"
            >
              ${formatState(
                task.status
              )}
            </span>

          </div>
        `;
      })
      .join("");
}


// ============================================================
// NEGOTIATION PANEL
// ============================================================

function updateNegotiationPanel(): void {
  const panel =
    document.querySelector<HTMLDivElement>(
      "#negotiationPanel"
    )!;

  const current =
    document.querySelector<HTMLDivElement>(
      "#currentTaskNegotiation"
    )!;

  const negotiations =
    engine.lastNegotiations;

  if (
    negotiations.length === 0
  ) {
    current.textContent =
      "Waiting for negotiation...";

    panel.innerHTML = `
      <div class="empty-state">
        No active negotiation
      </div>
    `;

    return;
  }

  const latest =
    negotiations[
      negotiations.length - 1
    ];

  if (
    latest.winningBid
  ) {
    current.innerHTML = `
      <div class="negotiation-current-inner">

        <span class="current-task">
          ${latest.taskId}
        </span>

        <span class="arrow">
          →
        </span>

        <strong>
          ${latest.winningBid.robotId}
        </strong>

        <span class="contract-tag">
          CONTRACT
        </span>

      </div>
    `;
  } else {
    current.textContent =
      `${latest.taskId} — no eligible bidder`;
  }


  panel.innerHTML =
    negotiations
      .slice()
      .reverse()
      .map(result => {

        const winningBid =
          result.winningBid;

        const bids =
          result.bids;

        return `
          <div class="negotiation-card">

            <div class="negotiation-card-header">

              <strong>
                ${result.taskId}
              </strong>

              <span>
                ${bids.length} bids
              </span>

            </div>


            <div class="bid-list">

              ${bids
                .slice()
                .sort(
                  (
                    a,
                    b
                  ) =>
                    a.score -
                    b.score
                )
                .slice(0, 4)
                .map(bid => {

                  const isWinner =
                    winningBid?.robotId ===
                    bid.robotId;

                  return `
                    <div
                      class="bid-row ${
                        isWinner
                          ? "winner"
                          : ""
                      }"
                    >

                      <span>
                        ${bid.robotId}
                      </span>

                      <span>
                        ${bid.score.toFixed(
                          1
                        )}
                      </span>

                      ${
                        isWinner
                          ? `
                            <span
                              class="winner-label"
                            >
                              ✓ WIN
                            </span>
                          `
                          : ""
                      }

                    </div>
                  `;
                })
                .join("")}

            </div>

          </div>
        `;
      })
      .join("");
}


// ============================================================
// NEGOTIATION STATISTICS
// ============================================================

function updateNegotiationStats(): void {
  const negotiationCount =
    document.querySelector<HTMLSpanElement>(
      "#negotiationCount"
    )!;

  const contractCount =
    document.querySelector<HTMLSpanElement>(
      "#contractCount"
    )!;

  const averageBids =
    document.querySelector<HTMLSpanElement>(
      "#averageBids"
    )!;


  negotiationCount.textContent =
    String(
      engine.totalNegotiations
    );


  contractCount.textContent =
    String(
      engine.successfulNegotiations
    );


  const negotiations =
    engine.lastNegotiations;

  if (
    negotiations.length === 0
  ) {
    averageBids.textContent =
      "0";

    return;
  }

  const totalBids =
    negotiations.reduce(
      (
        total,
        negotiation
      ) =>
        total +
        negotiation.bids.length,
      0
    );

  averageBids.textContent =
    (
      totalBids /
      negotiations.length
    ).toFixed(1);
}


// ============================================================
// COLLISION PANEL
// ============================================================

function updateCollisionPanel(): void {
  const panel =
    document.querySelector<HTMLDivElement>(
      "#collisionPanel"
    )!;

  const count =
    document.querySelector<HTMLSpanElement>(
      "#collisionCount"
    )!;

  const warnings =
    document.querySelector<HTMLSpanElement>(
      "#collisionWarnings"
    )!;

  const systemWarnings =
    document.querySelector<HTMLSpanElement>(
      "#systemCollisionWarnings"
    )!;

  const badge =
    document.querySelector<HTMLSpanElement>(
      "#safetyBadge"
    )!;


  const predictions =
    engine.collisionPredictions;


  count.textContent =
    String(
      predictions.length
    );


  warnings.textContent =
    String(
      engine.totalCollisionWarnings
    );


  systemWarnings.textContent =
    String(
      engine.totalCollisionWarnings
    );


  if (
    predictions.length === 0
  ) {
    badge.textContent =
      "SAFE";

    badge.className =
      "safe-badge";

    panel.innerHTML = `
      <div class="empty-state safety-safe">
        ✓ No predicted collisions
      </div>
    `;

    return;
  }


  badge.textContent =
    `${predictions.length} RISK${
      predictions.length > 1
        ? "S"
        : ""
    }`;

  badge.className =
    "safe-badge danger";


  panel.innerHTML =
    predictions
      .map(prediction => {

        const severityClass =
          prediction.severity
            .toLowerCase();

        return `
          <div
            class="collision-card ${severityClass}"
          >

            <div class="collision-header">

              <div class="robot-conflict">

                <strong>
                  ${prediction.robotA}
                </strong>

                <span>
                  ↔
                </span>

                <strong>
                  ${prediction.robotB}
                </strong>

              </div>

              <span
                class="severity ${severityClass}"
              >
                ${prediction.severity}
              </span>

            </div>


            <div class="collision-details">

              <div>
                <span>
                  Conflict Point
                </span>

                <strong>
                  (${prediction.conflictPoint.x},
                  ${prediction.conflictPoint.y})
                </strong>
              </div>


              <div>
                <span>
                  ETA ${prediction.robotA}
                </span>

                <strong>
                  ${prediction.timeA.toFixed(
                    1
                  )}s
                </strong>
              </div>


              <div>
                <span>
                  ETA ${prediction.robotB}
                </span>

                <strong>
                  ${prediction.timeB.toFixed(
                    1
                  )}s
                </strong>
              </div>


              <div>
                <span>
                  Time Difference
                </span>

                <strong>
                  ${prediction.timeDifference.toFixed(
                    2
                  )}s
                </strong>
              </div>

            </div>


            <div class="collision-action">
              ⚠ Right-of-way negotiation required
            </div>

          </div>
        `;
      })
      .join("");
}


// ============================================================
// GENERAL STATISTICS
// ============================================================

function updateStatistics(): void {
  const robots =
    engine.world.robots;

  const tasks =
    engine.world.tasks;


  const activeRobots =
    robots.filter(
      robot =>
        robot.state !==
          "IDLE" &&
        robot.state !==
          "FAILED"
    ).length;


  const healthyRobots =
    robots.filter(
      robot =>
        robot.state !==
        "FAILED"
    ).length;


  const healthPercentage =
    robots.length === 0
      ? 0
      : (
          healthyRobots /
          robots.length
        ) *
        100;


  document.querySelector<HTMLSpanElement>(
    "#robotCount"
  )!.textContent =
    String(
      robots.length
    );


  document.querySelector<HTMLSpanElement>(
    "#taskCount"
  )!.textContent =
    String(
      tasks.length
    );


  document.querySelector<HTMLSpanElement>(
    "#completedCount"
  )!.textContent =
    String(
      engine.world.completedTasks
    );


  document.querySelector<HTMLSpanElement>(
    "#activeCount"
  )!.textContent =
    String(
      activeRobots
    );


  document.querySelector<HTMLDivElement>(
    "#fleetHealth"
  )!.textContent =
    `${healthPercentage.toFixed(
      0
    )}%`;


  document.querySelector<HTMLSpanElement>(
    "#pendingTasks"
  )!.textContent =
    String(
      tasks.filter(
        task =>
          task.status ===
          "PENDING"
      ).length
    );


  document.querySelector<HTMLSpanElement>(
    "#systemCompletedTasks"
  )!.textContent =
    String(
      engine.world.completedTasks
    );
}


// ============================================================
// SIMULATION TIME
// ============================================================

function updateSimulationTime(): void {
  const element =
    document.querySelector<HTMLSpanElement>(
      "#simulationTime"
    )!;

  element.textContent =
    `${engine.world.simulationTime.toFixed(
      1
    )}s`;
}


// ============================================================
// MASTER UI UPDATE
// ============================================================

function updateUI(): void {
  updateStatus();

  updateRobotList();

  updateTaskList();

  updateNegotiationPanel();

  updateNegotiationStats();

  updateCollisionPanel();

  updateStatistics();

  updateSimulationTime();
}


// ============================================================
// FORMATTING HELPERS
// ============================================================

function formatRobotType(
  type: string
): string {
  return type
    .replaceAll(
      "_",
      " "
    )
    .replace(
      /\b\w/g,
      char =>
        char.toUpperCase()
    );
}


function formatTaskType(
  type: string
): string {
  return type
    .replaceAll(
      "_",
      " "
    )
    .replace(
      /\b\w/g,
      char =>
        char.toUpperCase()
    );
}


function formatState(
  state: string
): string {
  return state
    .replaceAll(
      "_",
      " "
    );
}


function getBatteryClass(
  battery: number
): string {
  if (battery > 50) {
    return "good";
  }

  if (battery > 20) {
    return "warning";
  }

  return "critical";
}


// ============================================================
// SIMULATION LOOP
// ============================================================

let previousTime =
  performance.now();


function simulationLoop(
  currentTime: number
): void {

  const deltaTime =
    Math.min(
      0.1,
      (
        currentTime -
        previousTime
      ) / 1000
    );

  previousTime =
    currentTime;


  engine.update(
    deltaTime
  );


  renderer.render(
    engine.world.robots,
    engine.world.tasks,
    engine.communicationLinks,
    engine.collisionPredictions
  );


  updateUI();


  requestAnimationFrame(
    simulationLoop
  );
}


// ============================================================
// INITIAL RENDER
// ============================================================

renderer.render(
  engine.world.robots,
  engine.world.tasks,
  engine.communicationLinks,
  engine.collisionPredictions
);

updateAutoButton();
updateSpeedButtons();
updateUI();

requestAnimationFrame(
  simulationLoop
);