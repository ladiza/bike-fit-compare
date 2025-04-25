<!-- BikeEditor.svelte (updated) -->
<script lang="ts">
	import { onMount } from 'svelte';
	import BikeForm from '$lib/components/BikeForm.svelte';
	import BikeVisualization from '$lib/components/BikeVisualization.svelte';
	import type { BikeParameters } from '$lib/types';
	import { defaultBikeParameters, defaultBikeParameters2 } from '$lib/types';

	// Initialize bike parameters array for comparison
	let bikesParameters: BikeParameters[] = [
		{ ...defaultBikeParameters },
		{ ...defaultBikeParameters2 }
	];

	// Track whether second bike is visible
	let showSecondBike = true;

	// References to form components for updating total measurements
	let bikeFormComponents: BikeForm[] = [];

	// Total measurements for each bike
	let totalReaches: number[] = [0, 0];
	let totalStacks: number[] = [0, 0];

	// Handle parameter changes from a form
	function handleParametersChange(event: CustomEvent<BikeParameters>, index: number) {
		bikesParameters[index] = event.detail;
		bikesParameters = [...bikesParameters]; // Trigger reactivity update
	}

	// Function to handle the request for total measurements
	function handleTotalMeasurementsRequest(index: number) {
		if (bikeFormComponents[index]) {
			bikeFormComponents[index].updateTotalMeasurements(totalReaches[index], totalStacks[index]);
		}
	}

	// Function to receive total measurements from visualization
	function handleTotalMeasurementsUpdate(
		event: CustomEvent<{ reach: number; stack: number }>,
		index: number
	) {
		totalReaches[index] = event.detail.reach;
		totalStacks[index] = event.detail.stack;
	}

	// Toggle the visibility of the second bike
	function toggleSecondBike() {
		showSecondBike = !showSecondBike;
	}

	// Save parameters to localStorage when they change
	$: {
		if (typeof window !== 'undefined') {
			localStorage.setItem('bikesParameters', JSON.stringify(bikesParameters));
			localStorage.setItem('showSecondBike', JSON.stringify(showSecondBike));
		}
	}

	// Load saved parameters on component mount
	onMount(() => {
		const savedParams = localStorage.getItem('bikesParameters');
		if (savedParams) {
			try {
				bikesParameters = JSON.parse(savedParams);
			} catch (e) {
				console.error('Failed to parse saved bike parameters:', e);
				bikesParameters = [{ ...defaultBikeParameters }, { ...defaultBikeParameters2 }];
			}
		}

		const savedShowSecondBike = localStorage.getItem('showSecondBike');
		if (savedShowSecondBike) {
			try {
				showSecondBike = JSON.parse(savedShowSecondBike);
			} catch (e) {
				console.error('Failed to parse saved showSecondBike state:', e);
			}
		}
	});
</script>

<div class="bike-editor">
	<h1>Bike Geometry Editor</h1>

	<div class="controls">
		<!-- Toggle for second bike visibility -->
		<button class="toggle-btn" on:click={toggleSecondBike}>
			{showSecondBike ? 'Hide Second Bike' : 'Show Second Bike'}
		</button>
	</div>

	<!-- Always use comparison layout -->
	<div class="editor-layout comparison-mode">
		<!-- Side-by-side forms -->
		<div class="comparison-grid">
			<!-- First bike form (always visible) -->
			<div class="bike-column bike-0">
				<BikeForm
					parameters={bikesParameters[0]}
					bind:this={bikeFormComponents[0]}
					on:change={(event) => handleParametersChange(event, 0)}
					on:requestTotalMeasurements={() => handleTotalMeasurementsRequest(0)}
					bikeIndex={0}
				/>
			</div>

			<!-- Second bike form (conditionally visible) -->
			{#if showSecondBike}
				<div class="bike-column bike-1">
					<BikeForm
						parameters={bikesParameters[1]}
						bind:this={bikeFormComponents[1]}
						on:change={(event) => handleParametersChange(event, 1)}
						on:requestTotalMeasurements={() => handleTotalMeasurementsRequest(1)}
						bikeIndex={1}
					/>
				</div>
			{:else}
				<div class="bike-column bike-1 disabled">
					<p class="disabled-message">Second bike is currently hidden</p>
				</div>
			{/if}
		</div>

		<!-- Combined visualization - using divs with positioned SVGs -->
		<div class="visualization-section">
			<!-- Main visualization wrapper -->
			<div class="visualizations-container">
				<!-- Main SVG container -->
				<BikeVisualization
					parameters={bikesParameters[0]}
					on:totalMeasurementsUpdate={(event) => handleTotalMeasurementsUpdate(event, 0)}
					bikeIndex={0}
				/>

				<!-- SVG overlay div (conditionally rendered) -->
				{#if showSecondBike}
					<div class="bike-overlay">
						<BikeVisualization
							parameters={bikesParameters[1]}
							on:totalMeasurementsUpdate={(event) => handleTotalMeasurementsUpdate(event, 1)}
							bikeIndex={1}
							isOverlay={true}
						/>
					</div>
				{/if}
			</div>

			<!-- Comparison info table -->
			<div class="comparison-info">
				<div class="comparison-table">
					<div class="info-row header">
						<div class="info-cell"></div>
						<div class="info-cell bike-0">Bike 1</div>
						{#if showSecondBike}
							<div class="info-cell bike-1">Bike 2</div>
							<div class="info-cell">Difference</div>
						{/if}
					</div>
					<div class="info-row">
						<div class="info-cell">Total Reach</div>
						<div class="info-cell bike-0">{totalReaches[0]} mm</div>
						{#if showSecondBike}
							<div class="info-cell bike-1">{totalReaches[1]} mm</div>
							<div class="info-cell">{totalReaches[1] - totalReaches[0]} mm</div>
						{/if}
					</div>
					<div class="info-row">
						<div class="info-cell">Total Stack</div>
						<div class="info-cell bike-0">{totalStacks[0]} mm</div>
						{#if showSecondBike}
							<div class="info-cell bike-1">{totalStacks[1]} mm</div>
							<div class="info-cell">{totalStacks[1] - totalStacks[0]} mm</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.bike-editor {
		max-width: 1200px;
		margin: 0 auto;
		padding: 1rem;
	}

	h1 {
		margin-bottom: 1.5rem;
		text-align: center;
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 0.8rem;
		margin-bottom: 1.5rem;
	}

	.toggle-btn {
		padding: 0.5rem 1rem;
		border-radius: 4px;
		border: none;
		cursor: pointer;
		font-weight: 500;
		background-color: #23d160;
		color: white;
	}

	.toggle-btn:hover {
		background-color: #20bc56;
	}

	.editor-layout {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}

	.comparison-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.bike-column {
		padding: 1rem;
		border-radius: 8px;
		/* background-color: #f9f9f9; */
	}

	.bike-column.disabled {
		opacity: 0.5;
		background-color: #e5e5e5;
	}

	.disabled-message {
		text-align: center;
		font-style: italic;
		color: #666;
		padding: 2rem 0;
	}

	.visualization-section {
		position: relative;
	}

	.visualizations-container {
		position: relative;
	}

	.bike-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
	}

	.comparison-info {
		margin-top: 1rem;
		padding: 1rem;
		background-color: #f5f5f5;
		border-radius: 8px;
	}

	.comparison-table {
		width: 100%;
	}

	.info-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
	}

	.info-row.header {
		font-weight: bold;
		border-bottom: 2px solid #ccc;
	}

	/* Adjust info-row grid when second bike is visible */
	:global(.bike-editor:has(.bike-overlay)) .info-row {
		grid-template-columns: 1fr 1fr 1fr 1fr;
	}

	.info-cell {
		padding: 0.5rem;
		text-align: center;
	}

	.info-cell.bike-0 {
		color: var(--bike-color, #3273dc);
	}

	.info-cell.bike-1 {
		color: var(--bike-color, #ff3860);
	}

	@media (min-width: 768px) {
		.editor-layout:not(.comparison-mode) {
			grid-template-columns: 1fr 1fr;
		}
	}

	@media (max-width: 767px) {
		.comparison-grid {
			grid-template-columns: 1fr;
		}

		/* Fix table columns for smaller screens */
		.info-row,
		:global(.bike-editor:has(.bike-overlay)) .info-row {
			grid-template-columns: 1fr 1fr;
		}

		/* Stack the comparison cells in mobile view when second bike is shown */
		:global(.bike-editor:has(.bike-overlay)) .info-row {
			border-bottom: 1px solid #ddd;
			margin-bottom: 0.5rem;
		}
	}
</style>
