<svelte:head>
	<title>Contact | Binterest</title>
</svelte:head>

<script lang="ts">
	let email;
	let msg = '';
	let text;

	const submit = function() {
		msg = 'Thank You For Contacting Us We Will Give You Feed Back Soon';
		email = '';
		text = ''
		setTimeout(() => {
			msg = ''
		}, 5000)
	}
</script>


<main>
	
    <div class="flex flex-col text-center justify-center"  style="align-items: center; min-height: 50vh;" >
            <div class="flex flex-row">
                <div></div>
                <div class="flex flex-col px-2 lg:mx-0 mx-4">
                    {#if msg !== ''}
                         <!-- content here -->
                         <span class="bg-green-500 border-4 border-green-400 text-white text-center p-2">{msg}</span>
                    {/if}
                    <form class="flex flex-col" on:submit|preventDefault={() => submit()}>
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
                            <label style="font-size: 20px;" class="text-gray-900 font-normal mb-2 text-left">Text</label>
                            <input placeholder="Enter Text" type="text" class="focus:outline-none w-full border-gray-500 focus:border-gray-800 transition duration-500 border-2 my-1 px-2 py-1" bind:value={text}>
                        </div>
    
                        <!-- {#if error_ !== ''}
                            <span class="bg-red-500 border-4 border-red-400 text-white text-center p-2">{error_}</span>
                        {/if} -->
    
                        <button class="bg-gray-600 mt-2 hover:bg-gray-900 text-white font-bold py-2 rounded shadow-lg hover:shadow-xl transition duration-200" type="submit" on:click={() => submit()}>Submit</button>
    
                    </form>
                </div>
            </div>
    </div>
    </main>