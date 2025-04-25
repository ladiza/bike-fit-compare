<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { BikeParameters } from '$lib/types';
	import { defaultBikeParameters } from '$lib/types';

	// Export parameters to be set by parent component
	export let parameters: BikeParameters = { ...defaultBikeParameters };

	// Export bike index for styling and differentiation
	export let bikeIndex: number = 0;

	let fileName = 'bike-parameters'; // Default filename without extension
	let fileInput: HTMLInputElement;
	let uploadedFileName = 'No file selected';

	// Create an event dispatcher for notifying parent components
	const dispatch = createEventDispatcher<{
		change: BikeParameters;
		requestTotalMeasurements: void;
	}>();

	// Handle input changes
	function handleChange() {
		dispatch('change', parameters);
	}

	/**
	 * Extracts only the editable parameters from the full bike parameters object
	 * These are the parameters that have UI controls in the form
	 */
	function getEditableParameters(params: BikeParameters) {
		return {
			headTubeAngle: params.headTubeAngle,
			stack: params.stack,
			reach: params.reach,
			spacersLength: params.spacersLength,
			stemLength: params.stemLength,
			stemAngle: params.stemAngle,
			handlebarReach: params.handlebarReach,
			handlebarRaise: params.handlebarRaise
		};
	}

	/**
	 * Validates that a parameter object contains all required editable parameters
	 */
	function isValidEditableParameters(params: any): boolean {
		const requiredKeys = [
			'headTubeAngle',
			'stack',
			'reach',
			'spacersLength',
			'stemLength',
			'stemAngle',
			'handlebarReach',
			'handlebarRaise'
		];

		return requiredKeys.every((key) => key in params && typeof params[key] === 'number');
	}

	// Handle file upload
	function handleFileUpload() {
		if (fileInput && fileInput.files && fileInput.files.length > 0) {
			const file = fileInput.files[0];
			// Update the filename input with the uploaded file name (without extension)
			fileName = file.name.replace(/\.json$/, '');
			// Keep track of the file name, but we no longer need to display it separately
			uploadedFileName = file.name;

			const reader = new FileReader();

			reader.onload = (e) => {
				try {
					const uploadedParams = JSON.parse(e.target.result as string);

					// Validate the uploaded JSON structure
					if (isValidEditableParameters(uploadedParams)) {
						// Only apply the editable parameters to our bike model
						Object.keys(getEditableParameters(uploadedParams)).forEach((key) => {
							parameters[key] = uploadedParams[key];
						});

						// Notify parent about change
						dispatch('change', parameters);
					} else {
						alert('Invalid bike parameters format - missing required editable parameters');
					}
				} catch (error) {
					console.error('Failed to parse uploaded file:', error);
					alert('Failed to parse the uploaded file. Please ensure it is a valid JSON file.');
				}
			};

			reader.readAsText(file);
		}
	}

	function isValidBikeParameters(params: any): params is BikeParameters {
		// We only need to validate the editable parameters now
		return isValidEditableParameters(params);
	}

	// Variables to hold the total measurements
	let totalReach = 0;
	let totalStack = 0;
	export function updateTotalMeasurements(reach: number, stack: number) {
		totalReach = reach;
		totalStack = stack;
	}

	/**
	 * Replace the existing exportParameters function with this version
	 * that only exports the editable parameters plus calculated values
	 */
	function exportParameters() {
		// First, request the latest total measurements from BikeVisualization
		dispatch('requestTotalMeasurements');

		// Create export data with only editable parameters plus calculated values
		const exportData = {
			...getEditableParameters(parameters),
			totalReach,
			totalStack
		};

		// Create blob and download link
		const dataStr = JSON.stringify(exportData, null, 2);
		const dataBlob = new Blob([dataStr], { type: 'application/json' });

		// Create download link with custom filename
		const url = URL.createObjectURL(dataBlob);
		const link = document.createElement('a');
		link.href = url;

		// Use custom filename if provided, otherwise use default
		const fileNameToUse = fileName.trim() || 'bike-parameters';
		// Include bike index in filename for multiple bikes
		link.download = `${fileNameToUse}.json`;

		document.body.appendChild(link);
		link.click();

		// Clean up
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}
</script>

<div class="form-container bike-{bikeIndex}">
	<h3>Bike {bikeIndex + 1} Parameters</h3>

	<div class="form-grid">
		<div class="form-group">
			<label for="headTubeAngle-{bikeIndex}">
				Head Tube Angle (°):
				<div class="input-group">
					<input
						type="range"
						id="headTubeAngleSlider-{bikeIndex}"
						bind:value={parameters.headTubeAngle}
						on:input={handleChange}
						min="55"
						max="80"
						step="0.5"
						class="slider"
					/>
					<input
						type="number"
						id="headTubeAngle-{bikeIndex}"
						bind:value={parameters.headTubeAngle}
						on:change={handleChange}
						min="55"
						max="80"
						step="0.5"
						class="number-input"
					/>
				</div>
			</label>
		</div>
		<div class="form-group">
			<label for="stack-{bikeIndex}">
				Stack (mm):
				<div class="input-group">
					<input
						type="range"
						id="stackSlider-{bikeIndex}"
						bind:value={parameters.stack}
						on:input={handleChange}
						min="500"
						max="700"
						step="1"
						class="slider"
					/>
					<input
						type="number"
						id="stack-{bikeIndex}"
						bind:value={parameters.stack}
						on:change={handleChange}
						min="500"
						max="700"
						step="1"
						class="number-input"
					/>
				</div>
			</label>
		</div>

		<div class="form-group">
			<label for="reach-{bikeIndex}">
				Reach (mm):
				<div class="input-group">
					<input
						type="range"
						id="reachSlider-{bikeIndex}"
						bind:value={parameters.reach}
						on:input={handleChange}
						min="350"
						max="450"
						step="1"
						class="slider"
					/>
					<input
						type="number"
						id="reach-{bikeIndex}"
						bind:value={parameters.reach}
						on:change={handleChange}
						min="350"
						max="450"
						step="1"
						class="number-input"
					/>
				</div>
			</label>
		</div>

		<div class="form-group">
			<label for="spacers-{bikeIndex}">
				Spacers Length (mm):
				<div class="input-group">
					<input
						type="range"
						id="spacersSlider-{bikeIndex}"
						bind:value={parameters.spacersLength}
						on:input={handleChange}
						min="0"
						max="70"
						step="1"
						class="slider"
					/>
					<input
						type="number"
						id="spacersLength-{bikeIndex}"
						bind:value={parameters.spacersLength}
						on:change={handleChange}
						min="0"
						max="70"
						step="1"
						class="number-input"
					/>
				</div>
			</label>
		</div>

		<div class="form-group">
			<label for="stemLength-{bikeIndex}">
				Stem Length (mm):
				<div class="input-group">
					<input
						type="range"
						id="stemLengthSlider-{bikeIndex}"
						bind:value={parameters.stemLength}
						on:input={handleChange}
						min="60"
						max="140"
						step="5"
						class="slider"
					/>
					<input
						type="number"
						id="stemLength-{bikeIndex}"
						bind:value={parameters.stemLength}
						on:change={handleChange}
						min="60"
						max="140"
						step="5"
						class="number-input"
					/>
				</div>
			</label>
		</div>

		<div class="form-group">
			<label for="stemAngle-{bikeIndex}">
				Stem Angle (degrees):
				<div class="input-group">
					<input
						type="range"
						id="stemAngleSlider-{bikeIndex}"
						bind:value={parameters.stemAngle}
						on:input={handleChange}
						min="-30"
						max="30"
						step="1"
						class="slider"
					/>
					<input
						type="number"
						id="stemAngle-{bikeIndex}"
						bind:value={parameters.stemAngle}
						on:change={handleChange}
						min="-30"
						max="30"
						step="1"
						class="number-input"
					/>
				</div>
			</label>
		</div>

		<div class="form-group">
			<label for="handlebarReach-{bikeIndex}">
				Handlebar Reach (mm):
				<div class="input-group">
					<input
						type="range"
						id="handlebarReachSlider-{bikeIndex}"
						bind:value={parameters.handlebarReach}
						on:input={handleChange}
						min="0"
						max="100"
						step="1"
						class="slider"
					/>
					<input
						type="number"
						id="handlebarReach-{bikeIndex}"
						bind:value={parameters.handlebarReach}
						on:change={handleChange}
						min="0"
						max="100"
						step="1"
						class="number-input"
					/>
				</div>
			</label>
		</div>

		<div class="form-group">
			<label for="handlebarRaise-{bikeIndex}">
				Handlebar Raise (mm):
				<div class="input-group">
					<input
						type="range"
						id="handlebarRaiseSlider-{bikeIndex}"
						bind:value={parameters.handlebarRaise}
						on:input={handleChange}
						min="-10"
						max="70"
						step="5"
						class="slider"
					/>
					<input
						type="number"
						id="handlebarRaise-{bikeIndex}"
						bind:value={parameters.handlebarRaise}
						on:change={handleChange}
						min="-10"
						max="70"
						step="5"
						class="number-input"
					/>
				</div>
			</label>
		</div>
	</div>

	<div class="export-container">
		<!-- Hidden file input -->
		<input
			type="file"
			accept=".json"
			style="display: none;"
			bind:this={fileInput}
			on:change={handleFileUpload}
		/>

		<!-- Filename input field -->
		<div class="filename-input-container">
			<label for="filename-{bikeIndex}">Filename:</label>
			<div class="input-with-extension">
				<input
					type="text"
					id="filename-{bikeIndex}"
					bind:value={fileName}
					placeholder="bike-parameters"
					class="filename-input"
				/>
				<span class="file-extension">.json</span>
			</div>
		</div>

		<!-- Buttons container for side-by-side layout -->
		<div class="buttons-container">
			<button on:click={() => fileInput.click()} class="action-button bike-{bikeIndex}-btn">
				Upload
			</button>
			<button on:click={exportParameters} class="action-button bike-{bikeIndex}-btn">
				Export
			</button>
		</div>
	</div>
</div>

<style>
	.form-container {
		background-color: #f5f5f5;
		padding: 0.75rem;
		border-radius: 8px;
		margin-bottom: 1.5rem;
	}

	.bike-0 {
		border-left: 3px solid #3273dc;
	}

	.bike-1 {
		border-left: 3px solid #ff3860;
	}

	h3 {
		margin-top: 0;
		margin-bottom: 1rem;
	}

	.bike-0 h3 {
		color: #3273dc;
	}

	.bike-1 h3 {
		color: #ff3860;
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 0.5rem;
	}

	.form-group {
		margin-bottom: 0.75rem;
	}

	label {
		display: block;
		font-weight: 500;
		margin-bottom: 0.25rem;
	}

	.input-group {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 0.25rem;
		width: 100%;
	}

	.slider {
		flex: 1;
		height: 6px;
		-webkit-appearance: none;
		appearance: none;
		background: #ddd;
		outline: none;
		border-radius: 3px;
		cursor: pointer;
		min-width: 0;
	}

	.slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		cursor: pointer;
	}

	.bike-0 .slider::-webkit-slider-thumb {
		background: #3273dc;
	}

	.bike-1 .slider::-webkit-slider-thumb {
		background: #ff3860;
	}

	.slider::-moz-range-thumb {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		cursor: pointer;
		border: none;
	}

	.bike-0 .slider::-moz-range-thumb {
		background: #3273dc;
	}

	.bike-1 .slider::-moz-range-thumb {
		background: #ff3860;
	}

	.number-input {
		width: 70px;
		padding: 0.4rem 0.2rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		text-align: center;
		font-size: 0.85rem;
		flex-shrink: 0;
	}

	.bike-0 .number-input:focus {
		border-color: #3273dc;
		outline: none;
		box-shadow: 0 0 0 2px rgba(50, 115, 220, 0.25);
	}

	.bike-1 .number-input:focus {
		border-color: #ff3860;
		outline: none;
		box-shadow: 0 0 0 2px rgba(255, 56, 96, 0.25);
	}

	input {
		font-family: inherit;
		font-size: 0.9rem;
	}

	.export-container {
		margin-top: 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.8rem;
	}

	.filename-input-container,
	.file-upload-container {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		justify-content: center;
	}

	.filename-input {
		padding: 0.4rem 0.6rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-size: 0.9rem;
		width: 180px;
	}

	.file-name {
		color: #666;
		font-size: 0.9rem;
		max-width: 150px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.file-extension {
		color: #666;
		font-size: 0.9rem;
	}

	.export-button {
		border: none;
		border-radius: 4px;
		padding: 0.6rem 1.2rem;
		font-size: 1rem;
		cursor: pointer;
		transition: background-color 0.2s;
		color: white;
	}

	.bike-0-btn {
		background-color: #3273dc;
	}

	.bike-0-btn:hover {
		background-color: #2366d1;
	}

	.bike-1-btn {
		background-color: #ff3860;
	}

	.bike-1-btn:hover {
		background-color: #ee2d54;
	}

	@media (max-width: 576px) {
		.form-grid {
			grid-template-columns: 1fr;
		}

		.slider {
			width: 100%;
		}

		.number-input {
			width: 65px;
		}
	}

	.export-container {
		margin-top: 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.8rem;
	}

	.filename-input-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.4rem;
		width: 100%;
	}

	.input-with-extension {
		display: flex;
		align-items: center;
		width: 100%;
		max-width: 300px;
	}

	.filename-input {
		flex: 1;
		padding: 0.5rem 0.6rem;
		border: 1px solid #ccc;
		border-radius: 4px 0 0 4px;
		font-size: 0.9rem;
	}

	.file-extension {
		padding: 0.5rem 0.6rem;
		background-color: #f0f0f0;
		border: 1px solid #ccc;
		border-left: none;
		border-radius: 0 4px 4px 0;
		color: #666;
		font-size: 0.9rem;
	}

	.buttons-container {
		display: flex;
		gap: 1rem;
		justify-content: center;
		width: 100%;
		margin-top: 0.5rem;
	}

	.action-button {
		border: none;
		border-radius: 4px;
		padding: 0.6rem 1.5rem;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition:
			background-color 0.2s,
			transform 0.1s;
		color: white;
		min-width: 120px;
		text-align: center;
	}

	.action-button:hover {
		transform: translateY(-2px);
	}

	.action-button:active {
		transform: translateY(0);
	}

	.bike-0-btn {
		background-color: #3273dc;
	}

	.bike-0-btn:hover {
		background-color: #2366d1;
	}

	.bike-1-btn {
		background-color: #ff3860;
	}

	.bike-1-btn:hover {
		background-color: #ee2d54;
	}

	@media (max-width: 576px) {
		.buttons-container {
			flex-direction: column;
			gap: 0.5rem;
			align-items: center;
		}

		.action-button {
			width: 100%;
			max-width: 300px;
		}
	}
</style>
