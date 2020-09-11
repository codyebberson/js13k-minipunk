
/**
 * Minimum speed.
 * Units: meters per second.
 * If decelerating and speed falls below this threshold, rounds to zero.
 * @const {number}
 */
let MIN_SPEED = 0.6;

/**
 * Vertical velocity on jump.
 * Units: meters per second.
 * @const {number}
 */
let JUMP_SPEED = 30;

/**
 * Gravitational pull.
 * Units: meters per second per second.
 * @const {number}
 */
let GRAVITY = 120;

/**
 * Hurt duration in seconds.
 * This controls render time (flash of red)
 * and immunity time (cannot be attacked while hurt).
 * @const {number}
 */
let HURT_DURATION = 0.5;

/**
 * Player dash speed (special sword attack).
 * Units: meters per second.
 * @const {number}
 */
let DASH_SPEED = 180;

/**
 * Initializes the world.
 * This is a heavy operation, and only needs to happen once.
 */
function initWorld() {
    genWorld();
    voxels.buildBuffers();
}

/**
 * Initializes the game state.
 * This is a lightweight operation, and can happen on every "New Game" or respawn.
 */
function initGame() {
    entities = [];

    player = new GameEntity(ENTITY_TYPE_PLAYER, 384, 2, 128);
    player.yaw = 1.5 * Math.PI;
    entities.push(player);

    // Underground punks
    for (let z = 128; z <= 256; z += 128) {
        for (let x = 128; x <= 256; x += 128) {
            entities.push(new GameEntity(ENTITY_TYPE_PUNK, x, 2, z));
            if (x < 256) {
                entities.push(new GameEntity(ENTITY_TYPE_PUNK, x + 6, 2, z + 6));
            }
        }
    }

    // Street punks
    for (let z = 128; z <= 384; z += 128) {
        for (let x = 128; x <= 256; x += 128) {
            if (x === 128 && z === 384) {
                continue;
            }
            entities.push(new GameEntity(ENTITY_TYPE_PUNK, x - 6, GROUND_LEVEL + 2, z));
            entities.push(new GameEntity(ENTITY_TYPE_PUNK, x + 6, GROUND_LEVEL + 2, z));
            entities.push(new GameEntity(ENTITY_TYPE_PUNK, x, GROUND_LEVEL + 2, z - 6));
            entities.push(new GameEntity(ENTITY_TYPE_PUNK, x, GROUND_LEVEL + 2, z + 6));
            if (x >= 256) {
                entities.push(new GameEntity(ENTITY_TYPE_SOLDIER, x, GROUND_LEVEL + 2, z));
            }
        }
    }

    // Rooftop soldiers
    entities.push(new GameEntity(ENTITY_TYPE_SOLDIER, 414, 85, 208));
    entities.push(new GameEntity(ENTITY_TYPE_SOLDIER, 414, 85, 232));
    entities.push(new GameEntity(ENTITY_TYPE_SOLDIER, 414, 85, 280));
    entities.push(new GameEntity(ENTITY_TYPE_SOLDIER, 414, 85, 304));

    // Final boss
    boss = new GameEntity(ENTITY_TYPE_BOSS, 460, 49, 256);
    boss.yaw = 1.5 * Math.PI;
    boss.damageMultiplier = 4.0;
    entities.push(boss);
    entities.push(new GameEntity(ENTITY_TYPE_SOLDIER, 400, 49, 236));
    entities.push(new GameEntity(ENTITY_TYPE_SOLDIER, 400, 49, 276));
    entities.push(new GameEntity(ENTITY_TYPE_SOLDIER, 460, 49, 236));
    entities.push(new GameEntity(ENTITY_TYPE_SOLDIER, 460, 49, 276));

    gameTime = 0;
}

/**
 * Handles a game update.
 */
function updateGame() {
    if (paused) {
        return;
    }

    vec3.rotateY(tempVec, forward, origin, player.yaw);

    if (player.attackState === ATTACK_STATE_DASH) {
        // Player is flying at an enemy
        // Calculate distance to target and velocity
        vec3.subtract(player.velocity, targetEntity.position, player.position);

        // Velocity is used as a temp variable to represent distance
        if (vec3.length(player.velocity) < 4.0) {
            // Close enough, start swinging
            vec3.set(player.velocity, 0, 0, 0);
            player.setAttackState(ATTACK_STATE_SWINGING);

        } else {
            // Continue flying
            vec3.normalize(player.velocity, player.velocity);
            vec3.scale(player.velocity, player.velocity, DASH_SPEED);
        }

    } else if (player.attackState === ATTACK_STATE_STUNNED) {
        // Do nothing

    } else {
        // Player is not dashing, normal input
        let decelerating = true;

        if (keys[KEY_UP].down || keys[KEY_W].down || keys[KEY_Z].down) {
            player.velocity[0] += dt * ENTITY_TYPE_PLAYER.acceleration * tempVec[0];
            player.velocity[2] += dt * ENTITY_TYPE_PLAYER.acceleration * tempVec[2];
            decelerating = false;
        }
        if (keys[KEY_DOWN].down || keys[KEY_S].down) {
            player.velocity[0] -= dt * ENTITY_TYPE_PLAYER.acceleration * tempVec[0];
            player.velocity[2] -= dt * ENTITY_TYPE_PLAYER.acceleration * tempVec[2];
            decelerating = false;
        }
        if (keys[KEY_LEFT].down || keys[KEY_A].down || keys[KEY_Q].down) {
            player.velocity[0] -= 0.5 * dt * ENTITY_TYPE_PLAYER.acceleration * tempVec[2];
            player.velocity[2] += 0.5 * dt * ENTITY_TYPE_PLAYER.acceleration * tempVec[0];
            decelerating = false;
        }
        if (keys[KEY_RIGHT].down || keys[KEY_D].down) {
            player.velocity[0] += 0.5 * dt * ENTITY_TYPE_PLAYER.acceleration * tempVec[2];
            player.velocity[2] -= 0.5 * dt * ENTITY_TYPE_PLAYER.acceleration * tempVec[0];
            decelerating = false;
        }

        player.restrictSpeed();
        if (decelerating) {
            player.decelerate();
        }

        if (keys[KEY_SPACE].downCount === 1 && player.jumpCount <= 1) {
            player.velocity[1] = JUMP_SPEED;
            player.jumpCount++;
            playAudio(jumpSoundEffect);
        }

        if (player.attackState === ATTACK_STATE_IDLE && mouse.buttons[0].downCount === 1) {
            if (zoom && targetEntity) {
                // Special dash attack
                player.damageMultiplier = 2.0;
                player.setAttackState(ATTACK_STATE_DASH);
            } else {
                // Normal sword swing attack
                player.damageMultiplier = 1.0;
                player.setAttackState(ATTACK_STATE_WINDING);
            }
            playAudio(swingSoundEffect);
        }
    }

    zoom = mouse.buttons[2].down;

    // Update entities
    for (let i = 0; i < entities.length; i++) {
        entities[i].update();
    }

    // Entity to entity collisions
    let collide = true;
    let collideIterations = 0;
    let attackCount = 0;
    while (collide && collideIterations < 10) {
        collide = false;
        collideIterations++;

        for (let i = 0; i < entities.length - 1; i++) {
            let e1 = entities[i];
            if (!e1.alive) {
                continue;
            }
            for (let j = i + 1; j < entities.length; j++) {
                let e2 = entities[j];
                if (!e2.alive) {
                    continue;
                }
                if ((e1.position[1] > e2.position[1] + 2.5) ||
                    (e2.position[1] > e1.position[1] + 2.5)) {
                    // Y-axis doesn't overlap
                    continue;
                }
                let dx = e1.position[0] - e2.position[0];
                let dz = e1.position[2] - e2.position[2];
                let dist = Math.hypot(dx, dz);
                if (dist < 2.0) {
                    // Projectiles will always be after the player in the entity list
                    if (e2.entityType === ENTITY_TYPE_PROJECTILE) {
                        // Projectiles ignore everything other than the player
                        if (e1.entityType === ENTITY_TYPE_PLAYER) {
                            // Projectile hitting the player
                            damageEntity(e1, 50);
                            e2.alive = false;
                            attackCount++;
                        }
                    } else {
                        // Default entity collision
                        // Just move them apart a little bit
                        let dx2 = dx - 2.0 * (dx / dist);
                        let dz2 = dz - 2.0 * (dz / dist);
                        e1.position[0] -= dx2;
                        e1.position[2] -= dz2;
                        e2.position[0] += dx2;
                        e2.position[2] += dz2;

                        // Save the old velocities
                        let e1PrevVel = vec3.clone(e1.velocity);
                        let e2PrevVel = vec3.clone(e2.velocity);

                        // Set the velocities temporarily to the direction of the nudge
                        // Voxel collision detection is based on direction of movement
                        vec3.set(e1.velocity, -dx2, 0, -dz2);
                        vec3.set(e2.velocity, dx2, 0, dz2);

                        // Redo voxel collision detection for both entities
                        collisionDetection(e1);
                        collisionDetection(e2);

                        // Restore the old velocities
                        vec3.copy(e1.velocity, e1PrevVel);
                        vec3.copy(e2.velocity, e2PrevVel);

                        collide = true;
                    }
                }
            }
        }
    }

    // Sword collisions
    for (let i = 0; i < entities.length; i++) {
        let attacker = entities[i];
        if (!attacker.alive) {
            continue;
        }
        if (attacker.attackState !== ATTACK_STATE_SWINGING) {
            // Not swinging
            continue;
        }
        for (let j = 0; j < entities.length; j++) {
            if (i === j) {
                // Ignore collision with self
                continue;
            }
            let defender = entities[j];
            if (!defender.alive) {
                // Other entity is dead
                continue;
            }
            if (attacker.team === defender.team) {
                // Same team
                continue;
            }
            if (defender.getHurtFactor() > 0.01) {
                // Other entity is still immune
                continue;
            }
            if ((attacker.position[1] > defender.position[1] + 2.5) ||
                (defender.position[1] > attacker.position[1] + 2.5)) {
                // Y-axis doesn't overlap
                continue;
            }
            let center = vec3.clone(defender.position);
            vec3.add(center, center, defender.entityType.collisionDetectionOffset);
            let result = lineIntersectSphere(center, defender.entityType.collisionDetectionRadius, attacker.swordStart, attacker.swordEnd);
            if (result !== null) {
                damageEntity(defender, 25 * attacker.damageMultiplier);
                attackCount++;
            }
        }
    }

    if (attackCount > 0) {
        playAudio(hitSoundEffect);
    }

    // Clean out dead entities
    for (let i = entities.length - 1; i >= 0; i--) {
        if (!entities[i].alive) {
            entities.splice(i, 1);
        }
    }

    // Heal player
    if (player.health < ENTITY_TYPE_PLAYER.initialHealth && gameTime - player.hurtTime > 5) {
        // If player has been out of combat for 5 seconds
        // Then recharge at rate of 33% per second
        player.health = Math.min(100, player.health + dt * 33);
    }

    if (player.attackState !== ATTACK_STATE_DASH && zoom) {
        // Check for enemies in crosshairs
        let playerPos = player.position;
        let bestDist = 64;
        let bestEntity = null;
        for (let i = 1; i < entities.length; i++) {
            let e = entities[i];
            let dx = e.position[0] - playerPos[0];
            let dy = e.position[1] - playerPos[1];
            let dz = e.position[2] - playerPos[2];
            let dist = Math.hypot(dx, dy, dz);
            if (dist < bestDist) {
                // Check if the camera line segment intersects with the entity sphere
                let center = vec3.clone(e.position);
                vec3.add(center, center, e.entityType.collisionDetectionOffset);
                let result = lineIntersectSphere(center, e.entityType.collisionDetectionRadius, zoomStart, zoomEnd);
                if (result !== null) {
                    bestDist = dist;
                    bestEntity = e;
                }
            }
        }
        targetEntity = bestEntity;
    }
}

/**
 * Damage an entity.
 * @param {!GameEntity} defender Entity receiving the attack.
 * @param {number} amount Damage dealt.
 */
function damageEntity(defender, amount) {
    defender.hurtTime = gameTime;
    defender.health -= amount;
    if (defender.health <= 0) {
        // Defender is dead
        defender.health = 0;
        defender.alive = false;
        if (defender === player) {
            // Player died
            paused = true;
            menu = new DeathScreen();
            addTrophy('First Death!');
        } else {
            addTrophy('First Kill!');
        }
        if (defender === boss) {
            // Final boss died
            paused = true;
            menu = new WinScreen();
            addTrophy('Winner!');
        }
        createExplosion(
            defender.position[0],
            defender.position[1] + 1.5,
            defender.position[2],
            80,
            2.0,
            createColor(192, 0, 0),
            40);
    } else {
        // Merely a flesh wound
        createExplosion(
            defender.position[0],
            defender.position[1] + 1.5,
            defender.position[2],
            20,
            1.0,
            createColor(192, 0, 0),
            10);
        if (defender !== player) {
            defender.setAttackState(ATTACK_STATE_STUNNED);

            if (defender === boss) {
                // Push the player backwards
                // vec3.subtract(player.velocity, boss.position, player.position);
                player.setAttackState(ATTACK_STATE_STUNNED);
                vec3.subtract(player.velocity, player.position, boss.position);
                vec3.normalize(player.velocity, player.velocity);
                vec3.scale(player.velocity, player.velocity, 100);
                player.velocity[1] = JUMP_SPEED;
            }
        }
    }
    vec3.set(defender.velocity, 0, 0, 0);
}

/**
 *
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} count
 * @param {number} size
 * @param {number} color
 * @param {number} duration
 */
function createExplosion(x, y, z, count, size, color, duration) {
    for (let k = 0; k < count; k++) {
        createParticle(
            x,
            y,
            z,
            0.3 * (Math.random() - 0.5),
            0.3 * (Math.random() - 0.4),
            0.3 * (Math.random() - 0.5),
            size,
            color,
            duration);
    }
}

/**
 * Renders the
 */
function renderGame() {
    for (let i = 0; i < entities.length; i++) {
        renderEntity(entities[i]);
    }

    let c = cube.create();
    for (let i = 0; i < cars.length; i++) {
        let car = cars[i];
        cube.reset(c, car.position[0], car.position[1], car.position[2], 4, 2, 4);
        engine.dynamicBuffers.addCube2(c, createColor(255, 128, 64));
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        let ps = p.size * (p.countdown / p.duration);
        engine.dynamicBuffers.addQuad([
            vec3.fromValues(p.x + rand2() * ps, p.y + rand2() * ps, p.z + rand2() * ps),
            vec3.fromValues(p.x + rand2() * ps, p.y + rand2() * ps, p.z + rand2() * ps),
            vec3.fromValues(p.x + rand2() * ps, p.y + rand2() * ps, p.z + rand2() * ps),
            vec3.fromValues(p.x + rand2() * ps, p.y + rand2() * ps, p.z + rand2() * ps)],
            p.color);

        if (--p.countdown <= 0) {
            particles.splice(i, 1);
        } else {
            p.x += p.dx;
            p.y += p.dy;
            p.z += p.dz;
        }
    }
}

/**
 * @param {!GameEntity} entity
 */
function renderEntity(entity) {
    let entityType = entity.entityType;
    let c = cube.create();

    if (entityType === ENTITY_TYPE_PROJECTILE) {
        cube.reset(c, 0, 0, 0, 0.3, 0.3, 0.3);
        cube.rotateY(c, c, origin, entity.yaw);
        cube.add(c, c, entity.position);
        engine.dynamicBuffers.addCube2(c, createColor(255, 0, 0));
        return;
    }

    let theta = ((gameTime / entityType.animCycleTime) % 1) * 2 * Math.PI;
    let running = Math.hypot(entity.velocity[0], entity.velocity[2]) > 0.01;
    let hurtFactor = entity.getHurtFactor();

    let offset = vec3.create();
    if (running) {
        vec3.set(offset, 0, 0.2 * (0.5 + Math.sin(theta * 2)), 0);
    }

    // Colors
    let headColor = blendColors2(entityType.headColor, COLOR_HURT_VEC, hurtFactor);
    let hairColor = blendColors2(entityType.hairColor, COLOR_HURT_VEC, hurtFactor);
    let bodyColor = blendColors2(entityType.bodyColor, COLOR_HURT_VEC, hurtFactor);
    let armColor = blendColors2(entityType.armColor, COLOR_HURT_VEC, hurtFactor);
    let legColor = blendColors2(entityType.legColor, COLOR_HURT_VEC, hurtFactor);
    let swordColor = blendColors2(entityType.swordColor, COLOR_HURT_VEC, hurtFactor);

    let halfBodyWidth = entityType.bodyWidth / 2;
    let halfBodyHeight = entityType.bodyHeight / 2;
    let halfBodyDepth = entityType.bodyDepth / 2;
    let halfArmLength = entityType.armLength / 2;
    let halfLegLength = entityType.legLength / 2;
    let shoulderHeight = entityType.legLength + entityType.bodyHeight;

    // entity location
    let x = entity.position[0];
    let y = entity.position[1];
    let z = entity.position[2];

    // Calculate "attack state" related timing
    // "f" represents the completion factor of the state, from 0->1.
    let stateTime = gameTime - entity.stateStartTime;
    let f = stateTime / entity.attackState.duration;
    if (DEBUG) {
        if (entity.attackState !== ATTACK_STATE_IDLE && f < 0.0 || f > 1.1) {
            throw new Error('State factor out of range (' + f.toFixed(6) + ')');
        }
    }

    let bodyRotation = 0;
    if (entity.attackState === ATTACK_STATE_WINDING) {
        // Pulling back / winding up
        // 0 -> 1.0
        bodyRotation = f;
    } else if (entity.attackState === ATTACK_STATE_SWINGING) {
        // Main swing
        // 1.0 -> -1.0
        bodyRotation = 1 - 2.0 * f;
    } else if (entity.attackState === ATTACK_STATE_EXTENDED) {
        // Fully extended
        // Consistent -1.0
        bodyRotation = -1;
    } else if (entity.attackState === ATTACK_STATE_RETURNING) {
        // Returning to rest
        // -1.0 -> 0.0
        bodyRotation = -1 + f;
    }

    // Add entity head
    cube.reset(c, 0, 0, 0, entityType.headRadius, entityType.headRadius, entityType.headRadius);
    cube.skew(c, 1.0, 0.9);
    cube.rotateY(c, c, origin, 0.2 * bodyRotation);
    cube.rotateY(c, c, origin, entity.yaw);
    cube.add(c, c, vec3.fromValues(x, y + shoulderHeight + entityType.headRadius, z));
    cube.add(c, c, offset);
    engine.dynamicBuffers.addCube2(c, headColor);

    if (entity.entityType === ENTITY_TYPE_PUNK) {
        // Add hair
        cube.reset(c, 0, 0, 0, 0.15, 0.3, 0.3);
        cube.add(c, c, vec3.fromValues(0, 2.2, -0.1));
        cube.rotateY(c, c, origin, 0.2 * bodyRotation);
        cube.rotateY(c, c, origin, entity.yaw);
        cube.add(c, c, vec3.fromValues(x, y, z));
        cube.add(c, c, offset);
        engine.dynamicBuffers.addCube2(c, hairColor);
    }

    if (entity.entityType === ENTITY_TYPE_SOLDIER) {
        // Add face laser
        cube.reset(c, 0, 0, 0, 0.2, 0.2, 0.2);
        cube.add(c, c, vec3.fromValues(0, 3.3, 0.3));
        cube.rotateY(c, c, origin, 0.2 * bodyRotation);
        cube.rotateY(c, c, origin, entity.yaw);
        cube.add(c, c, vec3.fromValues(x, y, z));
        cube.add(c, c, offset);

        let laserCharge = entity.attackState === ATTACK_STATE_CHARGING ? 0.5 + 0.5 * f : 0.5;
        engine.dynamicBuffers.addCube2(c, createHsvColor(0, 1.0, laserCharge));
    }

    // Add entity body
    cube.reset(c, 0, 0, 0, halfBodyWidth, halfBodyHeight, halfBodyDepth);
    cube.skew(c, 1.0, 0.8);
    cube.rotateY(c, c, origin, bodyRotation);
    cube.rotateY(c, c, origin, entity.yaw);
    cube.add(c, c, vec3.fromValues(x, y + entityType.legLength + halfBodyHeight, z));
    cube.add(c, c, offset);
    engine.dynamicBuffers.addCube2(c, bodyColor);

    if (entityType.swordLength > 0) {
        let halfSwordLength = entityType.swordLength / 2;

        // Add sword
        cube.reset(c, 0, 0, 0, 0.1, halfSwordLength, 0.1);
        cube.skew(c, 0.2, 1.0);

        // Move sword so bottom is at origin
        cube.add(c, c, vec3.fromValues(0, halfSwordLength, 0));
        if (entity.attackState === ATTACK_STATE_WINDING) {
            // Pulling back
            cube.rotateX(c, c, origin, 0.5 * f);
            cube.rotateY(c, c, origin, 2.5);

        } else if (entity.attackState === ATTACK_STATE_SWINGING) {
            // Swinging
            cube.rotateX(c, c, origin, 0.5 + f);
            cube.rotateY(c, c, origin, 2.5 - 4.0 * f);
            cube.add(c, c, vec3.fromValues(0, 0, f));

        } else if (entity.attackState === ATTACK_STATE_EXTENDED) {
            // Fully extended
            cube.rotateX(c, c, origin, 1.5);
            cube.rotateY(c, c, origin, -1.5);
            cube.add(c, c, vec3.fromValues(0, 0, 1.0));

        } else if (entity.attackState === ATTACK_STATE_RETURNING) {
            // Return to rest
            cube.rotateX(c, c, origin, 1.5 - 1.5 * f);
            cube.rotateY(c, c, origin, -1.5 + 4.0 * f);
            cube.add(c, c, vec3.fromValues(0, 0, 1.0 - f));
        }
        if (running) {
            cube.add(c, c, vec3.fromValues(0.7 + 0.05 * Math.sin(theta), 0, 0.2 - 0.2 * Math.sin(theta)));
        } else {
            cube.add(c, c, vec3.fromValues(0.8, 0, 0.2));
        }
        cube.rotateY(c, c, origin, entity.yaw);
        cube.add(c, c, vec3.fromValues(x, y + 1, z));
        cube.add(c, c, offset);

        if (entity !== boss) {
            // Don't draw the sword on the boss
            // It looks tiny and silly
            engine.dynamicBuffers.addCube2(c, swordColor);
        }

        // Copy the sword location for future collision detection
        vec3.copy(entity.swordStart, c[4]);
        vec3.copy(entity.swordEnd, c[0]);
    }

    // Add left arm
    cube.reset(c, 0, 0, 0, entityType.armRadius, halfArmLength, entityType.armRadius);
    cube.skew(c, 0.7, 1.0);
    cube.add(c, c, vec3.fromValues(0.0, -halfArmLength, 0));
    cube.rotateZ(c, c, origin, -0.1);
    if (running && entity.attackState === ATTACK_STATE_IDLE) {
        cube.rotateX(c, c, origin, -0.6 * Math.sin(theta));
    }
    cube.add(c, c, vec3.fromValues(-halfBodyWidth - 0.1, shoulderHeight, 0));
    cube.rotateY(c, c, origin, bodyRotation);
    cube.rotateY(c, c, origin, entity.yaw);
    cube.add(c, c, vec3.fromValues(x, y, z));
    cube.add(c, c, offset);
    engine.dynamicBuffers.addCube2(c, armColor);

    // Add right arm
    cube.reset(c, 0, 0, 0, entityType.armRadius, halfArmLength, entityType.armRadius);
    cube.skew(c, 0.7, 1.0);
    cube.add(c, c, vec3.fromValues(0.0, -halfArmLength, 0));
    cube.rotateZ(c, c, origin, 0.1);
    if (running && entity.attackState === ATTACK_STATE_IDLE) {
        cube.rotateX(c, c, origin, 0.6 * Math.sin(theta));
    }
    cube.add(c, c, vec3.fromValues(halfBodyWidth + 0.1, shoulderHeight, 0));
    cube.rotateY(c, c, origin, bodyRotation);
    cube.rotateY(c, c, origin, entity.yaw);
    cube.add(c, c, vec3.fromValues(x, y, z));
    cube.add(c, c, offset);
    engine.dynamicBuffers.addCube2(c, armColor);

    // Add left leg
    cube.reset(c, 0, 0, 0, entityType.legRadius, halfLegLength, entityType.legRadius);
    cube.skew(c, 0.8, 1.0);
    cube.add(c, c, vec3.fromValues(0.0, -halfLegLength, 0));
    if (running) {
        cube.rotateX(c, c, origin, Math.sin(theta));
    }
    cube.add(c, c, vec3.fromValues(-halfBodyWidth * 0.9 + entityType.legRadius, entityType.legLength, 0));
    cube.rotateY(c, c, origin, entity.yaw);
    cube.add(c, c, vec3.fromValues(x, y, z));
    cube.add(c, c, offset);
    engine.dynamicBuffers.addCube2(c, legColor);

    // Add right leg
    cube.reset(c, 0, 0, 0, entityType.legRadius, halfLegLength, entityType.legRadius);
    cube.skew(c, 0.8, 1.0);
    cube.add(c, c, vec3.fromValues(0.0, -halfLegLength, 0));
    if (running) {
        cube.rotateX(c, c, origin, -Math.sin(theta));
    }
    cube.add(c, c, vec3.fromValues(halfBodyWidth * 0.9 - entityType.legRadius, entityType.legLength, 0));
    cube.rotateY(c, c, origin, entity.yaw);
    cube.add(c, c, vec3.fromValues(x, y, z));
    cube.add(c, c, offset);
    engine.dynamicBuffers.addCube2(c, legColor);
}

/**
 * Returns a random number in the range of -0.5 to +0.5.
 * @return {number}
 */
function rand2() {
    return Math.random() - 0.5;
}
