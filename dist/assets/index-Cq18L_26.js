(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=class{width=200;height=80;obstacles=[];grid=[];chargingStations=[{x:137,y:40,id:`CS1`,width:11,height:11},{x:180,y:40,id:`CS2`,width:11,height:11}];chargingSlots=[];obstacleKeys=new Set;constructor(){this.buildWarehouse(),this.buildGrid()}buildGrid(){this.grid=[];for(let e=0;e<this.height;e++){let t=[];for(let n=0;n<this.width;n++)t.push({x:n,y:e,type:this.obstacleKeys.has(this.key(n,e))?`OBSTACLE`:`FREE`});this.grid.push(t)}for(let e=2;e<this.height-2;e++)for(let t=124;t<this.width-2;t++)this.isInside(t,e)&&!this.obstacleKeys.has(this.key(t,e))&&(this.grid[e][t].type=`CHARGING`);for(let e of this.chargingStations)this.isInside(e.x,e.y)&&(this.grid[e.y][e.x].type=`CHARGING`);for(let e of this.chargingSlots)this.isInside(e.slot.x,e.slot.y)&&(this.grid[e.slot.y][e.slot.x].type=`CHARGING`)}key(e,t){return`${e},${t}`}addObstacle(e,t){if(!this.isInside(e,t))return;let n=this.key(e,t);this.obstacleKeys.has(n)||(this.obstacleKeys.add(n),this.obstacles.push({x:e,y:t}))}addRectangle(e,t,n,r){for(let i=t;i<=r;i++)for(let t=e;t<=n;t++)this.addObstacle(t,i)}buildWarehouse(){for(let e=0;e<this.width;e++)this.addObstacle(e,0),this.addObstacle(e,this.height-1);for(let e=0;e<this.height;e++)this.addObstacle(0,e),this.addObstacle(this.width-1,e);for(let[e,t]of[[18,23],[30,35],[42,47],[54,59]])this.addRectangle(18,e,52,t),this.addRectangle(68,e,102,t);this.addRectangle(57,25,63,29),this.addRectangle(57,51,63,55);for(let e=1;e<this.height-1;e++)!(e>=18&&e<=22)&&!(e>=58&&e<=62)&&this.addObstacle(120,e);for(let e of this.chargingStations)for(let t=-1;t<=1;t++)for(let n=-1;n<=1;n++){let r=this.key(e.x+t,e.y+n);this.obstacleKeys.delete(r)&&(this.obstacles=this.obstacles.filter(r=>r.x!==e.x+t||r.y!==e.y+n))}}isInside(e,t){return e>=0&&e<this.width&&t>=0&&t<this.height}isWalkable(e,t){return this.isInside(e,t)?!this.obstacleKeys.has(this.key(e,t)):!1}},t=class{environment;directions=[[1,0],[0,1],[-1,0],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];diagonalCost=Math.SQRT2;turnPenalty=.12;trafficPenalty=7;nearTrafficPenalty=1.8;constructor(e){this.environment=e}findPath(e,t,n=[]){let r=Math.round(e.x),i=Math.round(e.y),a=Math.round(t.x),o=Math.round(t.y);if(!this.environment.isInside(r,i)||!this.environment.isInside(a,o))return[];if(r===a&&i===o)return[{x:r,y:i}];let s=this.toKeySet(n),c=this.search(r,i,a,o,s,!0);return c.length>0?c:this.search(r,i,a,o,s,!1)}findNaturalPathToObject(e,t,n=[]){let r=Math.round(t.x),i=Math.round(t.y),a=[];for(let[e,t]of this.directions){let n=r+e,o=i+t;this.environment.isInside(n,o)&&!this.isHardObstacle(n,o)&&a.push({x:n,y:o})}a.sort((t,n)=>Math.abs(t.x-e.x)+Math.abs(t.y-e.y)-(Math.abs(n.x-e.x)+Math.abs(n.y-e.y)));let o=[];for(let t of a.slice(0,4)){let r=this.findPath(e,t,n);r.length>0&&(o.length===0||r.length<o.length)&&(o=r)}return o.length===0&&this.environment.isWalkable(r,i)&&(o=this.findPath(e,{x:r,y:i},n)),o}search(e,t,n,r,i,a){let o=[],s=new Map,c=new Set,l={x:e,y:t,g:0,f:this.heuristic(e,t,n,r),parent:null,direction:-1};s.set(this.key(e,t),0),this.push(o,{node:l,priority:l.f});let u=0,d=Math.min(this.environment.width*this.environment.height+2400,12e3);for(;o.length&&u++<d;){let e=this.pop(o);if(!e)break;let t=e.node,l=this.key(t.x,t.y);if(!c.has(l)){if(c.add(l),t.x===n&&t.y===r)return this.reconstruct(t);for(let e=0;e<this.directions.length;e++){let[c,l]=this.directions[e],u=t.x+c,d=t.y+l,f=this.key(u,d);if(!this.environment.isInside(u,d)||this.isHardObstacle(u,d)||c!==0&&l!==0&&(this.isHardObstacle(t.x+c,t.y)||this.isHardObstacle(t.x,t.y+l)))continue;let p=i.has(f)&&(u!==n||d!==r);if(a&&p)continue;let m=c!==0&&l!==0?this.diagonalCost:1,h=t.direction>=0&&t.direction!==e?this.turnPenalty:0,g=p?this.trafficPenalty:this.nearTrafficCost(u,d,i),_=t.g+m+h+g,v=s.get(f);if(v!==void 0&&_>=v)continue;let y={x:u,y:d,g:_,f:_+this.heuristic(u,d,n,r),parent:t,direction:e};s.set(f,_),this.push(o,{node:y,priority:y.f})}}}return[]}isHardObstacle(e,t){if(!this.environment.isWalkable(e,t))return!0;for(let n of this.environment.chargingStations){let r=Math.max(1,Math.floor((n.width??7)/2)),i=Math.max(1,Math.floor((n.height??5)/2));if(Math.abs(e-n.x)<=r&&Math.abs(t-n.y)<=i)return!0}return!1}nearTrafficCost(e,t,n){if(!n.size)return 0;for(let[r,i]of this.directions)if(n.has(this.key(e+r,t+i)))return this.nearTrafficPenalty;return 0}heuristic(e,t,n,r){let i=Math.abs(n-e),a=Math.abs(r-t);return Math.max(i,a)+(Math.SQRT2-1)*Math.min(i,a)}reconstruct(e){let t=[],n=e;for(;n;)t.push({x:n.x,y:n.y}),n=n.parent;return t.reverse(),t}toKeySet(e){let t=new Set;for(let n of e)t.add(this.key(Math.round(n.x),Math.round(n.y)));return t}key(e,t){return`${e},${t}`}push(e,t){e.push(t);let n=e.length-1;for(;n>0;){let t=Math.floor((n-1)/2);if(e[t].priority<=e[n].priority)break;[e[t],e[n]]=[e[n],e[t]],n=t}}pop(e){if(!e.length)return;let t=e[0],n=e.pop();if(e.length&&n){e[0]=n;let t=0;for(;;){let n=t*2+1,r=n+1,i=t;if(n<e.length&&e[n].priority<e[i].priority&&(i=n),r<e.length&&e[r].priority<e[i].priority&&(i=r),i===t)break;[e[t],e[i]]=[e[i],e[t]],t=i}}return t}},n=class{environment;robots=[];tasks=[];simulationTime=0;completedTasks=0;constructor(){this.environment=new e}reset(){this.robots=[],this.tasks=[],this.simulationTime=0,this.completedTasks=0,this.environment=new e}},r=class{cellSize;buckets=new Map;constructor(e=3){this.cellSize=Math.max(1,e)}rebuild(e){this.buckets.clear();for(let t of e){if(t.state===`FAILED`)continue;let e=this.key(t.position.x,t.position.y),n=this.buckets.get(e);n?n.push(t):this.buckets.set(e,[t])}}nearby(e,t){let n=[],r=Math.ceil(t/this.cellSize),i=Math.floor(e.x/this.cellSize),a=Math.floor(e.y/this.cellSize),o=t*t;for(let t=-r;t<=r;t++)for(let s=-r;s<=r;s++){let r=this.buckets.get(`${i+t},${a+s}`);if(r)for(let t of r){let r=t.position.x-e.x,i=t.position.y-e.y;r*r+i*i<=o&&n.push(t)}}return n}nearbyRobot(e,t){return this.nearby(e.position,t).filter(t=>t.id!==e.id)}key(e,t){return`${Math.floor(e/this.cellSize)},${Math.floor(t/this.cellSize)}`}},i=class{queues=new Map;reservations=new Map;reset(e){this.queues.clear(),this.reservations.clear();for(let t of e)this.queues.set(this.stationId(t),[])}request(e,t,n,r){let i=this.reservations.get(e.id);if(i)return i;let a=null,o=``;if(r&&(a=t.chargingStations.find(e=>this.stationId(e)===r)??null,a&&(o=this.stationId(a))),!a){if(a=this.chooseStation(e,t),!a)return null;o=this.stationId(a)}let s=this.queues.get(o)??[];s.includes(e.id)||s.push(e.id),this.queues.set(o,s);let c=this.chooseAvailableSlot(a,t.chargingSlots,n);if(!c||[...this.reservations.values()].some(e=>e.state===`RESERVED`&&e.stationId===o&&e.slot.x===c.x&&e.slot.y===c.y))return null;let l={robotId:e.id,stationId:o,slot:c,state:`RESERVED`};return this.reservations.set(e.id,l),l}release(e){let t=this.reservations.get(e);if(t){let n=this.queues.get(t.stationId)??[];this.queues.set(t.stationId,n.filter(t=>t!==e))}else for(let[t,n]of this.queues)n.includes(e)&&this.queues.set(t,n.filter(t=>t!==e));this.reservations.delete(e)}get(e){return this.reservations.get(e)??null}getQueuePoint(e,t){let n=``,r=-1;for(let[t,i]of this.queues){let a=i.indexOf(e);if(a>=0){n=t,r=a;break}}if(!n||r<0)return null;let i=t.chargingStations.find(e=>this.stationId(e)===n);if(!i)return null;let a=i.x<t.width/2?1:-1,o=12+Math.min(r,7)*5;return{x:i.x+a*o,y:i.y}}queuePosition(e){for(let t of this.queues.values()){let n=t.indexOf(e);if(n>=0)return n+1}return 0}chooseStation(e,t){let n=null,r=1/0;for(let i of t.chargingStations){let t=Math.hypot(e.position.x-i.x,e.position.y-i.y);t<r&&(r=t,n=i)}return n}chooseAvailableSlot(e,t,n){let r=t.filter(t=>t.station.x===e.x&&t.station.y===e.y),i=null,a=1/0;for(let t of r){if(n.some(e=>e.id!==this.findRobotIdAtSlot(n,t.slot)&&e.state!==`FAILED`&&Math.hypot(e.position.x-t.slot.x,e.position.y-t.slot.y)<1.35)||[...this.reservations.values()].some(n=>n.state===`RESERVED`&&n.stationId===this.stationId(e)&&n.slot.x===t.slot.x&&n.slot.y===t.slot.y))continue;let r=Math.abs(t.slot.x-e.x)+Math.abs(t.slot.y-e.y);r<a&&(a=r,i={x:t.slot.x,y:t.slot.y})}return i}findRobotIdAtSlot(e,t){return e.find(e=>Math.hypot(e.position.x-t.x,e.position.y-t.y)<.55)?.id??null}stationId(e){return e.id??`${e.x},${e.y}`}},a=class{generateBid(e,t,n){if(e.state!==`IDLE`||e.battery<20||e.payloadCapacity<t.payload)return null;for(let n of t.requiredCapabilities)if(!e.capabilities.includes(n))return null;let r=this.distance(e.position.x,e.position.y,t.pickup.x,t.pickup.y)+this.distance(t.pickup.x,t.pickup.y,t.dropoff.x,t.dropoff.y),i=r/Math.max(e.speed,.1),a=r*.15,o=Math.max(0,e.battery-a),s=e.workload,c=r*1,l=i*.8,u=(100-o)*.6,d=s*15,f=t.priority*5,p=o<25?100:0,m=c+l+u+d+p-f;return{robotId:e.id,taskId:t.id,distance:r,estimatedTime:i,batteryAfterTask:o,workload:s,priority:t.priority,score:m,timestamp:n}}distance(e,t,n,r){return Math.abs(e-n)+Math.abs(t-r)}},o=class{bidEngine;constructor(){this.bidEngine=new a}announceTask(e,t,n){let r=performance.now(),i=[];for(let r of t){let t=this.bidEngine.generateBid(r,e,n);t!==null&&i.push(t)}let a=null;for(let e of i)(a===null||e.score<a.score)&&(a=e);let o=performance.now()-r;return{taskId:e.id,bids:i,winningBid:a,negotiationTime:o}}negotiateTasks(e,t,n){let r=[];for(let i of e){if(i.status!==`PENDING`)continue;let e=this.announceTask(i,t,n);r.push(e)}return r}},s=class{predictionHorizon=8;detectCollisions(e){let t=[];for(let n=0;n<e.length;n++)for(let r=n+1;r<e.length;r++){let i=e[n],a=e[r],o=this.predictCollision(i,a);o!==null&&t.push(o)}return t}predictCollision(e,t){if(e.state===`FAILED`||t.state===`FAILED`||e.route.length===0||t.route.length===0)return null;let n=this.getFutureRoute(e),r=this.getFutureRoute(t);for(let i=0;i<n.length;i++){let a=n[i];for(let n=0;n<r.length;n++){let o=r[n];if(a.x!==o.x||a.y!==o.y)continue;let s=this.estimateArrivalTime(e,i),c=this.estimateArrivalTime(t,n),l=Math.abs(s-c);if(l<=2)return{robotA:e.id,robotB:t.id,conflictPoint:a,timeA:s,timeB:c,timeDifference:l,severity:l<=.75?`HIGH`:l<=1.5?`MEDIUM`:`LOW`}}}return null}getFutureRoute(e){let t=Math.max(0,e.routeIndex);return e.route.slice(t,t+this.predictionHorizon)}estimateArrivalTime(e,t){return t/Math.max(e.speed,.1)}},c=class{negotiate(e,t,n){let r=t.find(t=>t.id===e.robotA),i=t.find(t=>t.id===e.robotB);if(!r||!i)return null;let a=this.getRobotTask(r,n),o=this.getRobotTask(i,n),s=this.calculatePriorityScore(r,a,e.timeA),c=this.calculatePriorityScore(i,o,e.timeB),l,u,d,f;s>=c?(l=r,u=i,d=s,f=c):(l=i,u=r,d=c,f=s);let p=this.buildReason(l,d,a,o);return{conflict:e,priorityRobotId:l.id,yieldingRobotId:u.id,priorityScore:d,yieldingScore:f,reason:p}}calculatePriorityScore(e,t,n){let r=0;return e.type===`EMERGENCY`&&(r+=100),t?.type===`EMERGENCY`&&(r+=80),t&&(r+=t.priority*10),e.battery<30?r+=15:e.battery<50&&(r+=5),r+=Math.max(0,10-n),r-=e.workload*3,r}getRobotTask(e,t){return e.currentTaskId===null?null:t.find(t=>t.id===e.currentTaskId)??null}buildReason(e,t,n,r){return e.type===`EMERGENCY`?`${e.id} receives priority because it is an emergency-response robot.`:n?.type===`EMERGENCY`||r?.type===`EMERGENCY`?`${e.id} receives priority because the conflicting mission contains an emergency task.`:t>=80?`${e.id} receives priority from mission urgency and task priority.`:e.battery<30?`${e.id} receives priority because its battery is critically low.`:`${e.id} receives priority from decentralized mission priority, ETA and workload scoring.`}},l=class{detect(e){let t=e.filter(e=>e.state!==`FAILED`&&e.routeIndex<e.route.length),n=new Map(t.map(e=>[e.id,e])),r=new Map;for(let e of t){let n=e.route[e.routeIndex];if(!n)continue;let i=t.find(t=>t.id!==e.id&&Math.round(t.position.x)===n.x&&Math.round(t.position.y)===n.y);i&&r.set(e.id,i.id)}let i=[],a=new Set;for(let e of t){if(!r.has(e.id))continue;let t=[],o=new Map,s=e.id;for(;s&&r.has(s);){if(o.has(s)){let e=t.slice(o.get(s));if(e.length>=2){let t=[...e].sort(),r=t.join(`|`);if(!a.has(r)){a.add(r);let e=t.map(e=>n.get(e)).filter(e=>!!e),o=this.chooseRecoveryRobot(e),s=n.get(o),c=s?.route[s.routeIndex]??s?.position??{x:0,y:0};i.push({id:`${r}@${c.x},${c.y}`,robotIds:t,recoveryRobotId:o,point:{x:c.x,y:c.y},reason:`Cyclic wait-for dependency detected across ${t.length} robots.`,timestamp:Date.now()})}}break}o.set(s,t.length),t.push(s),s=r.get(s)}}return i}chooseRecoveryRobot(e){return[...e].sort((e,t)=>{let n=+(e.type===`EMERGENCY`),r=+(t.type===`EMERGENCY`);if(n!==r)return n-r;let i=this.getTaskPriority(e),a=this.getTaskPriority(t);return i===a?e.battery===t.battery?e.id.localeCompare(t.id):e.battery-t.battery:i-a})[0]?.id??e[0].id}getTaskPriority(e){return+!!e.currentTaskId}},u=class{world;pathfinder;negotiator;collisionDetector;rightOfWayNegotiator;deadlockDetector;spatialIndex;chargingManager;homeStationByRobot=new Map;running=!1;simulationSpeed=1;autoTaskAssignment=!1;deadlockEvents=[];deadlockRecoveryCount=0;handledDeadlocks=new Set;stagnantTicks=new Map;yieldUntil=new Map;launchQueue=[];launchQueued=new Set;launchHoldRoutes=new Map;releasedFromLaunch=new Set;nextLaunchTime=0;launchSpacingSeconds=1;robotClearance=.22;tickAccumulator=0;movementAccumulator=0;collisionAccumulator=0;deadlockAccumulator=0;assignmentAccumulator=0;communicationAccumulator=0;chargingRecoveryAccumulator=0;chargingRecoveryAttempts=new Map;movementRate=30;tickRate=10;collisionInterval=.1;deadlockInterval=.75;assignmentInterval=.75;communicationInterval=.3;autoAssignmentTaskBudget=8;generateRandomTasks(e=5){let t=[],n=Math.max(1,Math.min(50,Math.floor(e)));for(let e=0;e<n;e++){let e=this.getRandomTaskType(),n=this.getRandomWalkablePoint(),r=this.getRandomWalkablePoint(),i=0;for(;r.x===n.x&&r.y===n.y&&i<20;)r=this.getRandomWalkablePoint(),i++;let a=this.buildRandomTask(e,n,r);this.world.tasks.push(a),t.push(a)}return this.totalTasksGenerated+=t.length,this.lastTaskGenerationCount=t.length,t}assignPendingTasks(){this.assignmentAccumulator=0,this.assignTasks(this.autoAssignmentTaskBudget)}setAutoTaskAssignment(e){this.autoTaskAssignment=e,e&&this.assignTasks()}toggleAutoTaskAssignment(){return this.setAutoTaskAssignment(!this.autoTaskAssignment),this.autoTaskAssignment}buildRandomTask(e,t,n){let r=10,i=[],a=5,o=120;switch(e){case`DELIVERY`:r=this.randomInteger(5,25),i=[`TRANSPORT`],a=this.randomInteger(3,8),o=this.randomInteger(90,180);break;case`HEAVY_TRANSPORT`:r=this.randomInteger(50,90),i=[`TRANSPORT`,`HEAVY_LOAD`],a=this.randomInteger(5,9),o=this.randomInteger(100,180);break;case`INSPECTION`:r=0,i=[`INSPECTION`],a=this.randomInteger(2,7),o=this.randomInteger(120,220);break;case`EMERGENCY`:r=this.randomInteger(1,10),i=[`TRANSPORT`,`EMERGENCY`],a=10,o=this.randomInteger(40,80);break;case`PICKUP`:r=this.randomInteger(5,20),i=[`TRANSPORT`],a=this.randomInteger(3,7),o=this.randomInteger(90,180)}return{id:this.getNextTaskId(),type:e,pickup:t,dropoff:n,priority:a,deadline:o,payload:r,requiredCapabilities:i,status:`PENDING`,assignedRobotId:null}}getRandomTaskType(){let e=[`DELIVERY`,`DELIVERY`,`DELIVERY`,`HEAVY_TRANSPORT`,`INSPECTION`,`EMERGENCY`];return e[Math.floor(Math.random()*e.length)]}getRandomWalkablePoint(){let e=this.world.environment.width,t=this.world.environment.height;for(let n=0;n<100;n++){let n=this.randomInteger(1,e-2),r=this.randomInteger(1,t-2);if(this.world.environment.isWalkable(n,r))return{x:n,y:r}}return{x:1,y:1}}getNextTaskId(){let e=0;for(let t of this.world.tasks){let n=t.id.match(/^T(\d+)$/);n&&(e=Math.max(e,Number(n[1])))}return`T${String(e+1).padStart(3,`0`)}`}randomInteger(e,t){return Math.floor(Math.random()*(t-e+1))+e}queueRobotForLaunch(e){e.state!==`FAILED`&&e.currentTaskId!==null&&(this.releasedFromLaunch.has(e.id)||this.launchQueued.has(e.id)||this.world.environment.chargingSlots.some(t=>Math.round(e.position.x)===t.slot.x&&Math.round(e.position.y)===t.slot.y)&&(this.launchQueued.add(e.id),this.launchQueue.push(e.id),e.route.length>0&&this.launchHoldRoutes.set(e.id,e.route.map(e=>({x:e.x,y:e.y}))),e.route=[],e.routeIndex=0,e.state=`WAITING`))}updateLaunchQueue(){if(this.launchQueue.length===0||this.world.simulationTime<this.nextLaunchTime)return;let e=this.launchQueue.shift();if(!e)return;this.launchQueued.delete(e);let t=this.world.robots.find(t=>t.id===e);if(!t||t.state===`FAILED`||t.currentTaskId===null){this.launchHoldRoutes.delete(e),this.nextLaunchTime=this.world.simulationTime+this.launchSpacingSeconds;return}let n=this.launchHoldRoutes.get(e);if(this.launchHoldRoutes.delete(e),!n||n.length===0){t.state=`WAITING`,t.route=[],t.routeIndex=0,this.nextLaunchTime=this.world.simulationTime+this.launchSpacingSeconds;return}t.route=n,t.routeIndex=+(n.length>1),t.state=`MOVING_TO_PICKUP`,this.releasedFromLaunch.add(t.id),this.nextLaunchTime=this.world.simulationTime+this.launchSpacingSeconds}lastNegotiations=[];totalNegotiations=0;successfulNegotiations=0;collisionPredictions=[];totalCollisionWarnings=0;communicationLinks=[];communicationGroups=[];recoveryBroadcastUntil=new Map;activeCollisionRiskCount=0;activeCollisionPairs=[];rightOfWayDecisions=[];totalRightOfWayNegotiations=0;totalYieldActions=0;totalTasksGenerated=0;lastTaskGenerationCount=0;handledConflicts=new Set;constructor(){this.world=new n,this.pathfinder=new t(this.world.environment),this.negotiator=new o,this.collisionDetector=new s,this.rightOfWayNegotiator=new c,this.deadlockDetector=new l,this.spatialIndex=new r(3),this.chargingManager=new i,this.initialize()}initialize(){this.world.reset(),this.ensureChargingSlots(),this.pathfinder=new t(this.world.environment),this.lastNegotiations=[],this.totalNegotiations=0,this.successfulNegotiations=0,this.collisionPredictions=[],this.totalCollisionWarnings=0,this.activeCollisionRiskCount=0,this.activeCollisionPairs=[],this.rightOfWayDecisions=[],this.totalRightOfWayNegotiations=0,this.totalYieldActions=0,this.totalTasksGenerated=0,this.lastTaskGenerationCount=0,this.handledConflicts.clear(),this.stagnantTicks.clear(),this.yieldUntil.clear(),this.launchQueue=[],this.launchQueued.clear(),this.launchHoldRoutes.clear(),this.releasedFromLaunch.clear(),this.nextLaunchTime=0,this.spatialIndex.rebuild([]),this.chargingManager.reset(this.world.environment.chargingStations),this.homeStationByRobot.clear(),this.tickAccumulator=0,this.movementAccumulator=0,this.collisionAccumulator=0,this.deadlockAccumulator=0,this.assignmentAccumulator=0,this.communicationAccumulator=0,this.communicationGroups=[],this.recoveryBroadcastUntil.clear(),this.chargingRecoveryAccumulator=0,this.chargingRecoveryAttempts.clear(),this.createRobots(),this.createTasks(),this.assignTasks()}createRobots(){let e=[`FAST_PICKER`,`HEAVY_CARRIER`,`INSPECTION`,`EMERGENCY`],t=this.world.environment.chargingSlots;if(t.length<100)throw Error(`Not enough startup slots: ${t.length}`);for(let n=0;n<100;n++){let r=e[n%e.length],i=t[n].slot,a=1,o=25,s=[];switch(r){case`FAST_PICKER`:a=1.5,o=25,s=[`TRANSPORT`,`FAST_PICKUP`];break;case`HEAVY_CARRIER`:a=.7,o=100,s=[`TRANSPORT`,`HEAVY_LOAD`];break;case`INSPECTION`:a=1,o=10,s=[`INSPECTION`];break;case`EMERGENCY`:a=1.8,o=40,s=[`TRANSPORT`,`EMERGENCY`,`FAST_PICKUP`]}let c={id:`R${String(n+1).padStart(2,`0`)}`,type:r,position:{x:i.x,y:i.y},speed:a,batteryCapacity:100,battery:70+n%4*7,health:100,payloadCapacity:o,capabilities:s,workload:0,currentTaskId:null,route:[],routeIndex:0,pathHistory:[{x:i.x,y:i.y}],state:`IDLE`,carryingPayload:!1};this.world.robots.push(c);let l=this.world.environment.chargingSlots.find(e=>e.slot.x===i.x&&e.slot.y===i.y);if(l){let e=this.world.environment.chargingStations.find(e=>e.x===l.station.x&&e.y===l.station.y)?.id??`${l.station.x},${l.station.y}`;this.homeStationByRobot.set(c.id,e)}}}createTasks(){this.world.tasks.push({id:`T001`,type:`DELIVERY`,pickup:{x:8,y:4},dropoff:{x:52,y:35},priority:5,deadline:120,payload:10,requiredCapabilities:[`TRANSPORT`],status:`PENDING`,assignedRobotId:null},{id:`T002`,type:`HEAVY_TRANSPORT`,pickup:{x:14,y:11},dropoff:{x:46,y:28},priority:8,deadline:100,payload:80,requiredCapabilities:[`TRANSPORT`,`HEAVY_LOAD`],status:`PENDING`,assignedRobotId:null},{id:`T003`,type:`INSPECTION`,pickup:{x:47,y:11},dropoff:{x:13,y:28},priority:4,deadline:150,payload:0,requiredCapabilities:[`INSPECTION`],status:`PENDING`,assignedRobotId:null},{id:`T004`,type:`DELIVERY`,pickup:{x:8,y:35},dropoff:{x:52,y:5},priority:6,deadline:120,payload:20,requiredCapabilities:[`TRANSPORT`],status:`PENDING`,assignedRobotId:null},{id:`T005`,type:`EMERGENCY`,pickup:{x:50,y:35},dropoff:{x:10,y:5},priority:10,deadline:60,payload:5,requiredCapabilities:[`TRANSPORT`,`EMERGENCY`],status:`PENDING`,assignedRobotId:null})}ensureChargingSlots(){let e=this.world.environment.chargingStations,t=[],n=new Set,r=[-12,-6,6,12,18],i=[-27,-21,-15,-9,-3,3,9,15,21,27];for(let a of e){let o=[];for(let t of i)for(let i of r){let r={x:a.x+i,y:a.y+t};if(!this.world.environment.isInside(r.x,r.y)||!this.world.environment.isWalkable(r.x,r.y)||e.some(e=>e!==a&&Math.hypot(e.x-r.x,e.y-r.y)<6))continue;let s=`${r.x},${r.y}`;n.has(s)||(o.push(r),n.add(s))}if(o.length<50)throw Error(`Charging station ${a.id??``} has only ${o.length} usable wide-spaced bays; 50 are required.`);for(let e of o.slice(0,50))t.push({station:{x:a.x,y:a.y},slot:e})}if(t.length<100)throw Error(`Only ${t.length} wide-spaced charging slots generated; 100 are required.`);this.world.environment.chargingSlots=t}getChargingStationObstaclePoints(){let e=[];for(let t of this.world.environment.chargingStations){let n=Math.max(1,Math.floor((t.width??7)/2)),r=Math.max(1,Math.floor((t.height??5)/2));for(let i=-n;i<=n;i++)for(let n=-r;n<=r;n++)e.push({x:t.x+i,y:t.y+n})}return e}isAtChargingSlot(e){return this.world.environment.chargingSlots.some(t=>Math.round(e.position.x)===t.slot.x&&Math.round(e.position.y)===t.slot.y)}getChargingStation(e){return this.world.environment.chargingStations.find(t=>(t.id??`${t.x},${t.y}`)===e)??null}sendRobotToChargingStation(e){if(e.state===`FAILED`)return;let t=this.chargingManager.request(e,this.world.environment,this.world.robots,this.homeStationByRobot.get(e.id));if(!t||t.state===`QUEUED`){let t=this.chargingManager.getQueuePoint(e.id,this.world.environment);if(t){let n=this.pathfinder.findPath(e.position,t,this.getChargingStationObstaclePoints());if(n.length>0){e.route=n,e.routeIndex=+(n.length>1),e.state=`WAITING`;return}}e.state=`WAITING`,e.route=[],e.routeIndex=0;return}let n=this.getChargingStationObstaclePoints(),r=this.getNearbyTrafficBlockPoints(e.id),i=this.pathfinder.findNaturalPathToObject(e.position,t.slot,this.uniquePoints([...n,...r.slice(0,24)])),a=i.length>0?i:this.pathfinder.findNaturalPathToObject(e.position,t.slot,n);if(a.length===0){this.chargingManager.release(e.id),e.state=`WAITING`,e.route=[],e.routeIndex=0;return}e.route=a,e.routeIndex=+(a.length>1),e.state=`RETURNING_TO_CHARGE`,this.chargingRecoveryAttempts.set(e.id,0)}assignTasks(e=1/0){let t=this.world.tasks.filter(e=>e.status===`PENDING`).sort((e,t)=>t.priority-e.priority||e.deadline-t.deadline).slice(0,Number.isFinite(e)?e:void 0);if(t.length===0)return;let n=new Map;for(let e of t){let t=this.world.robots.filter(t=>t.state===`IDLE`&&t.currentTaskId===null&&t.battery>=20&&t.payloadCapacity>=e.payload&&e.requiredCapabilities.every(e=>t.capabilities.includes(e))).sort((t,n)=>Math.hypot(t.position.x-e.pickup.x,t.position.y-e.pickup.y)-Math.hypot(n.position.x-e.pickup.x,n.position.y-e.pickup.y)).slice(0,12);for(let e of t)n.set(e.id,e)}let r=this.negotiator.negotiateTasks(t,[...n.values()],this.world.simulationTime);this.lastNegotiations=r,this.totalNegotiations+=r.length;let i=new Set;for(let e of r){let t=e.winningBid;if(t===null||i.has(t.robotId))continue;let n=this.world.tasks.find(e=>e.id===t.taskId),r=this.world.robots.find(e=>e.id===t.robotId);n&&r&&n.status===`PENDING`&&r.state===`IDLE`&&this.assignTask(r,n)&&(i.add(r.id),this.successfulNegotiations++)}}getTaskObstaclePoints(e=null){let t=[];for(let n of this.world.tasks)n.id!==e&&n.status!==`COMPLETED`&&(t.push({x:n.pickup.x,y:n.pickup.y}),t.push({x:n.dropoff.x,y:n.dropoff.y}));return t}assignTask(e,t){this.chargingManager.release(e.id);let n=[...this.getTaskObstaclePoints(t.id),...this.getChargingStationObstaclePoints()],r=this.pathfinder.findNaturalPathToObject(e.position,t.pickup,n);return r.length!==0&&(t.status=`ASSIGNED`,t.assignedRobotId=e.id,e.currentTaskId=t.id,e.workload+=1,e.state=`MOVING_TO_PICKUP`,e.route=r,e.routeIndex=+(r.length>1),this.queueRobotForLaunch(e),!0)}enforceChargingReturn(){let e=new Map;for(let t of this.world.robots){if(t.state===`FAILED`||t.state===`CHARGING`||t.currentTaskId!==null)continue;let n=this.chargingManager.get(t.id);if(n?.state===`RESERVED`){let r=`${n.stationId}|${n.slot.x},${n.slot.y}`,i=e.get(r);if(i&&i!==t.id){this.chargingManager.release(t.id),t.route=[],t.routeIndex=0,t.state=`WAITING`,this.chargingRecoveryAttempts.set(t.id,0);continue}e.set(r,t.id)}if(this.isAtChargingSlot(t))continue;let r=t.route.length===0||t.routeIndex>=t.route.length,i=t.state===`RETURNING_TO_CHARGE`,a=t.state===`WAITING`;if(t.state===`IDLE`||a||i&&r){this.sendRobotToChargingStation(t);let e=(this.chargingRecoveryAttempts.get(t.id)??0)+1;this.chargingRecoveryAttempts.set(t.id,e)}(this.chargingRecoveryAttempts.get(t.id)??0)>=3&&t.state===`RETURNING_TO_CHARGE`&&(this.recoverStalledRobot(t),this.chargingRecoveryAttempts.set(t.id,0))}}update(e){if(!this.running)return;let t=Math.min(.05,Math.max(0,e)),n=t*this.simulationSpeed;this.world.simulationTime+=n,this.movementAccumulator+=t;let r=1/this.movementRate;if(this.movementAccumulator>=r){let e=Math.min(.05,this.movementAccumulator);this.movementAccumulator%=r,this.spatialIndex.rebuild(this.world.robots),this.updateRobots(e*this.simulationSpeed)}this.collisionAccumulator+=t,this.communicationAccumulator+=t,this.deadlockAccumulator+=t,this.assignmentAccumulator+=t,this.tickAccumulator+=t;let i=1/this.tickRate;if(!(this.tickAccumulator<i)){if(this.tickAccumulator%=i,this.updateLaunchQueue(),this.chargingRecoveryAccumulator+=t,this.chargingRecoveryAccumulator>=.5&&(this.chargingRecoveryAccumulator%=.5,this.enforceChargingReturn()),this.collisionAccumulator>=this.collisionInterval&&(this.collisionAccumulator%=this.collisionInterval,this.collisionPredictions=this.collisionDetector.detectCollisions(this.world.robots),this.updateLiveCollisionRisks(),this.collisionPredictions.length>0&&(this.totalCollisionWarnings+=this.collisionPredictions.length,this.resolveRightOfWay())),this.communicationAccumulator>=this.communicationInterval&&(this.communicationAccumulator%=this.communicationInterval,this.communicationLinks=this.communicationLinks.filter(e=>e.expiresAt>this.world.simulationTime),this.refreshCommunicationNetwork(),this.coordinateRecoveryGroups()),this.deadlockAccumulator>=this.deadlockInterval){this.deadlockAccumulator%=this.deadlockInterval;let e=this.deadlockDetector.detect(this.world.robots);for(let t of e)this.handledDeadlocks.has(t.id)||(this.handledDeadlocks.add(t.id),this.deadlockEvents.unshift(t),this.deadlockEvents.length>10&&this.deadlockEvents.pop(),this.recoverDeadlock(t))}this.autoTaskAssignment&&this.assignmentAccumulator>=this.assignmentInterval&&(this.assignmentAccumulator%=this.assignmentInterval,this.assignTasks(this.autoAssignmentTaskBudget))}}getConflictKey(e){let t=[e.robotA,e.robotB].sort();return[t[0],t[1],e.conflictPoint.x,e.conflictPoint.y].join(`|`)}addCommunicationLink(e,t,n,r=.25){if(e===t)return;let i=e<t?e:t,a=e<t?t:e,o=this.world.simulationTime+r,s=this.communicationLinks.find(e=>e.robotA===i&&e.robotB===a);if(s){s.reason=n,s.expiresAt=Math.max(s.expiresAt,o);return}this.communicationLinks.push({robotA:i,robotB:a,reason:n,expiresAt:o}),this.communicationLinks.length>120&&this.communicationLinks.shift()}refreshCommunicationNetwork(){let e=this.world.robots.filter(e=>e.state!==`FAILED`&&e.state!==`IDLE`&&e.state!==`CHARGING`),t=new Set;for(let n of e){let e=(this.stagnantTicks.get(n.id)??0)>=3,r=n.state===`WAITING`,i=n.state===`RETURNING_TO_CHARGE`&&e,a=this.collisionPredictions.some(e=>e.robotA===n.id||e.robotB===n.id);(e||r||i||a)&&t.add(n.id)}let n=e.filter(e=>t.has(e.id)),r=new Set,i=[];for(let e of n){if(r.has(e.id))continue;let n=[e],a=[];for(r.add(e.id);n.length>0;){let e=n.shift();if(e){a.push(e);for(let i of this.spatialIndex.nearbyRobot(e,7))i.state===`FAILED`||i.state===`IDLE`||i.state===`CHARGING`||r.has(i.id)||(t.has(i.id)||i.route.some(t=>e.route.slice(e.routeIndex,e.routeIndex+8).some(e=>Math.round(e.x)===Math.round(t.x)&&Math.round(e.y)===Math.round(t.y))))&&(r.add(i.id),n.push(i))}}if(a.length<2)continue;let o=a.slice().sort((e,t)=>this.getTrafficPriority(t)-this.getTrafficPriority(e)||e.id.localeCompare(t.id))[0];i.push({leaderId:o.id,memberIds:a.map(e=>e.id),reason:`MULTI-COMM LOCAL CONSENSUS`});for(let e of a)e.id!==o.id&&this.addCommunicationLink(o.id,e.id,`MULTI-COMM GROUP LISTEN`,.45)}this.communicationGroups=i}coordinateRecoveryGroups(){let e=this.world.simulationTime;for(let t of this.world.robots){if(t.state===`FAILED`||t.state===`CHARGING`)continue;let n=(this.stagnantTicks.get(t.id)??0)>=3,r=t.state===`WAITING`,i=t.state===`RETURNING_TO_CHARGE`&&n;if(!n&&!r&&!i||(this.recoveryBroadcastUntil.get(t.id)??0)>e)continue;this.recoveryBroadcastUntil.set(t.id,e+.6);let a=this.communicationGroups.find(e=>e.memberIds.includes(t.id));if(!a)continue;let o=a.memberIds.map(e=>this.world.robots.find(t=>t.id===e)).filter(e=>e!==void 0&&e.state!==`FAILED`);if(o.length<2)continue;let s=this.getRobotRouteDestination(t);if(!s)continue;let c=o.filter(e=>e.id!==t.id).sort((e,t)=>this.getTrafficPriority(e)-this.getTrafficPriority(t)),l=c.slice(0,8).flatMap(e=>e.route.slice(e.routeIndex,e.routeIndex+5)),u=this.uniquePoints([...l,...this.getTaskObstaclePoints(t.currentTaskId),...this.getChargingStationObstaclePoints()]).filter(e=>!this.samePoint(e,t.position)&&!this.samePoint(e,s)),d=this.pathfinder.findNaturalPathToObject(t.position,s,u);if(d.length===0&&(d=this.pathfinder.findNaturalPathToObject(t.position,s,this.getChargingStationObstaclePoints())),d.length===0)continue;t.route=d,t.routeIndex=+(d.length>1),this.restoreMovementState(t);let f=new Set(d.slice(0,Math.min(d.length,12)).map(e=>`${Math.round(e.x)},${Math.round(e.y)}`));for(let n of c){if(!n.route.some(e=>f.has(`${Math.round(e.x)},${Math.round(e.y)}`)))continue;let r=this.getTrafficPriority(t);this.getTrafficPriority(n)<=r&&(this.yieldUntil.set(n.id,Math.max(this.yieldUntil.get(n.id)??0,e+.9)),this.addCommunicationLink(t.id,n.id,`MULTI-COMM SUPPORT: CLEAR RECOVERY CORRIDOR`,1))}}}resolveRightOfWay(){for(let e of this.collisionPredictions){let t=this.getConflictKey(e);if(this.handledConflicts.has(t))continue;this.addCommunicationLink(e.robotA,e.robotB,`MULTI-COMM CONFLICT CONSENSUS`,.5);let n=this.rightOfWayNegotiator.negotiate(e,this.world.robots,this.world.tasks);n!==null&&(this.handledConflicts.add(t),this.rightOfWayDecisions.unshift(n),this.rightOfWayDecisions.length>10&&this.rightOfWayDecisions.pop(),this.totalRightOfWayNegotiations++,this.applyYieldDecision(n))}let e=new Set(this.collisionPredictions.map(e=>this.getConflictKey(e)));for(let t of this.handledConflicts)e.has(t)||this.handledConflicts.delete(t)}applyYieldDecision(e){let t=this.world.robots.find(t=>t.id===e.yieldingRobotId);if(!t||t.state===`FAILED`)return;let n=e.conflict.robotA===e.yieldingRobotId?e.conflict.robotB:e.conflict.robotA,r=this.world.robots.find(e=>e.id===n);if(!r||r.state===`FAILED`)return;let i=this.world.simulationTime;this.addCommunicationLink(r.id,t.id,`MULTI-COMM RIGHT-OF-WAY: GROUP DECISION`,1),this.yieldUntil.set(t.id,Math.max(this.yieldUntil.get(t.id)??0,i+.85)),this.totalYieldActions++}replanRobotAroundConflict(e,t,n){let r=this.getRobotRouteDestination(e);if(!r)return[];let i=this.uniquePoints([t,...n,...this.getNearbyTrafficBlockPoints(e.id),...this.getTaskObstaclePoints(e.currentTaskId),...this.getChargingStationObstaclePoints()]).filter(t=>!this.samePoint(t,e.position)&&!this.samePoint(t,r)),a=this.pathfinder.findPath(e.position,r,i);return a.length===0&&(a=this.pathfinder.findPath(e.position,r,this.uniquePoints([t,...n.slice(0,12)]).filter(t=>!this.samePoint(t,e.position)&&!this.samePoint(t,r)))),a.length===0?[]:(e.route=a,e.routeIndex=+(a.length>1),this.restoreMovementState(e),a)}getRobotRouteDestination(e){if(e.currentTaskId!==null){let t=this.world.tasks.find(t=>t.id===e.currentTaskId);return t?this.getTaskDestination(e,t):null}let t=this.chargingManager.get(e.id);return t?.state===`RESERVED`?{x:t.slot.x,y:t.slot.y}:this.chargingManager.getQueuePoint(e.id,this.world.environment)||(e.route[e.route.length-1]??null)}getNearbyTrafficBlockPoints(e){let t=[],n=this.world.robots.find(t=>t.id===e);if(!n)return t;for(let e of this.spatialIndex.nearbyRobot(n,10))if(e.state!==`FAILED`){t.push({x:Math.round(e.position.x),y:Math.round(e.position.y)});for(let n=e.routeIndex;n<Math.min(e.routeIndex+4,e.route.length);n++){let r=e.route[n];r&&t.push({x:Math.round(r.x),y:Math.round(r.y)})}}return t}samePoint(e,t){return Math.round(e.x)===Math.round(t.x)&&Math.round(e.y)===Math.round(t.y)}uniquePoints(e){let t=new Set,n=[];for(let r of e){let e=`${Math.round(r.x)},${Math.round(r.y)}`;t.has(e)||(t.add(e),n.push({x:Math.round(r.x),y:Math.round(r.y)}))}return n}getTaskDestination(e,t){return e.state===`MOVING_TO_PICKUP`?t.pickup:t.dropoff}updateLiveCollisionRisks(){let e=[],t=Math.max(.28,this.robotClearance+.04);for(let n of this.world.robots)if(n.state!==`FAILED`&&n.route.length>0&&n.state!==`CHARGING`&&n.state!==`IDLE`)for(let r of this.spatialIndex.nearbyRobot(n,t)){if(n.id>=r.id||!(r.route.length>0&&r.state!==`CHARGING`&&r.state!==`IDLE`))continue;let i=Math.hypot(n.position.x-r.position.x,n.position.y-r.position.y);if(i<this.robotClearance){e.push({robotA:n.id,robotB:r.id,distance:i});continue}let a=n.route[n.routeIndex],o=r.route[r.routeIndex];a&&o&&Math.hypot(a.x-o.x,a.y-o.y)<this.robotClearance&&i<t&&e.push({robotA:n.id,robotB:r.id,distance:i})}this.activeCollisionPairs=e,this.activeCollisionRiskCount=e.length}updateRobots(e){for(let t of this.world.robots){if(t.state===`FAILED`||this.launchQueued.has(t.id))continue;if(t.state===`CHARGING`){this.chargeRobot(t,e);continue}if(t.currentTaskId===null&&this.isAtChargingSlot(t)){t.route=[],t.routeIndex=0,t.state=t.battery<t.batteryCapacity?`CHARGING`:`IDLE`;continue}if(t.state===`WAITING`&&this.retryWaitingRobot(t),t.route.length===0){t.currentTaskId===null&&!this.isAtChargingSlot(t)&&(t.state===`RETURNING_TO_CHARGE`||this.world.tasks.every(e=>e.status!==`PENDING`))&&this.sendRobotToChargingStation(t);continue}let n=t.position.x,r=t.position.y;if(t.state!==`RETURNING_TO_CHARGE`&&this.handleImmediateTrafficConflict(t))continue;this.moveRobot(t,e);let i=Math.hypot(t.position.x-n,t.position.y-r);if(i<.001&&t.route.length>0){let e=(this.stagnantTicks.get(t.id)??0)+1;this.stagnantTicks.set(t.id,e),e>=6&&(this.recoverStalledRobot(t),this.stagnantTicks.set(t.id,0))}else this.stagnantTicks.set(t.id,0);let a=i*.018;t.battery-=a,t.battery<=0&&(t.battery=0,t.state=`FAILED`)}this.spatialIndex.rebuild(this.world.robots)}retryWaitingRobot(e){if(e.state===`WAITING`){if(e.currentTaskId!==null){let t=this.world.tasks.find(t=>t.id===e.currentTaskId);if(!t||t.status===`COMPLETED`){e.currentTaskId=null,e.route=[],e.routeIndex=0,e.state=`IDLE`;return}let n=t.status===`IN_PROGRESS`?t.dropoff:t.pickup,r=this.uniquePoints([...this.getTaskObstaclePoints(t.id),...this.getNearbyTrafficBlockPoints(e.id)]),i=this.pathfinder.findPath(e.position,n,r);if(i.length>0){e.route=i,e.routeIndex=+(i.length>1),e.state=t.status===`IN_PROGRESS`?`MOVING_TO_DROPOFF`:`MOVING_TO_PICKUP`;return}let a=this.pathfinder.findNaturalPathToObject(e.position,n,r);a.length>0&&(e.route=a,e.routeIndex=+(a.length>1),e.state=t.status===`IN_PROGRESS`?`MOVING_TO_DROPOFF`:`MOVING_TO_PICKUP`);return}if(this.isAtChargingSlot(e)&&this.chargingManager.get(e.id)?.state===`RESERVED`){e.route=[],e.routeIndex=0,e.state=`CHARGING`;return}this.sendRobotToChargingStation(e)}}recoverStalledRobot(e){if(e.state===`FAILED`||e.state===`CHARGING`)return;let t=null,n=[];if(e.currentTaskId!==null){let r=this.world.tasks.find(t=>t.id===e.currentTaskId);if(!r)return;t=r.status===`IN_PROGRESS`?r.dropoff:r.pickup,n=this.getTaskObstaclePoints(r.id)}else e.state===`RETURNING_TO_CHARGE`&&(t=this.getRobotRouteDestination(e));if(!t)return;let r=e.state===`RETURNING_TO_CHARGE`?[]:this.spatialIndex.nearbyRobot(e,8).filter(e=>e.state!==`FAILED`&&e.state!==`CHARGING`).map(e=>({x:Math.round(e.position.x),y:Math.round(e.position.y)})),i=this.pathfinder.findPath(e.position,t,[...n,...r]);if(i.length>0){e.route=i,e.routeIndex=+(i.length>1),this.restoreMovementState(e);return}let a=this.pathfinder.findPath(e.position,t,n);a.length>0&&(e.route=a,e.routeIndex=+(a.length>1),this.restoreMovementState(e))}restoreMovementState(e){if(e.currentTaskId===null){e.state!==`RETURNING_TO_CHARGE`&&(e.state=`RETURNING_TO_CHARGE`);return}e.state=this.world.tasks.find(t=>t.id===e.currentTaskId)?.status===`IN_PROGRESS`?`MOVING_TO_DROPOFF`:`MOVING_TO_PICKUP`}handleImmediateTrafficConflict(e){let t=this.yieldUntil.get(e.id)??0;if(t>this.world.simulationTime)return!0;if(t>0&&this.yieldUntil.delete(e.id),e.routeIndex>=e.route.length)return!1;let n=e.route[e.routeIndex];if(!n)return!1;let r=this.spatialIndex.nearby(n,Math.max(.24,this.robotClearance)).filter(t=>t.id!==e.id&&t.state!==`FAILED`);if(r.length===0)return!1;let i=r.map(e=>({robot:e,distance:Math.hypot(e.position.x-n.x,e.position.y-n.y)})).sort((e,t)=>e.distance-t.distance)[0]?.robot;if(!i)return!1;let a=this.world.simulationTime,o=this.getTrafficPriority(e),s=this.getTrafficPriority(i);return o>s||o===s&&e.id<i.id?(this.addCommunicationLink(e.id,i.id,`MULTI-COMM RIGHT-OF-WAY: GROUP DECISION`,.75),this.forceTrafficYield(i,e)||this.yieldUntil.set(i.id,a+.65),!1):(this.addCommunicationLink(i.id,e.id,`MULTI-COMM RIGHT-OF-WAY: GROUP DECISION`,.75),(this.yieldUntil.get(e.id)??0)<=a&&this.replanRobotAroundConflict(e,n,i.route.slice(i.routeIndex,i.routeIndex+8)).length>1?(this.stagnantTicks.set(e.id,0),!1):(this.yieldUntil.set(e.id,a+.65),!0))}getTrafficPriority(e){let t=0,n=e.currentTaskId===null?null:this.world.tasks.find(t=>t.id===e.currentTaskId)??null;return n&&(t+=n.priority*100,n.type===`EMERGENCY`&&(t+=5e3)),e.battery<20?t+=900:e.battery<35&&(t+=300),e.state===`RETURNING_TO_CHARGE`&&(t+=150),e.state===`MOVING_TO_DROPOFF`&&(t+=40),e.state===`MOVING_TO_PICKUP`&&(t+=20),t}forceTrafficYield(e,t){if(e.state===`FAILED`||e.state===`CHARGING`)return!1;if(e.currentTaskId===null&&e.state===`IDLE`){let t=e.route;if(this.sendRobotToChargingStation(e),e.route.length>0)return this.yieldUntil.set(e.id,0),!0;e.route=t}let n=this.getRobotRouteDestination(e);if(!n)return!1;let r=this.uniquePoints([{x:t.position.x,y:t.position.y},...t.route.slice(t.routeIndex,t.routeIndex+8).map(e=>({x:e.x,y:e.y}))]).filter(t=>!this.samePoint(t,e.position)&&!this.samePoint(t,n)),i=this.pathfinder.findPath(e.position,n,r);return i.length===0&&(i=this.pathfinder.findPath(e.position,n,[{x:Math.round(t.position.x),y:Math.round(t.position.y)}])),i.length!==0&&(e.route=i,e.routeIndex=+(i.length>1),this.restoreMovementState(e),this.yieldUntil.set(e.id,0),this.stagnantTicks.set(e.id,0),!0)}moveRobot(e,t){if(e.routeIndex>=e.route.length){this.handleDestination(e);return}let n=e.route[e.routeIndex],r=n.x-e.position.x,i=n.y-e.position.y,a=Math.sqrt(r*r+i*i);if(a<.05){if(this.spatialIndex.nearby(n,.2).some(t=>t.id!==e.id&&t.state!==`FAILED`))return;e.position={x:n.x,y:n.y},e.routeIndex++,e.routeIndex>=e.route.length&&this.handleDestination(e);return}let o=e.speed*11.75*t,s=Math.min(1,o/a),c=e.position.x+r*s,l=e.position.y+i*s;if(this.spatialIndex.nearby({x:c,y:l},.2).some(t=>t.id!==e.id&&t.state!==`FAILED`)){let t=(this.stagnantTicks.get(e.id)??0)+1;this.stagnantTicks.set(e.id,t);return}this.stagnantTicks.set(e.id,0),e.position.x=c,e.position.y=l,this.recordRobotPath(e)}recordRobotPath(e){let t=e.pathHistory[e.pathHistory.length-1];if(!t){e.pathHistory.push({x:e.position.x,y:e.position.y});return}Math.hypot(e.position.x-t.x,e.position.y-t.y)<.18||(e.pathHistory.push({x:e.position.x,y:e.position.y}),e.pathHistory.length>300&&e.pathHistory.splice(0,e.pathHistory.length-300))}handleDestination(e){if(e.currentTaskId===null){if(e.state===`RETURNING_TO_CHARGE`){let t=this.world.environment.chargingSlots.some(t=>Math.round(e.position.x)===t.slot.x&&Math.round(e.position.y)===t.slot.y),n=this.world.environment.chargingStations.some(t=>Math.round(e.position.x)===t.x&&Math.round(e.position.y)===t.y);if(t){if(this.chargingManager.get(e.id)?.state===`RESERVED`){e.route=[],e.routeIndex=0,e.state=`CHARGING`,this.chargingRecoveryAttempts.delete(e.id);return}e.route=[],e.routeIndex=0,e.state=`WAITING`;return}if(n){this.sendRobotToChargingStation(e);return}}e.state=`IDLE`,e.route=[],e.routeIndex=0;return}let t=this.world.tasks.find(t=>t.id===e.currentTaskId);if(!t){e.state=`IDLE`,e.route=[],e.routeIndex=0,e.currentTaskId=null;return}if(e.state===`MOVING_TO_PICKUP`){e.carryingPayload=!0,t.status=`IN_PROGRESS`,e.state=`MOVING_TO_DROPOFF`;let n=this.pathfinder.findNaturalPathToObject(e.position,t.dropoff,[...this.getTaskObstaclePoints(t.id),...this.getChargingStationObstaclePoints()]);if(n.length===0){e.state=`WAITING`,e.route=[];return}e.route=n,e.routeIndex=+(n.length>1);return}e.state===`MOVING_TO_DROPOFF`&&(t.status=`COMPLETED`,this.world.completedTasks++,e.carryingPayload=!1,e.currentTaskId=null,e.route=[],e.routeIndex=0,e.workload=Math.max(0,e.workload-1),this.releasedFromLaunch.delete(e.id),this.sendRobotToChargingStation(e))}chargeRobot(e,t){let n=this.chargingManager.get(e.id),r=this.isAtChargingSlot(e);if(!n){if(r&&e.currentTaskId===null){e.battery+=10*t,e.battery>=e.batteryCapacity&&(e.battery=e.batteryCapacity,e.state=`IDLE`);return}e.state=`WAITING`,e.route=[],e.routeIndex=0;return}if(n.state!==`RESERVED`){e.state=`WAITING`,e.route=[],e.routeIndex=0;return}if(!r){e.state=`RETURNING_TO_CHARGE`,this.sendRobotToChargingStation(e);return}if(e.battery+=10*t,e.battery>=e.batteryCapacity){if(e.battery=e.batteryCapacity,!this.getChargingStation(n.stationId)){this.chargingManager.release(e.id),e.state=`IDLE`;return}this.chargingManager.release(e.id),this.chargingRecoveryAttempts.delete(e.id),e.route=[],e.routeIndex=0,e.state=`IDLE`}}injectRobotFailure(e){let t=this.world.robots.filter(e=>e.state!==`FAILED`);if(t.length===0)return;let n=e?this.world.robots.find(t=>t.id===e&&t.state!==`FAILED`):t.find(e=>e.currentTaskId!==null)??t[0];if(n){if(n.currentTaskId!==null){let e=this.world.tasks.find(e=>e.id===n.currentTaskId);e&&e.status!==`COMPLETED`&&(e.status=`PENDING`,e.assignedRobotId=null)}n.currentTaskId=null,n.route=[],n.routeIndex=0,n.state=`FAILED`,n.workload=0,n.carryingPayload=!1,this.chargingManager.release(n.id),this.launchQueued.delete(n.id),this.launchHoldRoutes.delete(n.id),this.releasedFromLaunch.delete(n.id)}}injectDeadlockScenario(){let e=this.world.robots[0],t=this.world.robots[1];if(!e||!t)return;e.position={x:10,y:10},t.position={x:11,y:10},e.pathHistory=[{x:10,y:10}],t.pathHistory=[{x:11,y:10}],e.route=[{x:10,y:10},{x:11,y:10}],t.route=[{x:11,y:10},{x:10,y:10}],e.routeIndex=1,t.routeIndex=1,e.state=`WAITING`,t.state=`WAITING`,this.deadlockEvents=[],this.handledDeadlocks.clear();let n=this.deadlockDetector.detect(this.world.robots);for(let e of n)this.deadlockEvents.push(e),this.recoverDeadlock(e)}recoverDeadlock(e){let t=this.world.robots.find(t=>t.id===e.recoveryRobotId);if(!t||t.state===`FAILED`)return;let n=t.route[t.route.length-1];if(!n)return;let r=e.robotIds.filter(e=>e!==t.id).map(e=>this.world.robots.find(t=>t.id===e)).filter(e=>!!e).map(e=>({x:Math.round(e.position.x),y:Math.round(e.position.y)})),i=this.pathfinder.findPath(t.position,n,[e.point,...r]);if(i.length>0){t.route=i,t.routeIndex=+(i.length>1),t.state===`WAITING`&&(t.state=t.currentTaskId===null?`RETURNING_TO_CHARGE`:this.world.tasks.find(e=>e.id===t.currentTaskId)?.status===`IN_PROGRESS`?`MOVING_TO_DROPOFF`:`MOVING_TO_PICKUP`),this.deadlockRecoveryCount++;return}t.state=`WAITING`,t.route=[t.position,n],t.routeIndex=1,this.deadlockRecoveryCount++}setSimulationSpeed(e){[.5,1,2,4,10,20].includes(e)&&(this.simulationSpeed=e)}start(){this.running||=!0}pause(){this.running=!1}togglePause(){this.running=!this.running}reset(){this.running=!1,this.initialize()}isRunning(){return this.running}},d=class{canvas;ctx;environment;selectedRobotId=null;lastRobots=[];lastTasks=[];lastLinks=[];lastCollisions=[];view={scale:1,ox:0,oy:0};panX=0;panY=0;zoomLevel=1;followRobotId=null;dragging=!1;dragged=!1;dragButton=0;lastPointer={x:0,y:0};pointerDown={x:0,y:0};minZoom=.55;maxZoom=2.8;constructor(e,t){this.canvas=e;let n=e.getContext(`2d`);if(!n)throw Error(`Could not create 2D canvas context`);this.ctx=n,this.environment=t,this.canvas.addEventListener(`mousedown`,e=>this.handlePointerDown(e)),this.canvas.addEventListener(`mousemove`,e=>this.handlePointerMove(e)),this.canvas.addEventListener(`mouseup`,e=>this.handlePointerUp(e)),this.canvas.addEventListener(`mouseleave`,e=>this.handlePointerUp(e)),this.canvas.addEventListener(`contextmenu`,e=>e.preventDefault()),this.canvas.addEventListener(`wheel`,e=>this.handleWheel(e),{passive:!1})}render(e,t,n=[],r=[]){this.lastRobots=e,this.lastTasks=t,this.lastLinks=n,this.lastCollisions=r,this.resizeCanvas(),this.updateFollowCamera(),this.drawFrame()}resizeCanvas(){let e=this.canvas.getBoundingClientRect(),t=Math.max(640,Math.floor(e.width||this.canvas.parentElement?.clientWidth||1e3)),n=Math.max(420,Math.floor(e.height||t*.58)),r=Math.min(2,window.devicePixelRatio||1);(this.canvas.width!==Math.floor(t*r)||this.canvas.height!==Math.floor(n*r))&&(this.canvas.width=Math.floor(t*r),this.canvas.height=Math.floor(n*r)),this.ctx.setTransform(r,0,0,r,0,0);let i=Math.min((t-36)/this.environment.width,(n-36)/this.environment.height)*this.zoomLevel;this.view.scale=i,this.view.ox=(t-this.environment.width*i)/2+this.panX,this.view.oy=(n-this.environment.height*i)/2+this.panY}zoomIn(){this.setZoom(this.zoomLevel*1.2)}zoomOut(){this.setZoom(this.zoomLevel/1.2)}resetZoom(){this.setZoom(1)}setZoom(e){this.zoomLevel=Math.max(this.minZoom,Math.min(this.maxZoom,e)),this.render(this.lastRobots,this.lastTasks,this.lastLinks,this.lastCollisions)}handleWheel(e){e.preventDefault();let t=this.canvas.getBoundingClientRect(),n=this.screenToWorld(e.clientX-t.left,e.clientY-t.top),r=e.deltaY<0?1.12:1/1.12,i=Math.max(this.minZoom,Math.min(this.maxZoom,this.zoomLevel*r));if(Math.abs(i-this.zoomLevel)<.001)return;this.zoomLevel=i,this.resizeCanvas();let a=this.worldToScreen(n);this.panX+=e.clientX-t.left-a.x,this.panY+=e.clientY-t.top-a.y,this.resizeCanvas(),this.updateFollowCamera(),this.drawFrame()}updateFollowCamera(){if(!this.followRobotId)return;let e=this.lastRobots.find(e=>e.id===this.followRobotId);if(!e||e.state===`FAILED`){this.followRobotId=null;return}let t=this.canvas.getBoundingClientRect(),n=t.width/2,r=t.height/2,i=this.worldToScreen(e.position),a=.16;this.panX+=(n-i.x)*a,this.panY+=(r-i.y)*a,this.view.ox+=(n-i.x)*a,this.view.oy+=(r-i.y)*a}followRobot(e){this.followRobotId=e,this.selectedRobotId=e,this.centerOnRobot(e,!0)}releaseFollow(){this.followRobotId=null}centerOnRobot(e,t=!1){let n=this.lastRobots.find(t=>t.id===e);if(!n)return;let r=this.canvas.getBoundingClientRect(),i=this.worldToScreen(n.position),a=r.width/2-i.x,o=r.height/2-i.y,s=t?1:.16;this.panX+=a*s,this.panY+=o*s,this.view.ox+=a*s,this.view.oy+=o*s,this.drawFrame()}drawFrame(){this.drawBackground(),this.drawWarehouse(),this.drawCommunicationLinks(),this.drawTaskMarkers(),this.drawRoutes(),this.drawCollisionHints(),this.drawChargingStations(),this.drawRobots(),this.drawSelectionPanel()}worldToScreen(e){return{x:this.view.ox+e.x*this.view.scale,y:this.view.oy+e.y*this.view.scale}}screenToWorld(e,t){return{x:(e-this.view.ox)/this.view.scale,y:(t-this.view.oy)/this.view.scale}}drawBackground(){let{ctx:e}=this,t=this.canvas.getBoundingClientRect();e.fillStyle=`#071018`,e.fillRect(0,0,t.width,t.height),e.strokeStyle=`rgba(70, 135, 165, 0.10)`,e.lineWidth=1,Math.max(8,this.view.scale*5);for(let t=0;t<=this.environment.width;t+=5){let n=this.worldToScreen({x:t,y:0});e.beginPath(),e.moveTo(n.x,this.view.oy),e.lineTo(n.x,this.view.oy+this.environment.height*this.view.scale),e.stroke()}for(let t=0;t<=this.environment.height;t+=5){let n=this.worldToScreen({x:0,y:t});e.beginPath(),e.moveTo(this.view.ox,n.y),e.lineTo(this.view.ox+this.environment.width*this.view.scale,n.y),e.stroke()}}drawWarehouse(){let{ctx:e}=this,t=this.view.scale;e.fillStyle=`rgba(14, 30, 41, 0.88)`,e.strokeStyle=`rgba(90, 150, 175, 0.28)`,e.lineWidth=1;let n=this.environment.grid;if(n?.length)for(let r of n)for(let n of r){if(n.type!==`OBSTACLE`)continue;let r=this.worldToScreen(n);e.fillRect(r.x,r.y,t+.4,t+.4)}e.strokeStyle=`rgba(84, 155, 184, 0.42)`,e.strokeRect(this.view.ox,this.view.oy,this.environment.width*t,this.environment.height*t)}drawRoutes(){let{ctx:e}=this,t=this.selectedRobotId,n=performance.now()/1e3;for(let r of this.lastRobots){if(r.state===`FAILED`||r.route.length<2)continue;let i=r.id===t,a=this.robotColor(r),o=r.route.slice(Math.max(0,r.routeIndex));if(o.length===0)continue;e.save(),e.lineJoin=`round`,e.lineCap=`round`,e.shadowBlur=i?12:5,e.shadowColor=a,e.setLineDash(i?[]:[5,5]),e.lineWidth=i?4.2:2,e.strokeStyle=i?a:this.withAlpha(a,.48),e.beginPath();let s=this.worldToScreen(r.position);e.moveTo(s.x,s.y);for(let t of o){let n=this.worldToScreen(t);e.lineTo(n.x,n.y)}e.stroke(),e.restore(),e.save(),e.shadowBlur=i?8:0,e.shadowColor=a,e.fillStyle=i?a:this.withAlpha(a,.72);let c=Math.max(4,Math.floor(o.length/9));for(let t=c;t<o.length;t+=c){let n=o[t-1],r=o[t],a=this.worldToScreen(n),s=this.worldToScreen(r),c=Math.atan2(s.y-a.y,s.x-a.x),l=i?4.5:3.2,u=s.x,d=s.y;e.save(),e.translate(u,d),e.rotate(c),e.beginPath(),e.moveTo(l,0),e.lineTo(-l,-l*.55),e.lineTo(-l*.55,0),e.lineTo(-l,l*.55),e.closePath(),e.fill(),e.restore()}if(e.restore(),i){let t=o[o.length-1],r=this.worldToScreen(t);e.save(),e.strokeStyle=a,e.shadowBlur=12,e.shadowColor=a,e.lineWidth=2.5,e.beginPath(),e.arc(r.x,r.y,8+Math.sin(n*5)*1.5,0,Math.PI*2),e.stroke(),e.restore()}}}drawCommunicationLinks(){let e=new Map(this.lastRobots.map(e=>[e.id,e])),{ctx:t}=this,n=performance.now()/1e3;for(let r of this.lastLinks){let i=e.get(r.robotA),a=e.get(r.robotB);if(!i||!a)continue;let o=this.worldToScreen(i.position),s=this.worldToScreen(a.position),c=this.selectedRobotId===i.id||this.selectedRobotId===a.id;t.save(),t.setLineDash([7,5]),t.lineDashOffset=-(n*22),t.strokeStyle=c?`rgba(53, 214, 255, 0.95)`:`rgba(169, 139, 255, 0.68)`,t.shadowBlur=c?9:4,t.shadowColor=c?`#35d6ff`:`#a98bff`,t.lineWidth=c?2.4:1.45,t.beginPath(),t.moveTo(o.x,o.y),t.lineTo(s.x,s.y),t.stroke(),t.restore();let l=n*.7%1,u=o.x+(s.x-o.x)*l,d=o.y+(s.y-o.y)*l;t.save(),t.fillStyle=c?`#35d6ff`:`#a98bff`,t.shadowBlur=8,t.shadowColor=t.fillStyle,t.beginPath(),t.arc(u,d,c?2.6:2,0,Math.PI*2),t.fill(),t.restore()}}drawCollisionHints(){let e=new Map(this.lastRobots.map(e=>[e.id,e])),{ctx:t}=this;for(let n of this.lastCollisions){let r=e.get(n.robotA),i=e.get(n.robotB);if(!r||!i)continue;let a=this.worldToScreen(r.position),o=this.worldToScreen(i.position),s={x:(a.x+o.x)/2,y:(a.y+o.y)/2};t.save(),t.strokeStyle=`rgba(255, 112, 128, 0.58)`,t.setLineDash([5,5]),t.lineWidth=1.4,t.beginPath(),t.moveTo(a.x,a.y),t.lineTo(o.x,o.y),t.stroke(),t.fillStyle=`rgba(255, 112, 128, 0.95)`,t.beginPath(),t.arc(s.x,s.y,3,0,Math.PI*2),t.fill(),t.restore()}}drawTaskMarkers(){let{ctx:e}=this;for(let t of this.lastTasks){if(t.status===`COMPLETED`)continue;let n=this.worldToScreen(t.pickup),r=this.worldToScreen(t.dropoff);e.save(),e.strokeStyle=t.status===`IN_PROGRESS`?`rgba(255, 173, 74, 0.72)`:`rgba(255, 255, 255, 0.28)`,e.lineWidth=1,e.beginPath(),e.arc(n.x,n.y,3.5,0,Math.PI*2),e.stroke(),e.beginPath(),e.moveTo(r.x-3,r.y),e.lineTo(r.x+3,r.y),e.moveTo(r.x,r.y-3),e.lineTo(r.x,r.y+3),e.stroke(),e.restore()}}drawChargingStations(){let{ctx:e}=this,t=this.view.scale;for(let n of this.environment.chargingStations){let r=(n.width??7)*t,i=(n.height??5)*t,a=this.worldToScreen({x:n.x,y:n.y});e.save(),e.fillStyle=`rgba(30, 120, 150, 0.18)`,e.strokeStyle=`rgba(45, 211, 255, 0.68)`,e.lineWidth=1.5,e.fillRect(a.x-r/2,a.y-i/2,r,i),e.strokeRect(a.x-r/2,a.y-i/2,r,i),e.fillStyle=`rgba(85, 220, 255, 0.9)`,e.font=`10px system-ui`,e.fillText(n.id??`CHARGE`,a.x-r/2+4,a.y-i/2-4),e.restore()}}drawRobots(){let{ctx:e}=this,t=Math.max(4.5,Math.min(7,this.view.scale*.38));for(let n of this.lastRobots){let r=this.worldToScreen(n.position),i=n.id===this.selectedRobotId,a=this.robotColor(n);e.save(),i&&(e.strokeStyle=`rgba(255,255,255,0.98)`,e.lineWidth=2.5,e.beginPath(),e.arc(r.x,r.y,t+5,0,Math.PI*2),e.stroke()),e.fillStyle=a,e.strokeStyle=`rgba(230,250,255,0.92)`,e.lineWidth=1.2,e.beginPath(),e.arc(r.x,r.y,t,0,Math.PI*2),e.fill(),e.stroke(),e.fillStyle=`#071018`,e.font=`${Math.max(7,t*1.45)}px system-ui`,e.textAlign=`center`,e.textBaseline=`middle`,e.fillText(n.id.replace(`R`,``),r.x,r.y),i&&(e.fillStyle=`rgba(225,245,255,0.95)`,e.font=`10px system-ui`,e.textAlign=`left`,e.textBaseline=`bottom`,e.fillText(`${n.id} • ${n.state.replaceAll(`_`,` `)}`,r.x+t+5,r.y-t-2)),e.restore()}}drawSelectionPanel(){if(!this.selectedRobotId)return;let e=this.lastRobots.find(e=>e.id===this.selectedRobotId);if(!e)return;let{ctx:t}=this;t.save(),t.fillStyle=`rgba(5, 13, 20, 0.92)`,t.strokeStyle=`rgba(62, 209, 255, 0.65)`,t.lineWidth=1,t.fillRect(14,14,190,86),t.strokeRect(14,14,190,86),t.fillStyle=`#e8f7ff`,t.font=`bold 13px system-ui`,t.fillText(`${e.id}  ${e.type.replaceAll(`_`,` `)}`,24,32),t.font=`11px system-ui`,t.fillText(`STATE  ${e.state.replaceAll(`_`,` `)}`,24,52),t.fillText(`BATTERY  ${e.battery.toFixed(0)}%`,24,68),t.fillText(`TASK  ${e.currentTaskId??`NONE`}`,24,84),this.followRobotId===e.id&&(t.fillStyle=`#35d6ff`,t.font=`bold 10px system-ui`,t.fillText(`● FOLLOWING`,126,32)),t.restore()}withAlpha(e,t){let n=e.replace(`#`,``);return`rgba(${parseInt(n.slice(0,2),16)}, ${parseInt(n.slice(2,4),16)}, ${parseInt(n.slice(4,6),16)}, ${t})`}robotColor(e){switch(e.type){case`FAST_PICKER`:return`#28c7f5`;case`HEAVY_CARRIER`:return`#ff9f43`;case`INSPECTION`:return`#9b7cff`;case`EMERGENCY`:return`#ff647c`;default:return`#d7e7ef`}}handlePointerDown(e){(e.button===0||e.button===1||e.button===2)&&(this.dragging=!0,this.dragged=!1,this.dragButton=e.button,this.pointerDown={x:e.clientX,y:e.clientY},this.lastPointer={x:e.clientX,y:e.clientY},this.canvas.style.cursor=`grabbing`)}handlePointerMove(e){let t=e.clientX-this.lastPointer.x,n=e.clientY-this.lastPointer.y,r=Math.hypot(e.clientX-this.pointerDown.x,e.clientY-this.pointerDown.y);if(this.dragging&&r>4&&(this.dragged=!0),this.dragging&&(this.dragButton!==0||this.dragged)){this.dragged&&(this.followRobotId=null),this.panX+=t,this.panY+=n,this.view.ox+=t,this.view.oy+=n,this.lastPointer={x:e.clientX,y:e.clientY},this.drawFrame();return}this.lastPointer={x:e.clientX,y:e.clientY},this.handleHover(e)}handlePointerUp(e){if(!this.dragging)return;let t=this.dragged,n=this.dragButton;this.dragging=!1,this.dragButton=0,this.canvas.style.cursor=`crosshair`,!t&&n===0&&this.handleClick(e)}handleClick(e){let t=this.canvas.getBoundingClientRect(),n=this.screenToWorld(e.clientX-t.left,e.clientY-t.top),r=Math.max(.9,8/this.view.scale),i=null,a=r;for(let e of this.lastRobots){let t=Math.hypot(e.position.x-n.x,e.position.y-n.y);t<a&&(a=t,i=e)}i?(this.selectedRobotId=i.id,this.followRobotId=i.id,this.centerOnRobot(i.id,!0)):(this.selectedRobotId=null,this.followRobotId=null),this.render(this.lastRobots,this.lastTasks,this.lastLinks,this.lastCollisions)}handleHover(e){if(this.dragging)return;let t=this.canvas.getBoundingClientRect(),n=this.screenToWorld(e.clientX-t.left,e.clientY-t.top),r=Math.max(.8,7/this.view.scale),i=this.lastRobots.some(e=>Math.hypot(e.position.x-n.x,e.position.y-n.y)<r);this.canvas.style.cursor=i?`pointer`:`grab`}},f=document.querySelector(`#app`);if(!f)throw Error(`Could not find #app element`);var p=new u;f.innerHTML=`
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
`;var m=document.querySelector(`#simulationCanvas`);if(!m)throw Error(`Could not find simulation canvas`);var h=new d(m,p.world.environment),g=document.querySelector(`#startBtn`),_=document.querySelector(`#pauseBtn`),v=document.querySelector(`#resetBtn`),y=document.querySelector(`#generateBtn`),b=document.querySelector(`#assignBtn`),x=document.querySelector(`#autoAssignBtn`),S=document.querySelector(`#deadlockBtn`),C=document.querySelector(`#failureBtn`),w=Array.from(document.querySelectorAll(`.speed-btn`)),T=document.querySelector(`#zoomInBtn`),E=document.querySelector(`#zoomOutBtn`),D=document.querySelector(`#zoomResetBtn`);g.addEventListener(`click`,()=>{p.start(),A()}),_.addEventListener(`click`,()=>{p.pause(),A()}),v.addEventListener(`click`,()=>{p.reset(),h.render(p.world.robots,p.world.tasks,p.communicationLinks,p.collisionPredictions),R(),A(),O(),k()}),y.addEventListener(`click`,()=>{p.generateRandomTasks(8),R()}),b.addEventListener(`click`,()=>{p.assignPendingTasks(),R()}),x.addEventListener(`click`,()=>{p.toggleAutoTaskAssignment(),O(),R()}),S.addEventListener(`click`,()=>{p.injectDeadlockScenario(),R()}),C.addEventListener(`click`,()=>{p.injectRobotFailure(),R()}),w.forEach(e=>{e.addEventListener(`click`,()=>{let t=Number(e.dataset.speed);p.setSimulationSpeed(t),k()})}),T.addEventListener(`click`,()=>h.zoomIn()),E.addEventListener(`click`,()=>h.zoomOut()),D.addEventListener(`click`,()=>h.resetZoom());function O(){x.textContent=p.autoTaskAssignment?`⚙ Auto: ON`:`⚙ Auto: OFF`,x.classList.toggle(`active-control`,p.autoTaskAssignment)}function k(){w.forEach(e=>{e.classList.toggle(`active-speed`,Number(e.dataset.speed)===p.simulationSpeed)})}function A(){let e=document.querySelector(`#statusDot`),t=document.querySelector(`#systemStatus`);p.isRunning()?(e.classList.add(`running`),t.textContent=`SYSTEM RUNNING`):(e.classList.remove(`running`),t.textContent=`SYSTEM PAUSED`)}function j(){let e=document.querySelector(`#robotList`);e.innerHTML=p.world.robots.map(e=>{let t=e.state.toLowerCase().replaceAll(`_`,`-`),n=e.currentTaskId??`No task`;return`
          <div class="robot-row">

            <div
              class="robot-type-dot ${e.type.toLowerCase()}"
            ></div>

            <div class="robot-main">

              <strong>
                ${e.id}
              </strong>

              <span>
                ${z(e.type)}
              </span>

            </div>

            <div class="robot-task">
              ${n}
            </div>

            <div class="robot-battery">

              <div class="battery-track">

                <div
                  class="battery-fill ${H(e.battery)}"
                  style="
                    width: ${Math.max(0,Math.min(100,e.battery))}%;
                  "
                ></div>

              </div>

              <span>
                ${e.battery.toFixed(0)}%
              </span>

            </div>

            <span
              class="state-badge ${t}"
            >
              ${V(e.state)}
            </span>

          </div>
        `}).join(``)}function M(){let e=document.querySelector(`#taskList`);e.innerHTML=p.world.tasks.map(e=>{let t=e.status.toLowerCase().replaceAll(`_`,`-`);return`
          <div class="task-row">

            <div class="task-id">
              ${e.id}
            </div>

            <div class="task-info">

              <strong>
                ${B(e.type)}
              </strong>

              <span>
                Priority ${e.priority}
              </span>

            </div>

            <div class="task-assigned">
              ${e.assignedRobotId??`Unassigned`}
            </div>

            <span
              class="task-status ${t}"
            >
              ${V(e.status)}
            </span>

          </div>
        `}).join(``)}function N(){let e=document.querySelector(`#negotiationPanel`),t=document.querySelector(`#currentTaskNegotiation`),n=p.lastNegotiations;if(n.length===0){t.textContent=`Waiting for negotiation...`,e.innerHTML=`
      <div class="empty-state">
        No active negotiation
      </div>
    `;return}let r=n[n.length-1];r.winningBid?t.innerHTML=`
      <div class="negotiation-current-inner">

        <span class="current-task">
          ${r.taskId}
        </span>

        <span class="arrow">
          →
        </span>

        <strong>
          ${r.winningBid.robotId}
        </strong>

        <span class="contract-tag">
          CONTRACT
        </span>

      </div>
    `:t.textContent=`${r.taskId} — no eligible bidder`,e.innerHTML=n.slice().reverse().map(e=>{let t=e.winningBid,n=e.bids;return`
          <div class="negotiation-card">

            <div class="negotiation-card-header">

              <strong>
                ${e.taskId}
              </strong>

              <span>
                ${n.length} bids
              </span>

            </div>


            <div class="bid-list">

              ${n.slice().sort((e,t)=>e.score-t.score).slice(0,4).map(e=>{let n=t?.robotId===e.robotId;return`
                    <div
                      class="bid-row ${n?`winner`:``}"
                    >

                      <span>
                        ${e.robotId}
                      </span>

                      <span>
                        ${e.score.toFixed(1)}
                      </span>

                      ${n?`
                            <span
                              class="winner-label"
                            >
                              ✓ WIN
                            </span>
                          `:``}

                    </div>
                  `}).join(``)}

            </div>

          </div>
        `}).join(``)}function P(){let e=document.querySelector(`#negotiationCount`),t=document.querySelector(`#contractCount`),n=document.querySelector(`#averageBids`);e.textContent=String(p.totalNegotiations),t.textContent=String(p.successfulNegotiations);let r=p.lastNegotiations;if(r.length===0){n.textContent=`0`;return}n.textContent=(r.reduce((e,t)=>e+t.bids.length,0)/r.length).toFixed(1)}function F(){let e=document.querySelector(`#collisionPanel`),t=document.querySelector(`#collisionCount`),n=document.querySelector(`#collisionWarnings`),r=document.querySelector(`#systemCollisionWarnings`),i=document.querySelector(`#safetyBadge`),a=p.collisionPredictions;if(t.textContent=String(a.length),n.textContent=String(p.totalCollisionWarnings),r.textContent=String(p.totalCollisionWarnings),a.length===0){i.textContent=`SAFE`,i.className=`safe-badge`,e.innerHTML=`
      <div class="empty-state safety-safe">
        ✓ No predicted collisions
      </div>
    `;return}i.textContent=`${a.length} RISK${a.length>1?`S`:``}`,i.className=`safe-badge danger`,e.innerHTML=a.map(e=>{let t=e.severity.toLowerCase();return`
          <div
            class="collision-card ${t}"
          >

            <div class="collision-header">

              <div class="robot-conflict">

                <strong>
                  ${e.robotA}
                </strong>

                <span>
                  ↔
                </span>

                <strong>
                  ${e.robotB}
                </strong>

              </div>

              <span
                class="severity ${t}"
              >
                ${e.severity}
              </span>

            </div>


            <div class="collision-details">

              <div>
                <span>
                  Conflict Point
                </span>

                <strong>
                  (${e.conflictPoint.x},
                  ${e.conflictPoint.y})
                </strong>
              </div>


              <div>
                <span>
                  ETA ${e.robotA}
                </span>

                <strong>
                  ${e.timeA.toFixed(1)}s
                </strong>
              </div>


              <div>
                <span>
                  ETA ${e.robotB}
                </span>

                <strong>
                  ${e.timeB.toFixed(1)}s
                </strong>
              </div>


              <div>
                <span>
                  Time Difference
                </span>

                <strong>
                  ${e.timeDifference.toFixed(2)}s
                </strong>
              </div>

            </div>


            <div class="collision-action">
              ⚠ Right-of-way negotiation required
            </div>

          </div>
        `}).join(``)}function I(){let e=p.world.robots,t=p.world.tasks,n=e.filter(e=>e.state!==`IDLE`&&e.state!==`FAILED`).length,r=e.filter(e=>e.state!==`FAILED`).length,i=e.length===0?0:r/e.length*100;document.querySelector(`#robotCount`).textContent=String(e.length),document.querySelector(`#taskCount`).textContent=String(t.length),document.querySelector(`#completedCount`).textContent=String(p.world.completedTasks),document.querySelector(`#activeCount`).textContent=String(n),document.querySelector(`#fleetHealth`).textContent=`${i.toFixed(0)}%`,document.querySelector(`#pendingTasks`).textContent=String(t.filter(e=>e.status===`PENDING`).length),document.querySelector(`#systemCompletedTasks`).textContent=String(p.world.completedTasks)}function L(){let e=document.querySelector(`#simulationTime`);e.textContent=`${p.world.simulationTime.toFixed(1)}s`}function R(){A(),j(),M(),N(),P(),F(),I(),L()}function z(e){return e.replaceAll(`_`,` `).replace(/\b\w/g,e=>e.toUpperCase())}function B(e){return e.replaceAll(`_`,` `).replace(/\b\w/g,e=>e.toUpperCase())}function V(e){return e.replaceAll(`_`,` `)}function H(e){return e>50?`good`:e>20?`warning`:`critical`}var U=performance.now();function W(e){let t=Math.min(.1,(e-U)/1e3);U=e,p.update(t),h.render(p.world.robots,p.world.tasks,p.communicationLinks,p.collisionPredictions),R(),requestAnimationFrame(W)}h.render(p.world.robots,p.world.tasks,p.communicationLinks,p.collisionPredictions),O(),k(),R(),requestAnimationFrame(W);