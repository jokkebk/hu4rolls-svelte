/** @type {import('./$types').PageLoad} */
export async function load({ fetch, params }) {
    let [host, port, game_id, seat] = params.key.split('_');
    
    console.log(`http://${host}:${port}/join`, game_id, seat);

    let resp = await fetch(`http://${host}:${port}/join`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'game_id': parseInt(game_id),
            'seat': parseInt(seat),
        })
    });
    
    // JSON should have { 'url': 'ws://...' }
    const data = await resp.json();

    return { seat, game_id, ...data };
}