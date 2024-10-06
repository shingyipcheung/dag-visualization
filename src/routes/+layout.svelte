<script>
	import '../app.css';

	import { Toaster } from '$lib/components/ui/sonner';
	import Footer from './Footer.svelte';
</script>

<Toaster />
<div class="app flex min-h-screen flex-col bg-muted/40">
	<div class="mx-auto flex items-center justify-between px-6 py-10">
		<h1 class="text-xl font-bold">DAG Visualization Demo</h1>
	</div>
	<main class="mx-auto mt-5 box-border flex w-full max-w-7xl flex-1 flex-col p-7">
		<slot></slot>
	</main>

	<Footer></Footer>
</div>

<svelte:head>
	<style>
		@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap');
	</style>
</svelte:head>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>
