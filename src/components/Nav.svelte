<!-- <nav class="navbar navbar-expand-lg navbar-light bg-gray-700">
  <a class="navbar-brand font-medium text-xl" href="#">Navbar</a>
  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>

  <div class="collapse navbar-collapse" id="navbarSupportedContent">
    <ul class="navbar-nav mr-auto">
      <li class="nav-item active">
        <a class="nav-link font-medium text-white" href="#">Home <span class="sr-only">(current)</span></a>
      </li>
      <li class="nav-item">
        <a class="nav-link font-medium text-white" href="#">About</a>
      </li>
    </ul> -->
    <!-- <form class="form-inline my-2 my-lg-0">
      <input class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search">
      <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
    </form> -->
  <!-- </div>
</nav> -->
        <!-- 
          <i class="material-icons">arrow_drop_down</i>
       --><!-- </button> -->

<script lang="ts">
  import {push, location} from 'svelte-spa-router';
  let menu: boolean = false;

  let _auth:boolean;


  const _authFound = JSON.parse(localStorage.getItem('User'));

  if(_authFound) {
    _auth = true;
  } else {
    _auth = false;
  }

  const logout = () => {
    localStorage.removeItem('User');
    localStorage.removeItem('token');
    _auth = false;
    push('/')
  }
  const menuActive = () => {
    menu = !menu;
  } 
</script>

<section class="flex bg-gray-800 flex-row justify-between px-3 py-2 sticky">
    <span class="text-white text-base font-medium">Opening Hours: 24Hours</span>
    <div>
      <button style="outline: none;" class="text-white text-base font-medium mr-2 text-min" on:click={() => push('/auth/signin')}>
        <!-- svelte-ignore a11y-invalid-attribute -->
        <!-- <a href="#" class="text-white text-base font-medium mr-2 text-min">Login</a> -->
        Login
      </button>
  
      <button style="outline: none;">
        {#if !_auth}
          <!-- svelte-ignore a11y-missing-attribute -->
          <a on:click={() => push('/auth/signup')} class="text-white text-base font-medium text-min">Sign up</a>
        {:else}
          <!-- svelte-ignore a11y-invalid-attribute -->
          <a href="#" class="text-white text-base font-medium text-min" on:click={() => logout()}>Logout</a>  
        {/if}
      </button>
    </div>
  </section>

<!-- <nav class="px-6 py-5 bg-white flex flex-row justify-between">
  <a href="/#/" class="text-3xl font-semibold text-gray-700">Binterest</a>

  <div class="lg:inline-flex {menu === true ? 'block' : 'hidden'} ml-4">
      
      <button style="outline: none;" class="ml-5 {$location === '/' ? 'border-b-4 border-yellow-700' : 'border-b-0' } text-lg font-medium text-gray-600" on:click={() => push('/')}>Home</button>

      <button style="outline: none;" class="ml-5 text-lg font-medium text-gray-600 {$location === '/investment-plans-page' ? 'border-b-4 border-yellow-700' : 'border-b-0' }" on:click={() => push('/investment-plans-page')}>Invsetment Plans</button>

      <button style="outline: none;" class="ml-5 text-lg font-medium text-gray-600 {$location === '/about' ? 'border-b-4 border-yellow-700' : 'border-b-0' }" on:click={() => push('/about')}>About</button>

      <button style="outline: none;" class="ml-5 text-lg font-medium text-gray-600 {$location === '/contact' ? 'border-b-4 border-yellow-700' : 'border-b-0' }" on:click={() => push('/contact')}>Contact</button>

  </div>

  <div class="inline-flex">
    <button style="outline: none;" class="px-3 py-2 text-white roboto bg-gray-700 rounded">Get Started</button>

    <button on:click={() => menuActive()} style="outline: none; font-size: 25px;" class="lg:hidden inline-flex ml-3 py-2"><i class="material-icons ">reorder</i></button>
  </div>
</nav>
 -->



<nav class="top-0 flex items-center bg-white px-6 py-5 shadow-md flex-wrap">
  <div class="container mx-auto flex flex-wrap lg:items-center justify-between">

    <!-- Brand -->
    <a href="/#/" class="p-2 mr-4 inline-flex items-center">
      <!-- <span class="text-3xl tracking-wide text-gray-700 font-semibold">
        Binterest
      </span> -->
      <h2 class="roboto text-gray-900 font-semibold text-4xl lg:text-5xl uppercase">Etoro</h2>
    </a>

    <!-- Menu-btn -->
    <button on:click={() => menuActive()}
     style="outline: none;" class="rounded lg:hidden text-gray-700 inline-flex p-3">
            <i class="material-icons text-3xl font-bold">menu</i>
    </button>

    <!-- Nav Items -->
    <div class="{menu === true ? 'block' : 'hidden'} w-full lg:inline-flex lg:flex-row lg:w-auto">

        <div class="lg:flex-row lg:inline-flex flex flex-col">
          <!-- Home-route -->
          <button style="outline: none;" on:click={() => push('/')}
            class="lg:inline-flex flex lg:w-auto text-xl
            {$location === '/' ? 'border-b-4 border-yellow-700' : 'border-b-0'} 
            px-2 py-1  text-gray-900 font-normal
            hover:text-white hover:bg-gray-900 mr-2 roboto"

     >
            <span>Home</span>   </button>
          <!-- Investment-plans-route  -->
          <button style="outline: none;" on:click={() => push('/investment-plans-page')}
            class="lg:inline-flex flex lg:w-auto text-lg font-normal mr-2
            {$location === '/investment-plans-page' ? 'border-b-4 border-yellow-700' : 'border-b-0'}
            px-2 py-1  text-gray-900 
            hover:text-white hover:bg-gray-900 roboto"
            >
            <span>Investment Plans</span>
          </button>

          <!-- Trade/Dashboard route -->
          <button style="outline: none;" on:click={() => push('/admin/dashboard')}
            class="lg:inline-flex flex lg:w-auto text-lg font-normal mr-2
            {$location === '/portal/dashboard' ? 'border-b-4 border-yellow-700' : 'border-b-0'}
            px-2 py-1  text-gray-900 
            hover:text-white hover:bg-gray-900 roboto"
            >
            <span>Dashboard</span>
          </button>
          <!-- About-route  -->
          <button style="outline: none;" on:click={() => push('/about')}
            class="lg:inline-flex flex lg:w-auto text-lg font-normal mr-2
            {$location === '/about' ? 'border-b-4 border-yellow-700' : 'border-b-0'} 
            px-2 py-1  text-gray-900 
            hover:text-white hover:bg-gray-900 roboto"
            >
            <span>About</span>
          </button>
          <!-- Check-out-route  -->
          <button style="outline: none;" on:click={() => push('/contact')}
            class="lg:inline-flex flex lg:w-auto text-lg font-normal mr-2
            {$location === '/contact' ? 'border-b-4 border-yellow-700' : 'border-b-0'} 
            px-2 py-1  text-gray-900 
            hover:text-white hover:bg-gray-900 roboto"
            >
            <span>Contact Us</span>
          </button>
          
          <button style="outline: none;" on:click={() => push('/admin/dashboard')} class="px-3 py-2 text-white roboto bg-gray-900 rounded">
          Get Started
          </button>
        </div>
    </div>

  </div>
</nav>

