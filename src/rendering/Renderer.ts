import type { Environment } from "../models/Environment";
import type { Point, Robot } from "../models/Robot";
import type { Task } from "../models/Task";
import type { CollisionPrediction } from "../safety/CollisionDetector";

interface CommunicationLink {
  robotA: string;
  robotB: string;
  reason: string;
  expiresAt: number;
}

export class Renderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly environment: Environment;
  private selectedRobotId: string | null = null;
  private lastRobots: Robot[] = [];
  private lastTasks: Task[] = [];
  private lastLinks: CommunicationLink[] = [];
  private lastCollisions: CollisionPrediction[] = [];

  private view = { scale: 1, ox: 0, oy: 0 };
  private panX = 0;
  private panY = 0;
  private zoomLevel = 1;
  private followRobotId: string | null = null;
  private dragging = false;
  private dragged = false;
  private dragButton = 0;
  private lastPointer = { x: 0, y: 0 };
  private pointerDown = { x: 0, y: 0 };
  private readonly minZoom = 0.55;
  private readonly maxZoom = 2.8;

  constructor(canvas: HTMLCanvasElement, environment: Environment) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not create 2D canvas context");
    this.ctx = ctx;
    this.environment = environment;

    this.canvas.addEventListener("mousedown", event => this.handlePointerDown(event));
    this.canvas.addEventListener("mousemove", event => this.handlePointerMove(event));
    this.canvas.addEventListener("mouseup", event => this.handlePointerUp(event));
    this.canvas.addEventListener("mouseleave", event => this.handlePointerUp(event));
    this.canvas.addEventListener("contextmenu", event => event.preventDefault());
    this.canvas.addEventListener("wheel", event => this.handleWheel(event), { passive: false });
  }

  render(
    robots: Robot[],
    tasks: Task[],
    communicationLinks: CommunicationLink[] = [],
    collisions: CollisionPrediction[] = [],
  ): void {
    this.lastRobots = robots;
    this.lastTasks = tasks;
    this.lastLinks = communicationLinks;
    this.lastCollisions = collisions;

    this.resizeCanvas();
    this.updateFollowCamera();
    this.drawFrame();
  }

  private resizeCanvas(): void {
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(640, Math.floor(rect.width || this.canvas.parentElement?.clientWidth || 1000));
    const height = Math.max(420, Math.floor(rect.height || width * 0.58));
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    if (this.canvas.width !== Math.floor(width * dpr) || this.canvas.height !== Math.floor(height * dpr)) {
      this.canvas.width = Math.floor(width * dpr);
      this.canvas.height = Math.floor(height * dpr);
    }

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const pad = 18;
    const scale = Math.min(
      (width - pad * 2) / this.environment.width,
      (height - pad * 2) / this.environment.height,
    );

    const scaled = scale * this.zoomLevel;
    this.view.scale = scaled;
    this.view.ox = (width - this.environment.width * scaled) / 2 + this.panX;
    this.view.oy = (height - this.environment.height * scaled) / 2 + this.panY;
  }


  zoomIn(): void {
    this.setZoom(this.zoomLevel * 1.2);
  }

  zoomOut(): void {
    this.setZoom(this.zoomLevel / 1.2);
  }

  resetZoom(): void {
    this.setZoom(1);
  }

  private setZoom(value: number): void {
    this.zoomLevel = Math.max(this.minZoom, Math.min(this.maxZoom, value));
    this.render(this.lastRobots, this.lastTasks, this.lastLinks, this.lastCollisions);
  }

  private handleWheel(event: WheelEvent): void {
    event.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const before = this.screenToWorld(event.clientX - rect.left, event.clientY - rect.top);
    const factor = event.deltaY < 0 ? 1.12 : 1 / 1.12;
    const next = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoomLevel * factor));
    if (Math.abs(next - this.zoomLevel) < 0.001) return;
    this.zoomLevel = next;
    this.resizeCanvas();
    const after = this.worldToScreen(before);
    this.panX += (event.clientX - rect.left) - after.x;
    this.panY += (event.clientY - rect.top) - after.y;
    this.resizeCanvas();
    this.updateFollowCamera();
    this.drawFrame();
  }

  private updateFollowCamera(): void {
    if (!this.followRobotId) return;
    const robot = this.lastRobots.find(item => item.id === this.followRobotId);
    if (!robot || robot.state === "FAILED") {
      this.followRobotId = null;
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    const targetX = rect.width / 2;
    const targetY = rect.height / 2;
    const current = this.worldToScreen(robot.position);
    const smoothing = 0.16;
    this.panX += (targetX - current.x) * smoothing;
    this.panY += (targetY - current.y) * smoothing;
    this.view.ox += (targetX - current.x) * smoothing;
    this.view.oy += (targetY - current.y) * smoothing;
  }

  followRobot(robotId: string): void {
    this.followRobotId = robotId;
    this.selectedRobotId = robotId;
    this.centerOnRobot(robotId, true);
  }

  releaseFollow(): void {
    this.followRobotId = null;
  }

  private centerOnRobot(robotId: string, immediate = false): void {
    const robot = this.lastRobots.find(item => item.id === robotId);
    if (!robot) return;
    const rect = this.canvas.getBoundingClientRect();
    const current = this.worldToScreen(robot.position);
    const dx = rect.width / 2 - current.x;
    const dy = rect.height / 2 - current.y;
    const factor = immediate ? 1 : 0.16;
    this.panX += dx * factor;
    this.panY += dy * factor;
    this.view.ox += dx * factor;
    this.view.oy += dy * factor;
    this.drawFrame();
  }

  private drawFrame(): void {
    this.drawBackground();
    this.drawWarehouse();
    this.drawCommunicationLinks();
    this.drawTaskMarkers();
    this.drawRoutes();
    this.drawCollisionHints();
    this.drawChargingStations();
    this.drawRobots();
    this.drawSelectionPanel();
  }

  private worldToScreen(point: Point): Point {
    return {
      x: this.view.ox + point.x * this.view.scale,
      y: this.view.oy + point.y * this.view.scale,
    };
  }

  private screenToWorld(x: number, y: number): Point {
    return {
      x: (x - this.view.ox) / this.view.scale,
      y: (y - this.view.oy) / this.view.scale,
    };
  }

  private drawBackground(): void {
    const { ctx } = this;
    const rect = this.canvas.getBoundingClientRect();
    ctx.fillStyle = "#071018";
    ctx.fillRect(0, 0, rect.width, rect.height);

    ctx.strokeStyle = "rgba(70, 135, 165, 0.10)";
    ctx.lineWidth = 1;
    const step = Math.max(8, this.view.scale * 5);
    for (let x = 0; x <= this.environment.width; x += 5) {
      const p = this.worldToScreen({ x, y: 0 });
      ctx.beginPath();
      ctx.moveTo(p.x, this.view.oy);
      ctx.lineTo(p.x, this.view.oy + this.environment.height * this.view.scale);
      ctx.stroke();
    }
    for (let y = 0; y <= this.environment.height; y += 5) {
      const p = this.worldToScreen({ x: 0, y });
      ctx.beginPath();
      ctx.moveTo(this.view.ox, p.y);
      ctx.lineTo(this.view.ox + this.environment.width * this.view.scale, p.y);
      ctx.stroke();
    }
    void step;
  }

  private drawWarehouse(): void {
    const { ctx } = this;
    const s = this.view.scale;

    ctx.fillStyle = "rgba(14, 30, 41, 0.88)";
    ctx.strokeStyle = "rgba(90, 150, 175, 0.28)";
    ctx.lineWidth = 1;

    const grid = this.environment.grid;
    if (grid?.length) {
      for (const row of grid) {
        for (const cell of row) {
          if (cell.type !== "OBSTACLE") continue;
          const p = this.worldToScreen(cell);
          ctx.fillRect(p.x, p.y, s + 0.4, s + 0.4);
        }
      }
    }

    ctx.strokeStyle = "rgba(84, 155, 184, 0.42)";
    ctx.strokeRect(
      this.view.ox,
      this.view.oy,
      this.environment.width * s,
      this.environment.height * s,
    );
  }

  private drawRoutes(): void {
    const { ctx } = this;
    const selected = this.selectedRobotId;
    const now = performance.now() / 1000;

    for (const robot of this.lastRobots) {
      if (robot.state === "FAILED" || robot.route.length < 2) continue;
      const isSelected = robot.id === selected;
      const color = this.robotColor(robot);
      const remaining = robot.route.slice(Math.max(0, robot.routeIndex));
      if (remaining.length === 0) continue;

      ctx.save();
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      // Soft glow underneath every active trajectory.
      ctx.shadowBlur = isSelected ? 12 : 5;
      ctx.shadowColor = color;
      ctx.setLineDash(isSelected ? [] : [5, 5]);
      ctx.lineWidth = isSelected ? 4.2 : 2.0;
      ctx.strokeStyle = isSelected ? color : this.withAlpha(color, 0.48);

      ctx.beginPath();
      const start = this.worldToScreen(robot.position);
      ctx.moveTo(start.x, start.y);
      for (const point of remaining) {
        const p = this.worldToScreen(point);
        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
      ctx.restore();

      // Direction markers make the route readable even when many routes overlap.
      ctx.save();
      ctx.shadowBlur = isSelected ? 8 : 0;
      ctx.shadowColor = color;
      ctx.fillStyle = isSelected ? color : this.withAlpha(color, 0.72);
      const stride = Math.max(4, Math.floor(remaining.length / 9));
      for (let i = stride; i < remaining.length; i += stride) {
        const a = remaining[i - 1];
        const b = remaining[i];
        const pa = this.worldToScreen(a);
        const pb = this.worldToScreen(b);
        const angle = Math.atan2(pb.y - pa.y, pb.x - pa.x);
        const size = isSelected ? 4.5 : 3.2;
        const x = pb.x;
        const y = pb.y;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(size, 0);
        ctx.lineTo(-size, -size * 0.55);
        ctx.lineTo(-size * 0.55, 0);
        ctx.lineTo(-size, size * 0.55);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();

      if (isSelected) {
        const destination = remaining[remaining.length - 1];
        const p = this.worldToScreen(destination);
        ctx.save();
        ctx.strokeStyle = color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8 + Math.sin(now * 5) * 1.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  private drawCommunicationLinks(): void {
    const byId = new Map(this.lastRobots.map(robot => [robot.id, robot]));
    const { ctx } = this;
    const now = performance.now() / 1000;

    for (const link of this.lastLinks) {
      const a = byId.get(link.robotA);
      const b = byId.get(link.robotB);
      if (!a || !b) continue;

      const pa = this.worldToScreen(a.position);
      const pb = this.worldToScreen(b.position);
      const isSelected = this.selectedRobotId === a.id || this.selectedRobotId === b.id;

      ctx.save();
      ctx.setLineDash([7, 5]);
      ctx.lineDashOffset = -(now * 22);
      ctx.strokeStyle = isSelected
        ? "rgba(53, 214, 255, 0.95)"
        : "rgba(169, 139, 255, 0.68)";
      ctx.shadowBlur = isSelected ? 9 : 4;
      ctx.shadowColor = isSelected ? "#35d6ff" : "#a98bff";
      ctx.lineWidth = isSelected ? 2.4 : 1.45;
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
      ctx.restore();

      // Small moving communication pulse.
      const pulse = (now * 0.7) % 1;
      const px = pa.x + (pb.x - pa.x) * pulse;
      const py = pa.y + (pb.y - pa.y) * pulse;
      ctx.save();
      ctx.fillStyle = isSelected ? "#35d6ff" : "#a98bff";
      ctx.shadowBlur = 8;
      ctx.shadowColor = ctx.fillStyle;
      ctx.beginPath();
      ctx.arc(px, py, isSelected ? 2.6 : 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private drawCollisionHints(): void {
    const byId = new Map(this.lastRobots.map(robot => [robot.id, robot]));
    const { ctx } = this;
    for (const conflict of this.lastCollisions) {
      const a = byId.get(conflict.robotA);
      const b = byId.get(conflict.robotB);
      if (!a || !b) continue;
      const pa = this.worldToScreen(a.position);
      const pb = this.worldToScreen(b.position);
      const mid = { x: (pa.x + pb.x) / 2, y: (pa.y + pb.y) / 2 };
      ctx.save();
      ctx.strokeStyle = "rgba(255, 112, 128, 0.58)";
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 112, 128, 0.95)";
      ctx.beginPath();
      ctx.arc(mid.x, mid.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private drawTaskMarkers(): void {
    const { ctx } = this;
    for (const task of this.lastTasks) {
      if (task.status === "COMPLETED") continue;
      const pickup = this.worldToScreen(task.pickup);
      const drop = this.worldToScreen(task.dropoff);

      ctx.save();
      ctx.strokeStyle = task.status === "IN_PROGRESS"
        ? "rgba(255, 173, 74, 0.72)"
        : "rgba(255, 255, 255, 0.28)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(pickup.x, pickup.y, 3.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(drop.x - 3, drop.y);
      ctx.lineTo(drop.x + 3, drop.y);
      ctx.moveTo(drop.x, drop.y - 3);
      ctx.lineTo(drop.x, drop.y + 3);
      ctx.stroke();
      ctx.restore();
    }
  }

  private drawChargingStations(): void {
    const { ctx } = this;
    const s = this.view.scale;
    for (const station of this.environment.chargingStations) {
      const width = (station.width ?? 7) * s;
      const height = (station.height ?? 5) * s;
      const p = this.worldToScreen({ x: station.x, y: station.y });
      ctx.save();
      ctx.fillStyle = "rgba(30, 120, 150, 0.18)";
      ctx.strokeStyle = "rgba(45, 211, 255, 0.68)";
      ctx.lineWidth = 1.5;
      ctx.fillRect(p.x - width / 2, p.y - height / 2, width, height);
      ctx.strokeRect(p.x - width / 2, p.y - height / 2, width, height);
      ctx.fillStyle = "rgba(85, 220, 255, 0.9)";
      ctx.font = "10px system-ui";
      ctx.fillText(station.id ?? "CHARGE", p.x - width / 2 + 4, p.y - height / 2 - 4);
      ctx.restore();
    }
  }

  private drawRobots(): void {
    const { ctx } = this;
    const radius = Math.max(4.5, Math.min(7, this.view.scale * 0.38));

    for (const robot of this.lastRobots) {
      const p = this.worldToScreen(robot.position);
      const selected = robot.id === this.selectedRobotId;
      const fill = this.robotColor(robot);

      ctx.save();
      if (selected) {
        ctx.strokeStyle = "rgba(255,255,255,0.98)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius + 5, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = fill;
      ctx.strokeStyle = "rgba(230,250,255,0.92)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#071018";
      ctx.font = `${Math.max(7, radius * 1.45)}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(robot.id.replace("R", ""), p.x, p.y);

      if (selected) {
        ctx.fillStyle = "rgba(225,245,255,0.95)";
        ctx.font = "10px system-ui";
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";
        ctx.fillText(`${robot.id} • ${robot.state.replaceAll("_", " ")}`, p.x + radius + 5, p.y - radius - 2);
      }
      ctx.restore();
    }
  }

  private drawSelectionPanel(): void {
    if (!this.selectedRobotId) return;
    const robot = this.lastRobots.find(item => item.id === this.selectedRobotId);
    if (!robot) return;

    const { ctx } = this;
    const width = 190;
    const height = 86;
    const x = 14;
    const y = 14;

    ctx.save();
    ctx.fillStyle = "rgba(5, 13, 20, 0.92)";
    ctx.strokeStyle = "rgba(62, 209, 255, 0.65)";
    ctx.lineWidth = 1;
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);
    ctx.fillStyle = "#e8f7ff";
    ctx.font = "bold 13px system-ui";
    ctx.fillText(`${robot.id}  ${robot.type.replaceAll("_", " ")}`, x + 10, y + 18);
    ctx.font = "11px system-ui";
    ctx.fillText(`STATE  ${robot.state.replaceAll("_", " ")}`, x + 10, y + 38);
    ctx.fillText(`BATTERY  ${robot.battery.toFixed(0)}%`, x + 10, y + 54);
    ctx.fillText(`TASK  ${robot.currentTaskId ?? "NONE"}`, x + 10, y + 70);
    if (this.followRobotId === robot.id) {
      ctx.fillStyle = "#35d6ff";
      ctx.font = "bold 10px system-ui";
      ctx.fillText("● FOLLOWING", x + 112, y + 18);
    }
    ctx.restore();
  }

  private withAlpha(hex: string, alpha: number): string {
    const value = hex.replace("#", "");
    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  private robotColor(robot: Robot): string {
    switch (robot.type) {
      case "FAST_PICKER": return "#28c7f5";
      case "HEAVY_CARRIER": return "#ff9f43";
      case "INSPECTION": return "#9b7cff";
      case "EMERGENCY": return "#ff647c";
      default: return "#d7e7ef";
    }
  }

  private handlePointerDown(event: MouseEvent): void {
    if (event.button !== 0 && event.button !== 1 && event.button !== 2) return;
    this.dragging = true;
    this.dragged = false;
    this.dragButton = event.button;
    this.pointerDown = { x: event.clientX, y: event.clientY };
    this.lastPointer = { x: event.clientX, y: event.clientY };
    this.canvas.style.cursor = "grabbing";
  }

  private handlePointerMove(event: MouseEvent): void {
    const dx = event.clientX - this.lastPointer.x;
    const dy = event.clientY - this.lastPointer.y;
    const total = Math.hypot(event.clientX - this.pointerDown.x, event.clientY - this.pointerDown.y);

    if (this.dragging && total > 4) this.dragged = true;

    if (this.dragging && (this.dragButton !== 0 || this.dragged)) {
      if (this.dragged) this.followRobotId = null;
      this.panX += dx;
      this.panY += dy;
      this.view.ox += dx;
      this.view.oy += dy;
      this.lastPointer = { x: event.clientX, y: event.clientY };
      this.drawFrame();
      return;
    }

    this.lastPointer = { x: event.clientX, y: event.clientY };
    this.handleHover(event);
  }

  private handlePointerUp(event: MouseEvent): void {
    if (!this.dragging) return;
    const wasDragged = this.dragged;
    const button = this.dragButton;
    this.dragging = false;
    this.dragButton = 0;
    this.canvas.style.cursor = "crosshair";

    if (!wasDragged && button === 0) {
      this.handleClick(event);
    }
  }

  private handleClick(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const world = this.screenToWorld(event.clientX - rect.left, event.clientY - rect.top);
    const hitRadius = Math.max(0.9, 8 / this.view.scale);

    let closest: Robot | null = null;
    let best = hitRadius;
    for (const robot of this.lastRobots) {
      const distance = Math.hypot(robot.position.x - world.x, robot.position.y - world.y);
      if (distance < best) {
        best = distance;
        closest = robot;
      }
    }

    if (closest) {
      this.selectedRobotId = closest.id;
      this.followRobotId = closest.id;
      this.centerOnRobot(closest.id, true);
    } else {
      this.selectedRobotId = null;
      this.followRobotId = null;
    }
    this.render(this.lastRobots, this.lastTasks, this.lastLinks, this.lastCollisions);
  }

  private handleHover(event: MouseEvent): void {
    if (this.dragging) return;
    const rect = this.canvas.getBoundingClientRect();
    const world = this.screenToWorld(event.clientX - rect.left, event.clientY - rect.top);
    const hitRadius = Math.max(0.8, 7 / this.view.scale);
    const hit = this.lastRobots.some(robot => Math.hypot(robot.position.x - world.x, robot.position.y - world.y) < hitRadius);
    this.canvas.style.cursor = hit ? "pointer" : "grab";
  }
}
