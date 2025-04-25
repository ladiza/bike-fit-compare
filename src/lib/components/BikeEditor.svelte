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

	// Track which bike is currently being displayed (in single view mode)
	let activeBikeIndex = 0;

	// Track comparison mode
	let comparisonMode = false;

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

	// Toggle between single and comparison mode
	function toggleComparisonMode() {
		comparisonMode = !comparisonMode;
	}

	// Set the active bike in single view mode
	function setActiveBike(index: number) {
		activeBikeIndex = index;
	}

	// Save parameters to localStorage when they change
	$: {
		if (typeof window !== 'undefined') {
			localStorage.setItem('bikesParameters', JSON.stringify(bikesParameters));
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
	});
</script>

<div class="bike-editor">
	<h1>Bike Geometry Editor</h1>

	<div class="controls">
		<!-- Toggle comparison mode -->
		<button class="toggle-btn" on:click={toggleComparisonMode}>
			{comparisonMode ? 'Single View Mode' : 'Comparison Mode'}
		</button>

		<!-- Bike selection tabs in single view mode -->
		{#if !comparisonMode}
			<div class="bike-tabs">
				{#each bikesParameters as _, index (index)}
					<button
						class="tab-btn {activeBikeIndex === index ? 'active' : ''}"
						on:click={() => setActiveBike(index)}
					>
						Bike {index + 1}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Comparison mode layout -->
	{#if comparisonMode}
		<div class="editor-layout comparison-mode">
			<!-- Side-by-side forms -->
			<div class="comparison-grid">
				{#each bikesParameters as parameters, index (index)}
					<div class="bike-column bike-{index}">
						<h2>Bike {index + 1}</h2>
						<BikeForm
							{parameters}
							bind:this={bikeFormComponents[index]}
							on:change={(event) => handleParametersChange(event, index)}
							on:requestTotalMeasurements={() => handleTotalMeasurementsRequest(index)}
							bikeIndex={index}
						/>
					</div>
				{/each}
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

					<!-- SVG overlay div -->
					<div class="bike-overlay">
						<BikeVisualization
							parameters={bikesParameters[1]}
							on:totalMeasurementsUpdate={(event) => handleTotalMeasurementsUpdate(event, 1)}
							bikeIndex={1}
							isOverlay={true}
						/>
					</div>
				</div>

				<!-- Comparison info table -->
				<div class="comparison-info">
					<div class="comparison-table">
						<div class="info-row header">
							<div class="info-cell"></div>
							<div class="info-cell bike-0">Bike 1</div>
							<div class="info-cell bike-1">Bike 2</div>
							<div class="info-cell">Difference</div>
						</div>
						<div class="info-row">
							<div class="info-cell">Total Reach</div>
							<div class="info-cell bike-0">{totalReaches[0]} mm</div>
							<div class="info-cell bike-1">{totalReaches[1]} mm</div>
							<div class="info-cell">{totalReaches[1] - totalReaches[0]} mm</div>
						</div>
						<div class="info-row">
							<div class="info-cell">Total Stack</div>
							<div class="info-cell bike-0">{totalStacks[0]} mm</div>
							<div class="info-cell bike-1">{totalStacks[1]} mm</div>
							<div class="info-cell">{totalStacks[1] - totalStacks[0]} mm</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<!-- Single bike mode -->
		<div class="editor-layout">
			<div class="form-section">
				<BikeForm
					parameters={bikesParameters[activeBikeIndex]}
					bind:this={bikeFormComponents[activeBikeIndex]}
					on:change={(event) => handleParametersChange(event, activeBikeIndex)}
					on:requestTotalMeasurements={() => handleTotalMeasurementsRequest(activeBikeIndex)}
					bikeIndex={activeBikeIndex}
				/>
			</div>

			<div class="visualization-section bike-{activeBikeIndex}">
				<BikeVisualization
					parameters={bikesParameters[activeBikeIndex]}
					on:totalMeasurementsUpdate={(event) =>
						handleTotalMeasurementsUpdate(event, activeBikeIndex)}
					bikeIndex={activeBikeIndex}
				/>
			</div>
		</div>
	{/if}
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

	h2 {
		margin-top: 0;
		text-align: center;
		margin-bottom: 1rem;
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 0.8rem;
		margin-bottom: 1.5rem;
	}

	.bike-tabs {
		display: flex;
		gap: 0.5rem;
	}

	.toggle-btn,
	.tab-btn {
		padding: 0.5rem 1rem;
		border-radius: 4px;
		border: none;
		cursor: pointer;
		font-weight: 500;
	}

	.toggle-btn {
		background-color: #23d160;
		color: white;
	}

	.toggle-btn:hover {
		background-color: #20bc56;
	}

	.tab-btn {
		background-color: #f5f5f5;
		border: 1px solid #ddd;
	}

	.tab-btn.active {
		background-color: #3273dc;
		color: white;
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
		background-color: #f9f9f9;
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
		grid-template-columns: 1fr 1fr 1fr 1fr;
		border-bottom: 1px solid #ddd;
	}

	.info-row.header {
		font-weight: bold;
		border-bottom: 2px solid #ccc;
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
	}
</style>
