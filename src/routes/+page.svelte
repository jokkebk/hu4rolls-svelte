<script>
let host = 'localhost';
let port = 8000;
let game_id = 123;
let sb_size = 5;
let stacks = 200;
let seat = 0;
let response = null;

let seats = ['Seat 0', 'Seat 1'];

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

async function joinGame() {
    // Post AJAX request to join game
    let resp = await fetch(`http://${host}:${port}/join`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'game_id': game_id,
            'seat': seat,
        })
    });
    
    // Example response:
    // { "url": "ws://127.0.0.1:8000/ws/abc123" }
    // Parse response as JSON
    resp = await resp.json();

    // Parse the unique alphanumeric id from end of response
    let ws_id = resp.url.split('/').pop();
    console.log(resp.url, ws_id);
    
    // Redirect browser to play page /seat/<ws_id>
    // popup in a new window
    window.open(`/seat/${ws_id}`);
    
    //window.location.href = `/seat/${ws_id}`;
}
</script>

<svelte:head>
</svelte:head>

<style>
    th {
        text-align: left;
    }
</style>

    
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

<!-- Show response as pre tag -->
<pre>{JSON.stringify(response, null, 2)}</pre>

<h2>Join a game</h2>

<p>Once a game is created, you can join it, just enter/update id and specify seat.</p>

<form>
    <table>
    <tr>
    <th><label for="game_id">Game ID</label></th>
    <td><input type="number" bind:value={game_id} placeholder="Game ID" id="game_id"></td>
    </tr>
    <tr>
    <th><label for="seat">Seat</label></th>
    <td><select bind:value={seat} id="seat">
    {#each seats as s, i}
        <option value={i}>{s}</option>
    {/each}
    </select>
    </td>
    </tr>
    <tr>
    <th colspan="2"><button on:click={joinGame}>Join game</button></th>
    </tr>
    </table>
</form>
