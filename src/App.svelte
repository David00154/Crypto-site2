<script lang="ts">
	import Router, {location} from "svelte-spa-router";
	import Nav from "./components/Nav.svelte";
	import Footer from "./components/Footer.svelte"
	import index from "./pages/index.svelte";
	import about from "./pages/about.svelte";
	import contact from "./pages/contact.svelte";
	import pricingPage from "./pages/pricingPage.svelte";
	import trade from "./pages/trade.svelte";
	import signup from "./authPages/signup.svelte";
	import signin from "./authPages/signin.svelte";
	import invest from './components/invest.svelte';
	let l = false;
	const routes = {
		'/': index,
		'/contact': contact,
		'/about': about,
		'/investment-plans-page': pricingPage,
		'/admin/*': trade,
		'/auth/signup': signup,
		'/auth/signin': signin,
		'/investment/confirm': invest
	};

	const _routesToShowNav = ['/auth/signup'];

	const _routesToShowFooter = ['/auth/signup'];
</script>
<main>
	
<!-- <section class="flex bg-gray-800 flex-row justify-between px-3 py-2 sticky">
		<span class="text-white text-base font-medium">Opening Hours: 24Hours</span>

		<button style="outline: none;">
			<a href="#" class="text-white text-base font-medium mr-2 text-min">Login</a>
			<a href="#" class="text-white text-base font-medium text-min">Sign up</a>
		</button>
	</section> -->
<!-- <Nav />
<Router {routes}/>
<Footer /> -->

	{#if $location === '/auth/signup' || $location === '/auth/signin' || $location === '/admin/dashboard' || $location === '/admin/notifications' || $location === '/admin/profile' || $location === '/admin/notification' || $location === '/investment/confirm'}
		<div></div>
	{:else}
		<!-- else content here -->
		<Nav />
	{/if}

<Router {routes}/>

	{#if $location === '/auth/signup' || $location === '/auth/signin' || $location === '/admin/dashboard' || $location === '/admin/notifications' || $location === '/admin/profile' || $location === '/admin/notification' || $location === '/investment/confirm'}
		<div></div>
	{:else}
		 <!-- else content here -->
		 <Footer />
	{/if}


</main>

<style type="text/css">
	@media only screen and (max-width: 600px) {
		.text-min {
			font-size: 15px;
		}
	}
</style>



