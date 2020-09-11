
/**
 * Projectile speed.
 * Units: meters per second.
 * @const {number}
 */
let PROJECTILE_SPEED = 120;

/**
 * Friction coefficient.
 * @const {number}
 */
let FRICTION_COEFFICIENT = 3;

/**
 * Boss waypoints for when he runs upstairs.
 * @const {!Array.<!vec3>}
 */
let BOSS_WAYPOINTS = [
    vec3.fromValues(480, 49, 172), // Before the stairs doorway
    vec3.fromValues(503, 49, 172), // After the stairs doorway
    vec3.fromValues(503, 95, 328), // Up the stairs
    vec3.fromValues(408, 95, 328), // Outside the tunnel
    vec3.fromValues(412, 95, 256), // Under the 404 sign
];

/**
 * Total count of boss waypoints.
 * @const {number}
 */
let BOSS_WAYPOINTS_COUNT = 5;

class EntityType {
    constructor() {
        this.initialHealth = 100;

        /**
         * Walking acceleration.
         * Units: meters per second per second.
         * @type {number}
         */
        this.acceleration = 144;

        /**
         * Stopping deceleration.
         * Units: meters per second per second.
         * @type {number}
         */
        this.deceleration = 72;

        /**
         * Maximum run speed.
         * Units: meters per second.
         * @type {number}
         */
        this.maxSpeed = 24;

        /**
         * Time in seconds for one run animation loop.
         * @type {number}
         */
        this.animCycleTime = 0.6;
        this.headColor = vec3.fromValues(164, 96, 80);
        this.bodyColor = vec3.create();
        this.armColor = vec3.create();
        this.legColor = vec3.create();
        this.hair = false;
        this.hairColor = vec3.create();
        this.sword = false;
        this.swordColor = vec3.create();
        this.swordLength = 0;
        this.headRadius = 0.3;
        this.bodyHeight = 1.0;
        this.bodyWidth = 1.0;
        this.bodyDepth = 0.6;
        this.armLength = 0.8;
        this.armRadius = 0.18;
        this.legLength = 0.8;
        this.legRadius = 0.2;
        this.collisionDetectionOffset = vec3.fromValues(0, 1.5, 0);
        this.collisionDetectionRadius = 1.5;
    }
}

/**
 * Player entity type.
 * @const {!EntityType}
 */
let ENTITY_TYPE_PLAYER = new EntityType();
ENTITY_TYPE_PLAYER.sword = true;
ENTITY_TYPE_PLAYER.swordLength = 3.0;
vec3.set(ENTITY_TYPE_PLAYER.bodyColor, 160, 80, 32);
vec3.set(ENTITY_TYPE_PLAYER.armColor, 144, 72, 24);
vec3.set(ENTITY_TYPE_PLAYER.legColor, 144, 72, 24);
vec3.set(ENTITY_TYPE_PLAYER.swordColor, 200, 224, 255);

/**
 * Punk entity type.
 * Simple AI, melee attack, low health.
 * @const {!EntityType}
 */
let ENTITY_TYPE_PUNK = new EntityType();
ENTITY_TYPE_PUNK.initialHealth = 25;
ENTITY_TYPE_PUNK.acceleration = 100; // Slower than player
ENTITY_TYPE_PUNK.maxSpeed = 32; // Faster than the player!
ENTITY_TYPE_PUNK.animCycleTime = 0.8;
ENTITY_TYPE_PUNK.hair = true;
ENTITY_TYPE_PUNK.sword = true;
ENTITY_TYPE_PUNK.swordLength = 2.0;
vec3.set(ENTITY_TYPE_PUNK.hairColor, 0, 180, 0);
vec3.set(ENTITY_TYPE_PUNK.bodyColor, 72, 72, 72);
vec3.set(ENTITY_TYPE_PUNK.armColor, 164, 96, 80);
vec3.set(ENTITY_TYPE_PUNK.legColor, 64, 64, 64);
vec3.set(ENTITY_TYPE_PUNK.swordColor, 192, 192, 192);

/**
 * Soldier entity type.
 * Bigger, harder, can shoot at the player.
 * @const {!EntityType}
 */
let ENTITY_TYPE_SOLDIER = new EntityType();
ENTITY_TYPE_SOLDIER.acceleration = 36;
ENTITY_TYPE_SOLDIER.maxSpeed = 12;
ENTITY_TYPE_SOLDIER.animCycleTime = 1.2;
ENTITY_TYPE_SOLDIER.headRadius = 0.4;
ENTITY_TYPE_SOLDIER.bodyHeight = 1.5;
ENTITY_TYPE_SOLDIER.bodyWidth = 1.5;
ENTITY_TYPE_SOLDIER.bodyDepth = 1.2;
ENTITY_TYPE_SOLDIER.armLength = 1.3;
ENTITY_TYPE_SOLDIER.armRadius = 0.24;
ENTITY_TYPE_SOLDIER.legLength = 1.4;
ENTITY_TYPE_SOLDIER.legRadius = 0.3;
vec3.set(ENTITY_TYPE_SOLDIER.headColor, 128, 128, 128);
vec3.set(ENTITY_TYPE_SOLDIER.bodyColor, 32, 32, 32);
vec3.set(ENTITY_TYPE_SOLDIER.armColor, 32, 32, 32);
vec3.set(ENTITY_TYPE_SOLDIER.legColor, 32, 32, 32);
vec3.set(ENTITY_TYPE_SOLDIER.collisionDetectionOffset, 0, 2.0, 0);
ENTITY_TYPE_SOLDIER.collisionDetectionRadius = 2.0;

/**
 * Boss entity type.
 * Defeating the boss wins the
 * @const {!EntityType}
 */
let ENTITY_TYPE_BOSS = new EntityType();
ENTITY_TYPE_BOSS.initialHealth = 600;
ENTITY_TYPE_BOSS.acceleration = 36;
ENTITY_TYPE_BOSS.maxSpeed = 6;
ENTITY_TYPE_BOSS.animCycleTime = 2.0;
ENTITY_TYPE_BOSS.headRadius = 0.6;
ENTITY_TYPE_BOSS.bodyHeight = 4.0;
ENTITY_TYPE_BOSS.bodyWidth = 5.0;
ENTITY_TYPE_BOSS.bodyDepth = 2.4;
ENTITY_TYPE_BOSS.armLength = 3.2;
ENTITY_TYPE_BOSS.armRadius = 0.6;
ENTITY_TYPE_BOSS.legLength = 2.0;
ENTITY_TYPE_BOSS.legRadius = 0.8;
ENTITY_TYPE_BOSS.swordLength = 1.0;
vec3.set(ENTITY_TYPE_BOSS.headColor, 160, 125, 120);
vec3.set(ENTITY_TYPE_BOSS.bodyColor, 32, 32, 32);
vec3.set(ENTITY_TYPE_BOSS.armColor, 32, 32, 32);
vec3.set(ENTITY_TYPE_BOSS.legColor, 32, 32, 32);
vec3.set(ENTITY_TYPE_BOSS.collisionDetectionOffset, 0, 2.5, 0);
ENTITY_TYPE_BOSS.collisionDetectionRadius = 2.5;

/**
 * A missile entity.
 * @const {!EntityType}
 */
let ENTITY_TYPE_PROJECTILE = new EntityType();
vec3.set(ENTITY_TYPE_PROJECTILE.collisionDetectionOffset, 0, 0, 0);
ENTITY_TYPE_PROJECTILE.collisionDetectionRadius = 0.3;

class AttackState {
    /**
     * Creates a new attack state.
     * @param {number} duration
     * @param {!AttackState=} opt_nextState
     */
    constructor(duration, opt_nextState) {
        /**
         * Duration in seconds
         * @const {number}
         */
        this.duration = duration;

        /**
         * Next state after duration is over.
         * @const {!AttackState}
         */
        this.nextState = opt_nextState || this;
    }
}

/**
 * Idle state.
 * @const {!AttackState}
 */
let ATTACK_STATE_IDLE = new AttackState(-1);

/**
 * Sword/knife is returning to idle position
 * @const {!AttackState}
 */
let ATTACK_STATE_RETURNING = new AttackState(0.2, ATTACK_STATE_IDLE);

/**
 * Sword/knife is fully extended.
 * @const {!AttackState}
 */
let ATTACK_STATE_EXTENDED = new AttackState(0.2, ATTACK_STATE_RETURNING);

/**
 * Sword/knife is in main swing.
 * @const {!AttackState}
 */
let ATTACK_STATE_SWINGING = new AttackState(0.1, ATTACK_STATE_EXTENDED);

/**
 * Sword/knife is pulling back / winding up.
 * @const {!AttackState}
 */
let ATTACK_STATE_WINDING = new AttackState(0.1, ATTACK_STATE_SWINGING);

/**
 * Player is dashing toward an enemy.
 * @const {!AttackState}
 */
let ATTACK_STATE_DASH = new AttackState(2.0, ATTACK_STATE_SWINGING);

/**
 * Entity is stunned / unable to move or attack.
 * @const {!AttackState}
 */
let ATTACK_STATE_STUNNED = new AttackState(0.5, ATTACK_STATE_IDLE);

/**
 * Entity is shooting (plus wait time after shot).
 * @const {!AttackState}
 */
let ATTACK_STATE_SHOOTING = new AttackState(1.0, ATTACK_STATE_IDLE);

/**
 * Entity is charging up to shoot.
 * @const {!AttackState}
 */
let ATTACK_STATE_CHARGING = new AttackState(1.0, ATTACK_STATE_SHOOTING);

class GameEntity {

    /**
     * @param {!EntityType} entityType
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    constructor(entityType, x, y, z) {

        /**
         * Entity type.
         * @const {!EntityType}
         */
        this.entityType = entityType;

        /**
         * Team.
         * 1 for player.
         * 2 for everything else.
         * @const {number}
         */
        this.team = (entityType === ENTITY_TYPE_PLAYER ? 1 : 2);

        /**
         * Determines if the entity is alive.
         * Dead entities are cleared out at end of frame.
         * @type {boolean}
         */
        this.alive = true;

        /**
         * Health (0-100).
         * @type {number}
         */
        this.health = entityType.initialHealth;

        /**
         * Current location.
         * @type {!vec3}
         * @const
         */
        this.position = vec3.fromValues(x, y, z);

        /**
         * Current velocity.
         * @type {!vec3}
         * @const
         */
        this.velocity = vec3.create();

        /**
         * Camera pitch.
         * @type {number}
         */
        this.pitch = 0.1;

        /**
         * Camera yaw.
         * @type {number}
         */
        this.yaw = Math.random() * 2 * Math.PI;

        /**
         * Jump count (for tracking double jumps).
         * @type {number}
         */
        this.jumpCount = 0;

        /**
         * Current "attack state".
         * @type {!AttackState}
         */
        this.attackState = ATTACK_STATE_IDLE;

        /**
         * Current "attack state" start time.
         * @type {number}
         */
        this.stateStartTime = -1;

        /**
         * Last time stamp that the entity was hurt.
         * For some duration of time after this, the entity will be drawn in red.
         * @type {number}
         */
        this.hurtTime = -1;

        /**
         * Sword base point.
         * @type {!vec3}
         */
        this.swordStart = vec3.create();

        /**
         * Sword end point.
         * @type {!vec3}
         */
        this.swordEnd = vec3.create();

        /**
         * Whether the entity has been triggered.
         * @type {boolean}
         */
        this.aggro = false;

        /**
         * Damage multiplier from special attacks.
         * @type {number}
         */
        this.damageMultiplier = 1.0;

        /**
         * The laser target.
         * When a soldier starts charging, the target is locked in.
         * @const {!vec3}
         */
        this.laserTarget = vec3.create();

        /**
         * Array index into the waypoints array.
         * This is for the boss "run up the stairs" cutscene.
         * @type {number}
         */
        this.waypointIndex = 0;
    }

    /**
     * Updates the entity for a single frame.
     */
    update() {
        // Apply friction and gravity
        if (this.entityType !== ENTITY_TYPE_PROJECTILE) {
            this.velocity[0] -= dt * FRICTION_COEFFICIENT * this.velocity[0];
            this.velocity[2] -= dt * FRICTION_COEFFICIENT * this.velocity[2];
            this.velocity[1] -= dt * GRAVITY;
        }

        if (AI_ENABLED && this.entityType !== ENTITY_TYPE_PLAYER && this.attackState !== ATTACK_STATE_STUNNED) {
            // Do AI
            let dx = player.position[0] - this.position[0];
            let dy = player.position[1] - this.position[1];
            let dz = player.position[2] - this.position[2];
            let distToPlayer = Math.hypot(dx, dz);

            if (Math.abs(dy) < 8 && distToPlayer < 64) {
                this.aggro = true;
            }

            if (Math.abs(dy) > 10) {
                this.aggro = false;
            }

            if (this.aggro) {
                if (this.entityType === ENTITY_TYPE_PUNK || this.entityType === ENTITY_TYPE_BOSS) {
                    if (this.entityType === ENTITY_TYPE_BOSS && this.health < 400 && this.waypointIndex < BOSS_WAYPOINTS_COUNT) {
                        let waypoint = BOSS_WAYPOINTS[this.waypointIndex];
                        let dx2 = waypoint[0] - this.position[0];
                        let dz2 = waypoint[2] - this.position[2];
                        if (Math.hypot(dx2, dz2) < 2) {
                            ENTITY_TYPE_BOSS.acceleration = 36;
                            ENTITY_TYPE_BOSS.maxSpeed = 6;
                            ENTITY_TYPE_BOSS.collisionDetectionRadius = 2.5;
                            this.waypointIndex++;
                        } else {
                            ENTITY_TYPE_BOSS.acceleration = 288;
                            ENTITY_TYPE_BOSS.maxSpeed = 40;
                            ENTITY_TYPE_BOSS.collisionDetectionRadius = 0.01;
                            this.setDirection(dx2, dz2);
                            this.accelerate();
                        }
                    } else {
                        this.setDirection(dx, dz);
                        if (distToPlayer > 3.0) {
                            this.accelerate();
                        } else {
                            this.decelerate();
                            if (this.attackState === ATTACK_STATE_IDLE) {
                                this.setAttackState(ATTACK_STATE_WINDING);
                            }
                        }
                    }
                }
                if (this.entityType === ENTITY_TYPE_SOLDIER) {
                    if (this.attackState === ATTACK_STATE_CHARGING) {
                        this.decelerate();
                    } else {
                        this.setDirection(dx, dz);
                        if (distToPlayer > 64.0) {
                            this.accelerate();
                        } else {
                            this.decelerate();
                            if (this.attackState === ATTACK_STATE_IDLE) {
                                this.setAttackState(ATTACK_STATE_CHARGING);
                                vec3.add(this.laserTarget, player.position, ENTITY_TYPE_PLAYER.collisionDetectionOffset);
                            }
                        }
                    }
                }
            }
        }

        vec3.scaleAndAdd(this.position, this.position, this.velocity, dt);
        collisionDetection(this);

        if (this.attackState !== ATTACK_STATE_IDLE) {
            let t = gameTime - this.stateStartTime;
            if (t > this.attackState.duration) {
                if (this.attackState === ATTACK_STATE_CHARGING) {
                    // Shoot!
                    let projectile = new GameEntity(ENTITY_TYPE_PROJECTILE, this.position[0], this.position[1] + 2.5, this.position[2]);
                    vec3.subtract(projectile.velocity, this.laserTarget, projectile.position);
                    vec3.normalize(projectile.velocity, projectile.velocity);
                    vec3.scale(projectile.velocity, projectile.velocity, PROJECTILE_SPEED);
                    projectile.setDirection(projectile.velocity[0], projectile.velocity[2]);
                    entities.push(projectile);
                }
                this.setAttackState(this.attackState.nextState);
            }
        }
    }

    /**
     * Sets the entity yaw to face the specified direction.
     * @param {number} dx
     * @param {number} dz
     */
    setDirection(dx, dz) {
        this.yaw = Math.atan2(dx, dz);
    }

    /**
     * Walks in the specified direction.
     */
    accelerate() {
        vec3.rotateY(tempVec, forward, origin, this.yaw);
        this.velocity[0] += dt * this.entityType.acceleration * tempVec[0];
        this.velocity[2] += dt * this.entityType.acceleration * tempVec[2];
        this.restrictSpeed();
    }

    /**
     * Restricts speed to maximum.
     */
    restrictSpeed() {
        let speed = Math.hypot(this.velocity[0], this.velocity[2]);
        if (speed > this.entityType.maxSpeed) {
            this.velocity[0] = this.velocity[0] / speed * this.entityType.maxSpeed;
            this.velocity[2] = this.velocity[2] / speed * this.entityType.maxSpeed;
        }
    }

    /**
     * Decelerates
     */
    decelerate() {
        let speed = Math.hypot(this.velocity[0], this.velocity[2]);
        if (speed < MIN_SPEED) {
            this.velocity[0] = 0;
            this.velocity[2] = 0;
        } else {
            this.velocity[0] -= dt * this.velocity[0] / speed * this.entityType.deceleration;
            this.velocity[2] -= dt * this.velocity[2] / speed * this.entityType.deceleration;
        }
    }

    /**
     * Starts an attack state.
     * @param {!AttackState} attackState
     */
    setAttackState(attackState) {
        this.attackState = attackState;
        this.stateStartTime = gameTime;
    }

    /**
     * Returns the hurt factor from 0.0 to 1.0.
     * Immediately after being hit, hurt factor is 1.0.
     * Then linearly decreases to 0.0.
     * @return {number}
     */
    getHurtFactor() {
        return 1 - Math.max(0, Math.min(1, (gameTime - this.hurtTime) / HURT_DURATION));
    }
}
