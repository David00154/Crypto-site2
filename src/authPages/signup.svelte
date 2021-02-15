<svelte:head>
	<title>Account | Binterest</title>
</svelte:head>

<script lang="ts">
	import axios from 'axios';
	import {push} from "svelte-spa-router";
import { text } from 'svelte/internal';
	let error_ = '';

	let name = '';
	let nameError = '';

	let email = '';
	let emailError = '';

	let password = '';
	let passwordError;

	let repeatePassword = '';
	let repeatePasswordError = '';

	let country = '';
	let countryError = '';

	function validateEmail(_email_) {
			const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(_email_);
	}

	const handleChange = function(_name) {
		if(_name == "repeatePassword") {
			if(repeatePassword.trim() == '') {
				repeatePasswordError = 'onRepeatePasswordNull-This Field Should Not Be Empty';
				return;
			} else {
				repeatePasswordError = '';
			}

			if(password.trim() !== repeatePassword) {
				repeatePasswordError = 'onRepeatePassword-The Password Should Match With The Repeated One';
				return;
			} else {
				repeatePasswordError = '';
			}
		} else if(_name == "name") {
			if(name.trim() == '') {
				nameError = 'onNameNull-Name Field Should Not Be Empty';
				return;
			} else {
				nameError = '';
			}
		} else if(_name == 'country') {
			if(country.trim() == '') {
				countryError = 'onCountryNull-Country Field Should Not Be Empty';
				return;
			} else {
				countryError = ''
			}
		}
	}

	const signUp = (e) => {
		e.preventDefault();
		// error_ = '';
		if(name.trim() == '') {
			error_ = 'Name Field Should Not Be Empty';
			return;
		} else if(email == '') {
			error_ = "Email Field Should Not Be Empty"
			return;
		} else if(!validateEmail(email)) {
			error_ = "You Must Enter A Correct Email Address"
			return;
		} else if(password == '') {
			error_ = 'Password Field Should Not Be Empty';
			return;
		} else if(repeatePassword.trim() == '') {
			error_ = 'Repeated Password Field Should Not Be Empty';	
			return;
		} else if(repeatePassword !== password.trim()) {
			error_ = 'The Password Should Match With The Repeated One';
			return;
		} else if(country.trim() == '') {
			error_ = 'Country Field Should Not Be Empty';
			return;
		} else {
			error_ = ''
		}

		error_ = "Hold On";

		axios({
			url: "https://gql-2.vercel.app/api/signup",
			method: "post",
			data: {
				args: {
					name: `${name.trim()}`, 
					email: `${email}`, 
					password: `${password}`, 
					country: `${country}`, 
					countryCode: '01547',
					phoneNumber: '45789'
				}
			},
		})
		.then(res => {
			error_ = "";
			if(res.data.type === "Error") {
				error_ = res.data.message
			} else if(res.data.type == "Success") {
				name = "";
				email = "";
				password = "",
				country = "";
				push('/auth/signin');
			}
			})
		.catch(e => console.log(e))
	// localStorage.setItem('Auth', JSON.stringify(data));
	// alert('ok')
	}
</script>


<main>
	
<div class="flex flex-col text-center justify-center"  style="align-items: center; min-height: 100vh;" >
		<div class="flex flex-row">
			<div></div>
			<div class="flex flex-col px-2 lg:mx-0 mx-4">
				<section class="my-4">
					<h3 class="font-bold text-2xl">Welcome to Binterest</h3>
					<p class="text-gray-600 pt-2">Sign up for an account.</p>
				</section>
				{#if error_ !== ''}
					 <!-- content here -->
					 <span class="bg-red-500 border-4 border-red-400 text-white text-center p-2">{error_}</span>
				{/if}
				<form class="flex flex-col" on:submit|preventDefault={(e) => signUp(e)}>
					<!-- <div class="mb-6 pt-3 body-gray-200">
						<label class="block text-gray-700 text-sm font-bold mb-2 ml-3">Name</label>
						<input type="text" class="
						body-gray-200 w-full text-gray-700 focus:outline-none  border-b-4 border-gray-300 focus:border-gray-600 transition duration-500 px-3 pb-3" bind:value={name}>
					</div> -->

					<div class="my-3 text-left">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<div>
							<label style="font-size: 20px;" class="text-gray-900 font-normal mb-2 text-left">Name</label>
							<input placeholder="Enter Fullname" type="text" class="focus:outline-none w-full border-gray-500 focus:border-gray-800 transition duration-500 border-2 my-1 px-2 py-1" 
							bind:value={name}
							on:change={() => handleChange('name')}
							>
						</div>
						<!-- <div>
							{#if nameError.split('-')[0] == 'onNameNull'}
									 {nameError.split('-')[1]}
								 </span>
							{/if}
						</div> -->
					</div>

					<div class="my-3 text-left">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label style="font-size: 20px;" class="text-gray-900 font-normal mb-2 text-left">Email</label>
						<input placeholder="Enter Email" type="email" class="focus:outline-none w-full border-gray-500 focus:border-gray-800 transition duration-500 border-2 my-1 px-2 py-1" bind:value={email}>
					</div>

					<div class="my-3 text-left">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label style="font-size: 20px;" class="text-gray-900 font-normal mb-2 text-left">Password</label>
						<input placeholder="Enter Password" type="password" class="focus:outline-none w-full border-gray-500 focus:border-gray-800 transition duration-500 border-2 my-1 px-2 py-1" bind:value={password}>
					</div>

					<div class="my-3 text-left">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<div>
							<label style="font-size: 20px;" class="text-gray-900 font-normal mb-2 text-left">Repeat Password</label>
							<input 
								placeholder="Reapet Password" 
								type="password" 
								class="focus:outline-none w-full border-gray-500 focus:border-gray-800 transition duration-500 border-2 my-1 px-2 py-1" 
								on:change={() => handleChange('repeatePassword')} 
								bind:value={repeatePassword}>
							<!-- { ? 'The Repeated Password Must Be The Same As The Main Password;' : ''} -->
						</div>
						<!-- <div>
							{#if repeatePasswordError.split('-')[0] == "onRepeatePassword"}
								<span style="font-size: 15px;">
									{repeatePasswordError.split('-')[1]}
								</span>
							{:else if  repeatePasswordError.split('-')[0] == "onRepeatePasswordNull"}
								<span style="font-size: 15px;">
									{repeatePasswordError.split('-')[1]}
								</span>
							{/if}
						</div> -->
					</div>


					<div class="my-3 text-left">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<div>
							<label style="font-size: 20px;" class="text-gray-900 font-normal mb-2 text-left">Country</label>
						<input placeholder="Enter Country" type="text" class="focus:outline-none w-full border-gray-500 focus:border-gray-800 transition duration-500 border-2 my-1 px-2 py-1" 
						bind:value={country}
						on:change={() => handleChange('country')}>
						</div>
						<!-- <div>
							{#if countryError.split('-')[0] == "onCountryNull"}
								 <span>
									 {countryError.split('-')[1]}
								 </span>
							{/if}
						</div> -->
					</div>

					

					{#if error_ !== ''}
						<!-- content here -->
						<span class="bg-red-500 border-4 border-red-400 text-white text-center p-2">{error_}</span>
					{/if}

					<button class="bg-gray-600 mt-2 hover:bg-gray-900 text-white font-bold py-2 rounded shadow-lg hover:shadow-xl transition duration-200" type="submit" on:click={(e) => signUp(e)}>Sign Up</button>

				</form>
				<div class="max-w-lg mx-auto text-center mt-12 mb-6">
					<p class="text-gray-900">Have an account already? 
						<!-- svelte-ignore a11y-missing-attribute -->
						<a on:click={() => push("/auth/signin")} class="font-bold hover:underline">Sign In</a>
					</p>
				</div>
			</div>
		</div>
</div>
</main>

<style type="text/css">
	.body-bg {
		background-color: #9921e8;
		background-image: linear-gradient(315deg 0%, #5f72be 74%);
	}
</style>