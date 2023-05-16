<script>
    import { page } from '$app/stores'
    import { onMount } from 'svelte';
    
    // hardcode for now
    let host = 'localhost';
    let port = 8000;
    
    $: wsAddr = `ws://${host}:${port}/ws/${$page.params.key}`;

    let ws = null;
    let cmd = 'state';
    
    // Connect onMount
    onMount(() => {
        connectWs();
    });

    // Sample game state:
    let state = {
     "pot_size": 0,
     "btn_stack": 200,
     "bb_stack": 200,
     "btn_added_chips_this_street": 0,
     "bb_added_chips_this_street": 0,
     "button_seat": 0,
     "sb_size": 5,
     "bb_size": 10,
     "btn_hole_cards": [
       "8d",
       "6d"
     ],
     "bb_hole_cards": null,
     "board_cards": [],
     "available_actions": [
       {
         "PostBlind": 5
       }
     ],
     "active_player": "Button"
    };

    function connectWs() {
        if (ws) return; // Do nothing if already connected
            
        ws = new WebSocket(wsAddr);
        ws.onopen = () => {
            console.log('ws open');
        };
        ws.onmessage = (msg) => {
            console.log('ws message', msg);
            state = JSON.parse(msg.data);
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

<style>
    table {
        border-collapse: collapse;
    }
    td, th {
        border: 1px solid black;
    }
</style>

<h1>Hu4Rolls-2 game</h1>

{#if state}
    <h2>Hand</h2>
    <p>Board cards: {state.board_cards}</p>
    <p>Pot: {state.pot_size}</p>
    <p>Active player: {state.active_player}</p>
    <p>Blinds: {state.sb_size} / {state.bb_size}</p>

    <h2>Players</h2>
    <table>
        <tbody>
            <tr>
                <th>Seat</th>
                <th>Stack</th>
                <th>Added this street</th>
                <th>Hole cards</th>
            </tr>
            <tr>
                <td>Button</td>
                <td>{state.btn_stack}</td>
                <td>{state.btn_added_chips_this_street}</td>
                <td>{state.btn_hole_cards || 'hidden'}</td>
            </tr>
            <tr>
                <td>Big blind</td>
                <td>{state.bb_stack}</td>
                <td>{state.bb_added_chips_this_street}</td>
                <td>{state.bb_hole_cards || 'hidden'}</td>
            </tr>
        </tbody>
    </table>
    
    {#if state.available_actions }
    <h3>Available actions</h3>
    <!-- Go through keys of state.actions -->
    {#each state.available_actions as action}
        <button on:click={() => sendAction(action)}>
        {#if action.PostBlind}
            <p>Post blind: {action.PostBlind}</p>
        {/if}
        {#if action.Fold}
            <p>Fold</p>
        {/if}
        {#if action.Check}
            <p>Check</p>
        {/if}
        {#if action.Call}
            <p>Call: {action.Call}</p>
        {/if}
        {#if action.Raise}
            <p>Raise: {action.Raise}</p>
        {/if}
        </button>
    {/each}
    {/if}
{/if}

<h2>Raw mode</h2>

{#if ws}
    <p>Connected to {wsAddr}
    <button on:click={() => { ws.close(); ws = null; }}>Disconnect</button>
    </p>
{:else}
    <p>Disconnected.</p>
{/if}

<form on:submit|preventDefault={sendCmd}>
    <p>
    <input bind:value={cmd} placeholder="Enter command here">
    <button on:click={sendCmd}>Send command</button>
    </p>
    <h3>State</h3>
    <pre>
    {JSON.stringify(state, null, 2)}
    </pre>
</form>
