<script>
    import { page } from '$app/stores'
    import { onMount } from 'svelte';
    
    // hardcode for now
    let host = 'localhost';
    let port = 8000;
    let ws = null;
    let rawCmd = 'state';
    let showRaw = false;
    let you = 'btn', opp = 'bb'; // these will contain 'bb' and 'btn'

    let betsize = 0; // helper for betsize input
    let state = null; 
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
    //  "btn_hole_cards": [ "8d", "6d" ],
    //  "bb_hole_cards": null,
    //  "board_cards": [ "7s", "5s", "2h" ],
    //  "available_actions": [ { "PostBlind": 5 } ],
    //  "active_player": "Button"
    // };

    $: wsAddr = `ws://${host}:${port}/ws/${$page.params.key}`;

    // Connect onMount
    onMount(() => {
        ws = new WebSocket(wsAddr);
        ws.onopen = () => {
            console.log('ws open');
        };
        ws.onmessage = (msg) => {
            console.log('ws message', msg);
            state = JSON.parse(msg.data);
            
            if(!state.active_player) return; // game not started yet

            you = state.active_player == 'Button' ? 'btn' : 'bb';
            opp = state.active_player == 'Button' ? 'bb' : 'btn';

            // Figure out if we are btn or bb
            if(!state.available_actions || state.available_actions.length == 0) {
                // Swap you and opp
                let tmp = you;
                you = opp;
                opp = tmp;
            }
            console.log('you', you, 'opp', opp);
            console.log(state[opp+'_stack']);
        };
        ws.onclose = () => {
            console.log('ws close');
        };
    });

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
    
    function renderCards(cards, n) {
        let copy = cards ? cards.slice() : [];

        // Pad with 'nn' to get n cards
        if(n) while (copy.length < n) copy.push('nn');
        
        return copy.map((card) => {
            let suit = card[1];
            let rank = card[0];
            return `<div class="card mini card-${suit} card-${rank}"></div>`;
        }).join('');
    }
</script>

<style>
    td, th {
        border: 1px solid black;
    }
    tr.active {
        background-color: lightgreen;
    }
    .rawmode {
        padding-top: 50px;
        color: grey;
    }
    
    .rawmode button {
        background-color: white;
    }
    
    .player, .table {
        padding: 10px;
        text-align: center;
    }
    
    .player h1, .table h1 {
        font-size: 1.5em;
    }
    
    /* Dark green background for table */
    .table {
        background-color: #160;
        color: white;
        border-radius: 2em;
        box-shadow: 0.2em 0.2em 0.2em rgba(95, 95, 95, 0.5);
    }
</style>

{#if state}
    <div class="player">
        <h1>Opponent ({opp})</h1>
        <p>Stack: {state[opp+'_stack']}
        (bet {state[opp+'_added_chips_this_street']} this street)</p>
        <p>{@html renderCards(state[opp+'_hole_cards'], 2)}</p>
    </div>
    <div class="table">
        <h1>Table</h1>
        <p> {@html renderCards(state.board_cards, 5)} </p>
        <p>Pot: {state.pot_size}
        (blinds: {state.sb_size} / {state.bb_size})</p>
    </div>
    <div class="player">
        <h1>You ({you.toUpperCase()})</h1>
        <p>Stack: {state[you+'_stack']}
        (bet {state[you+'_added_chips_this_street']} this street)</p>
        <p>{@html renderCards(state[you+'_hole_cards'], 2)}</p>
    
        {#if state.available_actions && state.available_actions.length }
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
                <br>
                <input type=range bind:value={betsize}
                min={Object.values(action)[0][0]} max={Object.values(action)[0][1]}>
            {/if}
            </p>
        {/each}
        {/if}
    </div>
{:else}
    <button on:click={() => sendCmd('state')}>Get state!</button>
{/if}

<div class="rawmode">
<button on:click={() => showRaw = !showRaw}>Toggle raw mode</button>
{#if showRaw}
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
        <input bind:value={rawCmd} placeholder="Enter command here">
        <button on:click={() => sendCmd(rawCmd)}>Send command</button>
        </p>
        <h3>State</h3>
        <pre>
        {JSON.stringify(state, null, 2)}
        </pre>
    </form>
{/if}
</div>