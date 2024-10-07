<script>
	import { Linkedin, Github } from 'lucide-svelte';
</script>

<footer class="mx-auto flex w-full max-w-screen-xl items-center justify-center p-4">
	<div class="flex-col items-center justify-center">
		<div class="flex items-center justify-center space-x-2">
			<a href="https://github.com/shingyipcheung/" target="_blank" rel="noreferrer">
				<div class="icon-btn" title="Github">
					<Github size="20" />
					<span class="sr-only">Github</span>
				</div>
			</a>

			<a href="https://www.linkedin.com/in/jamesy-ip/" target="_blank" rel="noreferrer"
				><div class="icon-btn" title="LinkedIn">
					<Linkedin size="20" />
					<span class="sr-only">Linkedin</span>
				</div></a
			>

			<a href="https://soundcloud.com/james-yip" target="_blank" rel="noreferrer"
				><div class="icon-btn" title="SoundCloud">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="icon icon-tabler icon-tabler-brand-soundcloud"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						stroke-width="2"
						stroke="currentColor"
						fill="none"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path stroke="none" d="M0 0h24v24H0z" fill="none" />
						<path d="M17 11h1c1.38 0 3 1.274 3 3c0 1.657 -1.5 3 -3 3l-6 0v-10c3 0 4.5 1.5 5 4z" />
						<line x1="9" y1="8" x2="9" y2="17" /> <line x1="6" y1="17" x2="6" y2="10" />
						<line x1="3" y1="16" x2="3" y2="14" />
					</svg>
					<span class="sr-only">SoundCloud</span>
				</div></a
			>
		</div>
		<p class="block text-center text-xs text-foreground/60">
			© {new Date().getFullYear()}
			<a href="https://jamesy.dev" class="hover:underline">jamesy.dev</a>
		</p>
	</div>
</footer>
<div id="bottom"></div>

<style>
	@keyframes waveShadow {
		0% {
			box-shadow: 0  40px 30px rgba(255, 240, 160, 0.2);
		}
		50% {
			box-shadow: 0 0 50px 40px rgba(255, 240, 160, 0.3);
		}
		100% {
			box-shadow: 0 0 40px 30px rgba(255, 240, 160, 0.2);
		}
	}
	/* applied only when dark mode */
	:global(.dark #bottom) {
		animation: waveShadow 4s infinite; /* This applies the animation, lasting for 4 seconds, and repeats it infinitely */
	}
</style>
