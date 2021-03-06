import {
	Color,
	MeshNormalMaterial,
	LinearFilter,
	RGBFormat,
	Vector2,
	WebGLRenderTarget
} from "three";

import { Pass } from "./Pass.js";
import { RenderPass } from "./RenderPass.js";

/**
 * A pass that renders the normals of a given scene.
 */

export class NormalPass extends Pass {

	/**
	 * Constructs a new normal pass.
	 *
	 * @param {Scene} scene - The scene to render.
	 * @param {Camera} camera - The camera to use to render the scene.
	 * @param {Object} [options] - The options.
	 * @param {Number} [options.resolutionScale=0.5] - The render texture resolution scale, relative to the screen render size.
	 * @param {WebGLRenderTarget} [options.renderTarget] - A custom render target.
	 */

	constructor(scene, camera, options = {}) {

		super("NormalPass");

		this.needsSwap = false;

		/**
		 * A render pass.
		 *
		 * @type {RenderPass}
		 * @private
		 */

		this.renderPass = new RenderPass(scene, camera, {
			overrideMaterial: new MeshNormalMaterial({
				morphTargets: true,
				skinning: true
			}),
			clearColor: new Color(0x7777ff),
			clearAlpha: 1.0
		});

		/**
		 * A render target that contains the scene normals.
		 *
		 * @type {WebGLRenderTarget}
		 */

		this.renderTarget = options.renderTarget;

		if(this.renderTarget === undefined) {

			this.renderTarget = new WebGLRenderTarget(1, 1, {
				minFilter: LinearFilter,
				magFilter: LinearFilter,
				format: RGBFormat
			});

			this.renderTarget.texture.name = "NormalPass.Target";
			this.renderTarget.texture.generateMipmaps = false;

		}

		/**
		 * The original resolution.
		 *
		 * @type {Vector2}
		 * @private
		 */

		this.resolution = new Vector2();

		/**
		 * The current resolution scale.
		 *
		 * @type {Number}
		 * @private
		 */

		this.resolutionScale = (options.resolutionScale !== undefined) ? options.resolutionScale : 0.5;

	}

	/**
	 * Returns the current resolution scale.
	 *
	 * @return {Number} The resolution scale.
	 */

	getResolutionScale() {

		return this.resolutionScale;

	}

	/**
	 * Sets the resolution scale.
	 *
	 * @param {Number} scale - The new resolution scale.
	 */

	setResolutionScale(scale) {

		this.resolutionScale = scale;
		this.setSize(this.resolution.x, this.resolution.y);

	}

	/**
	 * Renders the scene normals.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	 * @param {Number} [delta] - The time between the last frame and the current one in seconds.
	 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	 */

	render(renderer, inputBuffer, outputBuffer, delta, stencilTest) {

		const renderTarget = this.renderToScreen ? null : this.renderTarget;
		this.renderPass.render(renderer, renderTarget, renderTarget);

	}

	/**
	 * Updates the size of this pass.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		this.resolution.set(width, height);

		this.renderTarget.setSize(
			Math.max(1, Math.floor(width * this.resolutionScale)),
			Math.max(1, Math.floor(height * this.resolutionScale))
		);

	}

}