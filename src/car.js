
class Car {
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {number} dx
     * @param {number} dz
     */
    constructor(x, y, z, dx, dz) {

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
        this.velocity = vec3.fromValues(dx, 0, dz);
    }
}

/**
 * Updates all the cars in the sky.
 * These are purely decorative, they have no impact on gameplay.
 * They update even when the game is paused.
 */
function updateCars() {
    // World is 512x512
    // Add a 100 unit buffer on both sides
    // Therefore, width=712, min=-100, max=612

    for (let i = 0; i < cars.length; i++) {
        let car = cars[i];
        vec3.scaleAndAdd(car.position, car.position, car.velocity, dt);

        if (car.position[0] < -100) {
            car.position[0] += 712;
        }
        if (car.position[0] > 612) {
            car.position[0] -= 712;
        }
        if (car.position[2] < -100) {
            car.position[2] += 712;
        }
        if (car.position[2] > 612) {
            car.position[2] -= 712;
        }
    }
}
