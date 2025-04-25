<script>
	import BikeEditor from '$lib/components/BikeEditor.svelte';
</script>

<svelte:head>
	<title>Bike Parameters App</title>
	<meta name="description" content="A simple app to visualize bike geometry parameters" />
</svelte:head>

<main>
	<BikeEditor />
</main>

<style>
	main {
		width: 100%;
		padding: 1rem;
	}
</style>
