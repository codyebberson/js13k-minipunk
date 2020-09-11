
/**
 * Creates a new input instance.
 * @constructor
 */
function Input() {
    this.down = false;
    this.downCount = 0;
    this.upCount = 9;
}

/**
 * Updates the up/down counts for an input.
 * @param {!Input} input
 */
function updateInput(input) {
    if (input.down) {
        input.downCount++;
        input.upCount = 0;
    } else {
        input.downCount = 0;
        input.upCount++;
    }
}
