<svelte:head>
	<title>Dashboard | Binterest</title>
</svelte:head>

<script lang="ts">
	import {push} from "svelte-spa-router";
	import Dashboard from "../components/Dashboard.svelte";
	let logged_in: boolean;

	const _authFound = JSON.parse(localStorage.getItem('Auth'));

	if(!_authFound) {
		logged_in = false;
	} else {
		logged_in = true;
	}
</script>

<Dashboard />


<style type="text/css">
	.body-bg {
		background-color: #9921e8;
		background-image: linear-gradient(315deg 0%, #5f72be 74%);
	}
</style>