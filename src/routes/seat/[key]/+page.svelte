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
    // {
    //  "pot_size": 0,
    //  "btn_stack": 200,
    //  "bb_stack": 200,
    //  "btn_added_chips_this_street": 0,
    //  "bb_added_chips_this_street": 0,
    //  "button_seat": 0,
    //  "sb_size": 5,
    //  "bb_size": 10,
    //  "btn_hole_cards": [
    //    "8d",
    //    "6d"
    //  ],
    //  "bb_hole_cards": null,
    //  "board_cards": [],
    //  "available_actions": [
    //    {
    //      "PostBlind": 5
    //    }
    //  ],
    //  "active_player": "Button"
    // };
    
    let state = null, betsize = 0; // helper for betsize input

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
    
    function sendCmd(cmd) {
        console.log('send cmd', cmd);
        if (ws && cmd) {
            ws.send(cmd);
        }
        cmd = '';
    }
    
    function sendAction(action) {
        console.log('send action', action);
        if (ws) {
            ws.send(JSON.stringify(action));
        }
    }
    
    function sendBet(action) {
        // Make a copy of action with betsize as value of first key
        action = Object.assign({}, action);
        action[Object.keys(action)[0]] = betsize;

        console.log('send bet', action);
        if (ws && betsize) {
            ws.send(JSON.stringify(action));
        }
        betsize = 0;
    }
    
    function renderCards(cards) {
        if (!cards || !cards.length) return '';
        
        return cards.map((card) => {
            let suit = card[1];
            let rank = card[0];
            return `<div class="card mini card-${suit} card-${rank}"></div>`;
        }).join('');
    }
</script>

<style>
    table {
        border-collapse: collapse;
    }
    td, th {
        border: 1px solid black;
    }
    tr.active {
        background-color: lightgreen;
    }

    .rawmode {
        margin-top: 50px;
        color: grey !important;
    }
</style>

<h1>Hu4Rolls-2 game</h1>

{#if state}
    <h2>Hand</h2>
    <!-- use renderCard to get HTML tag for card -->
    <p> {@html renderCards(state.board_cards)} </p>
    <p>Pot: {state.pot_size}</p>
    <p>Active player: {state.active_player}
    {(state.available_actions && state.available_actions.length) ? ' (you)' : ''}</p>
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
            <tr class:active={state.active_player == 'Button'}>
                <td>Button</td>
                <td>{state.btn_stack}</td>
                <td>{state.btn_added_chips_this_street}</td>
                <td>{@html renderCards(state.btn_hole_cards)}</td>
            </tr>
            <!-- Add active class if active_player == 'BigBlind '-->
            <tr class:active={state.active_player == 'BigBlind'}>
                <td>Big blind</td>
                <td>{state.bb_stack}</td>
                <td>{state.bb_added_chips_this_street}</td>
                <td>{@html renderCards(state.bb_hole_cards)}</td>
            </tr>
        </tbody>
    </table>
    
    {#if state.available_actions }
    <h3>Available actions</h3>
    <!-- Go through keys of state.actions -->
    {#each state.available_actions as action}
        <p>
        {#if action.PostBlind}
            <button on:click={() => sendAction(action)}>Post blind ({action.PostBlind})</button>
        {:else if action.Call}
            <button on:click={() => sendAction(action)}>Call ({action.Call})</button>
        {:else if ['Fold', 'Check'].includes(action)}
            <button on:click={() => sendAction(action)}>{action}</button>
        {:else if action.Bet || action.Raise}
            <button on:click={sendBet(action)}>{Object.keys(action)[0]}: {betsize}</button>
            <input type=range bind:value={betsize}
            min={Object.values(action)[0][0]} max={Object.values(action)[0][1]}>
        {/if}
        </p>
    {/each}
    {/if}
{:else}
    <button on:click={() => sendCmd('state')}>Get state!</button>
{/if}

<hr>
<div class="rawmode">
    <h2>Raw mode</h2>

    {#if ws}
        <p>Connected to {wsAddr}
        <button on:click={() => { ws.close(); ws = null; }}>Disconnect</button>
        </p>
    {:else}
        <p>Disconnected.</p>
    {/if}

    <form on:submit|preventDefault>
        <p>
        <input bind:value={cmd} placeholder="Enter command here">
        <button on:click={() => sendCmd(cmd)}>Send command</button>
        </p>
        <h3>State</h3>
        <pre>
        {JSON.stringify(state, null, 2)}
        </pre>
    </form>
</div>