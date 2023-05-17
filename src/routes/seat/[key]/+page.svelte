<script>
    import { onMount } from 'svelte';

    export let data;

    let ws = null, wsOpen = false, wsAddr = '';
    let you = 'btn', opp = 'bb', active=false; // these will contain 'bb' and 'btn'
    let winner = null;

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

    let rawCmd = 'state';
    let showRaw = false;

    // Connect onMount
    onMount(() => {
        wsAddr = data.url;
        ws = new WebSocket(wsAddr);
        ws.onopen = () => {
            wsOpen = true;
            console.log('ws open');
            sendCmd('state'); // automatically fetch state first
        };
        ws.onclose = () => { console.log('ws close'); };
        ws.onmessage = handleMessage;
    });
    
    function handleMessage(msg) {
        console.log('ws message', msg);
        let data = JSON.parse(msg.data);
        
        // If data contains winner key, game is over
        if('winner' in data) {
            winner = data;
            return;
        } else state = data; // update state
        
        you = state.active_player == 'Button' ? 'btn' : 'bb';
        opp = state.active_player == 'Button' ? 'bb' : 'btn';
        active = true;

        // Figure out if we are btn or bb
        if(!state.available_actions || state.available_actions.length == 0) {
            // Swap you and opp
            let tmp = you;
            you = opp;
            opp = tmp;
            active = false;
        }
        
        for(let action of state.available_actions) {
            if(action.Bet) betsize = action.Bet[0];
            if(action.Raise) betsize = action.Raise[0];
        }
        console.log('betsize', betsize);
    }

    function sendCmd(cmd) {
        console.log('send cmd', cmd);
        if(wsOpen && cmd) ws.send(cmd);
        cmd = '';
    }
    
    function sendAction(action) {
        console.log('send action', action);
        if(wsOpen) ws.send(JSON.stringify(action));
    }
    
    function sendBet(action) {
        // Make a copy of action with betsize as value of first key
        action = Object.assign({}, action);
        action[Object.keys(action)[0]] = betsize;

        console.log('send bet', action);
        if(wsOpen) ws.send(JSON.stringify(action));
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
        margin-bottom: 0.5em;
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
    
    .active {
        border-radius: 2em;
        border: 2px solid red;
    }
</style>

{#if winner}
    <div class="table">
        {#if winner.winner}
        <h1>Winner: {winner}</h1>
        {:else}
        <h1>Split pot</h1>
        {/if}
        <button on:click={() => winner = null}>OK</button>
    </div>
    <h2>Result in detail</h2>
    <pre>
    {JSON.stringify(winner, null, 2)}
    </pre>
{:else if state}
    <!-- Add 'active' class if active is false -->
    <div class="player" class:active={!active}>
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
    <div class="player" class:active={active}>
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
        <button on:click={() => { ws.close(); ws = null; wsOpen = false; }}>Disconnect</button>
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