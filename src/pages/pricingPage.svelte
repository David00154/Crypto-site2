<svelte:head>
	<title>Pricing | Binterest</title>
</svelte:head>

<script lang="ts">
	import {_btc, _btcCash, _eth} from "../data.js";
	import {push} from 'svelte-spa-router';
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
			};
			localStorage.setItem('investmentData', JSON.stringify(investmentData));
			push('/investment/confirm');
		}
	}
</script>

<main>
	
	<section style="background-image: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(/assets/site-images/img5.jpg);" class="bg-gradient-to-b jumbotron-image p-5">
		<div class="bg-scroll bg-no-repeat shadow bg-gradient-to-tr">
			<div style="height: 316px;" class="p-12 container mx-auto px-1">
				<div class="mb-5 p-8 text-center">
					<h2 style="font-size: 40px;" class="roboto text-gray-200 font-thin">Investment Plans</h2>
				</div>
			</div>
		</div>
	</section>

	<div class="container mt-8 mx-auto px-5 mb-5">
		<section class="lg:grid grid-cols-2 gap-5">
			<div class="">
				<h2 class="about-txt font-medium text-gray-900 my-5">Large Investment Organisation</h2>

				<p class="font-normal text-gray-600" style="font-size: 17px;">
					Binterest and bitcoin mining is a life changing investment platform where you can invest a certain amount of commodity (bitcoin) and get profits on a weekly basis and daily basis.
					<br>
					
					Binterest deals with mining of assets in Crypto Currency, Crypto Currencies like Bitcoin, Etherium etc.
					We have employed the expertise of some good objective financial advisor and also Mining technology. So, you have to start up and join the success story.
					<br>
					
				</p>
			</div>

			<div class="p-1 my-8">
				<!-- svelte-ignore a11y-missing-attribute -->
				<img src="/assets/carousel-images/c-img4.png" class="rounded random-img">
			</div>
		</section>

	</div>

	<section class="my-7">
			<div class="lg:grid grid-cols-3 gap-6 py-4 px-5 container mx-auto">
				<div class="flex flex-row">
					<!-- svelte-ignore a11y-missing-attribute -->
					<img src="assets/comp-images/img7.png" style="height: 64px; width: 64px;">
					<div class="flex flex-col ml-3">
						<h4 class="font-medium text-lg">Invest Bitcoin using USD</h4>
						<p class="text-gray-500 p-015">Invest with us with 3 easy steps</p>
					</div>
				</div>

				<div class="flex flex-row lg:mt-0 mt-4">
					<!-- svelte-ignore a11y-missing-attribute -->
					<img src="assets/comp-images/img8.png" style="height: 64px; width: 64px;">
					<div class="flex flex-col ml-3">
						<h4 class="font-medium text-lg">Deposit to our wallet</h4>
						<p class="text-gray-500 p-015">Deposit and instantly get verified</p>
					</div>
				</div>

				<div class="flex flex-row lg:mt-0 mt-4">
					<!-- svelte-ignore a11y-missing-attribute -->
					<img src="assets/comp-images/img9.png" style="height: 64px; width: 64px;">
					<div class="flex flex-col ml-3">
						<h4 class="font-medium text-lg">Invest Bitcoin using USD</h4>
						<p class="text-gray-500 p-015">Invest with us with 3 easy steps</p>
					</div>
				</div>
			</div>
		</section>

		<section class="my-8">

					<div class="lg:text-3xl text-lg font-bold text-gray-900 p-4">
						<center>About Our Plans</center>
					</div>
						<hr class="my-2 bg-gray-300 px-4 mx-12 lg:mx-56">
						<p class="text-base font-normal pt-5 lg:mx-20 mx-8" style="font-size: 17px;">
							Well Binterest is an investment that will earn you a consistent profit on a daily basis or weekly basis, Bitcoin mining refers to the process of hashing or using computers to solve complex algorithms. When an algorithm is solved a new Blockchain transaction is created and add bitcoin to the Blockchain or Bitcoin wallet , a 
							Blockchain or bitcoin wallet is a public platform where bitcoin, ethereum transaction are carried out..<br>
							<br>
							As soon as your investment is confirmed in the miner system, automatically your mining will start. You will notice fractions of bitcoins mining in your wallet every 10minutes through out the duration of your investment plan

							You make investment of a certain amount of capital, then you get a certain percentage which the percentage isn’t fixed and it directly depends on how long you are investing...
							On average;
							The daily profit is over 85%
							The weekly profit is over 600%
							<br><br>
							For instance you make investment of $1000, in a week you’ll get on average 560% For instance if the investment amount is $1,000 and the daily expectancy is 85% = $850
							If the period of your Mining is 10days
							You make 85% daily for 10days($850*10=$8500­)
							For 20days you make ($850 X 20= $17,000)
							Monthly Mining (30days) you make on average ($850 X 30=$25,500)
							<br><br>
							The company get off just 20% off the profit made after every Mining Duration.
							<br><br>
							With minimum investment of;<br>
							$500 Binterest can help you make over $3,000 in just 10 Mining days<br>
							$800 can help you make over $4,800<br>
							$1,000 can make over $5,000<br>
							$1,500 can make over $6,250<br>
							$2,000 can Make over $10,000<br>
							$5,000 can help you make over $13,500 in 8days.
						</p>

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
									<button style="outline: none;" on:click={() => alert('This investment is not currently available')} class="bg-gray-900 text-white w-full px-4 py-4">INVEST NOW</button>
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
				</section>
</main>

<style type="text/css">
	.jumbotron-image {
	  background-position: center center;
	  background-repeat: no-repeat;
	  background-size: cover;
	  height: auto;
	}
	.about-txt {
		font-size: 42px;
	}
	.p-015 {
		font-size: 16px;
	}
	p {
		font-size: 17px;
	}

	@media only screen and (max-width: 600px) {
		.about-txt {
			font-size: 19.5px;
		}
		p {
			font-size: 14px;
		}
		.p-015 {
			font-size: 15px;
		}
	}
</style>