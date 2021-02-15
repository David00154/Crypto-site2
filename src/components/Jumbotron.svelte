

<svelte:head>
    <!-- <script type="text/javascript" src="/swiper.js"></script>
        <script>
      var mySwiper = new Swiper ('.swiper-container');
    </script> -->
   <!--  https://source.unsplash.com/weekly?mountain -->
</svelte:head>



<!-- <div class="mb-2"> 
    <div class="p-8 text-center text-white jumbotron-image" style="height: auto; background-color: #e9ecef; background-image: url(/assets/carousel-images/c-img2.jpeg);">
      <div class="container mx-auto">
      <h3 style="font-size: 1.75rem;" class="display-4 font-medium">Take the World's best Crypto Cryptocurrency site</h3>
      <hr class="my-4">
      <p class="text-xl font-medium mb-3">We always provide our best services for our clients, and always try to achieve out clients trust and satifaction</p>

      <a href="#" class="px-3 text-lg py-2 border-2 border-red-500 text-red-500 bg-white rounded">Read More</a>
    <a href="#" class="px-3 text-lg py-2 border-2 border-blue-800 text-white bg-blue-800 rounded">Register Now</a>

    </div>
  </div>
</div>
 -->

 <script lang="ts">
   import {push} from "svelte-spa-router";
 </script>

 <div style="background-image: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(/assets/carousel-images/img1.jpg);" class="bg-gradient-to-b jumbotron-image p-5">
  <main class="bg-scroll bg-no-repeat shadow bg-gradient-to-tr">
    <div class="h-auto lg:p-20 p-12 container mx-auto px-1">
      <div class="my-8">
        <!-- <span class="font-thin roboto text-gray-200 text-5xl">Bring Power</span>
        <br>
        <span class="font-thin text-gray-200 text-5xl roboto">To Your Steps</span>  -->
        <h2 class="text-white font-thin font-semibold lg:text-5xl text-3xl">Take the World's best</h2>
        <h2 style="" class="text-white font-thin font-semibold lg:text-5xl text-3xl">Crypto currency site</h2>
      </div>
    <div class="my-8">
      <!-- <span class="text-lg font-normal text-gray-200 roboto">
      Go faster, go stronger, never stop.</span> -->
      <p class="text-lg font-thin mb-3 text-white">Join 15,000+ people who has {'\n'} 
      opened an account with Binterest</p>
    </div>
    <div class="mt-5">
      <a style="cursor: pointer;" on:click={() => push('/about')} class="mr-3 px-4 text-lg py-3 shadow-md font-medium text-gray-700 bg-white rounded hover:bg-gray-700 hover:text-white transition duration-400 hover:shadow-xl">Read More</a>
      <a style="cursor: pointer;" on:click={() => push('/auth/signup')} class="px-4 text-lg py-3 shadow-md font-medium text-white bg-gray-700 rounded hover:bg-white hover:text-gray-700 transition duration-400 hover:shadow-xl">Register Now</a>
    </div>
  </div>
  </main>
</div>




<style type="text/css">
  .jumbotron-image {
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  height: auto;
}
</style>