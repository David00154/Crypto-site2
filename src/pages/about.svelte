<svelte:head>
	<title>About | Etoro</title>
</svelte:head>
	<!-- <section class="p-12 text-center mx-5 my-5" style="height: 316px;">
		
	</section> -->

<!--  <section style="background-image: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(/assets/site-images/img5.jpg);" class="bg-gradient-to-b jumbotron-image p-5">
  <main class="bg-scroll bg-no-repeat shadow bg-gradient-to-tr">
    <div style="height: 316px;" class="p-12 container mx-auto px-1">
      <div class="mb-5 p-8 text-center">
        <h2 style="font-size: 40px;" class="roboto text-gray-200 font-thin">About Us</h2>
      </div>
  </div>
  </main>
</section> -->


<main>

	<section style="background-image: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(/assets/site-images/img5.jpg);" class="bg-gradient-to-b jumbotron-image p-5">
		<div class="bg-scroll bg-no-repeat shadow bg-gradient-to-tr">
			<div style="height: 316px;" class="p-12 container mx-auto px-1">
				<div class="mb-5 p-8 text-center">
					<h2 style="font-size: 40px;" class="roboto text-gray-200 font-thin">About Us</h2>
				</div>
			</div>
		</div>
	</section>

	<div class="container mt-8 mx-auto px-5 mb-5">
		<section class="lg:grid grid-cols-2 gap-5">
			<div class="">
				<h2 class="about-txt font-medium text-gray-900 my-5">About Bin<span class="about-txt font-medium text-gray-700">Terest</span></h2>

				<p class="font-normal text-gray-600">Etoro is a trading company focused on customer satisfaction both online and offline to ensure you make trades with the least margin for error.</p>

				<ul class="mt-5">

					<li class="font-normal text-gray-600 inline-flex">
						<i class="material-icons mr-4 text-gray-900">
							check_circle_outline
						</i> 
					you can exchange your bitcoin by eth.
					</li>

					<li class="font-normal text-gray-600 inline-flex">
						<i class="material-icons mr-4 text-gray-900">
						check_circle_outline
					</i>
						best profite bitco.exge for all over the world.
					</li>

					<li class="font-normal text-gray-600 inline-flex">
						<i class="material-icons mr-4 text-gray-900">
						check_circle_outline
					</i>
						we take a big missoin for growth business.
					</li>

					<li class="font-normal text-gray-600 inline-flex">
						<i class="material-icons mr-4 text-gray-900">
						check_circle_outline
					</i>
						we have top lavel bitcoin experts
					</li>

				</ul>

				<button class="px-5 py-4 text-lg roboto text-white bg-gray-900 mt-8 mx-2 rounded" style="outline: none;">
					Start Trading
				</button>
			</div>

			<div class="p-1 my-8">
				<img src="/assets/carousel-images/c-img3.jpeg" class="rounded random-img">
			</div>
		</section>

	</div>

	<section class="mb-5 mt-5 bg-gray-700">
			<div class="p-5 text-center">
				<h3 class="my-4 text-white text-3xl font-semibold">How work in Numbers</h3>
					<p class="mb-4 font-normal text-base container lg:px-5 mx-auto text-white" style="font-size: 17px;">
						Etoro is a fully automated Investment platform operating with no human intervention, aside from regular server maintenance conducted by our staff
						Take full advantage of our fast and legit Investment platform. Our automated system gathers information from the blockchain transfers and cryptocurrency exchanges to study and predict the Bitcoin price
					</p>
						<!-- <div class="lg:grid grid-cols-4 gap-4 mb-4 container mx-auto">
							<div class="">
								<div class="text-center">
									<h2 class="yt-text text-white">0</h2>
									<hr class="my-2 bg-gray-300 px-4 mx-32">
								</div>
								<h4 class="text-lg font-semibold text-white">TRANSACTIONS LAST 24H</h4>
							</div>

							<div class="">
								<div class="text-center">
									<h2 class="yt-text text-white">0</h2>
									<hr class="my-2 bg-gray-300 px-4 mx-32">
								</div>
								<h4 class="text-lg font-semibold text-white">TRANSACTIONS PER HOUR</h4>
							</div>

							<div class="">
								<div class="text-center">
									<h2 class="yt-text text-white">0</h2>
									<hr class="my-2 bg-gray-300 px-4 mx-32">
								</div>
								<h4 class="text-lg font-semibold text-white">LARGEST TRANSACTIONS</h4>
							</div>

							<div class="">
								<div class="text-center">
									<h2 class="yt-text text-white">0</h2>
									<hr class="my-2 bg-gray-300 px-4 mx-32">
								</div>
								<h4 class="text-lg font-semibold text-white">YEARS OF EXPERIENCE</h4>
							</div>
						</div> -->
			</div>
		</section>

		<section class="my-7">
			<!-- svelte-ignore a11y-missing-attribute -->
			<div class="lg:grid grid-cols-6 gap-4 py-4 px-5 container mx-auto">
				<!-- svelte-ignore a11y-missing-attribute -->
				<img src="assets/comp-images/img1.png">
				<img src="assets/comp-images/img2.png">
				<img src="assets/comp-images/img3.png">
				<img src="assets/comp-images/img4.png">
				<img src="assets/comp-images/img5.png">
				<img src="assets/comp-images/img6.png">
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
	.yt-text {
		font-size: 48px;
	}
	.about-txt {
		font-size: 42px;
	}
	p {
		font-size: 18px;
	}

	ul li {
		font-size: 16px;
	}

	.random-img {
		width: 487.5px; 
		height: 390px;
	}

@media only screen and (max-width: 600px) {
	.about-txt {
		font-size: 19.5px;
	}
	.yt-text {
		font-size: 48px;
	}
	p {
		font-size: 14px;
	}
	.random-img {
		width: 315px;
		height: 244px;
	}
}
</style>