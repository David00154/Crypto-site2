<script lang="ts">
    import {push} from 'svelte-spa-router';
    import axios from 'axios';
    import {onMount} from "svelte";
    import {notification_body} from "../../data.js";
    // let body = '';
    // let title = '';

let data = [
    {subject: "Blah", date: "022-5-89", body: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi, placeat."},
    {subject: "Blah2", date: "072-5-89",  body: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi, placeat."}
];

const openBody = function(options) {
    notification_body.update(v => {
        return {title: "", body: "", date: ""};
    })
    push('/admin/notification');
}
// onMount(() => {

// })
</script>

<div class="container mx-auto my-6 lg:px-5">
    <table class="shadow-lg bg-white">
        <tr>
            <th class="bg-blue-100 border text-left px-8 py-4">Id</th>
            <th class="bg-blue-100 border text-left px-8 py-4">Subject</th>
            <th class="bg-blue-100 border text-left px-8 py-4">Date</th>
        </tr>
        <!-- <tr>
            <td class="border px-8 py-4">1</td>
            <td class="border px-8 py-4">Blac</td>
            <td class="border px-8 py-4">022-5-89</td>
        </tr> -->
        {#each data as {subject, body, date}, index}
             <!-- content here -->
             <tr>
                <td class="border px-8 py-4">{index + 1}</td>
                <td class="border px-8 py-4" on:click={() => openBody({subject, date, body})}>{subject}</td>
                <td class="border px-8 py-4">{date}</td>
            </tr>
        {/each}
        <!-- <tr>
            <td class="border px-8 py-4">2</td>
            <td class="border px-8 py-4">Blah</td>
            <td class="border px-8 py-4">022-5-89</td>
        </tr>
        <tr>
            <td class="border px-8 py-4">3</td>
            <td class="border px-8 py-4">Blha</td>
            <td class="border px-8 py-4">022-5-89</td>
        </tr> -->
        </table>
</div>