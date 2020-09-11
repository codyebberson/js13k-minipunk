
let ZOOM_CAMERA_DISTANCE = 3.0;
let MAX_CAMERA_DISTANCE = 16.0;
let CAMERA_STIFFNESS = 0.9;

class Camera {
    constructor() {
        this.pitch = 0.0;
        this.yaw = 0.0;
        this.distance = 12.0;
        this.focus = vec3.create();
        this.desiredPosition = vec3.create();
        this.position = vec3.create();
        this.translate = vec3.create();
    }

    /**
     * Updates the camera based on the player position.
     */
    updateForPlayer() {
        this.pitch = player.pitch;
        this.yaw = player.yaw;

        this.focus[0] = 0.5 * this.focus[0] + 0.5 * player.position[0];
        this.focus[1] = 0.5 * this.focus[1] + 0.5 * (player.position[1] + 3.5);
        this.focus[2] = 0.5 * this.focus[2] + 0.5 * player.position[2];

        // Calculate desired camera position
        // Raycast the opposite direction the player is looking
        // to find the nearest obstacle
        vec3.rotateX(tempVec, forward, origin, this.pitch);
        vec3.rotateY(tempVec, tempVec, origin, this.yaw);
        vec3.scale(tempVec, tempVec, -1.0);

        let cameraDistance = zoom ? ZOOM_CAMERA_DISTANCE : MAX_CAMERA_DISTANCE;
        let raycastDistance = voxels.raycast(this.focus, tempVec, cameraDistance);
        let desiredCameraDistance = raycastDistance !== null ? raycastDistance * 0.9 : cameraDistance;
        if (desiredCameraDistance < this.distance) {
            this.distance = desiredCameraDistance;
        } else {
            this.distance = CAMERA_STIFFNESS * this.distance + (1.0 - CAMERA_STIFFNESS) * desiredCameraDistance;
        }

        this.desiredPosition[0] = this.focus[0] + this.distance * tempVec[0];
        this.desiredPosition[1] = this.focus[1] + this.distance * tempVec[1];
        this.desiredPosition[2] = this.focus[2] + this.distance * tempVec[2];

        this.position[0] = 0.5 * this.position[0] + 0.5 * this.desiredPosition[0];
        this.position[1] = 0.5 * this.position[1] + 0.5 * this.desiredPosition[1];
        this.position[2] = 0.5 * this.position[2] + 0.5 * this.desiredPosition[2];

        if (zoom) {
            // When zooming, track the line segment of the camera
            vec3.copy(zoomStart, this.position);
            vec3.scale(tempVec, tempVec, -64.0);
            vec3.add(zoomEnd, zoomStart, tempVec);
        }
    }

    /**
     * Sets the camera position and direction.
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {number} pitch
     * @param {number} yaw
     */
    set(x, y, z, pitch, yaw) {
        this.position[0] = x;
        this.position[1] = y;
        this.position[2] = z;
        this.pitch = pitch;
        this.yaw = yaw;
    }
}
