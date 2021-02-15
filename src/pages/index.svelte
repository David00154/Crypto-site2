
<script lang="ts">
	import Jumbotron from "../components/Jumbotron.svelte";
	import {_btc, _btcCash, _eth} from "../data.js";
	import {push} from 'svelte-spa-router'
	// import {_Btc, _BtcCash, _Eth} from "../types";
	let btc;
	let btcCash;
	let eth;

	_btc.subscribe(v => {
		btc = v;
	});

	_btcCash.subscribe(v => {
		btcCash = v;
	});

	_eth.subscribe(v => {
		eth = v;
	})

	const invest = function(options) {
		const User = localStorage.getItem('User');
		if(!User) {
			alert('You need to login to make an investment');
			push('/auth/signin');
		} else {
			const {id, name, email} = JSON.parse(localStorage.getItem('User'));
			const {coin, price, type, profit} = options;
			const investmentData = {
				id,
				name,
				coin,
				price,
				profit,
				email,
				type
			}
			localStorage.setItem('investmentData', JSON.stringify(investmentData));
			push('/investment/confirm');
		}
	}

</script>

<main>
	<Jumbotron/>
		<div>
			<div class="container mx-auto mt-4">
				<div class="lg:text-3xl text-lg font-bold text-gray-900 p-4">
					<center>LARGE INVESTMENT ORGANISATION</center>
				</div>
					<hr class="my-2 bg-gray-300 px-4 mx-4 lg:mx-20">
				<section class="mt-12 lg:grid block grid-cols-4 gap-4">

					<div class="px-4 mb-5 lg:px-0">
						<div style="background-color: #FFF1E0;" 
						class="lg:p-5 flex flex-col text-center p-8">
							<div class="flex flex-row justify-center  pb-4">
								<!-- svelte-ignore a11y-missing-attribute -->
								<img src="assets/site-images/img1.png" style="height: 60px; width: 60px;">
							</div>
							<h6 style="font-size: 16px;" class="text-gray-700 mb-1 font-medium">THE CLOCK</h6>
							<span class="text-base text-gray-400">23 hours a day, Sunday-Friday.{'\n'}</span>
							<span class="text-base text-gray-400">Whenever you want to trade.</span>
						</div>
					</div>

					<div class="px-4 mb-5 lg:px-0">
						<div style="background-color: #FFF1E0;" class="lg:p-5 bg-yellow-200 flex flex-col text-center p-8">
							<div class="flex flex-row justify-center pb-4">
								<!-- svelte-ignore a11y-missing-attribute -->
								<img src="assets/site-images/img2.png" style="height: 60px; width: 60px;">
							</div>
							<h6 style="font-size: 16px;" class="text-gray-700 mb-1 font-medium">NO HIDDEN FEES</h6>
							<span class="text-base text-gray-400">We have no hidden charges,{'\n'}</span>
							<span class="text-base text-gray-400">what you see is what you get.</span>
						</div>
					</div>

					<div class="px-4 mb-5 lg:px-0">
						<div style="background-color: #FFF1E0;" class="lg:p-5 bg-yellow-200 flex flex-col text-center p-8">
							<div class="flex flex-row justify-center  pb-4">
								<!-- svelte-ignore a11y-missing-attribute -->
								<img src="assets/site-images/img3.png" style="height: 60px; width: 60px;">
							</div>
							<h6 style="font-size: 16px;" class="text-gray-700 mb-1 font-medium">INSTANT TRADING</h6>
							<span class="text-base text-gray-400">All Trades are instant once you{'\n'}</span>
							<span class="text-base text-gray-400">approve of them..</span>
						</div>
					</div>

					<div class="px-4 mb-5 lg:px-0">	
						<div style="background-color: #FFF1E0;" class="lg:p-5 bg-yellow-200 flex flex-col text-center p-8">
							<div class="flex flex-row justify-center  pb-4">
								<!-- svelte-ignore a11y-missing-attribute -->
								<img src="assets/site-images/img4.png" style="height: 60px; width: 60px;">
							</div>
							<h6 style="font-size: 16px;" class="text-gray-700 mb-1 font-medium">SECURE TRUSTED</h6>
							<span class="text-base text-gray-400">Our systems are secured with{'\n'}</span>
							<span class="text-base text-gray-400">256bits encryption.</span>
						</div>
					</div>

				</section>

				<section class="mt-12">
					<div class="px-4 mb-5 lg:px-0">
						<div class="lg:text-4xl text-lg font-bold roboto text-gray-900 p-4"><center>Crypto Currency Is The Largest Market In The World</center>
						</div>
							<hr class="my-5 bg-gray-300 px-4 mx-4 lg:mx-24">
						<span class="mb-10 mx-2">
							<p class="text-base font-normal">
								Cryptocurrencies which are designed to be used for peer-to-peer transactions without being liable to any government or central bank are the latest financial innovations explored not only for the reasons of their being but also for potential risks and oppurtunities in the financial industry.
							</p>
							<p class="text-base font-normal pt-5">
								There are thousands of cryptocurrencies with various design goals. These design goals are to provide a digital currency alternative to cash (Bitcoin, Monero and Bitcoin cash), to support payment system at low-cost ( Ripple, Particl and Utility Settlement Coin),to support peer-to-peer trading activity by creating tokens ( RMG and Maecanas), to facilitate secure access to a good or service in peer-to-peer trading (Golem, Filecoin) and to support underlying platform or protocol ( Ether and NEO). These design goals mentioned won't be exhaustive as new cryptocurrencies are being created every week. Blockchain is the underlying technology for most of the cryptocurrencies.
							</p>
						</span>
					</div>
				</section>

				<section class="mt-12">
					<div class="px-4 mb-5 lg:px-0">
						<div class="lg:grid block lg:grid-cols-2 lg:gap-5">
							<div class="p-1 mb-6">
								<!-- svelte-ignore a11y-missing-attribute -->
								<img src="assets/site-images/img5.jpg" class="rounded random-img"></div>
							<div>
									<h2  class="p-3 text-gray-900 roboto font-semibold lg:font-semibold lg:text-3xl text-base mb-8">Trading involves risk. It wouldn’t be exciting if it didn’t.</h2>
									<p class="mb-10 mx-2 text-base font-normal">That’s why we offer a revolutionary approach to trading for the active short-term trader with Etoro Binary Options. Etoro Binary Options are financial instruments that turns every trade into a simple question: will this market be above this price at this time.</p>
									<!-- svelte-ignore a11y-invalid-attribute -->
									<a href="#" class="px-5 py-4 text-lg roboto text-white bg-gray-900 mt-8 mx-2 rounded">Read More</a>
								</div>
						</div>
					</div>
				</section>

				<section class="mt-12">

					<div class="lg:text-3xl text-lg font-bold text-gray-900 p-4">
						<center>Our Plans</center>
					</div>
						<hr class="my-2 bg-gray-300 px-4 mx-12 lg:mx-56">
						<p class="text-base font-normal pt-5 lg:mx-20 mx-8" style="font-size: 17px;">
							Choose your perfect plan and make your own strategy to get profits daily and hourly. You are allowed to make 3 investments per day with different currency's. If you invest more
							than 3 investments per day your investment will be refused and refunded.
						</p>

					<div class="mt-8 px-4 lg:grid grid-cols-4 gap-4 grid-rows-3 mb-8">

						{#each btc as {coin, price, time, type, profit}, index}
							<div class="my-2 lg:my-0 lg:mt-8 mt-12">
							
							<div class="px-3 py-2 h-auto border-2 border-gray-300 rounded">
								<h3 class="font-bold text-gray-900 lg:text-xl text-lg my-4 text-center">{type}</h3>
								<h3 class="font-bold text-gray-900 lg:text-lg text-lg my-2 text-center">({coin})</h3>
								<!-- <h5 class="text-base font-normal text-gray-500 py-1">Coin: {coin}</h5> -->
								<h5 class="text-base font-normal text-gray-500 py-1">{price}</h5>
								<h5 class="text-base font-normal text-gray-500 py-1">{profit}</h5>
								<h5 class="text-base font-normal text-gray-500 py-1">{time}</h5>
								<!-- <h5 class="text-base font-normal text-gray-500 py-1">{last}</h5> -->
							</div>
								<button style="outline: none;" on:click={() => invest({coin, price, type, profit})} class="bg-gray-900 text-white w-full px-4 py-4">INVEST NOW</button>
						</div>

						{/each}
						
						{#each btcCash as {coin, price, time, type, profit}, index}
							<div class="my-2 lg:my-0 lg:mt-8 mt-12">
							
							<div class="px-3 py-2 h-auto border-2 border-gray-300 rounded">
								<h3 class="font-bold text-gray-900 lg:text-xl text-lg my-4 text-center">{type}</h3>
								<h3 class="font-bold text-gray-900 lg:text-lg text-lg my-2 text-center">({coin})</h3>
								<!-- <span class="text-lg text-gray-600 py-1">{type}</span>--> 
								<!-- <h5 class="text-base font-normal text-gray-500 py-1">Coin: {coin}</h5> -->
								<h5 class="text-base font-normal text-gray-500 py-1">{price}</h5>
								<h5 class="text-base font-normal text-gray-500 py-1">{profit}</h5>
								<h5 class="text-base font-normal text-gray-500 py-1">{time}</h5>
								<!-- <h5 class="text-base font-normal text-gray-500 py-1">{last}</h5> -->
							</div>
								<button style="outline: none;" class="bg-gray-900 text-white w-full px-4 py-4" on:click={() => alert('This investment is not currently available')}>INVEST NOW</button>
						</div>

						{/each}
							
							
						{#each eth as {coin, price, time, type, profit}, index}
							<div class="my-2 lg:mt-8 mt-12 lg:my-0">
							
							<div class="px-3 py-2 h-auto border-2 border-gray-300 rounded">
								<h3 class="font-bold text-gray-900 lg:text-xl text-lg my-4 text-center">{type}</h3>
								<h3 class="font-bold text-gray-900 lg:text-lg text-lg my-2 text-center">({coin})</h3>
								<!-- <h5 class="text-base font-normal text-gray-500 py-1">Coin: {coin}</h5> -->
								<h5 class="text-base font-normal text-gray-500 py-1">{price}</h5>
								<h5 class="text-base font-normal text-gray-500 py-1">{profit}</h5>
								<h5 class="text-base font-normal text-gray-500 py-1">{time}</h5>
								<!-- <h5 class="text-base font-normal text-gray-500 py-1">{last}</h5> -->
							</div>
								<button style="outline: none;" class="bg-gray-900 text-white w-full px-4 py-4" on:click={() => alert('This investment is not currently available')}>INVEST NOW</button>
						</div>

						{/each}

						<!-- <a href="#" class="px-5 py-4 text-lg roboto text-white bg-gray-900 mt-8 mx-2 rounded">More >></a> -->

					</div>

						<!-- svelte-ignore a11y-invalid-attribute -->
						<a href="#" class="roboto text-white my-2 mx-4 py-3 text-white text-xl bg-gray-900 rounded px-2">More Plans &gt&gt</a>
				</section>

				<section class="mt-12">
					<div class="lg:text-4xl text-lg roboto font-bold text-gray-900 p-4">
						<center>Why Choose Us</center>
					</div>
						<hr class="my-7 bg-gray-300 px-4 mx-4 lg:mx-24">
					<span class="text-gray-400 text-base">
						<center>We are the most dynamic in the market space.</center>
					</span>
					<div class="mb-5 lg:px-0 mt-5 lg:grid grid-cols-3">
			

						<div class="flex flex-col px-2">
							<div style="padding: 0px 30px 70px;" class="why-choose-us-padding1 text-center">
								<h4 class="why-choose-us" style="padding: 0px 0px 12px;">Payment Options</h4>
								<p>We accept all major cryptocurrency payment options known to you.</p>
							</div>

							<div style="padding: 0px 30px 70px;" class="why-choose-us-padding1 text-center">
								<h4 class="why-choose-us" style="padding: 0px 0px 12px;">Legal Compliance</h4>
								<p>We abide by financial regulations of the industry, be rest assured you are safe and money secured.</p>
							</div>

							<div style="padding: 0px 30px;" class="text-center">
								<h4 class="why-choose-us" style="padding: 0px 0px 12px;">Cross-Platform Trading</h4>
								<p>We support cross-platform trading, multi-currency options also applicable.</p>
							</div>
						</div>

						<div class="flex flex-col px-2">
							<div style="padding: 0px 30px 70px;" class="why-choose-us-padding1 text-center">
								<h4 class="why-choose-us" style="padding: 0px 0px 12px;">Strong Security</h4>
								<p>We have one of the best secured trading network worldwide as we have our servers secured offsite.</p>
							</div>

							<div style="padding: 0px 30px 70px;">
								
								<!-- svelte-ignore a11y-missing-attribute -->
								<img src="assets/site-images/img6.png" style="height: 300px; width: 600px;">
							</div>

							<div style="padding: 0px 30px;" class="fle flex-row text-center">
								<h4 class="why-choose-us" style="padding: 0px 0px 12px;">Competitive Commissions</h4>
								<p>We pay comissions better than your next best choice.</p>
							</div>
						</div>

						<div class="flex flex-col px-2">
							<div style="padding: 0px 30px 70px;" class="why-choose-us-padding1 text-center">
								<h4 class="why-choose-us" style="padding: 0px 0px 12px;">World Coverage</h4>
								<p>Cryptocurrency is a general language and so is our coverage, worldwide, we speak your language</p>
							</div>

							<div style="padding: 0px 30px 70px;" class="why-choose-us-padding1 text-center"> 
								<h4 class="why-choose-us" style="padding: 0px 0px 12px;">Advanced Reporting</h4>
								<p>Detailed reporting daily, weekly and monthly. We give you infographic reports.</p>
							</div>

							<div style="padding: 0px 30px;" class="text-center">
								<h4 class="why-choose-us" style="padding: 0px 0px 12px;">Margin Trading</h4>
								<p>Trading that puts your mind at ease.</p>
							</div>	
						</div>
						<!-- </div> -->
					</div>
				</section>

				<section class="mt-12">
					<div class="lg:text-4xl text-lg roboto font-bold text-gray-900 p-4">
						<center>HOW IT WORKS</center>
					</div>
						<hr class="my-4 bg-gray-300 px-4 mx-4 lg:mx-56">
					<span class="text-gray-400 text-base">
						<center>Very easy to get started</center>
					</span>

					<div class="lg:grid px-3 py-3 grid-cols-3 gap-5">
						<!-- <div class="px-4 text-center">
							<h3 class="text-lg font-bold text-gray-600 roboto py-3">Sign up with us</h3>
							<p class="text-base font-normal">Registration is easy and straight forward</p>
						</div> -->

						<div
						class="lg:p-5 flex flex-col text-center p-8">
							<div class="flex flex-row justify-center  pb-4">
								<!-- svelte-ignore a11y-missing-attribute -->
								<img src="assets/site-images/red1.png" style="height: 60px; width: 60px;">
							</div>

							<h6 style="font-size: 24px;" class="text-gray-700 mb-1 font-medium">Sign up with us</h6>
							<p class="text-base font-normal">Registration is easy and straight forward</p>
						</div>

						<div
						class="lg:p-5 flex flex-col text-center p-8">
							<div class="flex flex-row justify-center  pb-4">
								<!-- svelte-ignore a11y-missing-attribute -->
								<img src="assets/site-images/red2.png" style="height: 60px; width: 60px;">
							</div>

							<h6 style="font-size: 24px;" class="text-gray-700 mb-1 font-medium">Create Wallet</h6>
							<p class="text-base font-normal">Create your wallet</p>
						</div>

						<div
						class="lg:p-5 flex flex-col text-center p-8">
							<div class="flex flex-row justify-center  pb-4">
								<!-- svelte-ignore a11y-missing-attribute -->
								<img src="assets/site-images/red3.png" style="height: 60px; width: 60px;">
							</div>

							<h6 style="font-size: 24px;" class="text-gray-700 mb-1 font-medium">Invest with us</h6>
							<p class="text-base font-normal">Choose a prefer plan and invest</p>
						</div>
					</div>
				</section>
			</div>
		</div>
</main>


<style type="text/css">
	p {
		font-size: 17px;
	}
	.random-img {
		width: 487.5px; 
		height: 390px;
	}
	.why-choose-us {
		font-size: 24px; 
	}
	@media only screen and (max-width: 600px) {
		p {
			font-size: 15px;
		}
		.random-img {
			width: 315px;
			height: 244px;
		}
		.why-choose-us {
			font-size: 19.5px;
		}
		.why-choose-us-padding1 {
		padding: 0px 0px 70px;
		}
		.why-choose-us-padding2 {
			padding: 0px 30px 70px;
		}
		.why-choose-us-padding3 {
			padding: 0px 30px;
		}
	}
</style>