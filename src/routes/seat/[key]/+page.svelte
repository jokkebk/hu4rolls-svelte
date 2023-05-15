<script>
    import { page } from '$app/stores'
    import { onMount } from 'svelte';
    
    // hardcode for now
    let host = 'localhost';
    let port = 8000;
    
    $: wsAddr = `ws://${host}:${port}/ws/${$page.params.key}`;

    let ws = null, payload = null;
    let cmd = 'state';
    
    // Connect onMount
    onMount(() => {
        connectWs();
    });

    function connectWs() {
        if (ws) return; // Do nothing if already connected
            
        ws = new WebSocket(wsAddr);
        ws.onopen = () => {
            console.log('ws open');
        };
        ws.onmessage = (msg) => {
            console.log('ws message', msg);
            payload = JSON.parse(msg.data);
        };
        ws.onclose = () => {
            console.log('ws close');
        };
    }
    
    function sendCmd() {
        if (ws && cmd) {
            ws.send(cmd);
        }
        cmd = '';
    }
    
    function sendAction(action) {
        if (ws) {
            ws.send(JSON.stringify(action));
        }
    }
</script>

<h1>Hu4Rolls-2 game</h1>

{#if ws}
    <p>Connected to {wsAddr}</p>
    <button on:click={() => { ws.close(); ws = null; }}>Disconnect</button>
{:else}
    <p>Disconnected.</p>
{/if}

<form on:submit|preventDefault={sendCmd}>
    <p>
    <input bind:value={cmd} placeholder="Enter command here">
    <button on:click={sendCmd}>Send command</button>
    </p>
</form>

    {#if payload}
        <h2>Data</h2>
        <!-- Go through keys of payload -->
        {#each Object.keys(payload) as key}
            <p>{key}: {payload[key]}</p>
        {/each}
        
        {#if payload.available_actions }
        <h3>Available actions</h3>
        <ul>
        <!-- Go through keys of payload.actions -->
        {#each payload.available_actions as action}
            <li><button on:click={() => sendAction(action)}>{JSON.stringify(action)}</button><li>
        {/each}
        </ul>
        {/if}
    {/if}