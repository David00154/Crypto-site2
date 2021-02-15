<script lang="ts">
    import {onDestroy} from 'svelte';
    import axios from "axios";
    import {push} from 'svelte-spa-router';
    let error_ = ''
    let {id, name, coin, price, profit, email, type} = JSON.parse(localStorage.getItem('investmentData'));
    const confirm = function() {
        error_ = ""
        axios.post(`https://graphql-server001.herokuapp.com/user/transaction/${id}`, {
            id, name, coin, price, profit, email, type
        }).then(res => {
            if(res.data.type == "Error") {
               error_ = res.data.message;
               return; 
            } else if(res.data.type == "Success") {
                alert(res.data.message);
                push('/admin/dashboard')
            }
        })

    }
    const cancel = function() {
        localStorage.removeItem('investmentData');
        push('/')
    }
</script>

{#if !localStorage.getItem('User')}
     {push('/auth/signin')}
{:else}
<main>
	
    <div class="flex flex-col text-center justify-center"  style="align-items: center; min-height: 100vh;" >
            <div class="flex flex-row">
                <div></div>
                <div class="flex flex-col px-2 lg:mx-0 mx-4">
                    <section class="my-4">
                        <h3 class="font-bold text-2xl">Confirm Investment Plan</h3>
                    </section>
                    {#if error_ !== ''}
                         <!-- content here -->
                         <span class="bg-red-500 border-4 border-red-400 text-white text-center p-2">{error_}</span>
                    {/if}
                    <form class="flex flex-col" on:submit|preventDefault={() => confirm()}>
                        <!-- <div class="mb-6 pt-3 body-gray-200">
                            <label class="block text-gray-700 text-sm font-bold mb-2 ml-3">Name</label>
                            <input type="text" class="
                            body-gray-200 w-full text-gray-700 focus:outline-none  border-b-4 border-gray-300 focus:border-gray-600 transition duration-500 px-3 pb-3" bind:value={name}>
                        </div> -->

                        <div class="my-3 text-left">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label style="font-size: 20px;" class="text-gray-900 font-normal mb-2 text-left">Id</label>
                            <input placeholder="Enter Email" type="email" class="focus:outline-none w-full border-gray-500 focus:border-gray-800 transition duration-500 border-2 my-1 px-2 py-1" value={id} disabled>
                        </div>

                        <div class="my-3 text-left">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label style="font-size: 20px;" class="text-gray-900 font-normal mb-2 text-left">Name</label>
                            <input placeholder="Enter Email" type="email" class="focus:outline-none w-full border-gray-500 focus:border-gray-800 transition duration-500 border-2 my-1 px-2 py-1" value={name} disabled>
                        </div>
    
                        <div class="my-3 text-left">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label style="font-size: 20px;" class="text-gray-900 font-normal mb-2 text-left">Email</label>
                            <input placeholder="Enter Email" type="email" class="focus:outline-none w-full border-gray-500 focus:border-gray-800 transition duration-500 border-2 my-1 px-2 py-1" value={email} disabled>
                        </div>

                        <div class="my-3 text-left">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label style="font-size: 20px;" class="text-gray-900 font-normal mb-2 text-left">Coin</label>
                            <input placeholder="Enter Email" type="email" class="focus:outline-none w-full border-gray-500 focus:border-gray-800 transition duration-500 border-2 my-1 px-2 py-1" value={coin} disabled>
                        </div>

                        <div class="my-3 text-left">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label style="font-size: 20px;" class="text-gray-900 font-normal mb-2 text-left">Price</label>
                            <input placeholder="Enter Email" type="email" class="focus:outline-none w-full border-gray-500 focus:border-gray-800 transition duration-500 border-2 my-1 px-2 py-1" value={price} disabled>
                        </div>

                        <div class="my-3 text-left">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label style="font-size: 20px;" class="text-gray-900 font-normal mb-2 text-left">Profit</label>
                            <input placeholder="Enter Email" type="email" class="focus:outline-none w-full border-gray-500 focus:border-gray-800 transition duration-500 border-2 my-1 px-2 py-1" value={profit} disabled>
                        </div>

                        <div class="my-3 text-left">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label style="font-size: 20px;" class="text-gray-900 font-normal mb-2 text-left">Type of Investment</label>
                            <input placeholder="Enter Email" type="email" class="focus:outline-none w-full border-gray-500 focus:border-gray-800 transition duration-500 border-2 my-1 px-2 py-1" value={type} disabled>
                        </div>
    
                        <!-- <div class="my-3 text-left">
                            <label style="font-size: 20px;" class="text-gray-900 font-normal mb-2 text-left">Password</label>
                            <input placeholder="Enter Password" type="password" class="focus:outline-none w-full border-gray-500 focus:border-gray-800 transition duration-500 border-2 my-1 px-2 py-1" value="445" disabled>
                        </div> -->
    
                        <!-- {#if error_ !== ''}
                            <span class="bg-red-500 border-4 border-red-400 text-white text-center p-2">{error_}</span>
                        {/if} -->
    
                        <button class="bg-gray-600 mt-2 hover:bg-gray-900 text-white font-bold py-2 rounded shadow-lg hover:shadow-xl transition duration-200" on:click={confirm} type="submit">Confirm</button>
                        <button class="bg-red-600 mt-2 hover:bg-red-900 text-white font-bold py-2 rounded shadow-lg hover:shadow-xl transition duration-200" on:click={() => cancel()} type="submit">Cancel</button>
    
                    </form>
                    <!-- <div class="max-w-lg mx-auto text-center mt-12 mb-6">
                            <a on:click={() => push("/auth/signup")} class="font-bold hover:underline">Sign Up</a>
                        </p>
                    </div> -->
                </div>
            </div>
    </div>
    </main>
{/if}

