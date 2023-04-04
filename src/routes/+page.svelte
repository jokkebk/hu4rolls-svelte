<script>
    let wsAddr = '';
    let ws = null;
    let cmd = '';
    
    function connectWs() {
        if (ws) {
            ws.close();
        }
        ws = new WebSocket(wsAddr);
        ws.onopen = () => {
            console.log('ws open');
        };
        ws.onmessage = (msg) => {
            console.log('ws message', msg);
        };
        ws.onclose = () => {
            console.log('ws close');
        };
    }
    
    function sendCmd() {
        if (ws) {
            ws.send(cmd);
        }
    }
</script>

<h1>Hu4Rolls-2 Svelte Client</h1>

<p>
    <input bind:value={wsAddr} placeholder="Paste WS address here">
    <button on:click={connectWs}>Connect</button>
</p>

<p>
    <input bind:value={cmd} placeholder="Enter command here">
    <button on:click={sendCmd}>Send command</button>
</p>