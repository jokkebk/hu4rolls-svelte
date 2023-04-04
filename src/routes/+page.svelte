<script>
    let wsAddr = '';
    let ws = null, data = null;
    let cmd = '';
    
    function connectWs() {
        if (ws) return; // Do nothing if already connected

        ws = new WebSocket(wsAddr);
        ws.onopen = () => {
            console.log('ws open');
        };
        ws.onmessage = (msg) => {
            console.log('ws message', msg);
            data = JSON.parse(msg.data);
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

<h1>Hu4Rolls-2 Svelte Client!</h1>

{#if ws}
    <p>Connected to {wsAddr}</p>
    <button on:click={() => { ws.close(); ws = null; }}>Disconnect</button>
{:else}
<form on:submit|preventDefault={connectWs}>
    <p>
    <input bind:value={wsAddr} placeholder="Paste WS address here">
    <button on:click={connectWs}>Connect</button>
    </p>
</form>
{/if}

<form on:submit|preventDefault={sendCmd}>
    <p>
    <input bind:value={cmd} placeholder="Enter command here">
    <button on:click={sendCmd}>Send command</button>
    </p>
</form>

    {#if data}
        <h2>Data</h2>
        <!-- Go through keys of data -->
        {#each Object.keys(data) as key}
            <p>{key}: {data[key]}</p>
        {/each}
        
        {#if data.available_actions }
        <h3>Available actions</h3>
        <ul>
        <!-- Go through keys of data.actions -->
        {#each data.available_actions as action}
            <li><button on:click={() => sendAction(action)}>{JSON.stringify(action)}</button><li>
        {/each}
        </ul>
        {/if}
    {/if}