<script>
let host = 'localhost';
let port = 8000;
let game_id = 123;
let sb_size = 5;
let stacks = 200;
let response = null;

async function createGame() {
    // Post AJAX request to create game
    let resp = await fetch(`http://${host}:${port}/create_game`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'id': game_id,
            'sb_size': sb_size,
            'stacks': [stacks, stacks],
        })
    });
    
    // Get response and put to response variable
    response = await resp.json();
}

async function joinGame(seat) {
    window.open(`/seat/${host}_${port}_${game_id}_${seat}`);
    // Post AJAX request to create game
    /*let resp = await fetch(`http://${host}:${port}/join`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'game_id': game_id,
            'seat': 0,
        })
    });
    
    // Get response and put to response variable
    response = await resp.json();
    */
};
    async function fuckMeSideways() {
        // Extract host, port, game_id, seat from page params
        //let [host, port, game_id, seat] = $page.params.key.split('_');
        
        console.log(`http://${host}:${port}/join`, game_id);

        let resp = await fetch(`http://${host}:${port}/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'game_id': game_id,
                'seat': 0,
            })
        });
        
        // JSON should have { 'url': 'ws://...' }
        const data = await resp.json();
        console.log(data);
    }
</script>

<style>
    th {
        text-align: left;
    }
</style>

<button on:click={fuckMeSideways}>FUCK ME!</button>
    
<p>First you need to create a game. After that, you and your friend can join it.</p>

<form>
    <!-- labels and bound inputs for variables -->
    <table>
    <tr>
    <th><label for="host">Host</label></th>
    <td><input bind:value={host} placeholder="Host" id="host"></td>
    </tr>
    <tr>
    <th><label for="port">Port</label></th>
    <td><input bind:value={port} placeholder="Port" id="port"></td>
    </tr>
    <tr>
    <th><label for="game_id">Game ID</label></th>
    <td><input type="number" bind:value={game_id} placeholder="Game ID" id="game_id"></td>
    </tr>
    <tr>
    <th><label for="sb_size">Small blind</label></th>
    <td>{sb_size} <input type=range min=1 max=10 bind:value={sb_size} placeholder="Small blind" id="sb_size"></td>
    </tr>
    <tr>
    <th><label for="stacks">Stack sizes</label></th>
    <td><input type=number min=1 bind:value={stacks} placeholder="Stack sizes" id="stacks"></td>
    </tr>
    <tr>
    <th colspan="2"><button on:click={createGame}>Create game</button></th>
    </tr>
    </table>
</form>

{#if response}
<pre>{@html JSON.stringify(response, null, 2)}</pre>

{#each [0, 1] as seat}
<button on:click={() => joinGame(seat)}>Join game {seat}</button>
{/each}
{/if}