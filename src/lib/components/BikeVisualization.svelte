<script lang="ts">
	import type { BikeParameters } from '$lib/types';
	import { createEventDispatcher } from 'svelte';

	// Export parameters to be set by parent component
	export let parameters: BikeParameters;

	// Export bike index for styling
	export let bikeIndex: number = 0;

	// Flag for overlay visualization in comparison mode
	export let isOverlay: boolean = false;

	// Canvas and margin settings
	const canvasWidth = 900;
	const canvasHeight = 700;
	const margin = 20;
	const scaleFactor = 0.5;

	// Bike colors for differentiation
	const bikeColors = ['var(--bike-color, #3273dc)', 'var(--bike-color, #ff3860)'];
	const strokeColor = bikeColors[bikeIndex] || '#333';
	const strokeWidth = isOverlay ? 1.5 : 2;
	const strokeOpacity = isOverlay ? 0.7 : 1;

	// Calculate bike geometry points
	let rearAxle = { x: 0, y: 0 };
	let frontAxle = { x: 0, y: 0 };
	let bottomBracket = { x: 0, y: 0 };
	let headTubeTop = { x: 0, y: 0 };
	let seatTubeTop = { x: 0, y: 0 };
	let spacersTop = { x: 0, y: 0 };
	let stemTip = { x: 0, y: 0 };
	let handlebarReach = { x: 0, y: 0 };
	let handlebarRaise = { x: 0, y: 0 };
	let wheelRadius = parameters.wheelDiameter / 2;

	const dispatch = createEventDispatcher<{
		totalMeasurementsUpdate: { reach: number; stack: number };
	}>();

	// Recalculate geometry whenever parameters change
	$: {
		// In this model, head tube angle is measured from the rear wheel reference point
		// A smaller angle points more toward the rear wheel
		const headTubeRad = (parameters.headTubeAngle * Math.PI) / 180;
		const seatTubeRad = (parameters.seatTubeAngle * Math.PI) / 180;
		const stemHelperRad = ((90 - parameters.headTubeAngle + parameters.stemAngle) * Math.PI) / 180;

		// Rear axle (origin point)
		rearAxle = {
			x: wheelRadius * scaleFactor + margin,
			y: canvasHeight - wheelRadius * scaleFactor - margin
		};

		// Bottom bracket
		bottomBracket = {
			x: rearAxle.x + parameters.chainStayLength * scaleFactor,
			y: rearAxle.y + parameters.bottomBracketDrop * scaleFactor
		};

		// Seat tube top (using the parameter for length)
		seatTubeTop = {
			x: bottomBracket.x - Math.cos(seatTubeRad) * parameters.seatTubeLength * scaleFactor,
			y: bottomBracket.y - Math.sin(seatTubeRad) * parameters.seatTubeLength * scaleFactor
		};

		headTubeTop = {
			x: bottomBracket.x + parameters.reach * scaleFactor,
			y: bottomBracket.y - parameters.stack * scaleFactor
		};

		// Front axle
		frontAxle = {
			x:
				rearAxle.x +
				((parameters.reach + parameters.chainStayLength) * scaleFactor +
					(parameters.stack * scaleFactor - parameters.bottomBracketDrop * scaleFactor) /
						Math.tan(headTubeRad)),
			y: rearAxle.y
		};

		spacersTop = {
			x: headTubeTop.x - Math.cos(headTubeRad) * parameters.spacersLength * scaleFactor,
			y: headTubeTop.y - Math.sin(headTubeRad) * parameters.spacersLength * scaleFactor
		};

		// now I need to calculate the stem tip position, which is counted from the spacers top, but the angle is relative to the head tube angle
		stemTip = {
			x: spacersTop.x + Math.cos(stemHelperRad) * parameters.stemLength * scaleFactor,
			y: spacersTop.y - Math.sin(stemHelperRad) * parameters.stemLength * scaleFactor
		};

		handlebarRaise = {
			x: stemTip.x,
			y: stemTip.y - parameters.handlebarRaise * scaleFactor
		};

		handlebarReach = {
			x: handlebarRaise.x + parameters.handlebarReach * scaleFactor,
			y: handlebarRaise.y
		};

		if (bottomBracket && handlebarReach) {
			const calculatedTotalReach = Math.round(
				Math.abs(handlebarReach.x - bottomBracket.x) / scaleFactor
			);
			const calculatedTotalStack = Math.round(
				Math.abs(handlebarReach.y - bottomBracket.y) / scaleFactor
			);

			dispatch('totalMeasurementsUpdate', {
				reach: calculatedTotalReach,
				stack: calculatedTotalStack
			});
		}
	}
</script>

<div class="visualization-container {isOverlay ? 'overlay' : ''}">
	<svg
		width={canvasWidth}
		height={canvasHeight}
		viewBox="0 0 {canvasWidth} {canvasHeight}"
		preserveAspectRatio="xMidYMid meet"
	>
		<!-- Wheels -->
		<circle
			cx={rearAxle.x}
			cy={rearAxle.y}
			r={wheelRadius * scaleFactor}
			fill="none"
			stroke={strokeColor}
			stroke-width={strokeWidth}
			stroke-opacity={strokeOpacity}
		/>
		<circle
			cx={frontAxle.x}
			cy={frontAxle.y}
			r={wheelRadius * scaleFactor}
			fill="none"
			stroke={strokeColor}
			stroke-width={strokeWidth}
			stroke-opacity={strokeOpacity}
		/>

		<!-- Frame -->
		<!-- Chain stay (rear axle to bottom bracket) -->
		<line
			x1={rearAxle.x}
			y1={rearAxle.y}
			x2={bottomBracket.x}
			y2={bottomBracket.y}
			stroke={strokeColor}
			stroke-width={strokeWidth}
			stroke-opacity={strokeOpacity}
		/>

		<!-- Seat tube (bottom bracket to seat tube top) -->
		<line
			x1={bottomBracket.x}
			y1={bottomBracket.y}
			x2={seatTubeTop.x}
			y2={seatTubeTop.y}
			stroke={strokeColor}
			stroke-width={strokeWidth}
			stroke-opacity={strokeOpacity}
		/>

		<!-- seat stay tube (seat tube top to the rear axle) -->
		<line
			x1={seatTubeTop.x}
			y1={seatTubeTop.y}
			x2={rearAxle.x}
			y2={rearAxle.y}
			stroke={strokeColor}
			stroke-width={strokeWidth}
			stroke-opacity={strokeOpacity}
		/>
		<!-- Down tube (bottom bracket to head tube bottom) -->
		<line
			x1={bottomBracket.x}
			y1={bottomBracket.y}
			x2={headTubeTop.x}
			y2={headTubeTop.y}
			stroke={strokeColor}
			stroke-width={strokeWidth}
			stroke-opacity={strokeOpacity}
		/>

		<!-- Top tube (seat tube top to head tube top) -->
		<line
			x1={seatTubeTop.x}
			y1={seatTubeTop.y}
			x2={headTubeTop.x}
			y2={headTubeTop.y}
			stroke={strokeColor}
			stroke-width={strokeWidth}
			stroke-opacity={strokeOpacity}
		/>

		<!-- simplified headtube (head tube top to front axle) -->
		<line
			x1={headTubeTop.x}
			y1={headTubeTop.y}
			x2={frontAxle.x}
			y2={frontAxle.y}
			stroke={strokeColor}
			stroke-width={strokeWidth}
			stroke-opacity={strokeOpacity}
		/>

		<!-- spacers top (seat tube top plus amount of spacers) -->
		<line
			x1={headTubeTop.x}
			y1={headTubeTop.y}
			x2={spacersTop.x}
			y2={spacersTop.y}
			stroke={strokeColor}
			stroke-width={strokeWidth}
			stroke-opacity={strokeOpacity}
		/>

		<!-- stem line (spacers top to stem tip) -->
		<line
			x1={spacersTop.x}
			y1={spacersTop.y}
			x2={stemTip.x}
			y2={stemTip.y}
			stroke={strokeColor}
			stroke-width={strokeWidth}
			stroke-opacity={strokeOpacity}
		/>

		<!-- handlebar raise representation -->
		<line
			x1={stemTip.x}
			y1={stemTip.y}
			x2={handlebarRaise.x}
			y2={handlebarRaise.y}
			stroke={strokeColor}
			stroke-width={strokeWidth}
			stroke-opacity={strokeOpacity}
		/>

		<!-- handlebar reach representation -->
		<line
			x1={handlebarReach.x}
			y1={handlebarReach.y}
			x2={handlebarRaise.x}
			y2={handlebarRaise.y}
			stroke={strokeColor}
			stroke-width={strokeWidth}
			stroke-opacity={strokeOpacity}
		/>

		<!-- Only show measurements if not in overlay mode -->
		{#if !isOverlay}
			<!-- Add key measurements -->
			<g class="measurements">
				<!-- Reach measurement line -->
				<line
					x1={bottomBracket.x}
					y1={bottomBracket.y}
					x2={headTubeTop.x}
					y2={bottomBracket.y}
					stroke={strokeColor}
					stroke-width="1"
					stroke-dasharray="5,5"
				/>
				<text
					x={(bottomBracket.x + headTubeTop.x) / 2}
					y={bottomBracket.y - 10}
					text-anchor="middle"
					font-size="12"
					fill={strokeColor}
				>
					Reach: {parameters.reach}mm
				</text>

				<!-- Stack measurement line -->
				<line
					x1={headTubeTop.x}
					y1={bottomBracket.y}
					x2={headTubeTop.x}
					y2={headTubeTop.y}
					stroke={strokeColor}
					stroke-width="1"
					stroke-dasharray="5,5"
				/>
				<text
					x={headTubeTop.x + 10}
					y={(bottomBracket.y + headTubeTop.y) / 2}
					text-anchor="start"
					font-size="12"
					fill={strokeColor}
				>
					Stack: {parameters.stack}mm
				</text>
			</g>
		{/if}

		<!-- Key points for visualization -->
		<circle
			cx={bottomBracket.x}
			cy={bottomBracket.y}
			r="4"
			fill={strokeColor}
			stroke="white"
			stroke-width="1"
		/>
		<circle
			cx={headTubeTop.x}
			cy={headTubeTop.y}
			r="4"
			fill={strokeColor}
			stroke="white"
			stroke-width="1"
		/>
		<circle
			cx={handlebarReach.x}
			cy={handlebarReach.y}
			r="4"
			fill={strokeColor}
			stroke="white"
			stroke-width="1"
		/>

		<!-- Point labels - only show if not in overlay -->
		{#if !isOverlay}
			<text x={bottomBracket.x + 10} y={bottomBracket.y} font-size="10" fill={strokeColor}>BB</text>
			<text x={headTubeTop.x + 10} y={headTubeTop.y} font-size="10" fill={strokeColor}>HT</text>
			<text x={handlebarReach.x - 20} y={handlebarReach.y - 10} font-size="10" fill={strokeColor}>
				HB
			</text>
		{/if}
	</svg>

	<!-- Only show info if not in overlay -->
	{#if !isOverlay}
		<div class="info">
			<p>
				Total reach: {Math.round(Math.abs(handlebarReach.x - bottomBracket.x) / scaleFactor)} mm
			</p>
			<p>
				Total stack: {Math.round(Math.abs(handlebarReach.y - bottomBracket.y) / scaleFactor)} mm
			</p>
		</div>
	{/if}
</div>

<style>
	.visualization-container {
		background-color: #f5f5f5;
		padding: 1rem;
		border-radius: 8px;
		position: relative;
	}

	.visualization-container.overlay {
		background-color: transparent;
		padding: 0;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 5;
	}

	.visualization-container.overlay svg {
		background-color: transparent;
		border: none;
		padding-top: 17px;
	}

	/* Define bike colors using CSS custom properties */
	:global(.bike-0) {
		--bike-color: #3273dc;
		--bike-color-rgb: 50, 115, 220;
		--bike-color-hover: #2366d1;
	}

	:global(.bike-1) {
		--bike-color: #ff3860;
		--bike-color-rgb: 255, 56, 96;
		--bike-color-hover: #ee2d54;
	}

	svg {
		background-color: white;
		border: 1px solid #ddd;
		border-radius: 4px;
		display: block;
		margin: 0 auto;
	}

	.visualization-container.overlay svg {
		background-color: transparent;
		border: none;
	}

	.info {
		margin-top: 0.5rem;
		font-size: 0.85rem;
		text-align: center;
		color: var(--bike-color, #666);
	}
</style>
