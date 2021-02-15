<script lang="ts">
    import axios from 'axios';
    import {push} from "svelte-spa-router";
    let error_ = '';
let email = '';
let password = '';

const signin = function() {
    if(email == '') {
        error_ = "Email Field Should Not Be Empty";
        return;
    } else if(password == '') {
        error_ = "Password Field Should Not Be Empty"
        return;
    } else {
        error_ = ''
    }
    axios.get(`https://gql-2.vercel.app/api/signin/${email}/${password}`)
    .then(res => {
        if(res.data.type == "Error") {
            error_ = res.data.message;
            return;
        } else if(res.data.type == "Invalid") {
            error_ = res.data.message;
            return;
        } else if(res.data.type == "Success") {
            error_ = '';
            email = "";
            password = "";
            console.log(res.data.message[0])
            localStorage.setItem('User', JSON.stringify(res.data.message[0]));
            localStorage.setItem('token', res.data.message[0].token)
            push('/admin/dashboard')
        }
    })
    .catch(e => console.log(e))
}
</script>


<main>
	
    <div class="flex flex-col text-center justify-center"  style="align-items: center; min-height: 100vh;" >
            <div class="flex flex-row">
                <div></div>
                <div class="flex flex-col px-2 lg:mx-0 mx-4">
                    <section class="my-4">
                        <h3 class="font-bold text-2xl">Welcome to Binterest</h3>
                        <p class="text-gray-600 pt-2">Sign in to your account.</p>
                    </section>
                    {#if error_ !== ''}
                         <!-- content here -->
                         <span class="bg-red-500 border-4 border-red-400 text-white text-center p-2">{error_}</span>
                    {/if}
                    <form class="flex flex-col" on:submit|preventDefault={() => signin()}>
                        <!-- <div class="mb-6 pt-3 body-gray-200">
                            <label class="block text-gray-700 text-sm font-bold mb-2 ml-3">Name</label>
                            <input type="text" class="
                            body-gray-200 w-full text-gray-700 focus:outline-none  border-b-4 border-gray-300 focus:border-gray-600 transition duration-500 px-3 pb-3" bind:value={name}>
                        </div> -->
    
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
    
                        <!-- {#if error_ !== ''}
                            <span class="bg-red-500 border-4 border-red-400 text-white text-center p-2">{error_}</span>
                        {/if} -->
    
                        <button class="bg-gray-600 mt-2 hover:bg-gray-900 text-white font-bold py-2 rounded shadow-lg hover:shadow-xl transition duration-200" type="submit" on:click={() => signin()}>Sign In</button>
    
                    </form>
                    <div class="max-w-lg mx-auto text-center mt-12 mb-6">
                        <p class="text-gray-900">Dont have an account? 
                            <!-- svelte-ignore a11y-missing-attribute -->
                            <a on:click={() => push("/auth/signup")} class="font-bold hover:underline">Sign Up</a>
                        </p>
                    </div>
                </div>
            </div>
    </div>
    </main>