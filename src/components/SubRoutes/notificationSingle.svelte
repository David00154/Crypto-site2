<script lang="ts">
    import {onMount, onDestroy} from 'svelte';
    import {notification_body} from "../../data.js";
    let body = '';
    let subject = '';
    let date = ''
        notification_body.subscribe(v => {
            console.log(v)
            body = v.body;
            subject = v.title;
            date = v.date;
        })
    onDestroy(() => {
        notification_body.update(v => {
            return {title: "", body: "", date: ""};
        })
        })
</script>
     <!-- content here -->
     <h1>{subject}</h1>